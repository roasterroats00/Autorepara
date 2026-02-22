import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { importJobs, workshops } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { processWorkshopImages } from '@/lib/image-processor';
import type { BusinessHours } from '@/db/schema/workshops';

interface CsvRow {
    [key: string]: string;
}

interface ImportRequest {
    csvData: CsvRow[];
    columnMapping: Record<string, string>;
}

// Parse rating JSON: {"rating_type":"Max5","value":5,"votes_count":17}
function parseRating(ratingJson: string): { rating: number | null; reviewCount: number } {
    try {
        // Handle double-escaped quotes from CSV
        const cleaned = ratingJson.replace(/""/g, '"');
        const data = JSON.parse(cleaned);
        return {
            rating: data.value != null ? parseFloat(data.value) : null,
            reviewCount: data.votes_count || 0
        };
    } catch {
        return { rating: null, reviewCount: 0 };
    }
}

// Parse work_time JSON to BusinessHours format
function parseWorkTime(workTimeJson: string): BusinessHours | null {
    try {
        // Quick validation - work_time JSON should start with { and contain work_hours
        if (!workTimeJson || !workTimeJson.trim().startsWith('{') || !workTimeJson.includes('work_hours')) {
            return null; // Silently skip invalid data
        }

        const cleaned = workTimeJson.replace(/""/g, '"');
        const data = JSON.parse(cleaned);

        if (!data.work_hours?.timetable) {
            return null;
        }

        const timetable = data.work_hours.timetable;
        const result: BusinessHours = {};

        const dayMap: Record<string, keyof BusinessHours> = {
            monday: 'monday',
            tuesday: 'tuesday',
            wednesday: 'wednesday',
            thursday: 'thursday',
            friday: 'friday',
            saturday: 'saturday',
            sunday: 'sunday'
        };

        for (const [day, schedules] of Object.entries(timetable)) {
            const mappedDay = dayMap[day];
            if (!mappedDay) continue;

            if (schedules === null || !Array.isArray(schedules) || schedules.length === 0) {
                result[mappedDay] = 'closed';
            } else {
                const schedule = schedules[0] as any;
                if (schedule.open && schedule.close) {
                    const formatTime = (h: number, m: number) =>
                        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                    result[mappedDay] = {
                        open: formatTime(schedule.open.hour, schedule.open.minute),
                        close: formatTime(schedule.close.hour, schedule.close.minute)
                    };
                }
            }
        }

        return Object.keys(result).length > 0 ? result : null;
    } catch {
        // Silently return null for malformed JSON - this is expected for some CSV rows
        return null;
    }
}

// Parse contact_info JSON to extract phone
function parseContactInfo(contactJson: string): string | null {
    try {
        const cleaned = contactJson.replace(/""/g, '"');
        const contacts = JSON.parse(cleaned);
        if (Array.isArray(contacts) && contacts.length > 0) {
            // Prefer google_business source, then any telephone
            const googlePhone = contacts.find(
                (c: any) => c.type === 'telephone' && c.source === 'google_business'
            );
            if (googlePhone?.value) return googlePhone.value;

            const anyPhone = contacts.find((c: any) => c.type === 'telephone');
            if (anyPhone?.value) return anyPhone.value;
        }
        return null;
    } catch {
        return null;
    }
}

// Parse latitude/longitude (some CSVs have comma as decimal separator)
function parseCoordinate(value: string): number | null {
    if (!value) return null;
    // Replace comma with dot for decimal
    const cleaned = value.replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
}

// Parse attributes JSON
function parseAttributes(attributesJson: string): { accessibility: string[], payments: string[] } {
    try {
        const cleaned = attributesJson.replace(/""/g, '"');
        const data = JSON.parse(cleaned);
        return {
            accessibility: data.available_attributes?.accessibility || [],
            payments: data.available_attributes?.payments || []
        };
    } catch {
        return { accessibility: [], payments: [] };
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: ImportRequest = await request.json();
        const { csvData, columnMapping } = body;

        if (!csvData || csvData.length === 0) {
            return NextResponse.json(
                { error: 'No data to import' },
                { status: 400 }
            );
        }

        // Create import job
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `import-${timestamp}.csv`;

        const [job] = await db
            .insert(importJobs)
            .values({
                filename: filename,
                originalName: 'bulk-import.csv',
                status: 'pending',
                totalRows: csvData.length,
                processedRows: 0,
                successRows: 0,
                errorRows: 0,
                csvData: csvData, // Store original CSV data
                columnMapping: columnMapping,
                aiEnrichmentStatus: 'pending',
                aiEnrichmentStats: {
                    totalEnriched: 0,
                    totalFailed: 0,
                    averageProcessingTime: 0,
                },
            })
            .returning();

        // Get a default city ID for workshops without city data
        const { cities: citiesTable } = await import('@/db/schema');
        const [firstCity] = await db.select({ id: citiesTable.id }).from(citiesTable).limit(1);

        if (!firstCity) {
            throw new Error('No cities found in database. Please seed cities first.');
        }

        const defaultCityId = firstCity.id;

        console.log(`[Import] Processing ${csvData.length} rows...`);

        // Import workshops from CSV
        const workshopRecords = csvData.map((row, index) => {
            // Map CSV columns to workshop fields using columnMapping
            const mappedData: any = {};

            for (const [systemField, csvColumn] of Object.entries(columnMapping)) {
                if (row[csvColumn]) {
                    mappedData[systemField] = row[csvColumn];
                }
            }

            // Direct column access (for common CSV columns not in mapping)
            const workshopName = mappedData.name || row['title'] || 'Unnamed Workshop';
            const slug = `${workshopName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index + 1}`;

            // Parse rating from JSON - check both mapped column and direct column names
            const ratingSource = mappedData.rating || row['rating'] || '';
            const ratingData = ratingSource ? parseRating(ratingSource) : { rating: null, reviewCount: 0 };

            // Parse work hours from JSON - check both mapped and direct
            const workTimeSource = mappedData.workTime || row['work_time'] || '';
            const businessHours = workTimeSource ? parseWorkTime(workTimeSource) : null;

            // Parse phone from contact_info JSON - check both mapped and direct
            const contactInfoSource = mappedData.contactInfo || row['contact_info'] || '';
            let phoneNumber = parseContactInfo(contactInfoSource);
            if (!phoneNumber && mappedData.phone) {
                phoneNumber = mappedData.phone;
            }

            // Parse coordinates - check both mapped and direct
            const latitude = parseCoordinate(mappedData.latitude || row['latitude'] || '');
            const longitude = parseCoordinate(mappedData.longitude || row['longitude'] || '');

            // Build address from components or use full address
            let address = mappedData.address || row['address'] || '';
            if (!address && row['address_info_address']) {
                address = row['address_info_address'];
                if (row['address_info_city']) address += `, ${row['address_info_city']}`;
                if (row['address_info_region']) address += `, ${row['address_info_region']}`;
                if (row['address_info_zip']) address += ` ${row['address_info_zip']}`;
            }

            // Get description from CSV
            const description = mappedData.description || row['description'] || '';

            // Get website - check both mapped and direct
            const website = mappedData.website || row['url'] || null;

            // Get logo URL - check both mapped and direct
            const logoUrl = mappedData.logo || row['logo'] || null;

            // Get main image URL - check both mapped and direct
            const mainImageUrl = mappedData.mainImage || row['main_image'] || null;

            // Parse attributes for potential future use
            const attributesSource = mappedData.attributes || row['attributes'] || '';
            const attributes = attributesSource ? parseAttributes(attributesSource) : null;

            // Log parsed data for debugging
            if (index < 3) {
                console.log(`[Import] Row ${index + 1}: ${workshopName}`);
                console.log(`  Rating: ${ratingData.rating}/5 (${ratingData.reviewCount} reviews)`);
                console.log(`  Phone: ${phoneNumber}`);
                console.log(`  Hours: ${businessHours ? JSON.stringify(businessHours).substring(0, 100) : 'N/A'}`);
            }

            return {
                name: workshopName,
                slug: slug,
                cityId: defaultCityId,
                address: address,
                phone: phoneNumber,
                website: website,
                // Real rating data from CSV
                rating: ratingData.rating,
                reviewCount: ratingData.reviewCount,
                // Coordinates
                latitude: latitude,
                longitude: longitude,
                // Business hours
                businessHours: businessHours,
                // Import description if available (will be enhanced by AI later)
                descriptionEn: description || null,
                // Enrichment fields start empty
                enrichmentStatus: 'pending' as const,
                enrichmentError: null,
                enrichedAt: null,
            };
        });

        // Batch insert workshops
        const insertedWorkshops = await db
            .insert(workshops)
            .values(workshopRecords)
            .returning({ id: workshops.id });

        console.log(`[Import] Inserted ${insertedWorkshops.length} workshops, now storing image URLs...`);

        // Store and process image URLs from CSV (download and save locally)
        let imagesProcessed = 0;
        for (let i = 0; i < insertedWorkshops.length; i++) {
            const workshop = insertedWorkshops[i];
            const csvRow = csvData[i];

            try {
                // Get logo URL from mapping or direct column
                let logoUrl: string | null = null;
                if (columnMapping.logo && csvRow[columnMapping.logo]) {
                    logoUrl = csvRow[columnMapping.logo];
                } else if (csvRow['logo']) {
                    logoUrl = csvRow['logo'];
                }

                // Get main image URL from mapping or direct column
                let mainImageUrl: string | null = null;
                if (columnMapping.mainImage && csvRow[columnMapping.mainImage]) {
                    mainImageUrl = csvRow[columnMapping.mainImage];
                } else if (csvRow['main_image']) {
                    mainImageUrl = csvRow['main_image'];
                }

                // Process images using image-processor (downloads and returns local URLs)
                if (logoUrl || mainImageUrl) {
                    const imageResult = await processWorkshopImages(csvRow, workshop.id, {
                        logo: logoUrl || undefined,
                        mainImage: mainImageUrl || undefined
                    });

                    // Update workshop with local URLs
                    if (imageResult.logoUrl || imageResult.images.length > 0) {
                        await db.update(workshops)
                            .set({
                                logoUrl: imageResult.logoUrl || null,
                                images: imageResult.images.length > 0 ? imageResult.images : null,
                            })
                            .where(eq(workshops.id, workshop.id));

                        imagesProcessed++;

                        if (i < 3) {
                            console.log(`[Import] Workshop ${i + 1} local images saved:`);
                            console.log(`  Logo: ${imageResult.logoUrl || '(none)'}`);
                            console.log(`  Main Image: ${imageResult.images[0] || '(none)'}`);
                        }
                    } else if (logoUrl || mainImageUrl) {
                        // Fallback: if download failed, still save the original URLs so proxy can attempt them
                        await db.update(workshops)
                            .set({
                                logoUrl: logoUrl || null,
                                images: mainImageUrl ? [mainImageUrl] : null,
                            })
                            .where(eq(workshops.id, workshop.id));
                    }
                }
            } catch (error) {
                console.error(`[Import] Failed to process images for workshop ${workshop.id}:`, error);
            }
        }

        console.log(`[Import] Processed images for ${imagesProcessed}/${insertedWorkshops.length} workshops`);

        // Update job with success count
        await db
            .update(importJobs)
            .set({
                status: 'completed',
                processedRows: csvData.length,
                successRows: insertedWorkshops.length,
                completedAt: new Date(),
            })
            .where(eq(importJobs.id, job.id));

        return NextResponse.json({
            success: true,
            jobId: job.id,
            totalRows: csvData.length,
            importedWorkshops: insertedWorkshops.length,
        });

    } catch (error) {
        console.error('Import error:', error);
        return NextResponse.json(
            { error: 'Failed to import data', details: (error as Error).message },
            { status: 500 }
        );
    }
}

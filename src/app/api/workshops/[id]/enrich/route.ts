import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshops, cities, states } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { enrichWorkshopContent, WorkshopInputData } from '@/lib/gemini';

/**
 * POST /api/workshops/[id]/enrich
 * Re-enrich a single workshop with AI-generated content
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get workshop with city and state info
        const [workshop] = await db
            .select({
                id: workshops.id,
                name: workshops.name,
                slug: workshops.slug,
                slugEs: workshops.slugEs,
                address: workshops.address,
                phone: workshops.phone,
                email: workshops.email,
                website: workshops.website,
                rating: workshops.rating,
                reviewCount: workshops.reviewCount,
                descriptionEn: workshops.descriptionEn,
                businessHours: workshops.businessHours,
                cityId: workshops.cityId,
                cityName: cities.name,
                stateId: cities.stateId,
                stateName: states.name,
            })
            .from(workshops)
            .leftJoin(cities, eq(workshops.cityId, cities.id))
            .leftJoin(states, eq(cities.stateId, states.id))
            .where(eq(workshops.id, id))
            .limit(1);

        if (!workshop) {
            return NextResponse.json(
                { error: 'Workshop not found' },
                { status: 404 }
            );
        }

        // Mark as processing
        await db
            .update(workshops)
            .set({
                enrichmentStatus: 'processing',
                enrichmentError: null,
            })
            .where(eq(workshops.id, id));

        // Prepare input data for Gemini
        const inputData: WorkshopInputData = {
            name: workshop.name,
            category: 'Auto Repair Service',
            address: workshop.address,
            city: workshop.cityName || undefined,
            state: workshop.stateName || undefined,
            phone: workshop.phone || undefined,
            website: workshop.website || undefined,
            existingDescription: workshop.descriptionEn || undefined,
            rating: workshop.rating || undefined,
            reviewCount: workshop.reviewCount || undefined,
            businessHours: workshop.businessHours || undefined,
            services: [],
        };

        console.log(`[Re-Enrich] Processing workshop: ${workshop.name}`);

        // Call Gemini AI for enrichment
        const enrichedContent = await enrichWorkshopContent(inputData);

        console.log(`[Re-Enrich] Gemini API successful for: ${workshop.name}`);

        // Update workshop with enriched content
        await db
            .update(workshops)
            .set({
                descriptionEn: enrichedContent.descriptionEn,
                descriptionEs: enrichedContent.descriptionEs,
                metaTitleEn: enrichedContent.metaTitleEn,
                metaTitleEs: enrichedContent.metaTitleEs,
                metaDescriptionEn: enrichedContent.metaDescriptionEn,
                metaDescriptionEs: enrichedContent.metaDescriptionEs,
                faqEn: enrichedContent.faqEn,
                faqEs: enrichedContent.faqEs,
                slug: enrichedContent.slug || workshop.slug,
                slugEs: enrichedContent.slugEs || workshop.slugEs,
                enrichmentStatus: 'completed',
                enrichmentError: null,
                enrichedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(workshops.id, id));

        return NextResponse.json({
            success: true,
            message: 'Workshop enriched successfully',
            workshop: {
                id: workshop.id,
                name: workshop.name,
                descriptionLength: enrichedContent.descriptionEn.length,
                faqCount: enrichedContent.faqEn.length,
            },
        });

    } catch (error) {
        const errorMessage = (error as Error).message;
        console.error('[Re-Enrich] Error:', errorMessage);

        // Mark as failed if we have the ID
        const { id } = await params;
        if (id) {
            await db
                .update(workshops)
                .set({
                    enrichmentStatus: 'failed',
                    enrichmentError: errorMessage,
                })
                .where(eq(workshops.id, id));
        }

        return NextResponse.json(
            {
                error: 'Failed to enrich workshop',
                details: errorMessage,
            },
            { status: 500 }
        );
    }
}

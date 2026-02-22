'use server';

import { db } from '@/db';
import { importJobs, workshops, cities, states } from '@/db/schema';
import { eq, and, or, isNull } from 'drizzle-orm';
import { enrichWorkshopContent, WorkshopInputData } from '@/lib/gemini';

// Types
export interface QueueStatus {
    jobId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'paused';
    totalRows: number;
    processedRows: number;
    successfulRows: number;
    failedRows: number;
    currentRowIndex: number;
    estimatedTimeRemaining: number; // in seconds
    lastProcessedAt?: string;
}

export interface ProcessRowResult {
    success: boolean;
    workshopId?: string;
    workshopName?: string;
    error?: string;
    hasMoreRows: boolean;
    progress: {
        current: number;
        total: number;
        percentage: number;
    };
}

/**
 * Get the current status of an enrichment job
 */
export async function getEnrichmentStatus(jobId: string): Promise<QueueStatus | null> {
    const [job] = await db
        .select()
        .from(importJobs)
        .where(eq(importJobs.id, jobId))
        .limit(1);

    if (!job) {
        return null;
    }

    const avgTimePerRow = 3; // seconds (2s rate limit + ~1s processing)
    const remainingRows = (job.totalRows || 0) - (job.processedRows || 0);

    return {
        jobId: job.id,
        status: (job.aiEnrichmentStatus as QueueStatus['status']) || 'pending',
        totalRows: job.totalRows || 0,
        processedRows: job.processedRows || 0,
        successfulRows: job.successRows || 0,
        failedRows: job.errorRows || 0,
        currentRowIndex: job.currentRowIndex || 0,
        estimatedTimeRemaining: remainingRows * avgTimePerRow,
        lastProcessedAt: job.aiEnrichmentStats?.lastProcessedAt,
    };
}

/**
 * Start enrichment for an import job
 */
export async function startEnrichment(jobId: string): Promise<{ success: boolean; error?: string }> {
    const [job] = await db
        .select()
        .from(importJobs)
        .where(eq(importJobs.id, jobId))
        .limit(1);

    if (!job) {
        return { success: false, error: 'Import job not found' };
    }

    if (job.status !== 'completed') {
        return { success: false, error: 'Import job must be completed before enrichment' };
    }

    // Update job status to processing
    await db
        .update(importJobs)
        .set({
            aiEnrichmentStatus: 'processing',
            currentRowIndex: 0,
            aiEnrichmentStats: {
                totalEnriched: 0,
                totalFailed: 0,
                averageProcessingTime: 0,
            },
        })
        .where(eq(importJobs.id, jobId));

    return { success: true };
}

/**
 * Pause enrichment for an import job
 */
export async function pauseEnrichment(jobId: string): Promise<{ success: boolean; error?: string }> {
    await db
        .update(importJobs)
        .set({ aiEnrichmentStatus: 'paused' })
        .where(eq(importJobs.id, jobId));

    return { success: true };
}

/**
 * Resume enrichment for an import job
 */
export async function resumeEnrichment(jobId: string): Promise<{ success: boolean; error?: string }> {
    await db
        .update(importJobs)
        .set({ aiEnrichmentStatus: 'processing' })
        .where(eq(importJobs.id, jobId));

    return { success: true };
}

/**
 * Process the next pending row in the enrichment queue
 */
export async function processNextRow(jobId: string): Promise<ProcessRowResult> {
    // Get job info
    const [job] = await db
        .select()
        .from(importJobs)
        .where(eq(importJobs.id, jobId))
        .limit(1);

    if (!job) {
        return {
            success: false,
            error: 'Import job not found',
            hasMoreRows: false,
            progress: { current: 0, total: 0, percentage: 0 },
        };
    }

    // Check if job is paused
    if (job.aiEnrichmentStatus === 'paused') {
        return {
            success: false,
            error: 'Enrichment is paused',
            hasMoreRows: true,
            progress: {
                current: job.processedRows || 0,
                total: job.totalRows || 0,
                percentage: job.totalRows ? Math.round(((job.processedRows || 0) / job.totalRows) * 100) : 0,
            },
        };
    }


    // Find next workshop to enrich (not yet enriched)
    console.log(`[Enrichment Queue] Job ${jobId}: Looking for pending workshop`);

    const [nextWorkshop] = await db
        .select()
        .from(workshops)
        .where(
            or(
                eq(workshops.enrichmentStatus, 'pending'),
                isNull(workshops.enrichmentStatus)
            )
        )
        .limit(1);

    console.log(`[Enrichment Queue] Found:`, nextWorkshop ? `ID=${nextWorkshop.id}, Name=${nextWorkshop.name}` : 'No pending workshops');

    // If no more workshops to process, mark job as completed
    if (!nextWorkshop) {
        await db
            .update(importJobs)
            .set({
                aiEnrichmentStatus: 'completed',
                completedAt: new Date(),
            })
            .where(eq(importJobs.id, jobId));

        return {
            success: true,
            hasMoreRows: false,
            progress: {
                current: job.totalRows || 0,
                total: job.totalRows || 0,
                percentage: 100,
            },
        };
    }

    // Mark workshop as processing
    await db
        .update(workshops)
        .set({ enrichmentStatus: 'processing' })
        .where(eq(workshops.id, nextWorkshop.id));

    const startTime = Date.now();

    try {
        // Get city and state info by joining with cities table
        let cityName = '';
        let stateName = '';

        if (nextWorkshop.cityId) {
            const cityData = await db
                .select({
                    cityName: cities.name,
                    stateId: cities.stateId,
                })
                .from(cities)
                .where(eq(cities.id, nextWorkshop.cityId))
                .limit(1);

            if (cityData && cityData.length > 0) {
                cityName = cityData[0].cityName || '';

                // Get state name if stateId available
                if (cityData[0].stateId) {
                    const stateData = await db
                        .select({
                            stateName: states.name,
                        })
                        .from(states)
                        .where(eq(states.id, cityData[0].stateId))
                        .limit(1);

                    if (stateData && stateData.length > 0) {
                        stateName = stateData[0].stateName || '';
                    }
                }
            }
        }

        // Prepare input data for Gemini with complete information (including real data)
        const inputData: WorkshopInputData = {
            name: nextWorkshop.name,
            category: 'Auto Repair Service',
            address: nextWorkshop.address,
            city: cityName || undefined,
            state: stateName || undefined,
            phone: nextWorkshop.phone || undefined,
            website: nextWorkshop.website || undefined,
            existingDescription: nextWorkshop.descriptionEn || undefined,
            // Real data from CSV import
            rating: nextWorkshop.rating || undefined,
            reviewCount: nextWorkshop.reviewCount || undefined,
            businessHours: nextWorkshop.businessHours || undefined,
            services: [], // Could be populated from workshop_services join if needed
        };

        console.log(`[Enrichment Queue] Calling Gemini API for: ${nextWorkshop.name}`);

        // Call Gemini AI for enrichment
        const enrichedContent = await enrichWorkshopContent(inputData);

        console.log(`[Enrichment Queue] Gemini API returned successfully for: ${nextWorkshop.name}`);

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
                slug: enrichedContent.slug || nextWorkshop.slug,
                slugEs: enrichedContent.slugEs || nextWorkshop.slugEs,
                enrichmentStatus: 'completed',
                enrichmentError: null,
                enrichedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(workshops.id, nextWorkshop.id));

        // Update job progress
        const processingTime = (Date.now() - startTime) / 1000;
        const currentStats = job.aiEnrichmentStats || { totalEnriched: 0, totalFailed: 0, averageProcessingTime: 0 };
        const newTotalEnriched = (currentStats.totalEnriched || 0) + 1;
        const newAvgTime = ((currentStats.averageProcessingTime || 0) * (currentStats.totalEnriched || 0) + processingTime) / newTotalEnriched;

        await db
            .update(importJobs)
            .set({
                processedRows: (job.processedRows || 0) + 1,
                successRows: (job.successRows || 0) + 1,
                currentRowIndex: (job.currentRowIndex || 0) + 1,
                aiEnrichmentStats: {
                    totalEnriched: newTotalEnriched,
                    totalFailed: currentStats.totalFailed || 0,
                    averageProcessingTime: newAvgTime,
                    lastProcessedAt: new Date().toISOString(),
                },
            })
            .where(eq(importJobs.id, jobId));

        console.log(`[Enrichment Queue] Stats updated - Enriched: ${newTotalEnriched}, ProcessingTime: ${processingTime.toFixed(2)}s`);

        // Use totalEnriched for progress tracking (not processedRows which is set by import)
        const total = job.totalRows || 0;
        const hasMore = newTotalEnriched < total;

        return {
            success: true,
            workshopId: nextWorkshop.id,
            workshopName: nextWorkshop.name,
            hasMoreRows: hasMore,
            progress: {
                current: newTotalEnriched,
                total: total,
                percentage: total ? Math.round((newTotalEnriched / total) * 100) : 0,
            },
        };

    } catch (error) {
        const errorMessage = (error as Error).message;

        // Mark workshop as failed
        await db
            .update(workshops)
            .set({
                enrichmentStatus: 'failed',
                enrichmentError: errorMessage,
            })
            .where(eq(workshops.id, nextWorkshop.id));

        // Update job error count
        const currentStats = job.aiEnrichmentStats || { totalEnriched: 0, totalFailed: 0, averageProcessingTime: 0 };

        await db
            .update(importJobs)
            .set({
                processedRows: (job.processedRows || 0) + 1,
                errorRows: (job.errorRows || 0) + 1,
                currentRowIndex: (job.currentRowIndex || 0) + 1,
                aiEnrichmentStats: {
                    ...currentStats,
                    totalFailed: (currentStats.totalFailed || 0) + 1,
                    lastProcessedAt: new Date().toISOString(),
                },
            })
            .where(eq(importJobs.id, jobId));

        // Use enrichment-specific counters for progress (totalEnriched + totalFailed)
        const totalProcessedByEnrichment = (currentStats.totalEnriched || 0) + (currentStats.totalFailed || 0) + 1;
        const total = job.totalRows || 0;
        const hasMore = totalProcessedByEnrichment < total;

        return {
            success: false,
            workshopId: nextWorkshop.id,
            workshopName: nextWorkshop.name,
            error: errorMessage,
            hasMoreRows: hasMore,
            progress: {
                current: totalProcessedByEnrichment,
                total: total,
                percentage: total ? Math.round((totalProcessedByEnrichment / total) * 100) : 0,
            },
        };
    }
}

/**
 * Retry failed enrichments for an import job
 */
export async function retryFailedEnrichments(jobId: string): Promise<{ success: boolean; count: number }> {
    const [job] = await db
        .select()
        .from(importJobs)
        .where(eq(importJobs.id, jobId))
        .limit(1);

    if (!job) {
        return { success: false, count: 0 };
    }

    // Count failed workshops first
    const failedWorkshops = await db
        .select()
        .from(workshops)
        .where(
            and(
                eq(workshops.createdBy, job.createdBy || ''),
                eq(workshops.enrichmentStatus, 'failed')
            )
        );

    const failedCount = failedWorkshops.length;

    // Reset failed workshops to pending
    await db
        .update(workshops)
        .set({
            enrichmentStatus: 'pending',
            enrichmentError: null,
        })
        .where(
            and(
                eq(workshops.createdBy, job.createdBy || ''),
                eq(workshops.enrichmentStatus, 'failed')
            )
        );

    // Reset job status
    await db
        .update(importJobs)
        .set({
            aiEnrichmentStatus: 'processing',
            errorRows: 0,
        })
        .where(eq(importJobs.id, jobId));

    return { success: true, count: failedCount };
}


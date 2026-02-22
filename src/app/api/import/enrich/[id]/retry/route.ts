import { NextRequest, NextResponse } from 'next/server';
import { retryFailedEnrichments } from '@/lib/enrichment-queue';

// POST - Retry failed enrichments for a job
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: jobId } = await params;

        if (!jobId) {
            return NextResponse.json(
                { error: 'Job ID is required' },
                { status: 400 }
            );
        }

        const result = await retryFailedEnrichments(jobId);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error retrying failed enrichments:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to retry enrichments' },
            { status: 500 }
        );
    }
}

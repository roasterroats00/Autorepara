import { NextRequest, NextResponse } from 'next/server';
import { getEnrichmentStatus } from '@/lib/enrichment-queue';

// GET - Get status for a specific enrichment job
export async function GET(
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

        const status = await getEnrichmentStatus(jobId);

        if (!status) {
            return NextResponse.json(
                { error: 'Import job not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(status);
    } catch (error) {
        console.error('Error getting enrichment status:', error);
        return NextResponse.json(
            { error: 'Failed to get enrichment status' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { getEnrichmentStatus, startEnrichment, pauseEnrichment, resumeEnrichment } from '@/lib/enrichment-queue';

// GET - Get enrichment status for an import job
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('jobId');

        if (!jobId) {
            return NextResponse.json(
                { error: 'jobId is required' },
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

// POST - Start, pause, or resume enrichment
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { jobId, action } = body;

        if (!jobId) {
            return NextResponse.json(
                { error: 'jobId is required' },
                { status: 400 }
            );
        }

        let result;

        switch (action) {
            case 'start':
                result = await startEnrichment(jobId);
                break;
            case 'pause':
                result = await pauseEnrichment(jobId);
                break;
            case 'resume':
                result = await resumeEnrichment(jobId);
                break;
            default:
                return NextResponse.json(
                    { error: 'Invalid action. Use: start, pause, or resume' },
                    { status: 400 }
                );
        }

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true, action });
    } catch (error) {
        console.error('Error in enrichment action:', error);
        return NextResponse.json(
            { error: 'Failed to perform enrichment action' },
            { status: 500 }
        );
    }
}

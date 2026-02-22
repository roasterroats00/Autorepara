import { NextRequest, NextResponse } from 'next/server';
import { processNextRow } from '@/lib/enrichment-queue';

// POST - Process the next row in the enrichment queue
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

        const result = await processNextRow(jobId);

        return NextResponse.json(result);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;

        console.error('Error processing next row:', errorMessage);
        console.error('Stack trace:', errorStack);

        return NextResponse.json(
            {
                success: false,
                error: errorMessage,
                errorDetails: errorStack,
                hasMoreRows: true,
                progress: { current: 0, total: 0, percentage: 0 }
            },
            { status: 500 }
        );
    }
}

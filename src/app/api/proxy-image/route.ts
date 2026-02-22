import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/proxy-image?url=<encoded-url>
 * Proxy external images to bypass CORS restrictions
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const imageUrl = searchParams.get('url');

        if (!imageUrl) {
            return NextResponse.json(
                { error: 'Missing image URL parameter' },
                { status: 400 }
            );
        }

        // Validate URL to prevent abuse
        const allowedDomains = [
            'googleusercontent.com',
            'googleapis.com',
            'google.com',
            'streetviewpixels-pa.googleapis.com',
            'lh3.googleusercontent.com',
            'lh4.googleusercontent.com',
            'lh5.googleusercontent.com',
        ];

        const url = new URL(imageUrl);
        const isAllowed = allowedDomains.some(domain => url.hostname.includes(domain));

        if (!isAllowed) {
            return NextResponse.json(
                { error: 'Domain not allowed' },
                { status: 403 }
            );
        }

        // Fetch the image with proper headers to bypass restrictions
        const response = await fetch(imageUrl, {
            headers: {
                'Referer': 'https://www.google.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            },
            // Add timeout
            signal: AbortSignal.timeout(10000), // 10 seconds
        });

        if (!response.ok) {
            console.error(`Failed to fetch image: ${response.status} ${response.statusText}`);
            return NextResponse.json(
                { error: 'Failed to fetch image', status: response.status },
                { status: response.status }
            );
        }

        // Get the image data
        const imageBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('Content-Type') || 'image/jpeg';

        // Return the image with proper headers
        return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800', // Cache for 1 day, stale for 7 days
                'CDN-Cache-Control': 'public, max-age=86400',
            },
        });
    } catch (error) {
        console.error('Error proxying image:', error);

        // Return error response
        return NextResponse.json(
            {
                error: 'Failed to proxy image',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

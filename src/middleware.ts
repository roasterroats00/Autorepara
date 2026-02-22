import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Redirect /en/* to /* (English is default, no prefix needed)
    if (pathname.startsWith('/en/') || pathname === '/en') {
        const newPathname = pathname.replace(/^\/en/, '') || '/';
        return NextResponse.redirect(new URL(newPathname + request.nextUrl.search, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match /en and /en/*
        '/en/:path*',
        '/en',
    ],
};

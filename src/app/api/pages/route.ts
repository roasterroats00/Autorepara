import { NextResponse } from 'next/server';
import { db } from '@/db';
import { pages } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// GET /api/pages - List pages
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const status = searchParams.get('status') || 'published';
        const admin = searchParams.get('admin') === 'true';

        // Admin view - all pages
        if (admin) {
            let result = await db.select()
                .from(pages)
                .orderBy(desc(pages.updatedAt), desc(pages.createdAt));

            if (type && type !== 'all') {
                result = result.filter(p => p.type === type);
            }

            return NextResponse.json(result);
        }

        // Blog posts
        if (type === 'blog') {
            const result = await db.select()
                .from(pages)
                .where(and(eq(pages.type, 'blog'), eq(pages.status, 'published')))
                .orderBy(desc(pages.publishedAt));
            return NextResponse.json(result);
        }

        // Public pages
        const conditions = [eq(pages.status, status as any)];
        if (type) conditions.push(eq(pages.type, type as any));

        const result = await db.select()
            .from(pages)
            .where(and(...conditions))
            .orderBy(desc(pages.publishedAt), desc(pages.createdAt));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching pages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pages' },
            { status: 500 }
        );
    }
}

// POST /api/pages - Create page
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { scheduledAt, ...pageData } = body;

        const [newPage] = await db.insert(pages)
            .values({
                ...pageData,
                publishedAt: pageData.status === 'published' ? new Date() : null,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
            })
            .returning();

        return NextResponse.json(newPage, { status: 201 });
    } catch (error) {
        console.error('Error creating page:', error);
        return NextResponse.json(
            { error: 'Failed to create page' },
            { status: 500 }
        );
    }
}

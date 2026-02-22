import { NextResponse } from 'next/server';
import { db } from '@/db';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/pages/[id] - Get page by ID or slug
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        const result = await db.select()
            .from(pages)
            .where(isUuid ? eq(pages.id, id) : eq(pages.slug, id))
            .limit(1);

        if (result.length === 0) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error('Error fetching page:', error);
        return NextResponse.json(
            { error: 'Failed to fetch page' },
            { status: 500 }
        );
    }
}

// PUT /api/pages/[id] - Update page
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { scheduledAt, ...pageData } = body;

        const [updated] = await db.update(pages)
            .set({
                ...pageData,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
                updatedAt: new Date(),
            })
            .where(eq(pages.id, id))
            .returning();

        if (!updated) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating page:', error);
        return NextResponse.json(
            { error: 'Failed to update page' },
            { status: 500 }
        );
    }
}

// DELETE /api/pages/[id] - Delete page
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const [deleted] = await db.delete(pages)
            .where(eq(pages.id, id))
            .returning();

        if (!deleted) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting page:', error);
        return NextResponse.json(
            { error: 'Failed to delete page' },
            { status: 500 }
        );
    }
}

// PATCH /api/pages/[id] - Publish/unpublish page
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { publish } = await request.json();

        const [updated] = await db.update(pages)
            .set({
                status: publish ? 'published' : 'draft',
                publishedAt: publish ? new Date() : null,
                updatedAt: new Date(),
            })
            .where(eq(pages.id, id))
            .returning();

        if (!updated) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating page status:', error);
        return NextResponse.json(
            { error: 'Failed to update page status' },
            { status: 500 }
        );
    }
}

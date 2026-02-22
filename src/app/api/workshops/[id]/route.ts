import { NextResponse } from 'next/server';
import { db } from '@/db';
import { workshops, workshopServices, services, cities, states } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

// GET /api/workshops/[id] - Get workshop by ID or slug
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Try to find by ID first, then by slug
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        const result = await db.select()
            .from(workshops)
            .leftJoin(cities, eq(workshops.cityId, cities.id))
            .leftJoin(states, eq(cities.stateId, states.id))
            .where(isUuid ? eq(workshops.id, id) : eq(workshops.slug, id))
            .limit(1);

        if (result.length === 0) {
            return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
        }

        // Get workshop services
        const workshopServicesList = await db.select()
            .from(workshopServices)
            .leftJoin(services, eq(workshopServices.serviceId, services.id))
            .where(eq(workshopServices.workshopId, result[0].workshops.id));

        // Increment view count
        await db.update(workshops)
            .set({ viewCount: sql`view_count + 1` })
            .where(eq(workshops.id, result[0].workshops.id));

        return NextResponse.json({
            ...result[0].workshops,
            city: result[0].cities,
            state: result[0].states,
            services: workshopServicesList.map(ws => ws.services),
        });
    } catch (error) {
        console.error('Error fetching workshop:', error);
        return NextResponse.json(
            { error: 'Failed to fetch workshop' },
            { status: 500 }
        );
    }
}

// PUT /api/workshops/[id] - Update workshop
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { serviceIds, ...workshopData } = body;

        const [updated] = await db.update(workshops)
            .set({
                ...workshopData,
                updatedAt: new Date(),
            })
            .where(eq(workshops.id, id))
            .returning();

        if (!updated) {
            return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
        }

        // Update services if provided
        if (serviceIds) {
            await db.delete(workshopServices).where(eq(workshopServices.workshopId, id));
            if (serviceIds.length > 0) {
                await db.insert(workshopServices).values(
                    serviceIds.map((serviceId: string) => ({
                        workshopId: id,
                        serviceId,
                    }))
                );
            }
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating workshop:', error);
        return NextResponse.json(
            { error: 'Failed to update workshop' },
            { status: 500 }
        );
    }
}

// DELETE /api/workshops/[id] - Delete workshop
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const [deleted] = await db.delete(workshops)
            .where(eq(workshops.id, id))
            .returning();

        if (!deleted) {
            return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting workshop:', error);
        return NextResponse.json(
            { error: 'Failed to delete workshop' },
            { status: 500 }
        );
    }
}

// PATCH /api/workshops/[id] - Update workshop status or featured state
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Allowed fields for PATCH
        const updates: Partial<typeof workshops.$inferInsert> = {};

        if (body.status) {
            if (!['draft', 'pending', 'active', 'inactive'].includes(body.status)) {
                return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
            }
            updates.status = body.status;
        }

        if (typeof body.isFeatured === 'boolean') {
            updates.isFeatured = body.isFeatured;
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        const [updated] = await db.update(workshops)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(workshops.id, id))
            .returning();

        if (!updated) {
            return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating workshop:', error);
        return NextResponse.json(
            { error: 'Failed to update workshop' },
            { status: 500 }
        );
    }
}

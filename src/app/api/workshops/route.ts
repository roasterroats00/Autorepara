import { NextResponse } from 'next/server';
import { db } from '@/db';
import { workshops, workshopServices, services, cities, states } from '@/db/schema';
import { eq, and, like, desc, asc, sql } from 'drizzle-orm';

// GET /api/workshops - List workshops
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
        const status = searchParams.get('status') as 'draft' | 'pending' | 'active' | 'inactive' | null;
        const cityId = searchParams.get('cityId');
        const stateId = searchParams.get('stateId');
        const serviceId = searchParams.get('serviceId');
        const serviceSlug = searchParams.get('service'); // Filter by service slug
        const search = searchParams.get('search');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        const offset = (page - 1) * limit;

        // Build conditions
        const conditions = [];
        if (status) conditions.push(eq(workshops.status, status));
        if (cityId) conditions.push(eq(workshops.cityId, cityId));
        if (search) conditions.push(like(workshops.name, `%${search}%`));

        // If filtering by service, we need a subquery
        let workshopIds: string[] | null = null;
        if (serviceId || serviceSlug) {
            let targetServiceId = serviceId;

            // If serviceSlug provided, find the service ID first
            if (serviceSlug && !serviceId) {
                const serviceResult = await db.select({ id: services.id })
                    .from(services)
                    .where(eq(services.slug, serviceSlug))
                    .limit(1);
                if (serviceResult.length > 0) {
                    targetServiceId = serviceResult[0].id;
                }
            }

            if (targetServiceId) {
                const workshopServiceResults = await db.select({ workshopId: workshopServices.workshopId })
                    .from(workshopServices)
                    .where(eq(workshopServices.serviceId, targetServiceId));
                workshopIds = workshopServiceResults.map(ws => ws.workshopId);
            }
        }

        // If we have service filter but no matching workshops, return empty
        if ((serviceId || serviceSlug) && (!workshopIds || workshopIds.length === 0)) {
            return NextResponse.json({
                data: [],
                pagination: { page, limit, total: 0, totalPages: 0 },
            });
        }

        // Add workshop IDs condition if filtering by service
        if (workshopIds && workshopIds.length > 0) {
            conditions.push(sql`${workshops.id} IN (${sql.join(workshopIds.map(id => sql`${id}`), sql`, `)})`);
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
        const sortColumn = sortBy === 'createdAt' ? workshops.createdAt
            : sortBy === 'name' ? workshops.name
                : sortBy === 'rating' ? workshops.rating
                    : sortBy === 'reviewCount' ? workshops.reviewCount
                        : workshops.viewCount;
        const orderClause = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

        const [result, countResult] = await Promise.all([
            db.select()
                .from(workshops)
                .where(whereClause)
                .orderBy(desc(workshops.isFeatured), orderClause)
                .limit(limit)
                .offset(offset),
            db.select({ count: sql<number>`count(*)::int` })
                .from(workshops)
                .where(whereClause),
        ]);

        const total = countResult[0]?.count || 0;

        return NextResponse.json({
            data: result,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching workshops:', error);
        return NextResponse.json(
            { error: 'Failed to fetch workshops' },
            { status: 500 }
        );
    }
}

// POST /api/workshops - Create workshop
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { serviceIds, ...workshopData } = body;

        const [newWorkshop] = await db.insert(workshops)
            .values(workshopData)
            .returning();

        // Add services if provided
        if (serviceIds && serviceIds.length > 0) {
            await db.insert(workshopServices).values(
                serviceIds.map((serviceId: string) => ({
                    workshopId: newWorkshop.id,
                    serviceId,
                }))
            );
        }

        return NextResponse.json(newWorkshop, { status: 201 });
    } catch (error) {
        console.error('Error creating workshop:', error);
        return NextResponse.json(
            { error: 'Failed to create workshop' },
            { status: 500 }
        );
    }
}

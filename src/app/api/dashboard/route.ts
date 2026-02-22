import { NextResponse } from 'next/server';
import { db } from '@/db';
import { workshops, services, states, cities, importJobs } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

// GET /api/dashboard - Get dashboard statistics
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');

        if (type === 'recent-workshops') {
            const result = await db.select()
                .from(workshops)
                .leftJoin(cities, eq(workshops.cityId, cities.id))
                .orderBy(desc(workshops.createdAt))
                .limit(10);

            return NextResponse.json(result.map(r => ({
                ...r.workshops,
                city: r.cities,
            })));
        }

        if (type === 'top-services') {
            const result = await db.select()
                .from(services)
                .orderBy(desc(services.workshopCount))
                .limit(10);
            return NextResponse.json(result);
        }

        if (type === 'top-states') {
            const result = await db.select()
                .from(states)
                .orderBy(desc(states.workshopCount))
                .limit(10);
            return NextResponse.json(result);
        }

        // Default: stats
        const [workshopStats] = await db.select({
            total: sql<number>`count(*)::int`,
            active: sql<number>`count(*) filter (where status = 'active')::int`,
            pending: sql<number>`count(*) filter (where status = 'pending')::int`,
            draft: sql<number>`count(*) filter (where status = 'draft')::int`,
            totalViews: sql<number>`coalesce(sum(view_count), 0)::int`,
        }).from(workshops);

        const [serviceCount] = await db.select({
            count: sql<number>`count(*)::int`,
        }).from(services);

        const [stateCount] = await db.select({
            count: sql<number>`count(*)::int`,
        }).from(states);

        const [cityCount] = await db.select({
            count: sql<number>`count(*)::int`,
        }).from(cities);

        const [pendingImports] = await db.select({
            count: sql<number>`count(*) filter (where status = 'processing')::int`,
        }).from(importJobs);

        return NextResponse.json({
            workshops: {
                total: workshopStats?.total || 0,
                active: workshopStats?.active || 0,
                pending: workshopStats?.pending || 0,
                draft: workshopStats?.draft || 0,
            },
            totalPageViews: workshopStats?.totalViews || 0,
            services: serviceCount?.count || 0,
            states: stateCount?.count || 0,
            cities: cityCount?.count || 0,
            pendingImports: pendingImports?.count || 0,
        });
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}

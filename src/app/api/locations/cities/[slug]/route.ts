import { NextResponse } from 'next/server';
import { db } from '@/db';
import { cities, states, workshops } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/locations/cities/[slug] - Get city by slug with workshops
export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Find city by slug
        const cityResult = await db.select()
            .from(cities)
            .where(eq(cities.slug, slug))
            .limit(1);

        if (cityResult.length === 0) {
            return NextResponse.json({ error: 'City not found' }, { status: 404 });
        }

        const city = cityResult[0];

        // Get state info
        let stateInfo = null;
        if (city.stateId) {
            const stateResult = await db.select()
                .from(states)
                .where(eq(states.id, city.stateId))
                .limit(1);
            if (stateResult.length > 0) {
                stateInfo = stateResult[0];
            }
        }

        // Get workshops in this city
        const workshopsResult = await db.select()
            .from(workshops)
            .where(eq(workshops.cityId, city.id));

        // Filter by active status
        const activeWorkshops = workshopsResult.filter(w => w.status === 'active');

        return NextResponse.json({
            city: {
                ...city,
                state: stateInfo,
                workshopCount: activeWorkshops.length,
            },
            workshops: activeWorkshops,
        });
    } catch (error) {
        console.error('Error fetching city:', error);
        return NextResponse.json(
            { error: 'Failed to fetch city' },
            { status: 500 }
        );
    }
}

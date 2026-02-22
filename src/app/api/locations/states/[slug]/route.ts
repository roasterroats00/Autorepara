import { NextResponse } from 'next/server';
import { db } from '@/db';
import { states, cities, workshops } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/locations/states/[slug] - Get state by slug with cities and workshops
export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Find state by slug
        const stateResult = await db.select()
            .from(states)
            .where(eq(states.slug, slug))
            .limit(1);

        if (stateResult.length === 0) {
            return NextResponse.json({ error: 'State not found' }, { status: 404 });
        }

        const state = stateResult[0];

        // Get cities in this state
        const citiesResult = await db.select()
            .from(cities)
            .where(eq(cities.stateId, state.id));

        // Get workshops in cities of this state
        const cityIds = citiesResult.map(c => c.id);
        let workshopsResult: typeof workshops.$inferSelect[] = [];

        if (cityIds.length > 0) {
            workshopsResult = await db.select()
                .from(workshops)
                .where(eq(workshops.status, 'active'));

            // Filter by city IDs
            workshopsResult = workshopsResult.filter(w =>
                w.cityId && cityIds.includes(w.cityId)
            );
        }

        return NextResponse.json({
            state: {
                ...state,
                workshopCount: workshopsResult.length,
            },
            cities: citiesResult,
            workshops: workshopsResult.slice(0, 10), // Limit to 10 for preview
        });
    } catch (error) {
        console.error('Error fetching state:', error);
        return NextResponse.json(
            { error: 'Failed to fetch state' },
            { status: 500 }
        );
    }
}

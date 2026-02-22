import { NextResponse } from 'next/server';
import { db } from '@/db';
import { cities, states } from '@/db/schema';
import { eq, asc, desc, sql } from 'drizzle-orm';

// GET /api/locations/cities - List cities
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const stateId = searchParams.get('stateId');
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

        let result;
        if (stateId) {
            result = await db.select()
                .from(cities)
                .leftJoin(states, eq(cities.stateId, states.id))
                .where(eq(cities.stateId, stateId))
                .orderBy(desc(cities.workshopCount))
                .limit(limit);
        } else {
            result = await db.select()
                .from(cities)
                .leftJoin(states, eq(cities.stateId, states.id))
                .where(eq(cities.isActive, true))
                .orderBy(desc(cities.workshopCount))
                .limit(limit);
        }

        return NextResponse.json(result.map(r => ({
            ...r.cities,
            state: r.states,
        })));
    } catch (error) {
        console.error('Error fetching cities:', error);
        return NextResponse.json(
            { error: 'Failed to fetch cities' },
            { status: 500 }
        );
    }
}

// POST /api/locations/cities - Create city
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const [newCity] = await db.insert(cities)
            .values(body)
            .returning();

        // Update state city count
        await db.update(states)
            .set({ cityCount: sql`city_count + 1` })
            .where(eq(states.id, body.stateId));

        return NextResponse.json(newCity, { status: 201 });
    } catch (error) {
        console.error('Error creating city:', error);
        return NextResponse.json(
            { error: 'Failed to create city' },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { db } from '@/db';
import { states, cities } from '@/db/schema';
import { eq, asc, desc, sql } from 'drizzle-orm';

// GET /api/locations/states - List all states
export async function GET() {
    try {
        const result = await db.select()
            .from(states)
            .where(eq(states.isActive, true))
            .orderBy(asc(states.name));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching states:', error);
        return NextResponse.json(
            { error: 'Failed to fetch states' },
            { status: 500 }
        );
    }
}

// POST /api/locations/states - Create state
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const [newState] = await db.insert(states)
            .values(body)
            .returning();

        return NextResponse.json(newState, { status: 201 });
    } catch (error) {
        console.error('Error creating state:', error);
        return NextResponse.json(
            { error: 'Failed to create state' },
            { status: 500 }
        );
    }
}

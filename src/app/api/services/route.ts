import { NextResponse } from 'next/server';
import { db } from '@/db';
import { services } from '@/db/schema';
import { eq, asc, desc } from 'drizzle-orm';

// GET /api/services - List all services
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const popular = searchParams.get('popular') === 'true';

        if (popular) {
            const result = await db.select()
                .from(services)
                .where(eq(services.isPopular, true))
                .orderBy(desc(services.workshopCount))
                .limit(12);
            return NextResponse.json(result);
        }

        const result = await db.select()
            .from(services)
            .where(eq(services.isActive, true))
            .orderBy(asc(services.displayOrder), asc(services.name));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching services:', error);
        return NextResponse.json(
            { error: 'Failed to fetch services' },
            { status: 500 }
        );
    }
}

// POST /api/services - Create service
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const [newService] = await db.insert(services)
            .values(body)
            .returning();

        return NextResponse.json(newService, { status: 201 });
    } catch (error) {
        console.error('Error creating service:', error);
        return NextResponse.json(
            { error: 'Failed to create service' },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { db } from '@/db';
import { settings } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/settings - Get site settings
export async function GET() {
    try {
        let [result] = await db.select().from(settings).where(eq(settings.id, 'main')).limit(1);

        // If no settings exist, create default ones
        if (!result) {
            [result] = await db.insert(settings).values({
                id: 'main',
                siteName: 'AutoRepara',
                siteDescriptionEn: 'Find trusted auto repair shops near you',
                contactEmail: 'contact@autorepara.net',
            }).returning();
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

// POST /api/settings - Update site settings
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Remove id and updatedAt if present to prevent issues
        const { id, updatedAt, ...updateData } = body;

        const [result] = await db
            .insert(settings)
            .values({
                id: 'main',
                ...updateData,
                updatedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: settings.id,
                set: {
                    ...updateData,
                    updatedAt: new Date(),
                },
            })
            .returning();

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}

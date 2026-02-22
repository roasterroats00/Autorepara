import { db } from '@/db';
import { settings } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Get site settings from database
 * This is server-side only as it accesses the database directly.
 */
export async function getSettings() {
    try {
        const [result] = await db.select().from(settings).where(eq(settings.id, 'main')).limit(1);
        return result || null;
    } catch (error) {
        console.error('Failed to fetch settings:', error);
        return null;
    }
}

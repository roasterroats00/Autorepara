import 'dotenv/config';
import { db } from '../src/db';
import { workshops } from '../src/db/schema';
import { isNull, not, or, like, eq } from 'drizzle-orm';
import { processWorkshopImages } from '../src/lib/image-processor';

async function localizeImages() {
    console.log('🔍 Finding workshops with external images...');

    // Find workshops where logoUrl is external or images contain external URLs
    const allWorkshops = await db.select().from(workshops);

    const pendingWorkshops = allWorkshops.filter(workshop => {
        const hasExternalLogo = workshop.logoUrl?.startsWith('http');
        const hasExternalImages = Array.isArray(workshop.images) &&
            workshop.images.some(img => typeof img === 'string' && img.startsWith('http'));
        return hasExternalLogo || hasExternalImages;
    });

    console.log(`Found ${pendingWorkshops.length} workshops to process.`);

    let successCount = 0;
    let failCount = 0;

    for (const workshop of pendingWorkshops) {
        try {
            console.log(`Processing: ${workshop.name}`);

            // Re-use processWorkshopImages logic
            // It expects a CSV row, but we can mock it with workshop data
            const mockRow = {
                logo: workshop.logoUrl,
                main_image: workshop.images && workshop.images.length > 0 ? workshop.images[0] : null
            };

            const result = await processWorkshopImages(mockRow, workshop.id);

            const updates: any = {};
            if (result.logoUrl && result.logoUrl !== workshop.logoUrl) {
                updates.logoUrl = result.logoUrl;
            }
            if (result.images && result.images.length > 0 && JSON.stringify(result.images) !== JSON.stringify(workshop.images)) {
                updates.images = result.images;
            }

            if (Object.keys(updates).length > 0) {
                await db.update(workshops)
                    .set(updates)
                    .where(eq(workshops.id, workshop.id));
                successCount++;
                console.log(`✅ Localized images for ${workshop.name}`);
            } else {
                console.log(`ℹ️ No changes needed for ${workshop.name}`);
            }

        } catch (error) {
            console.error(`❌ Failed processing ${workshop.name}:`, (error as Error).message);
            failCount++;
        }
    }

    console.log('\n--- Summary ---');
    console.log(`Localized: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    process.exit(0);
}

// Helper eq function for scripts
// (already imported at top)

localizeImages().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});

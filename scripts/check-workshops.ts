
import { db } from './src/db';
import { workshops } from './src/db/schema';

async function checkLogoUrls() {
    const results = await db.select({
        id: workshops.id,
        name: workshops.name,
        logoUrl: workshops.logoUrl,
        images: workshops.images
    }).from(workshops).limit(10);

    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
}

checkLogoUrls();

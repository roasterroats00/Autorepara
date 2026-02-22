import 'dotenv/config';
import { db } from '../src/db';
import { pages } from '../src/db/schema';

async function checkPages() {
    try {
        const allPages = await db.select().from(pages);
        console.log(`Found ${allPages.length} pages/blog posts.`);
        allPages.forEach(p => {
            console.log(`- [${p.type}] ${p.title} (${p.status})`);
        });
    } catch (error) {
        console.error('Error checking pages:', error);
    }
}

checkPages();

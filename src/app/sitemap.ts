import { MetadataRoute } from 'next';
import { db } from '@/db';
import { workshops, cities, states } from '@/db/schema';
import { sql } from 'drizzle-orm';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.autorepara.net';

    // Static pages
    const staticPages = [
        '',
        '/about',
        '/contact',
        '/partnership',
        '/search',
        '/blog',
        '/favorites',
    ];

    const pages: MetadataRoute.Sitemap = [];

    // Base paths for localization
    const locales = ['', '/es'];

    // 1. Add static pages
    staticPages.forEach((page) => {
        locales.forEach((locale) => {
            pages.push({
                url: `${baseUrl}${locale}${page}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: page === '' ? 1.0 : 0.8,
            });
        });
    });

    // 2. Fetch States
    const allStates = await db.select({ slug: states.slug }).from(states);
    allStates.forEach((state) => {
        locales.forEach((locale) => {
            pages.push({
                url: `${baseUrl}${locale}/state/${state.slug}`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.7,
            });
        });
    });

    // 3. Fetch Cities
    const allCities = await db.select({ slug: cities.slug }).from(cities);
    allCities.forEach((city) => {
        locales.forEach((locale) => {
            pages.push({
                url: `${baseUrl}${locale}/city/${city.slug}`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.7,
            });
        });
    });

    // 4. Fetch Workshops (limit to top 1000 for sitemap performance, or handle pagination if needed)
    // For now, let's fetch all active workshops
    const allWorkshops = await db.select({ id: workshops.id, slug: workshops.slug, slugEs: workshops.slugEs })
        .from(workshops)
        .where(sql`status = 'active'`)
        .limit(2000); // Reasonable limit for now

    allWorkshops.forEach((workshop) => {
        // English version
        pages.push({
            url: `${baseUrl}/workshop/${workshop.slug || workshop.id}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        });

        // Spanish version
        pages.push({
            url: `${baseUrl}/es/workshop/${workshop.slugEs || workshop.slug || workshop.id}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        });
    });

    return pages;
}



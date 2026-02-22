import { db } from '@/db';
import { workshops, workshopServices, services, cities, states } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import WorkshopDetailClient from '@/components/pages/WorkshopDetailClient';
import { WorkshopSchema, BreadcrumbSchema } from '@/components/seo/StructuredData';

// Fetch workshop helper
async function getWorkshop(id: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const result = await db.select({
        workshops: workshops,
        cityName: cities.name,
        stateName: states.name,
        stateCode: states.code
    })
        .from(workshops)
        .leftJoin(cities, eq(workshops.cityId, cities.id))
        .leftJoin(states, eq(cities.stateId, states.id))
        .where(isUuid ? eq(workshops.id, id) : eq(workshops.slug, id))
        .limit(1);

    if (result.length === 0) return null;

    // Get workshop services
    const workshopServicesList = await db.select()
        .from(workshopServices)
        .leftJoin(services, eq(workshopServices.serviceId, services.id))
        .where(eq(workshopServices.workshopId, result[0].workshops.id));

    // Increment view count asynchronously
    db.update(workshops)
        .set({ viewCount: sql`view_count + 1` })
        .where(eq(workshops.id, result[0].workshops.id))
        .execute();

    return {
        ...result[0].workshops,
        city: { name: result[0].cityName } as any,
        state: { name: result[0].stateName, code: result[0].stateCode } as any,
        services: workshopServicesList.map(ws => ws.services).filter(Boolean),
    };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const workshop = await getWorkshop(id);

    if (!workshop) {
        return { title: 'Workshop Not Found' };
    }

    const titleEn = workshop.metaTitleEn || `${workshop.name} - Expert Auto Repair in ${workshop.city?.name}`;
    const descriptionEn = workshop.metaDescriptionEn || `${workshop.name} offers specialized automotive services in ${workshop.city?.name}. +${workshop.reviewCount} customer reviews. Book now.`;

    const titleEs = workshop.metaTitleEs || `${workshop.name} - Taller Mecánico en ${workshop.city?.name}`;
    const descriptionEs = workshop.metaDescriptionEs || `${workshop.name} ofrece servicios automotrices especializados en ${workshop.city?.name}. Reseñas reales y servicio profesional.`;

    return {
        title: titleEn,
        description: descriptionEn,
        alternates: {
            canonical: `/workshop/${workshop.slug || workshop.id}`,
            languages: {
                'en-US': `/workshop/${workshop.slug || workshop.id}`,
                'es-MX': `/es/workshop/${workshop.slugEs || workshop.slug || workshop.id}`,
            },
        },
        openGraph: {
            title: titleEn,
            description: descriptionEn,
            url: `https://www.autorepara.net/workshop/${workshop.slug || workshop.id}`,
            images: workshop.images?.[0] ? [{ url: workshop.images[0] }] : [{ url: '/uploads/workshops/autorepara.png' }],
            type: 'website',
            locale: 'en_US',
        },
        other: {
            'es-title': titleEs,
            'es-description': descriptionEs,
            'geo.region': `MX-${workshop.state?.code || 'MX'}`,
            'geo.placename': workshop.city?.name || 'México',
            'geo.position': `${workshop.latitude};${workshop.longitude}`,
            'ICBM': `${workshop.latitude}, ${workshop.longitude}`
        }
    };
}

export default async function WorkshopDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const workshop = await getWorkshop(id);

    if (!workshop) {
        notFound();
    }

    const breadcrumbItems = [
        { name: 'Home', url: '/' },
        { name: 'Search', url: '/search' },
        { name: workshop.name, url: `/workshop/${workshop.slug || workshop.id}` }
    ];

    return (
        <>
            <WorkshopSchema workshop={workshop} lang="en" />
            <BreadcrumbSchema items={breadcrumbItems} />
            <WorkshopDetailClient workshop={workshop as any} />
        </>
    );
}

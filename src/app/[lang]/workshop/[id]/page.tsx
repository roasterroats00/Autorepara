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

export async function generateMetadata({ params }: { params: Promise<{ id: string; lang: string }> }): Promise<Metadata> {
    const { id, lang } = await params;
    const workshop = await getWorkshop(id);

    if (!workshop) {
        return { title: lang === 'es' ? 'Taller no encontrado' : 'Workshop Not Found' };
    }

    const titleAttr = lang === 'es' ? 'metaTitleEs' : 'metaTitleEn';
    const descAttr = lang === 'es' ? 'metaDescriptionEs' : 'metaDescriptionEn';

    const title = (workshop as any)[titleAttr] || (lang === 'es'
        ? `${workshop.name} - Taller Mecánico en ${workshop.city?.name}`
        : `${workshop.name} - Expert Auto Repair in ${workshop.city?.name}`);

    const description = (workshop as any)[descAttr] || (lang === 'es'
        ? `${workshop.name} ofrece servicios automotrices especializados en ${workshop.city?.name}. Reseñas reales y servicio profesional.`
        : `${workshop.name} offers specialized automotive services in ${workshop.city?.name}. +${workshop.reviewCount} customer reviews. Book now.`);

    return {
        title,
        description,
        alternates: {
            canonical: `/workshop/${workshop.slug || workshop.id}`,
            languages: {
                'en-US': `/workshop/${workshop.slug || workshop.id}`,
                'es-MX': `/es/workshop/${workshop.slugEs || workshop.slug || workshop.id}`,
            },
        },
        openGraph: {
            title,
            description,
            url: `https://www.autorepara.net/${lang}/workshop/${workshop.slug || workshop.id}`,
            images: workshop.images?.[0] ? [{ url: workshop.images[0] }] : [{ url: '/uploads/workshops/autorepara.png' }],
            type: 'website',
            locale: lang === 'es' ? 'es_MX' : 'en_US',
        }
    };
}

export default async function WorkshopDetailPageLang({ params }: { params: Promise<{ id: string; lang: string }> }) {
    const { id, lang } = await params;
    const workshop = await getWorkshop(id);

    if (!workshop) {
        notFound();
    }

    const breadcrumbItems = [
        { name: lang === 'es' ? 'Inicio' : 'Home', url: lang === 'es' ? '/es' : '/' },
        { name: lang === 'es' ? 'Buscar' : 'Search', url: lang === 'es' ? '/es/search' : '/search' },
        { name: workshop.name, url: `/${lang}/workshop/${workshop.slug || workshop.id}` }
    ];

    return (
        <>
            <WorkshopSchema workshop={workshop} lang={lang as any} />
            <BreadcrumbSchema items={breadcrumbItems} />
            <WorkshopDetailClient workshop={workshop as any} />
        </>
    );
}

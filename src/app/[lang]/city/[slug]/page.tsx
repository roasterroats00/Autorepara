import { db } from '@/db';
import { cities, states } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CityDetailClient from '@/components/pages/CityDetailClient';

async function getCity(slug: string) {
    const result = await db.select()
        .from(cities)
        .innerJoin(states, eq(cities.stateId, states.id))
        .where(eq(cities.slug, slug))
        .limit(1);

    return result.length > 0 ? result[0] : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; lang: string }> }): Promise<Metadata> {
    const { slug, lang } = await params;
    const data = await getCity(slug);

    if (!data) return { title: lang === 'es' ? 'Ciudad no encontrada' : 'City Not Found' };

    const cityName = data.cities.name;
    const stateName = data.states.name;

    const titleAttr = lang === 'es' ? 'metaTitleEs' : 'metaTitleEn';
    const descAttr = lang === 'es' ? 'metaDescriptionEs' : 'metaDescriptionEn';

    const title = (data.cities as any)[titleAttr] || (lang === 'es'
        ? `Los Mejores Talleres en ${cityName}, ${stateName} | AutoRepara`
        : `Best Auto Repair Shops in ${cityName}, ${stateName} | AutoRepara`);

    const description = (data.cities as any)[descAttr] || (lang === 'es'
        ? `Encuentra talleres mecánicos de confianza en ${cityName}, ${stateName}. Reseñas verificadas, calificaciones y el mejor servicio automotriz local.`
        : `Find top-rated, verified mechanics and workshops in ${cityName}, ${stateName}. Read customer reviews, check ratings, and book expert auto services online.`);

    return {
        title,
        description,
        alternates: {
            canonical: `/city/${slug}`,
            languages: {
                'en-US': `/city/${slug}`,
                'es-MX': `/es/city/${slug}`,
            }
        },
        openGraph: {
            title,
            description,
            url: `https://www.autorepara.net/${lang}/city/${slug}`,
            type: 'website',
            images: [{ url: '/uploads/workshops/autorepara.png' }],
            locale: lang === 'es' ? 'es_MX' : 'en_US',
        }
    };
}

export default async function CityPageLang({ params }: { params: Promise<{ slug: string; lang: string }> }) {
    const { slug } = await params;

    // Check if city exists
    const data = await getCity(slug);
    if (!data) notFound();

    return <CityDetailClient slug={slug} />;
}

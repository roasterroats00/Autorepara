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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const data = await getCity(slug);

    if (!data) return { title: 'City Not Found' };

    const cityName = data.cities.name;
    const stateName = data.states.name;

    const title = data.cities.metaTitleEn || `Best Auto Repair Shops in ${cityName}, ${stateName} | AutoRepara`;
    const description = data.cities.metaDescriptionEn || `Find top-rated, verified mechanics and workshops in ${cityName}, ${stateName}. Read customer reviews, check ratings, and book expert auto services online.`;

    const titleEs = data.cities.metaTitleEs || `Los Mejores Talleres en ${cityName}, ${stateName} | AutoRepara`;
    const descriptionEs = data.cities.metaDescriptionEs || `Encuentra talleres mecánicos de confianza en ${cityName}, ${stateName}. Reseñas verificadas, calificaciones y el mejor servicio automotriz local.`;

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
            url: `https://www.autorepara.net/city/${slug}`,
            type: 'website',
            images: [{ url: '/uploads/workshops/autorepara.png' }],
        },
        other: {
            'es-title': titleEs,
            'es-description': descriptionEs,
            'geo.region': 'MX',
            'geo.placename': cityName,
            'geo.position': `${data.cities.latitude};${data.cities.longitude}`,
            'ICBM': `${data.cities.latitude}, ${data.cities.longitude}`
        }
    };
}

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Check if city exists
    const data = await getCity(slug);
    if (!data) notFound();

    return <CityDetailClient slug={slug} />;
}

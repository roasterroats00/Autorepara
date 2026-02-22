import { db } from '@/db';
import { states } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StateDetailClient from '@/components/pages/StateDetailClient';

async function getState(slug: string) {
    const result = await db.select().from(states).where(eq(states.slug, slug)).limit(1);
    return result.length > 0 ? result[0] : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const state = await getState(slug);

    if (!state) return { title: 'State Not Found' };

    const title = state.metaTitleEn || `Best Auto Repair Shops in ${state.name} | AutoRepara`;
    const description = state.metaDescriptionEn || `Find verified, top-rated mechanics and auto repair services in ${state.name}. Extensive directory with reviews, ratings, and expert local services.`;

    const titleEs = state.metaTitleEs || `Los Mejores Talleres Mecánicos en ${state.name} | AutoRepara`;
    const descriptionEs = state.metaDescriptionEs || `Encuentra talleres mecánicos de confianza y servicios automotrices en ${state.name}. Directorio verificado con reseñas y calificaciones.`;

    return {
        title,
        description,
        alternates: {
            canonical: `/state/${slug}`,
            languages: {
                'en-US': `/state/${slug}`,
                'es-MX': `/es/state/${slug}`,
            }
        },
        openGraph: {
            title,
            description,
            url: `https://www.autorepara.net/state/${slug}`,
            type: 'website',
            images: [{ url: '/uploads/workshops/autorepara.png' }],
        },
        other: {
            'es-title': titleEs,
            'es-description': descriptionEs,
            'geo.region': `MX-${state.code}`,
            'geo.placename': state.name,
        }
    };
}

export default async function StatePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const state = await getState(slug);

    if (!state) notFound();

    return <StateDetailClient slug={slug} />;
}

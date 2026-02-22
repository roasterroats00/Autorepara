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

export async function generateMetadata({ params }: { params: Promise<{ slug: string; lang: string }> }): Promise<Metadata> {
    const { slug, lang } = await params;
    const state = await getState(slug);

    if (!state) return { title: lang === 'es' ? 'Estado no encontrado' : 'State Not Found' };

    const titleAttr = lang === 'es' ? 'metaTitleEs' : 'metaTitleEn';
    const descAttr = lang === 'es' ? 'metaDescriptionEs' : 'metaDescriptionEn';

    const title = (state as any)[titleAttr] || (lang === 'es'
        ? `Los Mejores Talleres Mecánicos en ${state.name} | AutoRepara`
        : `Best Auto Repair Shops in ${state.name} | AutoRepara`);

    const description = (state as any)[descAttr] || (lang === 'es'
        ? `Encuentra talleres mecánicos de confianza y servicios automotrices en ${state.name}. Directorio verificado con reseñas y calificaciones.`
        : `Find verified, top-rated mechanics and auto repair services in ${state.name}. Extensive directory with reviews, ratings, and expert local services.`);

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
            url: `https://www.autorepara.net/${lang}/state/${slug}`,
            type: 'website',
            images: [{ url: '/uploads/workshops/autorepara.png' }],
            locale: lang === 'es' ? 'es_MX' : 'en_US',
        }
    };
}

export default async function StatePageLang({ params }: { params: Promise<{ slug: string; lang: string }> }) {
    const { slug } = await params;
    const state = await getState(slug);

    if (!state) notFound();

    return <StateDetailClient slug={slug} />;
}

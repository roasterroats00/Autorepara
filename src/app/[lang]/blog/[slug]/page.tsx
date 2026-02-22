import BlogDetailClient from '@/components/pages/BlogDetailClient';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string; lang: string }> }): Promise<Metadata> {
    const { lang } = await params;

    if (lang === 'es') {
        return {
            title: 'Artículo del Blog | AutoRepara',
            description: 'Lee los últimos artículos de cuidado automotriz y guías de mantenimiento.',
        };
    }

    return {
        title: 'Blog Article | AutoRepara',
        description: 'Read the latest auto care articles and maintenance guides.',
    };
}

export default async function BlogArticlePageLang({ params }: { params: Promise<{ slug: string; lang: string }> }) {
    const { slug } = await params;
    return <BlogDetailClient slug={slug} />;
}

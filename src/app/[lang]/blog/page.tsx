import BlogClient from '@/components/pages/BlogClient';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
    const { lang } = await params;

    if (lang === 'es') {
        return {
            title: 'Blog de Cuidado Automotriz | AutoRepara',
            description: 'Consejos de expertos, guías de mantenimiento y las últimas noticias de reparación automotriz de AutoRepara.',
        };
    }

    return {
        title: 'Auto Care Blog | AutoRepara',
        description: 'Expert tips, maintenance guides, and the latest auto repair news from AutoRepara.',
    };
}

export default function BlogPageLang() {
    return <BlogClient />;
}

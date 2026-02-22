import FavoritesClient from '@/components/pages/FavoritesClient';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
    const { lang } = await params;

    if (lang === 'es') {
        return {
            title: 'Mis Talleres Favoritos | AutoRepara',
            description: 'Consulta tus talleres mecánicos y mecánicos guardados y favoritos.',
        };
    }

    return {
        title: 'My Favorite Workshops | AutoRepara',
        description: 'View your saved and favorite auto repair workshops and mechanics.',
    };
}

export default function FavoritesPageLang() {
    return <FavoritesClient />;
}

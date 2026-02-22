import FavoritesClient from '@/components/pages/FavoritesClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Favorite Workshops | AutoRepara',
    description: 'View your saved and favorite auto repair workshops and mechanics.',
};

export default function FavoritesPage() {
    return <FavoritesClient />;
}

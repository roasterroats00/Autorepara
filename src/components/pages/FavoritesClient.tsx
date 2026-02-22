'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { getProxiedImageUrl, getFallbackLogo } from '@/lib/client-image-utils';
import { useFavorites } from '@/hooks/useFavorites';
import FavoriteButton from '@/components/ui/FavoriteButton';

interface Workshop {
    id: string;
    name: string;
    address: string;
    rating: number;
    reviewCount: number;
    slug: string;
    isVerified?: boolean;
    descriptionEn?: string;
    descriptionEs?: string;
    logoUrl?: string;
    images?: string[];
}

export default function FavoritesClient() {
    const { t, lang: locale } = useTranslation();
    const { favorites, isLoaded } = useFavorites();
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded || favorites.length === 0) {
            setLoading(false);
            return;
        }

        // Fetch workshop details for each favorite
        Promise.all(
            favorites.map(id =>
                fetch(`/api/workshops/${id}`)
                    .then(res => res.ok ? res.json() : null)
                    .catch(() => null)
            )
        ).then(results => {
            setWorkshops(results.filter(Boolean));
            setLoading(false);
        });
    }, [favorites, isLoaded]);

    const getDescription = (workshop: Workshop) => {
        return locale === 'es'
            ? (workshop.descriptionEs || workshop.descriptionEn || '')
            : (workshop.descriptionEn || workshop.descriptionEs || '');
    };

    return (
        <>
            {/* Header */}
            <section className="py-12 bg-gradient-to-br from-red-500/10 to-transparent">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-14 h-14 bg-red-500/20 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-red-500 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                favorite
                            </span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">{t.favoritesPage.title}</h1>
                            <p className="text-gray-400">{t.favoritesPage.subtitle}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-4">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-mf-card rounded-xl p-6 animate-pulse">
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 bg-[#26342b] rounded-xl"></div>
                                        <div className="flex-1">
                                            <div className="h-5 bg-[#26342b] rounded w-1/3 mb-2"></div>
                                            <div className="h-4 bg-[#26342b] rounded w-1/2"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : workshops.length === 0 ? (
                        <div className="bg-mf-card rounded-xl p-12 text-center">
                            <span
                                className="material-symbols-outlined text-gray-500 text-6xl mb-4"
                                style={{ fontVariationSettings: "'FILL' 0" }}
                            >
                                favorite
                            </span>
                            <h3 className="text-xl font-semibold text-white mb-2">{t.favoritesPage.empty}</h3>
                            <p className="text-gray-400 mb-6">{t.favoritesPage.emptyDesc}</p>
                            <Link
                                href={locale === 'es' ? '/es/search' : '/search'}
                                className="inline-flex items-center gap-2 bg-mf-green text-mf-dark font-semibold px-6 py-3 rounded-lg hover:bg-mf-green-hover transition-colors"
                            >
                                <span className="material-symbols-outlined">search</span>
                                {t.favoritesPage.browseWorkshops}
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {workshops.map(workshop => (
                                <div key={workshop.id} className="bg-mf-card rounded-xl p-6">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        <div className="relative w-20 h-20 bg-white rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-[#26342b]">
                                            <img
                                                src={getProxiedImageUrl(workshop.logoUrl) || getFallbackLogo()}
                                                alt={workshop.name}
                                                className="w-full h-full object-contain p-2"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = getFallbackLogo();
                                                }}
                                            />
                                            <div className="absolute -top-2 -right-2">
                                                <FavoriteButton workshopId={workshop.id} size="sm" locale={locale} />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <Link
                                                href={locale === 'es' ? `/es/workshop/${workshop.slug || workshop.id}` : `/workshop/${workshop.slug || workshop.id}`}
                                                className="text-white font-semibold text-lg hover:text-mf-green transition-colors"
                                            >
                                                {workshop.name}
                                            </Link>
                                            <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                                                <span className="material-symbols-outlined text-sm">location_on</span>
                                                {workshop.address}
                                            </p>
                                            {getDescription(workshop) && (
                                                <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                                                    {getDescription(workshop)}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="flex items-center gap-1 text-mf-green">
                                                <span className="material-symbols-outlined text-lg">star</span>
                                                <span className="font-bold">{workshop.rating?.toFixed(1) || '-'}</span>
                                            </div>
                                            <p className="text-gray-500 text-sm">
                                                {workshop.reviewCount || 0} {t.common.reviews}
                                            </p>
                                            <Link
                                                href={locale === 'es' ? `/es/workshop/${workshop.slug || workshop.id}` : `/workshop/${workshop.slug || workshop.id}`}
                                                className="inline-flex items-center gap-1 text-mf-green text-sm mt-2 hover:text-mf-green-hover"
                                            >
                                                {t.home.viewDetails}
                                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

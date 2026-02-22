'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { getProxiedImageUrl, getFallbackLogo } from '@/lib/client-image-utils';

interface Workshop {
    id: string;
    name: string;
    address: string;
    rating: number;
    reviewCount: number;
    slug: string;
    isVerified?: boolean;
    isFeatured?: boolean;
    descriptionEn?: string;
    descriptionEs?: string;
    logoUrl?: string;
    images?: string[];
}

interface City {
    id: string;
    name: string;
    slug: string;
    state?: { name: string; code: string; slug: string };
    workshopCount?: number;
}

export default function CityDetailClient({ slug }: { slug: string }) {
    const { t, lang: locale } = useTranslation();
    const [city, setCity] = useState<City | null>(null);
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/api/locations/cities/${slug}`)
            .then(res => {
                if (!res.ok) throw new Error('City not found');
                return res.json();
            })
            .then(data => {
                setCity(data.city);
                setWorkshops(data.workshops || []);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [slug]);

    // Get description based on locale
    const getDescription = (workshop: Workshop) => {
        return locale === 'es'
            ? (workshop.descriptionEs || workshop.descriptionEn || '')
            : (workshop.descriptionEn || workshop.descriptionEs || '');
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-10 bg-mf-card rounded w-1/3 mb-4"></div>
                    <div className="h-6 bg-mf-card rounded w-1/4 mb-8"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-mf-card rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !city) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <span className="material-symbols-outlined text-gray-500 text-6xl mb-4">location_off</span>
                <h1 className="text-2xl font-bold text-white mb-2">
                    {t.cityPage.cityNotFound}
                </h1>
                <p className="text-gray-400 mb-6">
                    {t.cityPage.cityNotFoundDesc}
                </p>
                <Link
                    href="/search"
                    className="inline-flex items-center gap-2 bg-mf-green text-mf-dark font-semibold px-6 py-3 rounded-lg hover:bg-mf-green-hover"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    {t.cityPage.backToSearch}
                </Link>
            </div>
        );
    }

    return (
        <>
            {/* Breadcrumb */}
            <div className="bg-mf-card border-b border-[#26342b]">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Link href="/" className="hover:text-white">{t.common.home}</Link>
                        <span>/</span>
                        {city.state && (
                            <>
                                <Link href={`/${locale}/state/${city.state.slug}`} className="hover:text-white">
                                    {city.state.name}
                                </Link>
                                <span>/</span>
                            </>
                        )}
                        <span className="text-white">{city.name}</span>
                    </div>
                </div>
            </div>

            {/* Hero */}
            <section className="py-12 bg-gradient-to-br from-mf-green/10 to-transparent">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-mf-green/20 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-mf-green text-3xl">location_city</span>
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-white">{city.name}</h1>
                            <p className="text-gray-400">
                                {city.state && <span>{city.state.name}, {city.state.code} • </span>}
                                {workshops.length} {t.common.shops}
                            </p>
                        </div>
                    </div>
                    <p className="text-gray-300 max-w-2xl">
                        {locale === 'es'
                            ? `Encuentra los mejores talleres mecánicos en ${city.name}. Compara precios, lee reseñas y encuentra el taller perfecto para tu vehículo.`
                            : `Find the best auto repair shops in ${city.name}. Compare prices, read reviews, and find the perfect shop for your vehicle.`}
                    </p>
                </div>
            </section>

            {/* Workshops */}
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-2xl font-bold text-white mb-6">
                        {t.cityPage.workshopsIn} {city.name}
                    </h2>

                    {workshops.length === 0 ? (
                        <div className="bg-mf-card rounded-xl p-12 text-center">
                            <span className="material-symbols-outlined text-gray-500 text-5xl mb-4">store</span>
                            <h3 className="text-white font-semibold mb-2">
                                {t.cityPage.noWorkshopsAvailable}
                            </h3>
                            <p className="text-gray-400 mb-6">
                                {t.cityPage.noWorkshopsDesc}
                            </p>
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 text-mf-green hover:text-mf-green-hover"
                            >
                                {t.cityPage.ownAShop}
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {workshops.map((workshop) => (
                                <Link
                                    key={workshop.id}
                                    href={`/${locale}/workshop/${workshop.slug || workshop.id}`}
                                    className="block bg-mf-card rounded-xl p-6 hover:ring-2 hover:ring-mf-green/50 transition-all"
                                >
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="relative w-20 h-20 bg-white rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-[#26342b]">
                                            <img
                                                src={getProxiedImageUrl(workshop.logoUrl) || getFallbackLogo()}
                                                alt={workshop.name}
                                                className="w-full h-full object-contain p-2"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = getFallbackLogo();
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-white font-semibold text-lg">{workshop.name}</h3>
                                                {workshop.isVerified && (
                                                    <span className="material-symbols-outlined text-mf-green text-lg">verified</span>
                                                )}
                                                {workshop.isFeatured && (
                                                    <span className="px-2 py-0.5 bg-mf-green/20 text-mf-green text-xs rounded-full">
                                                        {t.common.featured}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-400 text-sm flex items-center gap-1">
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
                                                <span className="material-symbols-outlined">star</span>
                                                <span className="font-bold">{workshop.rating?.toFixed(1) || '-'}</span>
                                            </div>
                                            <p className="text-gray-500 text-sm">
                                                {workshop.reviewCount || 0} {t.common.reviews}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

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
    logoUrl?: string;
    images?: string[];
}

interface State {
    id: string;
    name: string;
    code: string;
    slug: string;
}

interface City {
    id: string;
    name: string;
    slug: string;
}

export default function StateDetailClient({ slug }: { slug: string }) {
    const { t, lang: locale } = useTranslation();
    const [state, setState] = useState<State | null>(null);
    const [cities, setCities] = useState<City[]>([]);
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/api/locations/states/${slug}`)
            .then(res => {
                if (!res.ok) throw new Error('State not found');
                return res.json();
            })
            .then(data => {
                setState(data.state);
                setCities(data.cities || []);
                setWorkshops(data.workshops || []);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [slug]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-10 bg-mf-card rounded w-1/3 mb-4"></div>
                    <div className="h-6 bg-mf-card rounded w-1/4 mb-8"></div>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-24 bg-mf-card rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !state) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <span className="material-symbols-outlined text-gray-500 text-6xl mb-4">location_off</span>
                <h1 className="text-2xl font-bold text-white mb-2">
                    {t.statePage.stateNotFound}
                </h1>
                <p className="text-gray-400 mb-6">
                    {t.statePage.stateNotFoundDesc}
                </p>
                <Link
                    href="/search"
                    className="inline-flex items-center gap-2 bg-mf-green text-mf-dark font-semibold px-6 py-3 rounded-lg hover:bg-mf-green-hover"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    {t.common.backToSearch}
                </Link>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="bg-mf-card border-b border-[#26342b]">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Link href="/" className="hover:text-white">{t.common.home}</Link>
                        <span>/</span>
                        <span className="text-white">{state.name}</span>
                    </div>
                </div>
            </div>

            {/* Hero */}
            <section className="py-12 bg-gradient-to-br from-mf-green/10 to-transparent">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-mf-green/20 rounded-xl flex items-center justify-center">
                            <span className="text-mf-green font-bold text-2xl">{state.code}</span>
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-white">{state.name}</h1>
                            <p className="text-gray-400">
                                {workshops.length} {t.common.shops} • {cities.length} {locale === 'es' ? 'ciudades' : 'cities'}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cities */}
            {cities.length > 0 && (
                <section className="py-8">
                    <div className="max-w-7xl mx-auto px-4">
                        <h2 className="text-2xl font-bold text-white mb-6">
                            {t.statePage.citiesIn} {state.name}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {cities.map((city) => (
                                <Link
                                    key={city.slug}
                                    href={`/${locale}/city/${city.slug}`}
                                    className="bg-mf-card rounded-xl p-4 hover:ring-2 hover:ring-mf-green/50 transition-all group flex items-center gap-3"
                                >
                                    <span className="material-symbols-outlined text-mf-green">location_city</span>
                                    <span className="text-white group-hover:text-mf-green transition-colors">{city.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Workshops */}
            <section className="py-8 bg-mf-card">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">
                            {t.statePage.workshopsIn} {state.name}
                        </h2>
                        <Link
                            href={`/search?state=${state.slug}`}
                            className="text-mf-green hover:text-mf-green-hover flex items-center gap-1"
                        >
                            {t.common.viewAll}
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                    </div>

                    {workshops.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="material-symbols-outlined text-gray-500 text-5xl mb-4">store</span>
                            <p className="text-gray-400">
                                {t.statePage.noWorkshopsInState}
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {workshops.slice(0, 6).map((workshop) => (
                                <Link
                                    key={workshop.id}
                                    href={`/${locale}/workshop/${workshop.slug || workshop.id}`}
                                    className="bg-mf-dark rounded-xl p-6 hover:ring-2 hover:ring-mf-green/50 transition-all group"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-[#26342b]">
                                            <img
                                                src={getProxiedImageUrl(workshop.logoUrl) || getFallbackLogo()}
                                                alt={workshop.name}
                                                className="w-full h-full object-contain p-2"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = getFallbackLogo();
                                                }}
                                            />
                                        </div>
                                        {workshop.isVerified && (
                                            <span className="material-symbols-outlined text-mf-green">verified</span>
                                        )}
                                    </div>
                                    <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-mf-green transition-colors">
                                        {workshop.name}
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-2">{workshop.address}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 text-mf-green">
                                            <span className="material-symbols-outlined text-sm">star</span>
                                            <span className="font-bold text-sm">{workshop.rating?.toFixed(1) || '-'}</span>
                                        </div>
                                        <span className="text-gray-500 text-sm">({workshop.reviewCount || 0})</span>
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

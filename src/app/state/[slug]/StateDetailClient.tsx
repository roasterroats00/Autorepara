'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { getFallbackLogo } from '@/lib/client-image-utils';

interface City {
    slug: string;
    name: string;
    workshopCount: number;
}

interface Workshop {
    id: string;
    name: string;
    slug?: string;
    city: string;
    rating: number;
    reviewCount: number;
}

interface StateDetailProps {
    state: {
        name: string;
        slug: string;
        descriptionEn?: string;
        descriptionEs?: string;
    };
    cities: City[];
    topWorkshops: Workshop[];
}

export default function StateDetailClient({ state, cities, topWorkshops }: StateDetailProps) {
    const { t, lang: locale } = useTranslation();
    const stateName = state.name;

    const description = locale === 'es'
        ? (state.descriptionEs || state.descriptionEn)
        : (state.descriptionEn || state.descriptionEs);

    return (
        <>
            {/* Breadcrumb */}
            <div className="bg-mf-card border-b border-[#26342b]">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Link href="/" className="hover:text-white">{t.common.home}</Link>
                        <span>/</span>
                        <span className="text-white">{stateName}</span>
                    </div>
                </div>
            </div>

            {/* Hero */}
            <section className="py-16 bg-mf-card">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        {t.statePage.autoRepairIn} <span className="text-mf-green">{stateName}</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                        {description || `Find trusted auto repair shops across ${stateName}. Browse by city or search for specific services.`}
                    </p>
                    <div className="max-w-xl mx-auto">
                        <Link
                            href={`/search?state=${state.slug}`}
                            className="inline-flex items-center gap-2 bg-mf-green text-mf-dark font-semibold px-8 py-4 rounded-full hover:bg-mf-green-hover transition-colors shadow-lg shadow-mf-green/20"
                        >
                            <span className="material-symbols-outlined">search</span>
                            {t.statePage.searchPlaceholder} {stateName}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Cities Grid */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-mf-green">location_city</span>
                            {t.statePage.citiesIn} {stateName}
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {cities.map((city) => (
                            <Link
                                key={city.slug}
                                href={`/city/${city.slug}`}
                                className="bg-mf-card border border-[#26342b] p-6 rounded-xl hover:border-mf-green/50 hover:bg-[#26342b] transition-all text-center group"
                            >
                                <h3 className="text-white font-semibold group-hover:text-mf-green transition-colors">{city.name}</h3>
                                <p className="text-gray-400 text-sm mt-1">{city.workshopCount} {t.common.shops}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Top Workshops */}
            <section className="py-12 bg-mf-card/50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-mf-green">star</span>
                            {t.statePage.topRatedIn} {stateName}
                        </h2>
                        <Link href={`/search?state=${state.slug}`} className="text-mf-green hover:underline flex items-center gap-1">
                            {t.common.viewAll} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {topWorkshops.map((workshop) => (
                            <Link
                                key={workshop.id}
                                href={`/workshop/${workshop.slug || workshop.id}`}
                                className="bg-mf-dark border border-[#26342b] p-6 rounded-xl hover:border-mf-green/50 hover:bg-[#1a2e1f]/20 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-mf-green/20">
                                        <img
                                            src={getFallbackLogo()}
                                            alt={workshop.name}
                                            className="w-full h-full object-contain p-2"
                                        />
                                    </div>
                                    <div className="flex items-center gap-1 bg-mf-green/10 text-mf-green px-2 py-1 rounded-lg">
                                        <span className="material-symbols-outlined text-sm fill-1">star</span>
                                        <span className="font-bold text-sm">{workshop.rating.toFixed(1)}</span>
                                    </div>
                                </div>
                                <h3 className="text-white font-bold group-hover:text-mf-green transition-colors">{workshop.name}</h3>
                                <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">location_on</span>
                                    {workshop.city}
                                </p>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-gray-500 text-xs">{workshop.reviewCount} reviews</span>
                                    <span className="material-symbols-outlined text-mf-green opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}

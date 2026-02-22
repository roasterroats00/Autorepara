'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { getFallbackLogo } from '@/lib/client-image-utils';

interface Workshop {
    id: string;
    name: string;
    slug?: string;
    address: string;
    rating: number;
    reviewCount: number;
    services: string[];
}

interface Service {
    slug: string;
    name: string;
    icon: string;
    count: number;
}

interface CityDetailProps {
    city: {
        name: string;
        slug: string;
        descriptionEn?: string;
        descriptionEs?: string;
        latitude?: number;
        longitude?: number;
        workshopCount: number;
        avgRating: number;
    };
    state: {
        name: string;
        slug: string;
    };
    popularServices: Service[];
    topWorkshops: Workshop[];
}

export default function CityDetailClient({ city, state, popularServices, topWorkshops }: CityDetailProps) {
    const { t, lang: locale } = useTranslation();
    const cityName = city.name;

    const description = locale === 'es'
        ? (city.descriptionEs || city.descriptionEn)
        : (city.descriptionEn || city.descriptionEs);

    return (
        <>
            {/* Breadcrumb */}
            <div className="bg-mf-card border-b border-[#26342b]">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Link href="/" className="hover:text-white">{t.common.home}</Link>
                        <span>/</span>
                        <Link href={`/state/${state.slug}`} className="hover:text-white">{state.name}</Link>
                        <span>/</span>
                        <span className="text-white">{cityName}</span>
                    </div>
                </div>
            </div>

            {/* Hero */}
            <section className="py-16 bg-mf-card">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        {t.cityPage.autoRepairIn} <span className="text-mf-green">{cityName}</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                        {description || `Discover top-rated, verified mechanics in ${cityName}. We've curated the most trusted workshops for your automotive needs in ${state.name}.`}
                    </p>
                    <div className="flex justify-center gap-12 mt-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-mf-green">{city.workshopCount}</div>
                            <div className="text-gray-400 text-sm font-medium uppercase tracking-wider">{t.cityPage.verified}</div>
                        </div>
                        <div className="text-center border-l border-white/10 pl-12">
                            <div className="text-3xl font-bold text-mf-green">{city.avgRating?.toFixed(1) || '4.8'}</div>
                            <div className="text-gray-400 text-sm font-medium uppercase tracking-wider">{t.cityPage.avgRating}</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Popular Services Section */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-mf-green">psychology</span>
                            {t.cityPage.popularServices} {cityName}
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {popularServices.map((service) => (
                            <Link
                                key={service.slug}
                                href={`/search?city=${city.slug}&service=${service.slug}`}
                                className="bg-mf-card border border-[#26342b] p-8 rounded-xl hover:border-mf-green/50 hover:bg-[#26342b] transition-all text-center group"
                            >
                                <div className="w-14 h-14 bg-mf-green/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-mf-green text-2xl">{service.icon}</span>
                                </div>
                                <h3 className="text-white font-bold group-hover:text-mf-green transition-colors">{service.name}</h3>
                                <p className="text-gray-400 text-sm mt-1">{service.count} {t.common.shops}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Best Rated Workshops Section */}
            <section className="py-12 bg-mf-card/30">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-mf-green">workspace_premium</span>
                            {t.cityPage.topRatedIn} {cityName}
                        </h2>
                        <Link href={`/search?city=${city.slug}`} className="text-mf-green hover:underline flex items-center gap-1">
                            {t.common.viewAll} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                    </div>
                    <div className="grid gap-6">
                        {topWorkshops.map((workshop) => (
                            <Link
                                key={workshop.id}
                                href={`/workshop/${workshop.slug || workshop.id}`}
                                className="bg-mf-dark border border-[#26342b] p-6 rounded-2xl hover:border-mf-green/50 hover:bg-[#1a2e1f]/20 transition-all group shadow-xl"
                            >
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shrink-0 overflow-hidden border border-mf-green/20 shadow-inner">
                                        <img
                                            src={getFallbackLogo()}
                                            alt={workshop.name}
                                            className="w-full h-full object-contain p-2"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white group-hover:text-mf-green transition-colors">{workshop.name}</h3>
                                        <p className="text-gray-400 mt-1 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">location_on</span>
                                            {workshop.address}, {cityName}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {workshop.services.map((s) => (
                                                <span key={s} className="px-3 py-1 bg-[#26342b] text-gray-300 text-xs font-medium rounded-full border border-white/5">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="md:text-right border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8 flex flex-row md:flex-col justify-between items-center">
                                        <div className="flex items-center gap-1.5 text-mf-green">
                                            <span className="material-symbols-outlined text-2xl fill-1">star</span>
                                            <span className="font-bold text-2xl">{workshop.rating.toFixed(1)}</span>
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium mt-1">{workshop.reviewCount} reviews</p>
                                    </div>
                                    <span className="hidden md:block material-symbols-outlined text-mf-green opacity-0 group-hover:opacity-100 transition-opacity ml-4">arrow_forward</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="text-center mt-12">
                        <Link
                            href={`/search?city=${city.slug}`}
                            className="inline-flex items-center gap-2 bg-mf-dark border border-mf-green text-mf-green font-semibold px-8 py-3 rounded-xl hover:bg-mf-green/10 transition-all"
                        >
                            {t.common.viewAll} in {cityName}
                            <span className="material-symbols-outlined">east</span>
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}

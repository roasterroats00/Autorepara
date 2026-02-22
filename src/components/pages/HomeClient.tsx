'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { getProxiedImageUrl, getFallbackLogo } from '@/lib/client-image-utils';
import { useState, useEffect } from 'react';
import { OrganizationSchema, LocalBusinessSchema, WebsiteSchema } from '@/components/seo/StructuredData';
import FavoriteButton from '@/components/ui/FavoriteButton';

// Helper function to format numbers consistently
function formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

interface Workshop {
    id: string;
    name: string;
    address?: string;
    rating: number;
    reviewCount: number;
    slug: string;
    isVerified?: boolean;
    isFeatured?: boolean;
    logoUrl?: string;
}

interface State {
    name: string;
    code: string;
    slug: string;
    workshopCount: number;
}

interface Service {
    name: string;
    nameEs?: string;
    slug: string;
    icon?: string;
}

const whyChooseUs = [
    { icon: 'verified', title: 'Verified Shops', titleEs: 'Talleres Verificados', desc: 'Every shop is thoroughly vetted', descEs: 'Cada taller es minuciosamente verificado' },
    { icon: 'star', title: 'Real Reviews', titleEs: 'Reseñas Reales', desc: 'Authentic customer feedback', descEs: 'Comentarios auténticos de clientes' },
    { icon: 'location_on', title: 'Nationwide Coverage', titleEs: 'Cobertura Nacional', desc: 'Shops across the country', descEs: 'Talleres en todo el país' },
    { icon: 'translate', title: 'Bilingual Support', titleEs: 'Soporte Bilingüe', desc: 'English & Spanish services', descEs: 'Servicios en inglés y español' },
];

const serviceColors: Record<string, string> = {
    'oil-change': 'from-amber-500 to-orange-600',
    'brake-repair': 'from-red-500 to-rose-600',
    'tire-services': 'from-blue-500 to-cyan-600',
    'ac-repair': 'from-cyan-500 to-teal-600',
    'engine-diagnostics': 'from-purple-500 to-violet-600',
};

function getLink(path: string, lang: string): string {
    return lang === 'es' ? `/es${path}` : path;
}

export default function HomeClient() {
    const { t, lang } = useTranslation();
    const [featuredWorkshops, setFeaturedWorkshops] = useState<Workshop[]>([]);
    const [states, setStates] = useState<State[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ workshops: 0, states: 0, services: 0 });

    useEffect(() => {
        Promise.all([
            fetch('/api/workshops?limit=10&status=active&sortBy=rating&sortOrder=desc').then(res => res.json()),
            fetch('/api/locations/states').then(res => res.json()),
            fetch('/api/services').then(res => res.json()),
        ])
            .then(([workshopsData, statesData, servicesData]) => {
                setFeaturedWorkshops(workshopsData.data || []);
                setStates(statesData || []);
                setServices((servicesData.data || servicesData || []).slice(0, 8));
                setStats({
                    workshops: workshopsData.pagination?.total || workshopsData.data?.length || 0,
                    states: statesData?.length || 0,
                    services: (servicesData.data || servicesData || []).length,
                });
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <>
            <OrganizationSchema />
            <LocalBusinessSchema />
            <WebsiteSchema />

            <section className="relative py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-mf-dark via-[#1a2a1f] to-mf-dark"></div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
                <div className="relative max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
                        {t.home.heroTitle.split(' ').map((word, i, arr) => (
                            i >= arr.length - 2 ? <span key={i} className="text-mf-green">{word} </span> : word + ' '
                        ))}
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
                        {t.home.heroSubtitle}
                    </p>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const query = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
                            window.location.href = getLink(`/search?search=${encodeURIComponent(query)}`, lang);
                        }}
                        className="max-w-2xl mx-auto mb-8 relative"
                    >
                        <input
                            name="search"
                            type="text"
                            placeholder={t.home.searchPlaceholder}
                            className="w-full pl-12 pr-4 py-5 bg-mf-card border border-[#26342b] rounded-full text-white focus:outline-none focus:ring-2 focus:ring-mf-green focus:border-transparent"
                        />
                        <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500 hover:text-mf-green">search</button>
                    </form>
                    <div className="flex justify-center gap-8 text-gray-400 text-sm">
                        <span><strong className="text-white">{stats.workshops}+</strong> {t.common.shops}</span>
                        <span><strong className="text-white">{stats.states}</strong> {t.common.states}</span>
                    </div>
                </div>
            </section>

            <section className="py-24 relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-mf-green/5 blur-[120px] rounded-full -z-10"></div>

                <div className="relative max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div className="text-left">
                            <h2 className="text-mf-green font-bold tracking-widest text-sm uppercase mb-3 px-1 border-l-4 border-mf-green leading-none">{t.home.premiumPartners}</h2>
                            <h2 className="text-4xl md:text-5xl font-black text-white">
                                {t.home.featuredWorkshops}
                            </h2>
                        </div>
                        <p className="text-gray-400 max-w-sm text-left md:text-right leading-relaxed">
                            {t.home.trustedSelection}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {featuredWorkshops.slice(0, 3).map((w, index) => (
                            <div key={w.id} className="group relative">
                                {/* Intense glow effect on hover */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-mf-green/30 to-emerald-500/30 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>

                                <Link href={getLink(`/workshop/${w.slug || w.id}`, lang)}
                                    className="relative block h-full bg-[#152018] border border-white/5 rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-mf-green/10">

                                    {/* Card Header Background */}
                                    <div className="h-32 bg-gradient-to-br from-[#1e2e22] to-[#0f1811] relative overflow-hidden">
                                        <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')]"></div>
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#152018]/80"></div>

                                        {w.isFeatured && (
                                            <div className="absolute top-5 right-5 z-10">
                                                <div className="backdrop-blur-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-2xl">
                                                    <span className="material-symbols-outlined text-[14px] fill-1">stars</span>
                                                    {t.home.premiumBadge}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Main Content Body */}
                                    <div className="px-8 pb-8 -mt-12 relative">
                                        {/* Logo with high-end container */}
                                        <div className="relative w-24 h-24 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-2xl border-[6px] border-[#152018] group-hover:scale-110 transition-transform duration-700 ease-out">
                                            <img src={getProxiedImageUrl(w.logoUrl) || getFallbackLogo()} className="w-full h-full object-contain p-2" alt={w.name} />
                                            <div className="absolute -top-2 -right-2 z-20" onClick={(e) => e.preventDefault()}>
                                                <FavoriteButton workshopId={w.id} size="sm" locale={lang} />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-2xl font-bold text-white group-hover:text-mf-green transition-colors duration-300 line-clamp-1">{w.name}</h3>
                                                <div className="flex items-center gap-2 mt-2 text-gray-500">
                                                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                                                    <span className="text-xs font-medium truncate">{w.address}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-5 border-t border-white/5">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="flex text-yellow-400">
                                                        <span className="material-symbols-outlined text-xl fill-1">star</span>
                                                    </div>
                                                    <span className="text-white font-black text-lg">{w.rating}</span>
                                                    <span className="text-gray-500 text-xs font-medium ml-1">({w.reviewCount} {t.common.reviews})</span>
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <div className="inline-flex items-center gap-2 text-mf-green font-bold text-sm tracking-wide">
                                                    {t.home.viewDetails}
                                                    <span className="material-symbols-outlined text-sm group-hover:translate-x-2 transition-transform duration-300">east</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-mf-card text-center">
                <h2 className="text-3xl font-bold text-white mb-10">{t.home.popularServices}</h2>
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {services.map(s => (
                        <Link key={s.slug} href={getLink(`/search?service=${s.slug}`, lang)} className="bg-mf-dark p-6 rounded-2xl hover:ring-2 hover:ring-mf-green/50">
                            <div className="w-12 h-12 bg-mf-green/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-mf-green">{s.icon || 'build'}</span>
                            </div>
                            <h3 className="text-white font-semibold">{lang === 'es' && s.nameEs ? s.nameEs : s.name}</h3>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="py-20 bg-transparent">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-3xl font-bold text-white">{t.home.recentListings}</h2>
                        <Link href={getLink('/search', lang)} className="text-mf-green hover:underline flex items-center gap-1">
                            {t.common.viewAll} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {featuredWorkshops.slice(3, 9).map(w => (
                            <Link key={w.id} href={getLink(`/workshop/${w.slug || w.id}`, lang)} className="bg-mf-card p-6 rounded-2xl flex gap-6 hover:ring-2 hover:ring-mf-green/50 transition-all group">
                                <div className="relative w-20 h-20 bg-white rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-[#26342b]">
                                    <img src={getProxiedImageUrl(w.logoUrl) || getFallbackLogo()} className="w-full h-full object-contain p-2" alt={w.name} />
                                    <div className="absolute -top-2 -right-2 z-10" onClick={(e) => e.preventDefault()}>
                                        <FavoriteButton workshopId={w.id} size="sm" locale={lang} />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-lg font-bold text-white truncate group-hover:text-mf-green transition-colors">{w.name}</h3>
                                        <div className="flex items-center gap-1 text-mf-green">
                                            <span className="material-symbols-outlined text-sm fill-1">star</span>
                                            <span className="font-bold">{w.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-sm truncate">{w.address}</p>
                                    <div className="flex items-center gap-3 mt-4">
                                        <span className="text-gray-500 text-xs">{w.reviewCount} {lang === 'es' ? 'reseñas' : 'reviews'}</span>
                                        {w.isVerified && (
                                            <span className="flex items-center gap-1 text-mf-green text-[10px] font-bold px-2 py-0.5 bg-mf-green/10 rounded-full border border-mf-green/20">
                                                <span className="material-symbols-outlined text-[12px]">verified</span>
                                                {t.home.verifiedBadge}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}

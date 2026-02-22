'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { getProxiedImageUrl, getFallbackLogo } from '@/lib/client-image-utils';
import SearchAutocomplete from '@/components/ui/SearchAutocomplete';
import FavoriteButton from '@/components/ui/FavoriteButton';

interface Workshop {
    id: string;
    name: string;
    address: string;
    rating: number;
    reviewCount: number;
    descriptionEn?: string;
    descriptionEs?: string;
    slug: string;
    isVerified?: boolean;
    isFeatured?: boolean;
    logoUrl?: string;
    images?: string[];
}

interface Service {
    id: string;
    name: string;
    nameEs?: string;
    slug: string;
    icon?: string;
}

export default function SearchClient() {
    const { t, lang: locale } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('rating');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 0, page: 1, limit: 10 });

    // Fetch workshops and services
    useEffect(() => {
        setLoading(true);

        const params = new URLSearchParams({
            limit: '10',
            page: currentPage.toString(),
            status: 'active',
            sortBy: sortBy,
            sortOrder: 'desc',
        });

        if (searchQuery) {
            params.set('search', searchQuery);
        }

        // Add service filter if selected
        if (selectedService) {
            params.set('service', selectedService);
        }

        Promise.all([
            fetch(`/api/workshops?${params.toString()}`).then(res => res.json()),
            fetch('/api/services').then(res => res.json()),
        ])
            .then(([workshopsData, servicesData]) => {
                setWorkshops(workshopsData.data || []);
                setPagination(workshopsData.pagination || { total: 0, totalPages: 0, page: 1, limit: 10 });
                setServices(servicesData.data || servicesData || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [searchQuery, sortBy, selectedService, currentPage]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedService, sortBy]);

    // Get service name based on locale
    const getServiceName = (service: Service) => {
        return locale === 'es' && service.nameEs ? service.nameEs : service.name;
    };

    // Workshops are already filtered by API
    const filteredWorkshops = workshops;

    return (
        <>
            {/* Search Section */}
            <section className="py-8 bg-mf-card border-b border-[#26342b]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="max-w-2xl mx-auto">
                        <SearchAutocomplete
                            locale={locale}
                            placeholder={t.hero.searchPlaceholder}
                            onSelect={(result) => {
                                if (result.type === 'service') {
                                    setSelectedService(result.slug || null);
                                } else if (result.type === 'workshop') {
                                    setSearchQuery(result.name);
                                }
                            }}
                        />
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar - Filters */}
                    <aside className="w-full lg:w-64 shrink-0">
                        <div className="bg-mf-card rounded-xl p-6">
                            <h3 className="text-white font-semibold mb-4">
                                {t.searchPage.filterByService}
                            </h3>
                            <div className="space-y-2">
                                {services.map((service) => (
                                    <button
                                        key={service.slug}
                                        onClick={() => setSelectedService(selectedService === service.slug ? null : service.slug)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${selectedService === service.slug
                                            ? 'bg-mf-green/20 text-mf-green'
                                            : 'text-gray-400 hover:bg-[#26342b] hover:text-white'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-lg">{service.icon || 'build'}</span>
                                        <span className="text-sm">{getServiceName(service)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Results */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {loading ? (
                                    <span className="text-gray-400">
                                        {t.searchPage.searching}
                                    </span>
                                ) : (
                                    <>
                                        {filteredWorkshops.length} {t.searchPage.workshopsFound}
                                    </>
                                )}
                            </h2>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-mf-card border border-[#26342b] rounded-lg px-4 py-2 text-gray-300 text-sm"
                            >
                                <option value="rating">{t.searchPage.sortByRating}</option>
                                <option value="reviewCount">{t.searchPage.sortByReviews}</option>
                                <option value="name">{t.searchPage.sortByName}</option>
                            </select>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-mf-card rounded-xl p-6 animate-pulse">
                                        <div className="flex gap-4">
                                            <div className="w-20 h-20 bg-[#26342b] rounded-xl"></div>
                                            <div className="flex-1 space-y-3">
                                                <div className="h-5 bg-[#26342b] rounded w-1/3"></div>
                                                <div className="h-4 bg-[#26342b] rounded w-1/2"></div>
                                                <div className="h-4 bg-[#26342b] rounded w-1/4"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredWorkshops.length === 0 ? (
                            <div className="bg-mf-card rounded-xl p-8 text-center">
                                <span className="material-symbols-outlined text-gray-500 text-5xl mb-4">search_off</span>
                                <h3 className="text-white font-semibold mb-2">
                                    {t.searchPage.noWorkshopsFound}
                                </h3>
                                <p className="text-gray-400">
                                    {t.searchPage.tryDifferentSearch}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredWorkshops.map((workshop) => (
                                    <Link
                                        key={workshop.id}
                                        href={`/${locale}/workshop/${workshop.slug || workshop.id}`}
                                        className="block bg-mf-card rounded-xl p-6 hover:ring-2 hover:ring-mf-green/50 transition-all"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                                            <div className="relative w-20 h-20 bg-white rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-[#26342b]">
                                                {(() => {
                                                    const logoUrl = workshop.logoUrl;
                                                    return (
                                                        <img
                                                            src={getProxiedImageUrl(logoUrl) || getFallbackLogo()}
                                                            alt={workshop.name}
                                                            className="w-full h-full object-contain p-2"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = getFallbackLogo();
                                                            }}
                                                        />
                                                    );
                                                })()}
                                                <div className="absolute -top-2 -right-2">
                                                    <FavoriteButton workshopId={workshop.id} size="sm" locale={locale} />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-white font-semibold text-lg">{workshop.name}</h3>
                                                    {workshop.isVerified && (
                                                        <span className="material-symbols-outlined text-mf-green text-lg" title="Verified">verified</span>
                                                    )}
                                                    {workshop.isFeatured && (
                                                        <span className="px-2 py-0.5 bg-mf-green/20 text-mf-green text-xs rounded-full">
                                                            {t.common.featured}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                                    {workshop.address}
                                                </p>
                                                {(workshop.descriptionEn || workshop.descriptionEs) && (
                                                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                                                        {locale === 'es'
                                                            ? (workshop.descriptionEs || workshop.descriptionEn)
                                                            : (workshop.descriptionEn || workshop.descriptionEs)
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1 text-mf-green">
                                                    <span className="material-symbols-outlined text-lg">star</span>
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

                        {/* Pagination */}
                        {!loading && pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 bg-mf-card rounded-lg text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>

                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (pagination.totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= pagination.totalPages - 2) {
                                        pageNum = pagination.totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === pageNum
                                                ? 'bg-mf-green text-mf-dark'
                                                : 'bg-mf-card text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                                    disabled={currentPage === pagination.totalPages}
                                    className="p-2 bg-mf-card rounded-lg text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

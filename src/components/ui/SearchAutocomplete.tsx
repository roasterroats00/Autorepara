'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface SearchResult {
    type: 'workshop' | 'service' | 'city' | 'state';
    id: string;
    name: string;
    slug?: string;
    address?: string;
    icon?: string;
}

interface SearchAutocompleteProps {
    locale: string;
    placeholder?: string;
    onSelect?: (result: SearchResult) => void;
}

export default function SearchAutocomplete({ locale, placeholder, onSelect }: SearchAutocompleteProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const t = {
        placeholder: placeholder || (locale === 'es'
            ? 'Buscar talleres, servicios o ciudades...'
            : 'Search for workshops, services, or cities...'),
        workshops: locale === 'es' ? 'Talleres' : 'Workshops',
        services: locale === 'es' ? 'Servicios' : 'Services',
        cities: locale === 'es' ? 'Ciudades' : 'Cities',
        states: locale === 'es' ? 'Estados' : 'States',
        noResults: locale === 'es' ? 'No se encontraron resultados' : 'No results found',
        searching: locale === 'es' ? 'Buscando...' : 'Searching...',
    };

    // Debounced search
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const [workshopsRes, servicesRes, citiesRes] = await Promise.all([
                    fetch(`/api/workshops?search=${encodeURIComponent(query)}&limit=5`).then(r => r.json()),
                    fetch('/api/services').then(r => r.json()),
                    fetch('/api/locations/cities').then(r => r.json()),
                ]);

                const allResults: SearchResult[] = [];

                // Filter workshops
                if (workshopsRes.data) {
                    workshopsRes.data.slice(0, 3).forEach((w: { id: string; name: string; slug: string; address: string }) => {
                        allResults.push({
                            type: 'workshop',
                            id: w.id,
                            name: w.name,
                            slug: w.slug,
                            address: w.address,
                            icon: 'store',
                        });
                    });
                }

                // Filter services
                const servicesData = servicesRes.data || servicesRes;
                if (Array.isArray(servicesData)) {
                    servicesData
                        .filter((s: { name: string; nameEs?: string }) =>
                            s.name.toLowerCase().includes(query.toLowerCase()) ||
                            (s.nameEs && s.nameEs.toLowerCase().includes(query.toLowerCase()))
                        )
                        .slice(0, 3)
                        .forEach((s: { id: string; name: string; nameEs?: string; slug: string; icon?: string }) => {
                            allResults.push({
                                type: 'service',
                                id: s.id,
                                name: locale === 'es' && s.nameEs ? s.nameEs : s.name,
                                slug: s.slug,
                                icon: s.icon || 'build',
                            });
                        });
                }

                // Filter cities
                if (Array.isArray(citiesRes)) {
                    citiesRes
                        .filter((c: { name: string }) =>
                            c.name.toLowerCase().includes(query.toLowerCase())
                        )
                        .slice(0, 3)
                        .forEach((c: { id: string; name: string; slug: string }) => {
                            allResults.push({
                                type: 'city',
                                id: c.id,
                                name: c.name,
                                slug: c.slug,
                                icon: 'location_city',
                            });
                        });
                }

                setResults(allResults);
                setIsOpen(allResults.length > 0 || query.length >= 2);
            } catch (e) {
                console.error('Search error:', e);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, locale]);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && results[selectedIndex]) {
                    handleSelect(results[selectedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSelectedIndex(-1);
                break;
        }
    };

    const handleSelect = (result: SearchResult) => {
        setQuery(result.name);
        setIsOpen(false);
        setSelectedIndex(-1);
        if (onSelect) {
            onSelect(result);
        }
    };

    const getResultUrl = (result: SearchResult) => {
        switch (result.type) {
            case 'workshop':
                return `/${locale}/workshop/${result.slug || result.id}`;
            case 'service':
                return `/${locale}/search?service=${result.slug}`;
            case 'city':
                return `/${locale}/city/${result.slug}`;
            case 'state':
                return `/${locale}/state/${result.slug}`;
            default:
                return `/${locale}/search`;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'workshop': return t.workshops;
            case 'service': return t.services;
            case 'city': return t.cities;
            case 'state': return t.states;
            default: return '';
        }
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
                inputRef.current && !inputRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full">
            <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    search
                </span>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => results.length > 0 && setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={t.placeholder}
                    className="w-full bg-mf-dark border border-[#26342b] rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-mf-green/50"
                />
                {loading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-mf-green border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 w-full mt-2 bg-mf-card border border-[#26342b] rounded-xl shadow-xl overflow-hidden"
                >
                    {results.length === 0 && !loading ? (
                        <div className="px-4 py-6 text-center text-gray-400">
                            <span className="material-symbols-outlined text-3xl mb-2 block">search_off</span>
                            {t.noResults}
                        </div>
                    ) : (
                        <div className="divide-y divide-[#26342b]">
                            {results.map((result, index) => (
                                <Link
                                    key={`${result.type}-${result.id}`}
                                    href={getResultUrl(result)}
                                    onClick={() => handleSelect(result)}
                                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${index === selectedIndex
                                            ? 'bg-mf-green/10'
                                            : 'hover:bg-[#26342b]'
                                        }`}
                                >
                                    <span className={`material-symbols-outlined ${result.type === 'workshop' ? 'text-mf-green' :
                                            result.type === 'service' ? 'text-purple-400' :
                                                'text-yellow-400'
                                        }`}>
                                        {result.icon}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-white font-medium truncate">{result.name}</div>
                                        {result.address && (
                                            <div className="text-gray-500 text-sm truncate">{result.address}</div>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500 px-2 py-1 bg-[#26342b] rounded">
                                        {getTypeLabel(result.type)}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

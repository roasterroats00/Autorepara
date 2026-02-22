'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n";

// Helper to get localized link path
function getLink(path: string, lang: string): string {
    // For English (default), no prefix
    // For Spanish, add /es prefix
    if (lang === 'es') {
        return `/es${path}`;
    }
    return path;
}

import { Setting } from "@/db/schema";
import { DEFAULT_SETTINGS } from "@/lib/settings";

interface HeaderProps {
    settings?: Setting | null;
}

export default function Header({ settings }: HeaderProps) {
    const { t, lang } = useTranslation();
    const siteSettings = settings || DEFAULT_SETTINGS;
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { href: "/", label: t.common.home },
        { href: "/search", label: t.nav.services },
        { href: "/blog", label: t.common.blog },
        { href: "/about", label: t.common.about },
        { href: "/contact", label: t.common.contact },
    ];

    const isActive = (href: string) => {
        const currentPath = pathname.replace(/^\/es/, '') || '/';
        if (href === "/") return currentPath === "/";
        return currentPath.startsWith(href);
    };

    // Get the URL for the opposite language
    const getLanguageToggleUrl = () => {
        // Get current path without language prefix
        const currentPath = pathname.replace(/^\/es/, '') || '/';

        if (lang === 'en') {
            // Switch to Spanish - add /es prefix
            return `/es${currentPath}`;
        } else {
            // Switch to English - remove /es prefix (go to root)
            return currentPath;
        }
    };

    return (
        <header className="bg-mf-dark border-b border-[#26342b] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href={getLink('/', lang)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <img
                            src="/uploads/workshops/autorepara.png"
                            alt={siteSettings.siteName}
                            className="h-12 w-auto"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={getLink(item.href, lang)}
                                className={`transition-colors ${isActive(item.href)
                                    ? "text-white font-medium"
                                    : "text-gray-300 hover:text-white"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* CTA Buttons */}
                    <div className="flex items-center gap-2">
                        {/* Language Toggle - using anchor for full reload */}
                        <a
                            href={getLanguageToggleUrl()}
                            className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-sm text-gray-300 hover:text-white border border-[#26342b] hover:border-mf-green/50 rounded-full transition-all"
                            title={lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
                        >
                            <span className="material-symbols-outlined text-lg">translate</span>
                            <span className="font-medium">{lang === 'es' ? 'EN' : 'ES'}</span>
                        </a>

                        {/* Favorites Link */}
                        <Link
                            href={getLink('/favorites', lang)}
                            className="hidden sm:flex p-2 text-gray-400 hover:text-red-400 transition-colors"
                            title={lang === 'es' ? 'Mis Favoritos' : 'My Favorites'}
                        >
                            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>
                                favorite
                            </span>
                        </Link>

                        <Link
                            href={getLink('/search', lang)}
                            className="bg-mf-green hover:bg-mf-green-hover text-mf-dark font-semibold py-2 px-4 rounded-full transition-colors text-sm flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">search</span>
                            <span className="hidden sm:inline">{t.common.findMechanic}</span>
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-gray-300 hover:text-white"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <span className="material-symbols-outlined text-2xl">
                                {mobileMenuOpen ? "close" : "menu"}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <nav className="md:hidden py-4 border-t border-[#26342b]">
                        <div className="flex flex-col gap-3">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={getLink(item.href, lang)}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`py-2 px-3 rounded-lg transition-colors ${isActive(item.href)
                                        ? "text-white font-medium bg-mf-pill"
                                        : "text-gray-300 hover:text-white hover:bg-mf-pill/50"
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            {/* Favorites link in mobile menu */}
                            <Link
                                href={getLink('/favorites', lang)}
                                onClick={() => setMobileMenuOpen(false)}
                                className="py-2 px-3 rounded-lg transition-colors text-gray-300 hover:text-red-400 hover:bg-mf-pill/50 flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 0" }}>
                                    favorite
                                </span>
                                {lang === 'es' ? 'Mis Favoritos' : 'My Favorites'}
                            </Link>
                            {/* Language Toggle in mobile menu - using anchor for full reload */}
                            <a
                                href={getLanguageToggleUrl()}
                                className="py-2 px-3 rounded-lg transition-colors text-gray-300 hover:text-white hover:bg-mf-pill/50 flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">translate</span>
                                {lang === 'es' ? 'English' : 'Español'}
                            </a>
                        </div>
                    </nav>
                )}
            </div>
        </header>
    );
}



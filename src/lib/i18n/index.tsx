'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import enDict from './dictionaries/en.json';
import esDict from './dictionaries/es.json';

// Types
export type Language = 'en' | 'es';
export type Dictionary = typeof enDict;

interface I18nContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: Dictionary;
    toggleLanguage: () => void;
}

// Context
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Dictionaries map
const dictionaries: Record<Language, Dictionary> = {
    en: enDict,
    es: esDict,
};

// Detect language from path
const detectLanguageFromPath = (pathname: string): Language => {
    if (pathname.startsWith('/es')) {
        return 'es';
    }
    return 'en';
};

// Provider component
interface I18nProviderProps {
    children: ReactNode;
    defaultLang?: Language;
    initialLang?: Language;
}

export function I18nProvider({ children, defaultLang, initialLang }: I18nProviderProps) {
    const pathname = usePathname();
    const [lang, setLangState] = useState<Language>(initialLang || defaultLang || 'en');
    const [mounted, setMounted] = useState(false);

    // Detect and sync language from URL pathname on every route change
    useEffect(() => {
        const detectedLang = detectLanguageFromPath(pathname);
        if (detectedLang !== lang) {
            setLangState(detectedLang);
            document.documentElement.lang = detectedLang;
        }
    }, [pathname]); // Re-run when pathname changes

    // Set mounted on initial load
    useEffect(() => {
        setMounted(true);
        const detectedLang = detectLanguageFromPath(pathname);
        setLangState(detectedLang);
        document.documentElement.lang = detectedLang;
    }, []);

    const setLang = (newLang: Language) => {
        if (newLang !== lang) {
            setLangState(newLang);
            document.documentElement.lang = newLang;
        }
    };

    const toggleLanguage = () => {
        setLang(lang === 'en' ? 'es' : 'en');
    };

    const value: I18nContextType = {
        lang,
        setLang,
        t: dictionaries[lang],
        toggleLanguage,
    };

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    );
}

// Hook to use i18n
export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
}

// Hook for just translations (convenience)
export function useTranslation() {
    const { t, lang } = useI18n();
    return { t, lang };
}

// Language names for display
export const languageNames: Record<Language, string> = {
    en: 'English',
    es: 'Español',
};

// Get localized path helper
export function getLocalizedPath(route: string, lang: Language, params?: Record<string, string>): string {
    const prefix = lang === 'es' ? '/es' : '';

    const routes: Record<string, { en: string; es: string }> = {
        home: { en: '/', es: '/es' },
        search: { en: '/search', es: '/es/search' },
        about: { en: '/about', es: '/es/about' },
        contact: { en: '/contact', es: '/es/contact' },
        partnership: { en: '/partnership', es: '/es/partnership' },
        blog: { en: '/blog', es: '/es/blog' },
        favorites: { en: '/favorites', es: '/es/favorites' },
        workshop: { en: `/workshop/${params?.id || ''}`, es: `/es/workshop/${params?.id || ''}` },
        city: { en: `/city/${params?.slug || ''}`, es: `/es/city/${params?.slug || ''}` },
        state: { en: `/state/${params?.slug || ''}`, es: `/es/state/${params?.slug || ''}` },
    };

    return routes[route]?.[lang] || prefix + '/' + route;
}

export default I18nContext;


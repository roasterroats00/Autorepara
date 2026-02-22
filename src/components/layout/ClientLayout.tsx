'use client';

import { usePathname } from 'next/navigation';
import { I18nProvider } from '@/lib/i18n';
import { Header, Footer } from '@/components/layout';

import { Setting } from '@/db/schema';

interface ClientLayoutProps {
    children: React.ReactNode;
    settings?: Setting | null;
}

const ADMIN_PATHS = ['/admin'];

export default function ClientLayout({ children, settings }: ClientLayoutProps) {
    const pathname = usePathname();

    // Check if current path is admin route
    const isAdminRoute = ADMIN_PATHS.some(path => pathname.startsWith(path));

    // Determine language from path for key-based remounting
    const langKey = pathname.startsWith('/es') ? 'es' : 'en';

    return (
        <I18nProvider key={langKey}>
            {!isAdminRoute && <Header settings={settings} />}
            <main className="min-h-screen bg-mf-dark">
                {children}
            </main>
            {!isAdminRoute && <Footer settings={settings} />}
        </I18nProvider>
    );
}

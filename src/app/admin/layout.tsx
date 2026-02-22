'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from '@/lib/auth-client';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session, isPending } = useSession();

    // Don't protect the login page
    const isLoginPage = pathname === '/admin/login';

    useEffect(() => {
        if (!isPending && !session && !isLoginPage) {
            router.push('/admin/login');
        }
    }, [session, isPending, isLoginPage, router]);

    // Show loading while checking session
    if (isPending && !isLoginPage) {
        return (
            <div className="min-h-screen bg-mf-dark flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mf-green"></div>
            </div>
        );
    }

    // Login page doesn't need the layout
    if (isLoginPage) {
        return <>{children}</>;
    }

    // Not authenticated - show nothing while redirecting
    if (!session) {
        return null;
    }

    const handleLogout = async () => {
        await signOut();
        router.push('/admin/login');
    };

    const navItems = [
        { href: '/admin', icon: 'dashboard', label: 'Dashboard' },
        { href: '/admin/workshops', icon: 'build', label: 'Workshops' },
        { href: '/admin/bulk-import', icon: 'upload_file', label: 'Bulk Import' },
        { href: '/admin/pages', icon: 'article', label: 'Pages & Blog' },
        { href: '/admin/reports', icon: 'analytics', label: 'Reports' },
        { href: '/admin/settings', icon: 'settings', label: 'Settings' },
    ];

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === '/admin';
        return pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-mf-dark">
            {/* Admin Header */}
            <header className="bg-mf-card border-b border-[#26342b]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-mf-green rounded-md flex items-center justify-center text-mf-dark">
                                    <span className="material-symbols-outlined text-lg">directions_car</span>
                                </div>
                                <span className="font-bold text-xl text-white">AutoRepair</span>
                            </Link>
                            <span className="text-gray-500">|</span>
                            <span className="text-gray-400">Admin Dashboard</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-400 text-sm">
                                {session.user.email}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">logout</span>
                                <span className="text-sm">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 min-h-[calc(100vh-64px)] bg-mf-card border-r border-[#26342b] p-4">
                    <nav className="space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive(item.href)
                                        ? 'bg-[#26342b] text-white'
                                        : 'text-gray-400 hover:bg-[#26342b] hover:text-white'
                                    }`}
                            >
                                <span className="material-symbols-outlined">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

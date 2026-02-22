'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';

interface DashboardStats {
    workshops: {
        total: number;
        active: number;
        pending: number;
        draft: number;
    };
    totalPageViews: number;
    services: number;
    states: number;
    cities: number;
    pendingImports: number;
}

interface Workshop {
    id: string;
    name: string;
    status: string;
    createdAt: string;
    city?: { name: string };
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentWorkshops, setRecentWorkshops] = useState<Workshop[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/dashboard').then(res => res.json()),
            fetch('/api/dashboard?type=recent-workshops').then(res => res.json()),
        ])
            .then(([statsData, workshopsData]) => {
                setStats(statsData);
                setRecentWorkshops(workshopsData || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-400 bg-green-400/10';
            case 'pending': return 'text-yellow-400 bg-yellow-400/10';
            case 'draft': return 'text-gray-400 bg-gray-400/10';
            default: return 'text-gray-400 bg-gray-400/10';
        }
    };

    return (
        <>
            <h1 className="text-2xl font-bold text-white mb-8">Dashboard Overview</h1>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-mf-card rounded-xl p-6 animate-pulse">
                            <div className="h-4 bg-[#26342b] rounded w-1/2 mb-4"></div>
                            <div className="h-8 bg-[#26342b] rounded w-1/3"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-mf-card rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-400">Total Workshops</span>
                            <span className="material-symbols-outlined text-mf-green">store</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{stats?.workshops.total || 0}</div>
                        <div className="text-sm text-gray-500 mt-2">
                            {stats?.workshops.active || 0} active, {stats?.workshops.pending || 0} pending
                        </div>
                    </div>

                    <div className="bg-mf-card rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-400">Total Page Views</span>
                            <span className="material-symbols-outlined text-blue-400">visibility</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{stats?.totalPageViews?.toLocaleString() || 0}</div>
                    </div>

                    <div className="bg-mf-card rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-400">Cities Covered</span>
                            <span className="material-symbols-outlined text-yellow-400">location_city</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{stats?.cities || 0}</div>
                        <div className="text-sm text-gray-500 mt-2">
                            in {stats?.states || 0} states
                        </div>
                    </div>

                    <div className="bg-mf-card rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-400">Services</span>
                            <span className="material-symbols-outlined text-purple-400">build</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{stats?.services || 0}</div>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="mt-8">
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                    <Link
                        href="/admin/workshops/new"
                        className="flex items-center gap-2 bg-mf-green text-mf-dark font-semibold px-4 py-2 rounded-lg hover:bg-mf-green-hover transition-colors"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Add Workshop
                    </Link>
                    <Link
                        href="/admin/bulk-import"
                        className="flex items-center gap-2 bg-[#26342b] text-white px-4 py-2 rounded-lg hover:bg-[#2f3e2b] transition-colors"
                    >
                        <span className="material-symbols-outlined">upload_file</span>
                        Import CSV
                    </Link>
                    <Link
                        href="/admin/pages/new"
                        className="flex items-center gap-2 bg-[#26342b] text-white px-4 py-2 rounded-lg hover:bg-[#2f3e2b] transition-colors"
                    >
                        <span className="material-symbols-outlined">article</span>
                        Create Page
                    </Link>
                </div>
            </div>

            {/* Recent Workshops */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Recent Workshops</h2>
                    <Link href="/admin/workshops" className="text-mf-green hover:text-mf-green-hover text-sm">
                        View all →
                    </Link>
                </div>
                <div className="bg-mf-card rounded-xl overflow-hidden">
                    {loading ? (
                        <div className="p-6 animate-pulse">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-4 py-3">
                                    <div className="w-10 h-10 bg-[#26342b] rounded-lg"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-[#26342b] rounded w-1/3 mb-2"></div>
                                        <div className="h-3 bg-[#26342b] rounded w-1/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : recentWorkshops.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            No workshops yet. Create your first one!
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-[#26342b]">
                                <tr>
                                    <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Name</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">City</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Status</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#26342b]">
                                {recentWorkshops.slice(0, 5).map(workshop => (
                                    <tr key={workshop.id} className="hover:bg-[#26342b]/50">
                                        <td className="px-4 py-3">
                                            <Link href={`/admin/workshops/${workshop.id}/edit`} className="text-white hover:text-mf-green">
                                                {workshop.name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400">{workshop.city?.name || '-'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs capitalize ${getStatusColor(workshop.status)}`}>
                                                {workshop.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-sm">
                                            {new Date(workshop.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
}


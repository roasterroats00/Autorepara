'use client';

import { useEffect, useState } from 'react';

interface ReportStats {
    totalWorkshops: number;
    totalViews: number;
    totalCities: number;
    totalServices: number;
}

export default function ReportsPage() {
    const [stats, setStats] = useState<ReportStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard')
            .then(res => res.json())
            .then(data => {
                setStats({
                    totalWorkshops: data.workshops?.total || 0,
                    totalViews: data.totalPageViews || 0,
                    totalCities: data.cities || 0,
                    totalServices: data.services || 0,
                });
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <>
            <h1 className="text-2xl font-bold text-white mb-8">Reports & Analytics</h1>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <span className="material-symbols-outlined animate-spin text-mf-green text-3xl">sync</span>
                </div>
            ) : (
                <>
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-mf-card rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-400">Total Workshops</span>
                                <span className="material-symbols-outlined text-mf-green">store</span>
                            </div>
                            <div className="text-3xl font-bold text-white">{stats?.totalWorkshops || 0}</div>
                        </div>

                        <div className="bg-mf-card rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-400">Total Page Views</span>
                                <span className="material-symbols-outlined text-blue-400">visibility</span>
                            </div>
                            <div className="text-3xl font-bold text-white">{stats?.totalViews || 0}</div>
                        </div>

                        <div className="bg-mf-card rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-400">Cities Covered</span>
                                <span className="material-symbols-outlined text-yellow-400">location_city</span>
                            </div>
                            <div className="text-3xl font-bold text-white">{stats?.totalCities || 0}</div>
                        </div>

                        <div className="bg-mf-card rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-400">Services</span>
                                <span className="material-symbols-outlined text-purple-400">build</span>
                            </div>
                            <div className="text-3xl font-bold text-white">{stats?.totalServices || 0}</div>
                        </div>
                    </div>

                    {/* Coming Soon */}
                    <div className="bg-mf-card rounded-xl p-8 text-center">
                        <span className="material-symbols-outlined text-gray-500 text-6xl mb-4">analytics</span>
                        <h3 className="text-white font-semibold text-xl mb-2">Advanced Reports Coming Soon</h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                            Detailed analytics, traffic reports, and performance insights will be available in a future update.
                        </p>
                    </div>
                </>
            )}
        </>
    );
}

'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                setSettings(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            if (res.ok) {
                const updated = await res.json();
                setSettings(updated);
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <span className="material-symbols-outlined animate-spin text-mf-green text-3xl">sync</span>
        </div>
    );

    if (!settings) return <div className="text-white p-8">Failed to load settings. Please refresh.</div>;

    return (
        <>
            <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

            <div className="max-w-2xl">
                {/* Site Settings */}
                <div className="bg-mf-card rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-mf-green">settings</span>
                        Site Settings
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Site Name</label>
                            <input
                                type="text"
                                value={settings.siteName || ''}
                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Site Description (EN)</label>
                            <textarea
                                value={settings.siteDescriptionEn || ''}
                                onChange={(e) => setSettings({ ...settings, siteDescriptionEn: e.target.value })}
                                rows={3}
                                className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Contact Email</label>
                            <input
                                type="email"
                                value={settings.contactEmail || ''}
                                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                                className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact & Business Info */}
                <div className="bg-mf-card rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-mf-green">business_center</span>
                        Contact & Business Info
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Contact Phone</label>
                            <input
                                type="text"
                                value={settings.contactPhone || ''}
                                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                                className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Contact Address</label>
                            <input
                                type="text"
                                value={settings.contactAddress || ''}
                                onChange={(e) => setSettings({ ...settings, contactAddress: e.target.value })}
                                className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">RFC / Tax ID</label>
                                <input
                                    type="text"
                                    value={settings.rfc || ''}
                                    onChange={(e) => setSettings({ ...settings, rfc: e.target.value })}
                                    className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Legal Name</label>
                                <input
                                    type="text"
                                    value={settings.legalName || ''}
                                    onChange={(e) => setSettings({ ...settings, legalName: e.target.value })}
                                    className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Database & Auth */}
                <div className="bg-mf-card rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-400">database</span>
                        Database & Authentication
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-[#26342b]">
                            <div>
                                <span className="text-white">Database</span>
                                <p className="text-gray-500 text-sm">PostgreSQL (Docker)</p>
                            </div>
                            <span className="flex items-center gap-2 text-green-400 text-sm">
                                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                Connected
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-[#26342b]">
                            <div>
                                <span className="text-white">Authentication</span>
                                <p className="text-gray-500 text-sm">Better Auth</p>
                            </div>
                            <span className="flex items-center gap-2 text-green-400 text-sm">
                                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                Active
                            </span>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-mf-green text-mf-dark font-semibold px-6 py-3 rounded-lg hover:bg-mf-green-hover disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">sync</span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">save</span>
                                Save Settings
                            </>
                        )}
                    </button>

                    {saved && (
                        <span className="text-green-400 flex items-center gap-2">
                            <span className="material-symbols-outlined">check_circle</span>
                            Settings saved!
                        </span>
                    )}
                </div>
            </div>
        </>
    );
}

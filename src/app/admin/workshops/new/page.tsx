'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface City {
    id: string;
    name: string;
    stateId: string;
}

interface State {
    id: string;
    name: string;
    code: string;
}

export default function NewWorkshopPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cities, setCities] = useState<City[]>([]);
    const [states, setStates] = useState<State[]>([]);
    const [loadingCities, setLoadingCities] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        descriptionEn: '',
        descriptionEs: '',
        cityId: '',
        status: 'draft',
        logoUrl: '',
        featuredImageUrl: '',
    });

    // Fetch cities and states
    useEffect(() => {
        Promise.all([
            fetch('/api/locations/cities').then(res => res.json()),
            fetch('/api/locations/states').then(res => res.json()),
        ])
            .then(([citiesData, statesData]) => {
                setCities(citiesData || []);
                setStates(statesData || []);
                setLoadingCities(false);
            })
            .catch(() => setLoadingCities(false));
    }, []);

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const slug = generateSlug(formData.name);

            const response = await fetch('/api/workshops', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    slug,
                    slugEs: slug,
                    logoUrl: formData.logoUrl || null,
                    images: formData.featuredImageUrl ? [formData.featuredImageUrl] : [],
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create workshop');
            }

            router.push('/admin/workshops');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Group cities by state
    const citiesByState = cities.reduce((acc, city) => {
        const state = states.find(s => s.id === city.stateId);
        const stateName = state?.name || 'Unknown';
        if (!acc[stateName]) acc[stateName] = [];
        acc[stateName].push(city);
        return acc;
    }, {} as Record<string, City[]>);

    return (
        <>
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/workshops" className="text-gray-400 hover:text-white">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <h1 className="text-2xl font-bold text-white">New Workshop</h1>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="max-w-2xl">
                <div className="bg-mf-card rounded-xl p-6 space-y-6">
                    {/* Basic Info */}
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Workshop Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                            placeholder="Enter workshop name"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-2">City *</label>
                        {loadingCities ? (
                            <div className="text-gray-500">Loading cities...</div>
                        ) : (
                            <select
                                required
                                value={formData.cityId}
                                onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                                className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                            >
                                <option value="">Select a city...</option>
                                {Object.entries(citiesByState).map(([stateName, stateCities]) => (
                                    <optgroup key={stateName} label={stateName}>
                                        {stateCities.map(city => (
                                            <option key={city.id} value={city.id}>{city.name}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        )}
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Address *</label>
                        <input
                            type="text"
                            required
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                            placeholder="123 Main St, City, State ZIP"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                                placeholder="+52 55 1234 5678"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                                placeholder="contact@workshop.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Website</label>
                        <input
                            type="url"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                            placeholder="https://example.com"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Logo URL</label>
                            <input
                                type="url"
                                value={formData.logoUrl}
                                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                                placeholder="https://example.com/logo.png"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Featured Image URL</label>
                            <input
                                type="url"
                                value={formData.featuredImageUrl}
                                onChange={(e) => setFormData({ ...formData, featuredImageUrl: e.target.value })}
                                className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                                placeholder="https://example.com/shop-photo.jpg"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Description (English)</label>
                        <textarea
                            rows={3}
                            value={formData.descriptionEn}
                            onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                            className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green resize-none"
                            placeholder="Describe the workshop in English..."
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Description (Spanish)</label>
                        <textarea
                            rows={3}
                            value={formData.descriptionEs}
                            onChange={(e) => setFormData({ ...formData, descriptionEs: e.target.value })}
                            className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green resize-none"
                            placeholder="Describe el taller en español..."
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                        >
                            <option value="draft">Draft</option>
                            <option value="pending">Pending Review</option>
                            <option value="active">Active</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-4 mt-6">
                    <Link
                        href="/admin/workshops"
                        className="px-6 py-3 bg-[#26342b] text-white rounded-lg hover:bg-[#2f3e2b]"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-mf-green text-mf-dark font-semibold rounded-lg hover:bg-mf-green-hover disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">sync</span>
                                Creating...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">add</span>
                                Create Workshop
                            </>
                        )}
                    </button>
                </div>
            </form>
        </>
    );
}

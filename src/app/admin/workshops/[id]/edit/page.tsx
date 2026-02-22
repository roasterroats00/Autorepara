'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';

interface FAQ {
    question: string;
    answer: string;
}

export default function EditWorkshopPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        address: '',
        phone: '',
        website: '',
        status: 'draft',
        logoUrl: '',
        featuredImageUrl: '',
        // Descriptions (bilingual)
        descriptionEn: '',
        descriptionEs: '',
        // SEO fields
        metaTitleEn: '',
        metaTitleEs: '',
        metaDescriptionEn: '',
        metaDescriptionEs: '',
        // Rating
        rating: 0,
        reviewCount: 0,
        // Enrichment status
        enrichmentStatus: '',
    });

    // FAQs stored separately
    const [faqEn, setFaqEn] = useState<FAQ[]>([]);
    const [faqEs, setFaqEs] = useState<FAQ[]>([]);

    useEffect(() => {
        fetch(`/api/workshops/${id}`)
            .then(res => res.json())
            .then(data => {
                setFormData({
                    name: data.name || '',
                    slug: data.slug || '',
                    address: data.address || '',
                    phone: data.phone || '',
                    website: data.website || '',
                    status: data.status || 'draft',
                    logoUrl: data.logoUrl || '',
                    featuredImageUrl: data.images?.[0] || '',
                    descriptionEn: data.descriptionEn || '',
                    descriptionEs: data.descriptionEs || '',
                    metaTitleEn: data.metaTitleEn || '',
                    metaTitleEs: data.metaTitleEs || '',
                    metaDescriptionEn: data.metaDescriptionEn || '',
                    metaDescriptionEs: data.metaDescriptionEs || '',
                    rating: data.rating || 0,
                    reviewCount: data.reviewCount || 0,
                    enrichmentStatus: data.enrichmentStatus || 'pending',
                });
                setFaqEn(data.faqEn || []);
                setFaqEs(data.faqEs || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const response = await fetch(`/api/workshops/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    images: formData.featuredImageUrl ? [formData.featuredImageUrl] : [],
                    faqEn: faqEn,
                    faqEs: faqEs,
                }),
            });

            if (!response.ok) throw new Error('Failed to update');

            setMessage({ type: 'success', text: 'Workshop saved successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save workshop' });
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const response = await fetch(`/api/workshops/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'active' }),
            });

            if (!response.ok) throw new Error('Failed to publish');

            setFormData(prev => ({ ...prev, status: 'active' }));
            setMessage({ type: 'success', text: 'Workshop published successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to publish workshop' });
        } finally {
            setSaving(false);
        }
    };

    const handleUnpublish = async () => {
        setSaving(true);
        try {
            const response = await fetch(`/api/workshops/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'draft' }),
            });

            if (!response.ok) throw new Error('Failed to unpublish');

            setFormData(prev => ({ ...prev, status: 'draft' }));
            setMessage({ type: 'success', text: 'Workshop unpublished (set to draft)' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to unpublish' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this workshop? This cannot be undone.')) return;

        try {
            const response = await fetch(`/api/workshops/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete');

            router.push('/admin/workshops');
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete workshop' });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    const isEnriched = formData.enrichmentStatus === 'completed';
    const isPublished = formData.status === 'active';

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/workshops" className="text-gray-400 hover:text-white">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{formData.name || 'Edit Workshop'}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${isPublished ? 'bg-green-500/20 text-green-400' :
                                    formData.status === 'draft' ? 'bg-gray-500/20 text-gray-400' :
                                        'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                {formData.status.toUpperCase()}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${isEnriched ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                                }`}>
                                {isEnriched ? '✓ AI Enriched' : '⏳ Pending Enrichment'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {isPublished ? (
                        <button
                            onClick={handleUnpublish}
                            disabled={saving}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                        >
                            Unpublish
                        </button>
                    ) : (
                        <button
                            onClick={handlePublish}
                            disabled={saving}
                            className="px-4 py-2 bg-mf-green text-mf-dark font-semibold rounded-lg hover:bg-mf-green-hover disabled:opacity-50"
                        >
                            🚀 Publish
                        </button>
                    )}
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30"
                    >
                        Delete
                    </button>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="bg-mf-card rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Workshop Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Slug</label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-gray-400 text-sm mb-2">Address *</label>
                            <input
                                type="text"
                                required
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Website</label>
                            <input
                                type="url"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Rating</label>
                            <input
                                type="number"
                                min="0"
                                max="5"
                                step="0.1"
                                value={formData.rating}
                                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Review Count</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.reviewCount}
                                onChange={(e) => setFormData({ ...formData, reviewCount: parseInt(e.target.value) || 0 })}
                                className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                            />
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="bg-mf-card rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Images</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Logo URL</label>
                            <input
                                type="url"
                                value={formData.logoUrl}
                                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Featured Image URL</label>
                            <input
                                type="url"
                                value={formData.featuredImageUrl}
                                onChange={(e) => setFormData({ ...formData, featuredImageUrl: e.target.value })}
                                className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </div>

                {/* Descriptions */}
                <div className="bg-mf-card rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Descriptions (AI Generated)</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Description (English)</label>
                            <textarea
                                rows={5}
                                value={formData.descriptionEn}
                                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                                className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Description (Spanish)</label>
                            <textarea
                                rows={5}
                                value={formData.descriptionEs}
                                onChange={(e) => setFormData({ ...formData, descriptionEs: e.target.value })}
                                className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* SEO */}
                <div className="bg-mf-card rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">SEO Meta Tags (AI Generated)</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Meta Title (EN)</label>
                                <input
                                    type="text"
                                    value={formData.metaTitleEn}
                                    onChange={(e) => setFormData({ ...formData, metaTitleEn: e.target.value })}
                                    className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Meta Title (ES)</label>
                                <input
                                    type="text"
                                    value={formData.metaTitleEs}
                                    onChange={(e) => setFormData({ ...formData, metaTitleEs: e.target.value })}
                                    className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Meta Description (EN)</label>
                                <textarea
                                    rows={2}
                                    value={formData.metaDescriptionEn}
                                    onChange={(e) => setFormData({ ...formData, metaDescriptionEn: e.target.value })}
                                    className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Meta Description (ES)</label>
                                <textarea
                                    rows={2}
                                    value={formData.metaDescriptionEs}
                                    onChange={(e) => setFormData({ ...formData, metaDescriptionEs: e.target.value })}
                                    className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Preview */}
                {(faqEn.length > 0 || faqEs.length > 0) && (
                    <div className="bg-mf-card rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">FAQ (AI Generated)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm text-gray-400 mb-2">English ({faqEn.length} questions)</h3>
                                <div className="space-y-2">
                                    {faqEn.slice(0, 3).map((faq, i) => (
                                        <div key={i} className="bg-mf-dark rounded-lg p-3">
                                            <p className="text-sm text-white font-medium">{faq.question}</p>
                                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{faq.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm text-gray-400 mb-2">Spanish ({faqEs.length} questions)</h3>
                                <div className="space-y-2">
                                    {faqEs.slice(0, 3).map((faq, i) => (
                                        <div key={i} className="bg-mf-dark rounded-lg p-3">
                                            <p className="text-sm text-white font-medium">{faq.question}</p>
                                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{faq.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit */}
                <div className="flex gap-4">
                    <Link
                        href="/admin/workshops"
                        className="px-6 py-3 bg-[#26342b] text-white rounded-lg hover:bg-[#2f3e2b]"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-mf-green text-mf-dark font-semibold rounded-lg hover:bg-mf-green-hover disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </>
    );
}

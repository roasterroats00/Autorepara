'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PageData {
    id?: string;
    title: string;
    titleEs: string;
    slug: string;
    content: string;
    contentEs: string;
    excerpt: string;
    excerptEs: string;
    type: 'page' | 'blog';
    status: 'draft' | 'published' | 'scheduled';
    featuredImage: string;
    metaTitle: string;
    metaTitleEs: string;
    metaDescription: string;
    metaDescriptionEs: string;
    publishedAt?: string | null;
    scheduledAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

interface PageEditorProps {
    initialData?: PageData;
    isEditing?: boolean;
}

export default function PageEditor({ initialData, isEditing = false }: PageEditorProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [activeLang, setActiveLang] = useState<'en' | 'es'>('en');

    const [formData, setFormData] = useState<PageData>(initialData || {
        title: '',
        titleEs: '',
        slug: '',
        content: '',
        contentEs: '',
        excerpt: '',
        excerptEs: '',
        type: 'page',
        status: 'draft',
        featuredImage: '',
        metaTitle: '',
        metaTitleEs: '',
        metaDescription: '',
        metaDescriptionEs: '',
    });

    // Auto-generate slug from title if title changes and slug is empty
    useEffect(() => {
        if (!isEditing && formData.title && !formData.slug) {
            const generatedSlug = formData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setFormData(prev => ({ ...prev, slug: generatedSlug }));
        }
    }, [formData.title, isEditing]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const url = isEditing ? `/api/pages/${formData.id}` : '/api/pages';
            const method = isEditing ? 'PUT' : 'POST';

            // Remove internal fields that shouldn't be sent in the body
            const { id, createdAt, updatedAt, publishedAt, ...payload } = formData;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save');
            }

            const savedPage = await response.json();

            setMessage({ type: 'success', text: `Page ${isEditing ? 'updated' : 'created'} successfully!` });

            if (!isEditing) {
                // Redirect to edit page after creation
                router.push(`/admin/pages/${savedPage.id}/edit`);
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to save page' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this page? This cannot be undone.')) return;

        try {
            const response = await fetch(`/api/pages/${formData.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete');

            router.push('/admin/pages');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to delete page' });
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/pages" className="text-gray-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            {isEditing ? `Edit ${formData.type === 'blog' ? 'Blog Post' : 'Page'}` : `Create New ${formData.type === 'blog' ? 'Blog Post' : 'Page'}`}
                        </h1>
                        {isEditing && (
                            <p className="text-gray-500 text-sm mt-1">ID: {formData.id}</p>
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                    {isEditing && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-600/10 text-red-400 rounded-lg hover:bg-red-600/20 transition-colors"
                        >
                            Delete
                        </button>
                    )}
                    <button
                        form="page-editor-form"
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-mf-green text-mf-dark font-bold rounded-lg hover:bg-mf-green-hover transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : (isEditing ? 'Update' : 'Publish')}
                    </button>
                </div>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                    <span className="material-symbols-outlined">
                        {message.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    {message.text}
                </div>
            )}

            <form id="page-editor-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Areas */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title & Slug */}
                    <div className="bg-mf-card rounded-xl border border-[#26342b] p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Title (English) *</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-mf-green"
                                placeholder="Enter English title"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Title (Spanish)</label>
                            <input
                                type="text"
                                value={formData.titleEs}
                                onChange={(e) => setFormData(prev => ({ ...prev, titleEs: e.target.value }))}
                                className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-mf-green"
                                placeholder="Enter Spanish title"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">URL Slug *</label>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600 text-sm whitespace-nowrap">{formData.type === 'blog' ? '/blog/' : '/'}</span>
                                <input
                                    type="text"
                                    required
                                    value={formData.slug}
                                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                    className="flex-1 bg-mf-dark border border-[#26342b] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-mf-green"
                                    placeholder="url-slug-here"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content (Tabs for English/Spanish) */}
                    <div className="bg-mf-card rounded-xl border border-[#26342b] overflow-hidden flex flex-col">
                        <div className="flex border-b border-[#26342b] bg-[#1a231d]">
                            <button
                                type="button"
                                onClick={() => setActiveLang('en')}
                                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeLang === 'en' ? 'border-mf-green text-mf-green' : 'border-transparent text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                English Content
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveLang('es')}
                                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeLang === 'es' ? 'border-mf-green text-mf-green' : 'border-transparent text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                Spanish Content
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {activeLang === 'en' ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Excerpt (English)</label>
                                        <textarea
                                            rows={3}
                                            value={formData.excerpt}
                                            onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                                            className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-mf-green resize-none"
                                            placeholder="Brief summary of the content"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Body Content (English)</label>
                                        <textarea
                                            rows={15}
                                            value={formData.content}
                                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                            className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-mf-green font-mono text-sm"
                                            placeholder="Page content (HTML or Markdown supported)"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Excerpt (Spanish)</label>
                                        <textarea
                                            rows={3}
                                            value={formData.excerptEs}
                                            onChange={(e) => setFormData(prev => ({ ...prev, excerptEs: e.target.value }))}
                                            className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-mf-green resize-none"
                                            placeholder="Resumen breve del contenido"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Body Content (Spanish)</label>
                                        <textarea
                                            rows={15}
                                            value={formData.contentEs}
                                            onChange={(e) => setFormData(prev => ({ ...prev, contentEs: e.target.value }))}
                                            className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-mf-green font-mono text-sm"
                                            placeholder="Contenido de la página (soporta HTML o Markdown)"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* SEO Settings */}
                    <div className="bg-mf-card rounded-xl border border-[#26342b] p-6 space-y-4">
                        <h3 className="text-white font-semibold">SEO Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Meta Title (EN)</label>
                                <input
                                    type="text"
                                    value={formData.metaTitle}
                                    onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                                    className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-mf-green"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Meta Title (ES)</label>
                                <input
                                    type="text"
                                    value={formData.metaTitleEs}
                                    onChange={(e) => setFormData(prev => ({ ...prev, metaTitleEs: e.target.value }))}
                                    className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-mf-green"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Meta Description (EN)</label>
                                <textarea
                                    rows={2}
                                    value={formData.metaDescription}
                                    onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                                    className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-mf-green resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Meta Description (ES)</label>
                                <textarea
                                    rows={2}
                                    value={formData.metaDescriptionEs}
                                    onChange={(e) => setFormData(prev => ({ ...prev, metaDescriptionEs: e.target.value }))}
                                    className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-mf-green resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Publishing Settings */}
                    <div className="bg-mf-card rounded-xl border border-[#26342b] p-6 space-y-4">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">settings</span>
                            Settings
                        </h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'page' | 'blog' }))}
                                className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-mf-green"
                            >
                                <option value="page">Static Page</option>
                                <option value="blog">Blog Post</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                                className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-mf-green"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="scheduled">Scheduled</option>
                            </select>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="bg-mf-card rounded-xl border border-[#26342b] p-6 space-y-4">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">image</span>
                            Featured Image
                        </h3>
                        <div className="aspect-video bg-mf-dark rounded-lg flex items-center justify-center border-2 border-dashed border-[#26342b] overflow-hidden group relative">
                            {formData.featuredImage ? (
                                <img
                                    src={formData.featuredImage}
                                    alt="Featured"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-gray-600 text-sm">No image selected</span>
                            )}
                        </div>
                        <input
                            type="text"
                            value={formData.featuredImage}
                            onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                            className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-mf-green"
                            placeholder="Image URL (temporary)"
                        />
                    </div>
                </div>
            </form>
        </div>
    );
}

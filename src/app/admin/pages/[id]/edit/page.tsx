'use client';

import { useEffect, useState, use } from 'react';
import PageEditor from '@/components/admin/PageEditor';

interface Page {
    id: string;
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
}

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [page, setPage] = useState<Page | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/api/pages/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Page not found');
                return res.json();
            })
            .then(data => {
                setPage(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-white">Loading page data...</div>
            </div>
        );
    }

    if (error || !page) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="text-red-400 mb-4">{error || 'Page not found'}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="text-mf-green hover:underline"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="py-8">
            <PageEditor initialData={page} isEditing />
        </div>
    );
}

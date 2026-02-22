'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Page {
    id: string;
    title: string;
    slug: string;
    type: 'page' | 'blog';
    status: 'draft' | 'published' | 'scheduled';
    updatedAt: string;
}

export default function PagesAdminPage() {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetch('/api/pages?admin=true')
            .then(res => res.json())
            .then(data => {
                setPages(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'bg-green-500/20 text-green-400';
            case 'draft': return 'bg-gray-500/20 text-gray-400';
            case 'scheduled': return 'bg-blue-500/20 text-blue-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const filteredPages = filter === 'all' ? pages : pages.filter(p => p.type === filter);

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-white">Pages & Blog</h1>
                <Link
                    href="/admin/pages/new"
                    className="flex items-center gap-2 bg-mf-green text-mf-dark font-semibold px-4 py-2 rounded-lg hover:bg-mf-green-hover"
                >
                    <span className="material-symbols-outlined">add</span>
                    New Page
                </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                {['all', 'page', 'blog'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                            ? 'bg-mf-green text-mf-dark'
                            : 'bg-mf-card text-gray-300 hover:bg-[#26342b]'
                            }`}
                    >
                        {f === 'all' ? 'All' : f === 'page' ? 'Pages' : 'Blog Posts'}
                    </button>
                ))}
            </div>

            {/* Pages Table */}
            <div className="bg-mf-card rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-[#26342b]">
                        <tr>
                            <th className="text-left px-6 py-4 text-gray-400 font-medium">Title</th>
                            <th className="text-left px-6 py-4 text-gray-400 font-medium">Type</th>
                            <th className="text-left px-6 py-4 text-gray-400 font-medium">Status</th>
                            <th className="text-left px-6 py-4 text-gray-400 font-medium">Updated</th>
                            <th className="text-left px-6 py-4 text-gray-400 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                    Loading...
                                </td>
                            </tr>
                        ) : filteredPages.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                    No pages found. <Link href="/admin/pages/new" className="text-mf-green hover:underline">Create your first page</Link>
                                </td>
                            </tr>
                        ) : (
                            filteredPages.map((page) => (
                                <tr key={page.id} className="border-t border-[#26342b]">
                                    <td className="px-6 py-4">
                                        <div>
                                            <span className="text-white font-medium">{page.title}</span>
                                            <p className="text-gray-500 text-sm">/{page.slug}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 capitalize">{page.type}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(page.status)}`}>
                                            {page.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">
                                        {new Date(page.updatedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link
                                            href={`/admin/pages/${page.id}/edit`}
                                            className="text-mf-green hover:underline"
                                        >
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}

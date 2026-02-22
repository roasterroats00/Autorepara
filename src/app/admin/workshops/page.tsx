'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getProxiedImageUrl, getFallbackLogo } from '@/lib/client-image-utils';

interface Workshop {
    id: string;
    name: string;
    address: string;
    status: string;
    rating: number;
    reviewCount: number;
    createdAt: string;
    enrichmentStatus?: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
    logoUrl?: string;
    images?: string[];
    isFeatured?: boolean;
}

export default function WorkshopsPage() {
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkAction, setBulkAction] = useState('');
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [enrichingIds, setEnrichingIds] = useState<Set<string>>(new Set());
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [totalWorkshops, setTotalWorkshops] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const limit = 100;

    const fetchWorkshops = (pageNum: number, search: string = '') => {
        setLoading(true);
        const query = new URLSearchParams({
            limit: limit.toString(),
            page: pageNum.toString()
        });
        if (search) query.append('search', search);

        fetch(`/api/workshops?${query.toString()}`)
            .then(res => res.json())
            .then(data => {
                setWorkshops(data.data || []);
                setTotalWorkshops(data.pagination?.total || 0);
                setTotalPages(data.pagination?.totalPages || 0);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchWorkshops(page, searchQuery);
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [page, searchQuery]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500/20 text-green-400';
            case 'pending': return 'bg-yellow-500/20 text-yellow-400';
            case 'draft': return 'bg-gray-500/20 text-gray-400';
            case 'inactive': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === workshops.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(workshops.map(w => w.id)));
        }
    };

    const handleBulkAction = async () => {
        if (selectedIds.size === 0) return;

        setBulkLoading(true);
        const ids = Array.from(selectedIds);

        try {
            if (bulkAction === 'delete') {
                await Promise.all(ids.map(id =>
                    fetch(`/api/workshops/${id}`, { method: 'DELETE' })
                ));
                // Refresh data to get updated total count
                fetchWorkshops(page);
            } else if (bulkAction === 'enrich') {
                // Re-enrich selected workshops
                let successCount = 0;
                let failCount = 0;

                for (const id of ids) {
                    try {
                        const response = await fetch(`/api/workshops/${id}/enrich`, { method: 'POST' });
                        if (response.ok) {
                            successCount++;
                        } else {
                            failCount++;
                        }
                    } catch {
                        failCount++;
                    }
                }

                alert(`Bulk Re-enrich Complete!\n\n✅ Success: ${successCount}\n❌ Failed: ${failCount}\n\nRefresh to see changes.`);
                fetchWorkshops(page);
            } else if (bulkAction.startsWith('status:')) {
                const newStatus = bulkAction.replace('status:', '');
                await Promise.all(ids.map(id =>
                    fetch(`/api/workshops/${id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: newStatus })
                    })
                ));
                // Refresh data to get updated status
                fetchWorkshops(page);
            } else if (bulkAction === 'set_featured') {
                await Promise.all(ids.map(id =>
                    fetch(`/api/workshops/${id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isFeatured: true })
                    })
                ));
                fetchWorkshops(page);
            } else if (bulkAction === 'unset_featured') {
                await Promise.all(ids.map(id =>
                    fetch(`/api/workshops/${id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isFeatured: false })
                    })
                ));
                fetchWorkshops(page);
            }

            setSelectedIds(new Set());
            setShowBulkModal(false);
            setBulkAction('');
        } catch (error) {
            alert('Error performing bulk action');
        } finally {
            setBulkLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this workshop?')) return;

        try {
            await fetch(`/api/workshops/${id}`, { method: 'DELETE' });
            // Refresh data to get updated total count
            fetchWorkshops(page);
        } catch (error) {
            alert('Error deleting workshop');
        }
    };

    const handleReEnrich = async (id: string, name: string) => {
        if (!confirm(`Re-generate AI content for "${name}"?\n\nThis will create:\n• Enhanced description (600-1000 words)\n• FAQ section (7 questions)\n• SEO meta tags\n• Spanish translations`)) return;

        setEnrichingIds(prev => new Set(prev).add(id));

        try {
            const response = await fetch(`/api/workshops/${id}/enrich`, {
                method: 'POST'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.details || data.error || 'Failed to enrich workshop');
            }

            alert(`✅ Success!\n\n"${name}" has been enriched with AI-generated content:\n• Description: ${data.workshop.descriptionLength} characters\n• FAQ: ${data.workshop.faqCount} questions\n\nRefresh the page to see changes.`);

            // Refresh data
            fetchWorkshops(page);
        } catch (error) {
            alert(`❌ Error enriching workshop:\n\n${(error as Error).message}`);
        } finally {
            setEnrichingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Workshops</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {totalWorkshops} total workshops
                        {selectedIds.size > 0 && ` • ${selectedIds.size} selected`}
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500 text-lg">search</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSearchQuery(val);
                                setPage(1); // Reset to first page on search
                            }}
                            placeholder="Search workshops..."
                            className="bg-mf-card border border-[#26342b] rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-mf-green w-64"
                        />
                    </div>
                    {selectedIds.size > 0 && (
                        <select
                            value={bulkAction}
                            onChange={(e) => {
                                setBulkAction(e.target.value);
                                if (e.target.value) setShowBulkModal(true);
                            }}
                            className="bg-mf-card border border-[#26342b] rounded-lg px-4 py-2 text-white"
                        >
                            <option value="">Bulk Actions</option>
                            <optgroup label="AI Content">
                                <option value="enrich">Re-enrich Selected</option>
                            </optgroup>
                            <optgroup label="Change Status">
                                <option value="status:active">Set Active</option>
                                <option value="status:pending">Set Pending</option>
                                <option value="status:draft">Set Draft</option>
                                <option value="status:inactive">Set Inactive</option>
                            </optgroup>
                            <optgroup label="Featured">
                                <option value="set_featured">Set Featured</option>
                                <option value="unset_featured">Unset Featured</option>
                            </optgroup>
                            <optgroup label="Danger Zone">
                                <option value="delete">Delete Selected</option>
                            </optgroup>
                        </select>
                    )}
                    <Link
                        href="/admin/workshops/new"
                        className="flex items-center gap-2 bg-mf-green text-mf-dark font-semibold px-4 py-2 rounded-lg hover:bg-mf-green-hover transition-colors"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Add Workshop
                    </Link>
                </div>
            </div>

            {/* Workshops Table */}
            <div className="bg-mf-card rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-[#26342b]">
                        <tr>
                            <th className="px-4 py-4 w-12">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.size === workshops.length && workshops.length > 0}
                                    onChange={toggleSelectAll}
                                    className="w-4 h-4 rounded bg-mf-dark border-[#26342b] text-mf-green focus:ring-mf-green"
                                />
                            </th>
                            <th className="text-left px-6 py-4 text-gray-400 font-medium">Workshop</th>
                            <th className="text-left px-6 py-4 text-gray-400 font-medium">Address</th>
                            <th className="text-left px-6 py-4 text-gray-400 font-medium">Status</th>
                            <th className="text-left px-6 py-4 text-gray-400 font-medium">Featured</th>
                            <th className="text-left px-6 py-4 text-gray-400 font-medium">Rating</th>
                            <th className="text-left px-6 py-4 text-gray-400 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined animate-spin">sync</span>
                                        Loading...
                                    </div>
                                </td>
                            </tr>
                        ) : workshops.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                    No workshops found. <Link href="/admin/workshops/new" className="text-mf-green hover:underline">Add your first workshop</Link>
                                </td>
                            </tr>
                        ) : (
                            workshops.map((workshop) => (
                                <tr
                                    key={workshop.id}
                                    className={`border-t border-[#26342b] ${selectedIds.has(workshop.id) ? 'bg-mf-green/5' : ''}`}
                                >
                                    <td className="px-4 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(workshop.id)}
                                            onChange={() => toggleSelect(workshop.id)}
                                            className="w-4 h-4 rounded bg-mf-dark border-[#26342b] text-mf-green focus:ring-mf-green"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-[#26342b]">
                                                {(() => {
                                                    const logoUrl = workshop.logoUrl;
                                                    return (
                                                        <img
                                                            src={getProxiedImageUrl(logoUrl) || getFallbackLogo()}
                                                            alt=""
                                                            className="w-full h-full object-contain p-1"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = getFallbackLogo();
                                                            }}
                                                        />
                                                    );
                                                })()}
                                            </div>
                                            <Link href={`/admin/workshops/${workshop.id}/edit`} className="text-white font-medium hover:text-mf-green">
                                                {workshop.name}
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">{workshop.address || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(workshop.status)}`}>
                                            {workshop.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={async () => {
                                                const newFeatured = !workshop.isFeatured;
                                                const response = await fetch(`/api/workshops/${workshop.id}`, {
                                                    method: 'PATCH',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ isFeatured: newFeatured })
                                                });
                                                if (response.ok) {
                                                    setWorkshops(prev => prev.map(w => w.id === workshop.id ? { ...w, isFeatured: newFeatured } : w));
                                                }
                                            }}
                                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${workshop.isFeatured
                                                ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                                : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: workshop.isFeatured ? "'FILL' 1" : "'FILL' 0" }}>
                                                star
                                            </span>
                                            {workshop.isFeatured ? 'Featured' : 'Standard'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-yellow-400 text-sm">star</span>
                                            {workshop.rating?.toFixed(1) || '-'}
                                            <span className="text-gray-500 text-xs">({workshop.reviewCount || 0})</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/admin/workshops/${workshop.id}/edit`}
                                                className="text-mf-green hover:underline text-sm"
                                            >
                                                Edit
                                            </Link>
                                            <span className="text-gray-600">|</span>
                                            <button
                                                onClick={() => handleReEnrich(workshop.id, workshop.name)}
                                                disabled={enrichingIds.has(workshop.id)}
                                                className="text-blue-400 hover:underline text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                                title="Generate AI content (FAQ, enhanced description, etc.)"
                                            >
                                                {enrichingIds.has(workshop.id) ? (
                                                    <>
                                                        <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                                                        Enriching...
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="material-symbols-outlined text-xs">auto_awesome</span>
                                                        Re-enrich
                                                    </>
                                                )}
                                            </button>
                                            <span className="text-gray-600">|</span>
                                            <button
                                                onClick={() => handleDelete(workshop.id)}
                                                className="text-red-400 hover:underline text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {workshops.length > 0 && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="text-gray-400 text-sm">
                        Page {page} of {totalPages} • Showing {workshops.length} workshops
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${page === 1
                                ? 'bg-[#26342b] text-gray-500 cursor-not-allowed'
                                : 'bg-mf-card text-white hover:bg-[#26342b] border border-[#26342b]'
                                }`}
                        >
                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                            Back
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${page === totalPages
                                ? 'bg-[#26342b] text-gray-500 cursor-not-allowed'
                                : 'bg-mf-card text-white hover:bg-[#26342b] border border-[#26342b]'
                                }`}
                        >
                            Next
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Bulk Selection Bar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-0 left-64 right-0 bg-mf-card border-t border-[#26342b] p-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-white font-medium">{selectedIds.size} selected</span>
                            <button
                                onClick={() => setSelectedIds(new Set())}
                                className="text-gray-400 hover:text-white text-sm"
                            >
                                Clear selection
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setBulkAction('status:active');
                                    setShowBulkModal(true);
                                }}
                                className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 text-sm"
                            >
                                Set Active
                            </button>
                            <button
                                onClick={() => {
                                    setBulkAction('delete');
                                    setShowBulkModal(true);
                                }}
                                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm"
                            >
                                Delete All
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Action Confirmation Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-mf-card rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-white mb-4">
                            {bulkAction === 'delete'
                                ? 'Delete Workshops?'
                                : bulkAction === 'enrich'
                                    ? 'Re-enrich Workshops?'
                                    : 'Update Workshops?'}
                        </h3>
                        <p className="text-gray-400 mb-6">
                            {bulkAction === 'delete' ? (
                                <>
                                    Are you sure you want to delete <strong className="text-white">{selectedIds.size}</strong> workshops?
                                    This action cannot be undone.
                                </>
                            ) : bulkAction === 'enrich' ? (
                                <>
                                    Generate AI content for <strong className="text-white">{selectedIds.size}</strong> workshops?
                                    <br /><br />
                                    This will create for each:
                                    <ul className="list-disc list-inside mt-2 text-sm">
                                        <li>Enhanced description (600-1000 words)</li>
                                        <li>FAQ section (7 questions)</li>
                                        <li>SEO meta tags</li>
                                        <li>Spanish translations</li>
                                    </ul>
                                    <br />
                                    <span className="text-yellow-400 text-sm">⚠️ This may take several minutes (5s per workshop)</span>
                                </>
                            ) : (
                                <>
                                    Update status of <strong className="text-white">{selectedIds.size}</strong> workshops to{' '}
                                    <span className={`px-2 py-0.5 rounded ${getStatusColor(bulkAction.replace('status:', ''))}`}>
                                        {bulkAction.replace('status:', '')}
                                    </span>
                                    ?
                                </>
                            )}
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowBulkModal(false);
                                    setBulkAction('');
                                }}
                                className="px-4 py-2 bg-[#26342b] text-white rounded-lg hover:bg-[#2f3e2b]"
                                disabled={bulkLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkAction}
                                disabled={bulkLoading}
                                className={`px-4 py-2 font-semibold rounded-lg flex items-center gap-2 ${bulkAction === 'delete'
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : bulkAction === 'enrich'
                                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                                        : 'bg-mf-green text-mf-dark hover:bg-mf-green-hover'
                                    }`}
                            >
                                {bulkLoading && <span className="material-symbols-outlined animate-spin text-sm">sync</span>}
                                {bulkAction === 'delete' ? 'Delete' : bulkAction === 'enrich' ? 'Re-enrich' : 'Update'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

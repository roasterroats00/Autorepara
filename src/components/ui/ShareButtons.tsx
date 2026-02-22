'use client';

import { useState } from 'react';

interface ShareButtonsProps {
    url: string;
    title: string;
    description?: string;
}

export default function ShareButtons({ url, title, description }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);

    const fullUrl = typeof window !== 'undefined'
        ? `${window.location.origin}${url}`
        : url;

    const encodedUrl = encodeURIComponent(fullUrl);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description || title);

    const shareLinks = [
        {
            name: 'Facebook',
            icon: 'share',
            color: 'bg-blue-600 hover:bg-blue-700',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        },
        {
            name: 'Twitter',
            icon: 'share',
            color: 'bg-sky-500 hover:bg-sky-600',
            url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        },
        {
            name: 'WhatsApp',
            icon: 'chat',
            color: 'bg-green-500 hover:bg-green-600',
            url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
        },
        {
            name: 'LinkedIn',
            icon: 'work',
            color: 'bg-blue-700 hover:bg-blue-800',
            url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
        },
    ];

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleShareClick = (shareUrl: string) => {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            {shareLinks.map((link) => (
                <button
                    key={link.name}
                    onClick={() => handleShareClick(link.url)}
                    className={`${link.color} text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors`}
                    title={`Share on ${link.name}`}
                >
                    <span className="material-symbols-outlined text-lg">{link.icon}</span>
                    <span className="hidden sm:inline">{link.name}</span>
                </button>
            ))}
            <button
                onClick={copyToClipboard}
                className={`${copied ? 'bg-mf-green text-mf-dark' : 'bg-gray-600 hover:bg-gray-500 text-white'} px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors`}
                title="Copy link"
            >
                <span className="material-symbols-outlined text-lg">
                    {copied ? 'check' : 'link'}
                </span>
                <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
        </div>
    );
}

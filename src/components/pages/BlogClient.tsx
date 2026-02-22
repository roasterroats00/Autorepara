'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';

interface Blog {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    image: string;
    readTime: number;
    date: string;
}

const mockBlogsEn: Blog[] = [
    {
        id: '1',
        slug: 'how-often-change-oil',
        title: 'How Often Should You Really Change Your Oil?',
        excerpt: 'The truth about oil change intervals and what factors affect how often you need to change your oil.',
        category: 'Maintenance',
        image: '/blog/oil-change.jpg',
        readTime: 5,
        date: '2024-12-15',
    },
    {
        id: '2',
        slug: '5-signs-bad-brakes',
        title: '5 Warning Signs Your Brakes Need Attention',
        excerpt: 'Learn the critical warning signs that indicate it\'s time to have your brakes inspected.',
        category: 'Safety',
        image: '/blog/brakes.jpg',
        readTime: 4,
        date: '2024-12-10',
    },
    {
        id: '3',
        slug: 'prepare-car-winter',
        title: 'How to Prepare Your Car for Winter',
        excerpt: 'Essential tips to winterize your vehicle and stay safe on icy roads.',
        category: 'Tips & Guides',
        image: '/blog/winter.jpg',
        readTime: 6,
        date: '2024-12-05',
    },
    {
        id: '4',
        slug: 'find-trustworthy-mechanic',
        title: 'How to Find a Trustworthy Mechanic',
        excerpt: 'A complete guide to finding a reliable auto repair shop you can trust.',
        category: 'Educational',
        image: '/blog/mechanic.jpg',
        readTime: 7,
        date: '2024-12-01',
    },
];

const mockBlogsEs: Blog[] = [
    {
        id: '1',
        slug: 'cada-cuanto-cambiar-aceite',
        title: '¿Cada cuánto tiempo debes cambiar el aceite?',
        excerpt: 'La verdad sobre los intervalos de cambio de aceite y qué factores afectan la frecuencia necesaria.',
        category: 'Mantenimiento',
        image: '/blog/oil-change.jpg',
        readTime: 5,
        date: '2024-12-15',
    },
    {
        id: '2',
        slug: '5-senales-frenos-malos',
        title: '5 señales de advertencia de que tus frenos necesitan atención',
        excerpt: 'Aprende las señales críticas que indican que es hora de inspeccionar tus frenos.',
        category: 'Seguridad',
        image: '/blog/brakes.jpg',
        readTime: 4,
        date: '2024-12-10',
    },
    {
        id: '3',
        slug: 'preparar-carro-invierno',
        title: 'Cómo preparar tu coche para el invierno',
        excerpt: 'Consejos esenciales para preparar tu vehículo y mantenerte seguro en carreteras heladas.',
        category: 'Guías y Consejos',
        image: '/blog/winter.jpg',
        readTime: 6,
        date: '2024-12-05',
    },
    {
        id: '4',
        slug: 'encontrar-mecanico-confianza',
        title: 'Cómo encontrar un mecánico de confianza',
        excerpt: 'Una guía completa para encontrar un taller de reparación confiable.',
        category: 'Educativo',
        image: '/blog/mechanic.jpg',
        readTime: 7,
        date: '2024-12-01',
    },
];

export default function BlogClient() {
    const { t, lang: locale } = useTranslation();
    const mockBlogs = locale === 'es' ? mockBlogsEs : mockBlogsEn;
    const allLabel = locale === 'es' ? 'Todos' : 'All';

    // Extract unique categories
    const categories = [allLabel, ...Array.from(new Set(mockBlogs.map(b => b.category)))];

    const [activeCategory, setActiveCategory] = useState(allLabel);

    const filteredBlogs = activeCategory === allLabel
        ? mockBlogs
        : mockBlogs.filter(b => b.category === activeCategory);

    return (
        <>
            {/* Hero */}
            <section className="py-16 bg-mf-card">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">{t.blogPage.title}</h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">{t.blogPage.subtitle}</p>
                </div>
            </section>

            {/* Categories */}
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat
                                    ? 'bg-mf-green text-mf-dark'
                                    : 'bg-mf-card text-gray-300 hover:bg-[#26342b]'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-2xl font-bold text-white mb-8">{t.blogPage.latestArticles}</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBlogs.map((blog) => (
                            <Link
                                key={blog.id}
                                href={locale === 'es' ? `/es/blog/${blog.slug}` : `/blog/${blog.slug}`}
                                className="bg-mf-card rounded-xl overflow-hidden hover:ring-2 hover:ring-mf-green/50 transition-all group"
                            >
                                <div className="h-48 bg-[#26342b] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-gray-500 text-4xl">image</span>
                                </div>
                                <div className="p-6">
                                    <span className="text-mf-green text-xs font-medium">{blog.category}</span>
                                    <h3 className="text-white font-semibold mt-2 mb-2 group-hover:text-mf-green transition-colors">
                                        {blog.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm line-clamp-2">{blog.excerpt}</p>
                                    <div className="flex items-center gap-4 mt-4 text-gray-500 text-xs">
                                        <span>{blog.date}</span>
                                        <span>•</span>
                                        <span>{blog.readTime} {t.common.readTime}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <section className="py-16 bg-mf-card">
                <div className="max-w-xl mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">{t.blogPage.newsletter}</h2>
                    <p className="text-gray-400 mb-6">{t.blogPage.newsletterDesc}</p>
                    <form className="flex gap-2">
                        <input
                            type="email"
                            placeholder={t.blogPage.enterEmail}
                            className="flex-1 bg-mf-dark border border-[#26342b] rounded-full px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                        />
                        <button type="button" className="bg-mf-green hover:bg-mf-green-hover text-mf-dark font-semibold px-6 py-3 rounded-full">
                            {t.common.subscribe}
                        </button>
                    </form>
                </div>
            </section>
        </>
    );
}

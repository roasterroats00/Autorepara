'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export default function BlogDetailClient({ slug }: { slug: string }) {
    const { t, lang: locale } = useTranslation();

    // Mock article data
    const articleEn = {
        title: 'How Often Should You Really Change Your Oil?',
        content: `
            <p>The question of how often to change your oil is one that every car owner faces. For years, the conventional wisdom was to change your oil every 3,000 miles, but modern vehicles and synthetic oils have changed the game significantly.</p>
            
            <h2>The Modern Oil Change Interval</h2>
            <p>Most modern vehicles can go 5,000 to 7,500 miles between oil changes when using conventional oil. If your car uses synthetic oil, you can often extend this interval to 10,000 or even 15,000 miles.</p>
            
            <h2>Factors That Affect Oil Life</h2>
            <ul>
                <li><strong>Driving Conditions:</strong> Stop-and-go traffic, extreme temperatures, and dusty environments can all reduce oil life.</li>
                <li><strong>Vehicle Age:</strong> Older engines may need more frequent oil changes.</li>
                <li><strong>Oil Type:</strong> Synthetic oils generally last longer than conventional oils.</li>
                <li><strong>Manufacturer Recommendations:</strong> Always check your owner's manual for specific guidance.</li>
            </ul>
        `,
        category: 'Maintenance',
        date: '2024-12-15',
        readTime: 5,
        author: 'John Smith',
    };

    const articleEs = {
        title: '¿Cada cuánto tiempo debes cambiar el aceite?',
        content: `
            <p>La pregunta de qué tan seguido cambiar el aceite es algo que todo dueño de auto enfrenta. Por años, la sabiduría convencional era cambiarlo cada 3,000 millas, pero los vehículos modernos y aceites sintéticos han cambiado el juego significativamente.</p>
            
            <h2>El Intervalo Moderno de Cambio de Aceite</h2>
            <p>La mayoría de los vehículos modernos pueden recorrer de 5,000 a 7,500 millas entre cambios de aceite usando aceite convencional. Si tu auto usa aceite sintético, a menudo puedes extender este intervalo a 10,000 o incluso 15,000 millas.</p>
            
            <h2>Factores que Afectan la Vida del Aceite</h2>
            <ul>
                <li><strong>Condiciones de Manejo:</strong> Tráfico pesado, temperaturas extremas y ambientes polvorientos pueden reducir la vida del aceite.</li>
                <li><strong>Edad del Vehículo:</strong> Los motores más viejos pueden necesitar cambios más frecuentes.</li>
                <li><strong>Tipo de Aceite:</strong> Los aceites sintéticos generalmente duran más que los convencionales.</li>
                <li><strong>Recomendaciones del Fabricante:</strong> Siempre revisa tu manual del propietario para una guía específica.</li>
            </ul>
        `,
        category: 'Mantenimiento',
        date: '2024-12-15',
        readTime: 5,
        author: 'Juan Pérez',
    };

    const article = locale === 'es' ? articleEs : articleEn;

    return (
        <>
            {/* Breadcrumb */}
            <div className="bg-mf-card border-b border-[#26342b]">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Link href="/" className="hover:text-white">{t.common.home}</Link>
                        <span>/</span>
                        <Link href={locale === 'es' ? '/es/blog' : '/blog'} className="hover:text-white">{t.common.blog}</Link>
                        <span>/</span>
                        <span className="text-mf-green">{article.category}</span>
                    </div>
                </div>
            </div>

            {/* Article */}
            <article className="py-12">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Meta */}
                    <div className="mb-8">
                        <span className="text-mf-green text-sm font-medium">{article.category}</span>
                        <h1 className="text-3xl lg:text-4xl font-bold text-white mt-2 mb-4">{article.title}</h1>
                        <div className="flex items-center gap-4 text-gray-400 text-sm">
                            <span>{locale === 'es' ? 'Por' : 'By'} {article.author}</span>
                            <span>•</span>
                            <span>{article.date}</span>
                            <span>•</span>
                            <span>{article.readTime} {t.common.readTime}</span>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="h-64 lg:h-96 bg-mf-card rounded-xl flex items-center justify-center mb-8">
                        <span className="material-symbols-outlined text-gray-500 text-6xl">image</span>
                    </div>

                    {/* Content */}
                    <div
                        className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-gray-300 prose-li:text-gray-300 prose-strong:text-white prose-a:text-mf-green"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />

                    {/* Share */}
                    <div className="mt-12 pt-8 border-t border-[#26342b]">
                        <p className="text-gray-400 mb-4">{t.blogPage.shareArticle}</p>
                        <div className="flex gap-3">
                            <button className="w-10 h-10 bg-mf-card rounded-full flex items-center justify-center text-gray-400 hover:text-white">
                                <span className="material-symbols-outlined">share</span>
                            </button>
                        </div>
                    </div>

                    {/* Back to Blog */}
                    <div className="mt-8">
                        <Link href={locale === 'es' ? '/es/blog' : '/blog'} className="text-mf-green hover:underline flex items-center gap-2">
                            <span className="material-symbols-outlined">arrow_back</span>
                            {t.blogPage.backToBlog}
                        </Link>
                    </div>
                </div>
            </article>

            {/* CTA */}
            <section className="py-16 bg-mf-card">
                <div className="max-w-xl mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">{t.blogPage.readyToFind}</h2>
                    <p className="text-gray-400 mb-6">{t.blogPage.useDirectory}</p>
                    <Link href={locale === 'es' ? '/es/search' : '/search'} className="inline-flex items-center gap-2 bg-mf-green hover:bg-mf-green-hover text-mf-dark font-semibold px-8 py-3 rounded-full">
                        <span className="material-symbols-outlined">search</span>
                        {t.common.findMechanic}
                    </Link>
                </div>
            </section>
        </>
    );
}

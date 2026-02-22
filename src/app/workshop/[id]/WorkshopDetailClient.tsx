'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { getProxiedImageUrl, getFallbackLogo } from '@/lib/client-image-utils';
import ShareButtons from '@/components/ui/ShareButtons';

interface Service {
    id: string;
    name: string;
    nameEs?: string;
    slug: string;
    icon?: string;
}

interface FAQ {
    question: string;
    answer: string;
}

interface BusinessHours {
    monday?: { open: string; close: string } | 'closed';
    tuesday?: { open: string; close: string } | 'closed';
    wednesday?: { open: string; close: string } | 'closed';
    thursday?: { open: string; close: string } | 'closed';
    friday?: { open: string; close: string } | 'closed';
    saturday?: { open: string; close: string } | 'closed';
    sunday?: { open: string; close: string } | 'closed';
}

interface Workshop {
    id: string;
    name: string;
    slug: string;
    address: string;
    phone?: string;
    email?: string;
    website?: string;
    rating: number;
    reviewCount: number;
    descriptionEn?: string;
    descriptionEs?: string;
    isVerified?: boolean;
    isFeatured?: boolean;
    city?: { name: string };
    state?: { name: string; code: string };
    services?: Service[];
    faqEn?: FAQ[];
    faqEs?: FAQ[];
    businessHours?: BusinessHours;
    logoUrl?: string;
    images?: string[];
}

export default function WorkshopDetailClient({ workshop }: { workshop: Workshop }) {
    const { t, lang: locale } = useTranslation();

    // Get description based on locale
    const getDescription = () => {
        return locale === 'es'
            ? (workshop.descriptionEs || workshop.descriptionEn || '')
            : (workshop.descriptionEn || workshop.descriptionEs || '');
    };

    // Get service name based on locale
    const getServiceName = (service: Service) => {
        return locale === 'es' && service.nameEs ? service.nameEs : service.name;
    };

    return (
        <>
            {/* Breadcrumb */}
            <div className="bg-mf-card border-b border-[#26342b]">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Link href="/" className="hover:text-white">{t.common.home}</Link>
                        <span>/</span>
                        <Link href="/search" className="hover:text-white">{locale === 'es' ? 'Buscar' : 'Search'}</Link>
                        <span>/</span>
                        <span className="text-white">{workshop.name}</span>
                    </div>
                </div>
            </div>

            {/* Workshop Hero */}
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Main Content */}
                        <div className="flex-1">
                            {/* Hero Image */}
                            <div className="h-64 lg:h-80 bg-gradient-to-br from-[#1a2e1f] via-[#26342b] to-[#1f2d24] rounded-xl overflow-hidden mb-6 border border-mf-green/20 relative group">
                                {(() => {
                                    const featuredImage = workshop.images && workshop.images.length > 0 ? workshop.images[0] : null;
                                    const rawImageUrl = featuredImage || workshop.logoUrl;
                                    const displayImage = getProxiedImageUrl(rawImageUrl);

                                    if (displayImage) {
                                        return (
                                            <img
                                                src={displayImage}
                                                alt={workshop.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                                    if (fallback) fallback.style.display = 'flex';
                                                }}
                                            />
                                        );
                                    }
                                    return null;
                                })()}
                                <div
                                    className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-mf-green/5 to-transparent"
                                    style={{ display: 'flex' }}
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-mf-green/20 blur-2xl rounded-full"></div>
                                        <span className="material-symbols-outlined text-mf-green text-8xl relative drop-shadow-lg">garage</span>
                                    </div>
                                    <div className="text-center px-6">
                                        <h3 className="text-2xl font-bold text-white mb-2">{workshop.name}</h3>
                                        <p className="text-gray-400 text-sm">Professional Auto Repair Service</p>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Images Gallery */}
                            {workshop.images && workshop.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-3 mb-6">
                                    {workshop.images.slice(1, 5).map((image, index) => (
                                        <div
                                            key={index}
                                            className="h-20 bg-mf-card rounded-lg overflow-hidden border border-[#26342b] cursor-pointer hover:border-mf-green transition-colors"
                                        >
                                            <img
                                                src={getProxiedImageUrl(image) || ''}
                                                alt={`${workshop.name} - Image ${index + 2}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Workshop Header */}
                            <div className="mb-8">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-mf-green/30 bg-white flex-shrink-0">
                                                <img
                                                    src={getProxiedImageUrl(workshop.logoUrl) || getFallbackLogo()}
                                                    alt={`${workshop.name} logo`}
                                                    className="w-full h-full object-contain p-1"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = getFallbackLogo();
                                                    }}
                                                />
                                            </div>
                                            <h1 className="text-4xl font-bold text-white">{workshop.name}</h1>
                                            {workshop.isVerified && (
                                                <span className="material-symbols-outlined text-mf-green text-2xl" title="Verified">verified</span>
                                            )}
                                        </div>
                                        {workshop.isFeatured && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-mf-green/20 text-mf-green text-sm rounded-full mb-3">
                                                <span className="material-symbols-outlined text-sm">star</span>
                                                {locale === 'es' ? 'Taller Destacado' : 'Featured Workshop'}
                                            </span>
                                        )}
                                        <p className="text-gray-400 flex items-start gap-2 mb-2">
                                            <span className="material-symbols-outlined text-lg mt-0.5">location_on</span>
                                            <span>
                                                {workshop.address}
                                                {workshop.city && workshop.state && (
                                                    <span className="block text-sm mt-1">{workshop.city.name}, {workshop.state.code}</span>
                                                )}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="text-right ml-4">
                                        <div className="bg-mf-card border border-mf-green/30 rounded-lg p-4">
                                            <div className="flex items-center gap-2 text-mf-green text-2xl mb-1">
                                                <span className="material-symbols-outlined">star</span>
                                                <span className="font-bold">{workshop.rating?.toFixed(1) || '-'}</span>
                                            </div>
                                            <p className="text-gray-400 text-sm">
                                                {workshop.reviewCount || 0} {locale === 'es' ? 'reseñas' : 'reviews'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* About Section */}
                            {getDescription() && (
                                <div className="bg-mf-card rounded-xl p-6 mb-6 border border-[#26342b]">
                                    <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-mf-green">info</span>
                                        {locale === 'es' ? 'Acerca de Este Taller' : 'About This Workshop'}
                                    </h2>
                                    <div className="space-y-4">
                                        {(() => {
                                            const description = getDescription();
                                            // Enhanced parsing for AI SEO structured content
                                            const paragraphs = description
                                                .split(/\n\n+|(?=## |### )/)
                                                .filter(p => p.trim().length > 0);

                                            return paragraphs.map((paragraph, index) => {
                                                if (paragraph.startsWith('## ')) {
                                                    return <h2 key={index} className="text-xl font-bold text-white mt-8 mb-4">{paragraph.replace('## ', '')}</h2>;
                                                }
                                                if (paragraph.startsWith('### ')) {
                                                    return <h3 key={index} className="text-lg font-bold text-white mt-6 mb-3">{paragraph.replace('### ', '')}</h3>;
                                                }
                                                return (
                                                    <div key={index} className="text-gray-300 leading-relaxed">
                                                        <p className="text-justify">
                                                            {paragraph.trim()}
                                                        </p>
                                                        {index < paragraphs.length - 1 && (
                                                            <div className="mt-4 border-b border-[#26342b]/50"></div>
                                                        )}
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* Services Section */}
                            {workshop.services && workshop.services.length > 0 && (
                                <div className="bg-mf-card rounded-xl p-6 mb-6 border border-[#26342b]">
                                    <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-mf-green">build</span>
                                        {locale === 'es' ? 'Servicios Ofrecidos' : 'Services Offered'}
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {workshop.services.map((service) => (
                                            <div
                                                key={service.id}
                                                className="px-4 py-3 bg-[#26342b] text-gray-300 rounded-lg flex items-center gap-3 hover:bg-[#2d3d33] transition-colors"
                                            >
                                                {service.icon && (
                                                    <span className="material-symbols-outlined text-mf-green text-xl">{service.icon}</span>
                                                )}
                                                <span className="font-medium">{getServiceName(service)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* FAQ Section */}
                            <div className="bg-mf-card rounded-xl p-6 mb-6 border border-[#26342b]">
                                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-mf-green">help</span>
                                    {locale === 'es' ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}
                                </h2>
                                <div className="space-y-4">
                                    {(() => {
                                        const faqs = locale === 'es' ? workshop.faqEs : workshop.faqEn;
                                        if (!faqs || faqs.length === 0) return <p className="text-gray-500">No FAQs available.</p>;

                                        return faqs.map((faq, index) => (
                                            <div key={index} className="border-b border-[#26342b] last:border-0 pb-4 last:pb-0">
                                                <h3 className="text-lg font-semibold text-white mb-2 flex items-start gap-2">
                                                    <span className="material-symbols-outlined text-sm mt-1">chevron_right</span>
                                                    {faq.question}
                                                </h3>
                                                <p className="text-gray-400 leading-relaxed pl-6">{faq.answer}</p>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>

                            {/* Share Buttons */}
                            <div className="bg-mf-card rounded-xl p-6 mb-6 border border-[#26342b]">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-mf-green">share</span>
                                    {locale === 'es' ? 'Compartir' : 'Share'}
                                </h3>
                                <ShareButtons
                                    url={`/workshop/${workshop.slug || workshop.id}`}
                                    title={workshop.name}
                                    description={getDescription().substring(0, 160)}
                                />
                            </div>
                        </div>

                        {/* Sidebar */}
                        <aside className="w-full lg:w-96 shrink-0 space-y-6">
                            {/* Contact Card */}
                            <div className="bg-mf-card rounded-xl p-6 border border-[#26342b] sticky top-24">
                                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-mf-green">contact_phone</span>
                                    {locale === 'es' ? 'Información de Contacto' : 'Contact Information'}
                                </h3>
                                <div className="space-y-4 mb-6">
                                    {workshop.phone && (
                                        <div className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-mf-green mt-0.5">phone</span>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">{locale === 'es' ? 'Teléfono' : 'Phone'}</p>
                                                <a href={`tel:${workshop.phone}`} className="text-gray-200 hover:text-white font-medium">
                                                    {workshop.phone}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    {workshop.email && (
                                        <div className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-mf-green mt-0.5">mail</span>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">{locale === 'es' ? 'Correo' : 'Email'}</p>
                                                <a href={`mailto:${workshop.email}`} className="text-gray-200 hover:text-white font-medium break-all">
                                                    {workshop.email}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    {workshop.website && (
                                        <div className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-mf-green mt-0.5">language</span>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">{locale === 'es' ? 'Sitio Web' : 'Website'}</p>
                                                <a
                                                    href={workshop.website.startsWith('http') ? workshop.website : `https://${workshop.website}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-200 hover:text-white font-medium break-all"
                                                >
                                                    {workshop.website.replace(/^https?:\/\//, '')}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-mf-green mt-0.5">location_on</span>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">{locale === 'es' ? 'Dirección' : 'Address'}</p>
                                            <span className="text-gray-200">{workshop.address}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-[#26342b]">
                                    {workshop.phone && (
                                        <a
                                            href={`tel:${workshop.phone}`}
                                            className="w-full bg-mf-green hover:bg-mf-green-hover text-mf-dark font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <span className="material-symbols-outlined">call</span>
                                            {locale === 'es' ? 'Llamar Ahora' : 'Call Now'}
                                        </a>
                                    )}
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(workshop.address)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full border border-mf-green text-mf-green hover:bg-mf-green/10 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <span className="material-symbols-outlined">directions</span>
                                        {locale === 'es' ? 'Cómo Llegar' : 'Get Directions'}
                                    </a>
                                </div>
                            </div>

                            {/* Business Hours Card */}
                            {workshop.businessHours && (
                                <div className="bg-mf-card rounded-xl p-6 border border-[#26342b]">
                                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-mf-green">schedule</span>
                                        {locale === 'es' ? 'Horario de Atención' : 'Business Hours'}
                                    </h3>
                                    <div className="space-y-2">
                                        {Object.entries(workshop.businessHours).map(([day, hours]: [string, any]) => (
                                            <div key={day} className="flex justify-between items-center py-2 border-b border-[#26342b] last:border-0">
                                                <span className="text-gray-400 capitalize font-medium">
                                                    {locale === 'es' ?
                                                        day === 'monday' ? 'Lunes' :
                                                            day === 'tuesday' ? 'Martes' :
                                                                day === 'wednesday' ? 'Miércoles' :
                                                                    day === 'thursday' ? 'Jueves' :
                                                                        day === 'friday' ? 'Viernes' :
                                                                            day === 'saturday' ? 'Sábado' :
                                                                                day === 'sunday' ? 'Domingo' : day
                                                        : day.charAt(0).toUpperCase() + day.slice(1)
                                                    }
                                                </span>
                                                <span className="text-gray-200 font-medium">
                                                    {hours === 'closed'
                                                        ? (locale === 'es' ? 'Cerrado' : 'Closed')
                                                        : typeof hours === 'object' && hours.open && hours.close
                                                            ? `${hours.open} - ${hours.close}`
                                                            : '-'
                                                    }
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </section>
        </>
    );
}

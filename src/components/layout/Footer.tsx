'use client';

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { useState } from "react";

// Helper to get localized link path
function getLink(path: string, lang: string): string {
    if (lang === 'es') {
        return `/es${path}`;
    }
    return path;
}

import { Setting } from "@/db/schema";
import { DEFAULT_SETTINGS } from "@/lib/settings";

interface FooterProps {
    settings?: Setting | null;
}

export default function Footer({ settings }: FooterProps) {
    const { t, lang } = useTranslation();
    const siteSettings = settings || DEFAULT_SETTINGS;
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        setSubscribed(true);
        setEmail('');
        setTimeout(() => setSubscribed(false), 3000);
    };

    const services = [
        { name: lang === 'es' ? 'Cambio de Aceite' : 'Oil Change', slug: 'oil-change' },
        { name: lang === 'es' ? 'Reparación de Frenos' : 'Brake Repair', slug: 'brake-repair' },
        { name: lang === 'es' ? 'Servicio de Llantas' : 'Tire Service', slug: 'tire-service' },
        { name: lang === 'es' ? 'Reparación de A/C' : 'AC Repair', slug: 'ac-repair' },
        { name: lang === 'es' ? 'Diagnóstico Motor' : 'Engine Diagnostics', slug: 'engine-diagnostics' },
        { name: lang === 'es' ? 'Transmisión' : 'Transmission', slug: 'transmission' },
    ];

    const quickLinks = [
        { name: lang === 'es' ? 'Inicio' : 'Home', href: '/' },
        { name: lang === 'es' ? 'Buscar Talleres' : 'Find Shops', href: '/search' },
        { name: lang === 'es' ? 'Acerca de' : 'About Us', href: '/about' },
        { name: lang === 'es' ? 'Asociación' : 'Partnership', href: '/partnership' },
        { name: lang === 'es' ? 'Contacto' : 'Contact', href: '/contact' },
        { name: lang === 'es' ? 'Blog' : 'Blog', href: '/blog' },
    ];



    return (
        <footer className="bg-mf-dark border-t border-[#26342b]">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Top Section - Brand & Newsletter */}
                <div className="grid lg:grid-cols-3 gap-8 mb-12 pb-12 border-b border-[#26342b]">
                    {/* Brand & Description */}
                    <div className="lg:col-span-1">
                        <Link href={getLink('/', lang)} className="inline-block mb-6 hover:opacity-80 transition-opacity">
                            <img
                                src="/uploads/workshops/autorepara.png"
                                alt="AutoRepara"
                                className="h-12 w-auto"
                            />
                        </Link>
                        <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                            {lang === 'es'
                                ? (siteSettings.siteDescriptionEs || siteSettings.siteDescriptionEn)
                                : siteSettings.siteDescriptionEn
                            }
                        </p>
                        {/* Trust Badges */}
                        <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                <span className="material-symbols-outlined text-mf-green text-base">verified</span>
                                <span>5,000+ {lang === 'es' ? 'Talleres' : 'Shops'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                <span className="material-symbols-outlined text-mf-green text-base">star</span>
                                <span>4.8/5 Rating</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                <span className="material-symbols-outlined text-mf-green text-base">people</span>
                                <span>100K+ {lang === 'es' ? 'Usuarios' : 'Users'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Newsletter Signup */}
                    <div className="lg:col-span-2">
                        <div className="bg-mf-card rounded-2xl p-6 lg:p-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-mf-green/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-mf-green text-2xl">mail</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-bold text-lg mb-2">
                                        {lang === 'es' ? 'Mantente Informado' : 'Stay Informed'}
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-4">
                                        {lang === 'es'
                                            ? 'Recibe tips de mantenimiento, ofertas exclusivas y noticias del sector automotriz.'
                                            : 'Get maintenance tips, exclusive offers, and automotive industry news.'
                                        }
                                    </p>
                                    {subscribed ? (
                                        <div className="flex items-center gap-2 text-mf-green">
                                            <span className="material-symbols-outlined">check_circle</span>
                                            <span className="text-sm font-medium">
                                                {lang === 'es' ? '¡Gracias por suscribirte!' : 'Thanks for subscribing!'}
                                            </span>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubscribe} className="flex gap-2" suppressHydrationWarning>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder={lang === 'es' ? 'Tu correo electrónico' : 'Your email address'}
                                                className="flex-1 bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-mf-green"
                                                required
                                            />
                                            <button
                                                type="submit"
                                                className="bg-mf-green hover:bg-mf-green-hover text-mf-dark font-semibold px-6 py-3 rounded-lg transition-all hover:scale-105 whitespace-nowrap text-sm"
                                                suppressHydrationWarning
                                            >
                                                {lang === 'es' ? 'Suscribirse' : 'Subscribe'}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Links Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-mf-green text-lg">link</span>
                            {lang === 'es' ? 'Enlaces Rápidos' : 'Quick Links'}
                        </h4>
                        <ul className="space-y-2">
                            {quickLinks.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={getLink(link.href, lang)}
                                        className="text-gray-400 hover:text-mf-green transition-colors text-sm flex items-center gap-1 group"
                                    >
                                        <span className="material-symbols-outlined text-xs group-hover:translate-x-1 transition-transform">chevron_right</span>
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-mf-green text-lg">build</span>
                            {lang === 'es' ? 'Servicios' : 'Services'}
                        </h4>
                        <ul className="space-y-2">
                            {services.map((service, index) => (
                                <li key={index}>
                                    <Link
                                        href={getLink(`/search?service=${service.slug}`, lang)}
                                        className="text-gray-400 hover:text-mf-green transition-colors text-sm flex items-center gap-1 group"
                                    >
                                        <span className="material-symbols-outlined text-xs group-hover:translate-x-1 transition-transform">chevron_right</span>
                                        {service.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Offices */}
                    <div className="lg:col-span-2">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-mf-green text-lg">location_on</span>
                            {lang === 'es' ? 'Nuestra Oficina' : 'Our Office'}
                        </h4>
                        <div className="space-y-4">
                            <div className="text-sm">
                                <div className="flex items-start gap-2">
                                    <div className="w-8 h-8 bg-mf-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-mf-green text-base">apartment</span>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{lang === 'es' ? 'Oficina Principal' : 'Main Office'}</p>
                                        <p className="text-gray-400 text-xs text-balance">{siteSettings.contactAddress}</p>
                                        <a href={`tel:${siteSettings.contactPhone?.replace(/\D/g, '')}`} className="text-mf-green hover:underline text-xs">
                                            {siteSettings.contactPhone}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact & Social */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-mf-green text-lg">contact_support</span>
                            {lang === 'es' ? 'Contacto' : 'Contact'}
                        </h4>
                        <div className="space-y-3 mb-6">
                            <a href={`mailto:${siteSettings.contactEmail}`} className="flex items-center gap-2 text-gray-400 hover:text-mf-green transition-colors text-sm group">
                                <span className="material-symbols-outlined text-base">mail</span>
                                <span className="group-hover:underline">{siteSettings.contactEmail}</span>
                            </a>
                            <a href={`tel:${siteSettings.contactPhone?.replace(/\D/g, '')}`} className="flex items-center gap-2 text-gray-400 hover:text-mf-green transition-colors text-sm group">
                                <span className="material-symbols-outlined text-base">call</span>
                                <span className="group-hover:underline">{siteSettings.contactPhone}</span>
                            </a>
                            <a href={`https://wa.me/${siteSettings.contactPhone?.replace(/\D/g, '')}`} className="flex items-center gap-2 text-gray-400 hover:text-mf-green transition-colors text-sm group">
                                <span className="material-symbols-outlined text-base">chat</span>
                                <span className="group-hover:underline">WhatsApp</span>
                            </a>
                        </div>

                        {/* Social Media */}
                        <div className="flex gap-4">
                            {siteSettings.socialLinks?.facebook && (
                                <a href={siteSettings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#26342b] rounded-lg text-gray-400 hover:text-mf-green transition-all hover:scale-110">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
                                </a>
                            )}
                            {siteSettings.socialLinks?.twitter && (
                                <a href={siteSettings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#26342b] rounded-lg text-gray-400 hover:text-mf-green transition-all hover:scale-110">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg>
                                </a>
                            )}
                            {siteSettings.socialLinks?.instagram && (
                                <a href={siteSettings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#26342b] rounded-lg text-gray-400 hover:text-mf-green transition-all hover:scale-110">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                                </a>
                            )}
                            {siteSettings.socialLinks?.linkedin && (
                                <a href={siteSettings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#26342b] rounded-lg text-gray-400 hover:text-mf-green transition-all hover:scale-110">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" /></svg>
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-[#26342b] pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-gray-500 text-sm text-center md:text-left">
                            <p>© {new Date().getFullYear()} {siteSettings.siteName}. {lang === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}</p>
                            <p className="text-xs mt-1">
                                {lang === 'es' ? 'Empresa Líder' : 'Leading Company'} |
                                <span className="text-mf-green"> RFC: {siteSettings.rfc}</span>
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4 text-xs">
                            <Link href={getLink("/privacy", lang)} className="text-gray-500 hover:text-mf-green transition-colors">
                                {lang === 'es' ? 'Política de Privacidad' : 'Privacy Policy'}
                            </Link>
                            <span className="text-gray-700">•</span>
                            <Link href={getLink("/terms", lang)} className="text-gray-500 hover:text-mf-green transition-colors">
                                {lang === 'es' ? 'Términos de Servicio' : 'Terms of Service'}
                            </Link>
                            <span className="text-gray-700">•</span>
                            <Link href={getLink("/cookies", lang)} className="text-gray-500 hover:text-mf-green transition-colors">
                                {lang === 'es' ? 'Política de Cookies' : 'Cookie Policy'}
                            </Link>
                            <span className="text-gray-700">•</span>
                            <a href={getLink("/sitemap.xml", lang)} className="text-gray-500 hover:text-mf-green transition-colors">
                                Sitemap
                            </a>
                        </div>
                    </div>

                    {/* Payment & Security Badges (Optional) */}
                    <div className="mt-6 pt-6 border-t border-[#26342b]/50">
                        <div className="flex flex-wrap justify-center items-center gap-4">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="material-symbols-outlined text-mf-green text-base">shield</span>
                                <span>{lang === 'es' ? 'Sitio Seguro SSL' : 'Secure SSL Site'}</span>
                            </div>
                            <span className="text-gray-700">•</span>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="material-symbols-outlined text-mf-green text-base">verified_user</span>
                                <span>{lang === 'es' ? 'Talleres Verificados' : 'Verified Workshops'}</span>
                            </div>
                            <span className="text-gray-700">•</span>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="material-symbols-outlined text-mf-green text-base">language</span>
                                <span>{lang === 'es' ? 'Soporte Bilingüe' : 'Bilingual Support'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}


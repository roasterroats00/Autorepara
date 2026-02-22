'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export default function AboutClient() {
    const { t, lang } = useTranslation();

    const getLink = (path: string) => {
        if (lang === 'es') return `/es${path}`;
        return path;
    };

    const achievements = [
        { icon: 'store', value: '5000+', label: t.aboutPage.achievements.workshops },
        { icon: 'people', value: '100K+', label: t.aboutPage.achievements.customers },
        { icon: 'location_on', value: '50', label: t.aboutPage.achievements.states },
        { icon: 'schedule', value: '24/7', label: t.aboutPage.achievements.support },
    ];

    const team = [
        {
            name: 'Carlos Mendoza',
            role: lang === 'es' ? 'Director General' : 'CEO & Founder',
            icon: 'person',
            bio: lang === 'es'
                ? 'Con más de 15 años en la industria automotriz'
                : 'With over 15 years in automotive industry'
        },
        {
            name: 'María González',
            role: lang === 'es' ? 'Directora de Operaciones' : 'COO',
            icon: 'person',
            bio: lang === 'es'
                ? 'Experta en gestión de redes de servicio'
                : 'Expert in service network management'
        },
        {
            name: 'Roberto Sánchez',
            role: lang === 'es' ? 'Director Técnico' : 'CTO',
            icon: 'person',
            bio: lang === 'es'
                ? 'Ingeniero en sistemas automotrices'
                : 'Automotive systems engineer'
        },
        {
            name: 'Ana Martínez',
            role: lang === 'es' ? 'Directora de Atención al Cliente' : 'Head of Customer Success',
            icon: 'person',
            bio: lang === 'es'
                ? 'Especialista en experiencia del cliente'
                : 'Customer experience specialist'
        },
    ];

    return (
        <>
            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-mf-dark via-[#1a2a1f] to-mf-dark"></div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-mf-green/10 border border-mf-green/20 rounded-full px-4 py-2 mb-6">
                        <span className="material-symbols-outlined text-mf-green text-sm">apartment</span>
                        <span className="text-mf-green text-sm font-medium">
                            {t.aboutPage.leadingSince}
                        </span>
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
                        {lang === 'es' ? (
                            <>Conectándote con <span className="text-mf-green">Talleres de Confianza</span></>
                        ) : (
                            <>Connecting you with <span className="text-mf-green">Trusted Workshops</span></>
                        )}
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
                        {t.aboutPage.intro}
                    </p>
                </div>
            </section>

            {/* Achievements Stats */}
            <section className="py-16 bg-mf-card">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {achievements.map((achievement, index) => (
                            <div key={index} className="text-center">
                                <div className="w-16 h-16 bg-mf-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-mf-green text-3xl">{achievement.icon}</span>
                                </div>
                                <div className="text-3xl lg:text-4xl font-bold text-mf-green mb-2">{achievement.value}</div>
                                <div className="text-gray-400">{achievement.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="bg-mf-card rounded-2xl p-8">
                            <div className="w-16 h-16 bg-mf-green/10 rounded-2xl flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-mf-green text-3xl">flag</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-4">
                                {t.aboutPage.missionTitle}
                            </h2>
                            <p className="text-gray-400 leading-relaxed">
                                {t.aboutPage.missionDesc}
                            </p>
                        </div>

                        <div className="bg-mf-card rounded-2xl p-8">
                            <div className="w-16 h-16 bg-mf-green/10 rounded-2xl flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-mf-green text-3xl">visibility</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-4">
                                {t.aboutPage.visionTitle}
                            </h2>
                            <p className="text-gray-400 leading-relaxed">
                                {t.aboutPage.visionDesc}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Video Section */}
            <section className="py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                            {t.aboutPage.discoverTitle}
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            {t.aboutPage.discoverDesc}
                        </p>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden bg-mf-card shadow-2xl">
                        <div className="relative aspect-video bg-mf-dark">
                            <video className="w-full h-full object-cover" controls poster="/uploads/workshops/autorepara.png" preload="metadata">
                                <source src="/uploads/workshops/Autorepara.net intro video.mp4" type="video/mp4" />
                            </video>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-16 lg:py-24 bg-mf-card">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                            {t.aboutPage.storyTitle}
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            {t.aboutPage.storyDesc}
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6 text-gray-400 leading-relaxed">
                            <p>
                                {t.aboutPage.storyIntro}
                            </p>
                        </div>
                        <div className="bg-mf-dark rounded-2xl p-8">
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-mf-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-mf-green">calendar_today</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold mb-1">2018</h4>
                                        <p className="text-gray-400 text-sm">
                                            {t.aboutPage.founded}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Leadership Team */}
            <section className="py-16 lg:py-24 bg-mf-card">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                            {t.aboutPage.teamTitle}
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {team.map((member, index) => (
                            <div key={index} className="bg-mf-dark rounded-2xl p-6 text-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-mf-green/20 to-mf-green/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-mf-green text-5xl">{member.icon}</span>
                                </div>
                                <h3 className="text-white font-semibold text-lg mb-1">{member.name}</h3>
                                <p className="text-mf-green text-sm mb-3 font-medium">{member.role}</p>
                                <p className="text-gray-400 text-sm">{member.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 lg:py-24 bg-gradient-to-br from-mf-green/10 via-mf-card to-mf-card">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                        {t.aboutPage.readyTitle}
                    </h2>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href={getLink('/search')} className="bg-mf-green hover:bg-mf-green-hover text-mf-dark font-semibold py-4 px-8 rounded-full">
                            {t.aboutPage.findWorkshops}
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}

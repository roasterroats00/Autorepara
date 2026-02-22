'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';

export default function ContactClient() {
    const { t, lang } = useTranslation();
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    const offices = [
        {
            city: 'Fort Worth, TX (HQ)',
            cityEs: 'Fort Worth, TX (Matriz)',
            address: '262 Baker Avenue, Fort Worth, TX 76102',
            phone: '+1 (817) 844-2973',
            email: 'tx@autorepara.net'
        },
        {
            city: 'Guadalajara',
            cityEs: 'Guadalajara',
            address: 'Av. Chapultepec 480, Col. Obrera, 44140',
            phone: '+52 (33) 3000-0000',
            email: 'gdl@autorepara.net'
        },
        {
            city: 'Monterrey',
            cityEs: 'Monterrey',
            address: 'Av. Constitución 1075, Col. Centro, 64000',
            phone: '+52 (81) 8000-0000',
            email: 'mty@autorepara.net'
        }
    ];

    return (
        <>
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                        {t.contactPage.title}
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        {t.contactPage.subtitle}
                    </p>
                </div>
            </section>

            <section className="py-16 bg-mf-card">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div className="grid sm:grid-cols-2 gap-6">
                                {offices.map((office, index) => (
                                    <div key={index} className="bg-mf-dark p-6 rounded-2xl border border-[#26342b]">
                                        <h3 className="text-mf-green font-bold mb-3">{lang === 'es' ? office.cityEs : office.city}</h3>
                                        <p className="text-gray-400 text-sm mb-4 leading-relaxed">{office.address}</p>
                                        <div className="space-y-2 text-sm">
                                            <div className="text-white flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm">phone</span>
                                                {office.phone}
                                            </div>
                                            <div className="text-white flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm">mail</span>
                                                {office.email}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-mf-dark p-8 rounded-3xl border border-[#26342b]">
                            {submitted ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-mf-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <span className="material-symbols-outlined text-mf-green text-4xl">check_circle</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">{t.contactPage.messageSent}</h3>
                                    <p className="text-gray-400">{t.contactPage.getInTouchSoon}</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-white mb-2 text-sm">{t.contactPage.fullName}</label>
                                        <input required type="text" className="w-full bg-[#1a2a1f] border border-[#26342b] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-mf-green transition-colors" />
                                    </div>
                                    <div>
                                        <label className="block text-white mb-2 text-sm">{t.contactPage.email}</label>
                                        <input required type="email" className="w-full bg-[#1a2a1f] border border-[#26342b] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-mf-green transition-colors" />
                                    </div>
                                    <div>
                                        <label className="block text-white mb-2 text-sm">{t.contactPage.message}</label>
                                        <textarea required rows={4} className="w-full bg-[#1a2a1f] border border-[#26342b] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-mf-green transition-colors"></textarea>
                                    </div>
                                    <button type="submit" className="w-full bg-mf-green text-mf-dark font-bold py-4 rounded-xl hover:bg-mf-green-hover transition-colors">
                                        {t.common.sendMessage}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

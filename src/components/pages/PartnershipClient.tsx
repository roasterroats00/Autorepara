'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export default function PartnershipClient() {
    const { t, lang } = useTranslation();

    const plans = [
        {
            name: t.partnershipPage.plans.basic,
            price: t.partnershipPage.plans.free,
            features: [
                t.partnershipPage.plans.basicFeature1,
                t.partnershipPage.plans.basicFeature2,
                t.partnershipPage.plans.basicFeature3,
            ],
            cta: t.partnershipPage.plans.startFree,
            highlight: false
        },
        {
            name: t.partnershipPage.plans.premium,
            price: '$499 MXN',
            period: t.partnershipPage.plans.perMonth,
            features: [
                t.partnershipPage.plans.premiumFeature1,
                t.partnershipPage.plans.premiumFeature2,
                t.partnershipPage.plans.premiumFeature3,
                t.partnershipPage.plans.premiumFeature4,
            ],
            cta: t.partnershipPage.plans.choosePremium,
            highlight: true
        }
    ];

    return (
        <>
            <section className="relative py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-mf-dark via-[#1a2a1f] to-mf-dark"></div>
                <div className="relative max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
                        {lang === 'es'
                            ? <>Lleva tu Taller al <span className="text-mf-green">Siguiente Nivel</span></>
                            : <>Take Your Workshop to the <span className="text-mf-green">Next Level</span></>
                        }
                    </h1>
                    <p className="text-gray-400 text-lg max-w-3xl mx-auto mb-10">
                        {t.partnershipPage.heroSubtitle}
                    </p>
                </div>
            </section>

            <section className="py-16 bg-mf-card">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {plans.map((plan, index) => (
                            <div key={index} className={`p-8 rounded-3xl border ${plan.highlight ? 'border-mf-green bg-mf-green/5' : 'border-[#26342b] bg-mf-dark'} flex flex-col`}>
                                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                <div className="text-3xl font-bold text-mf-green mb-6">
                                    {plan.price}{plan.period && <span className="text-sm text-gray-400 font-normal">{plan.period}</span>}
                                </div>
                                <ul className="space-y-4 mb-8 flex-grow">
                                    {plan.features.map((feature, fIndex) => (
                                        <li key={fIndex} className="text-gray-400 flex items-start gap-3">
                                            <span className="material-symbols-outlined text-mf-green text-sm flex-shrink-0 mt-1">check_circle</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <button className={`w-full py-4 rounded-xl font-bold transition-colors ${plan.highlight ? 'bg-mf-green text-mf-dark hover:bg-mf-green-hover' : 'border border-mf-green text-mf-green hover:bg-mf-green/10'}`}>
                                    {plan.cta}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}

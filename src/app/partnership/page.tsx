import { Metadata } from 'next';
import PartnershipClient from '@/components/pages/PartnershipClient';

export const metadata: Metadata = {
    title: {
        default: 'Workshop Partnership Program - List Your Shop | AutoRepara',
        template: '%s | AutoRepara'
    },
    description: 'Join Mexico\'s #1 directory for auto repair shops. Transform your business, reach thousands of local drivers, and get verified status. Become an AutoRepara partner today.',
    keywords: ['AutoRepara partnership', 'workshop marketing Mexico', 'grow auto repair business', 'certified mechanic network', 'automotive lead generation'],
    alternates: {
        canonical: '/partnership',
        languages: {
            'es-MX': '/es/partnership',
            'en-US': '/partnership'
        }
    },
    openGraph: {
        title: 'AutoRepara Partnership - Accelerate Your Workshop Growth',
        description: 'Are you a workshop owner in Mexico? Join our verified network and connect with thousands of customers looking for trusted mechanics.',
        url: 'https://www.autorepara.net/partnership',
        siteName: 'AutoRepara',
        images: [
            {
                url: '/uploads/workshops/autorepara.png',
                width: 1200,
                height: 630,
                alt: 'AutoRepara Workshop Partnership Program'
            }
        ],
        locale: 'es_MX',
        type: 'website',
    }
};

export default function PartnershipPage() {
    return (
        <>
            <PartnershipClient />
        </>
    );
}

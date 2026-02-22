import { Metadata } from 'next';
import ContactClient from '@/components/pages/ContactClient';

export const metadata: Metadata = {
    title: {
        default: 'Contact AutoRepara - Support & Inquiries | Mexico Offices',
        template: '%s | AutoRepara'
    },
    description: 'Get in touch with AutoRepara. Visit our offices in CDMX, Guadalajara, or Monterrey, or contact our 24/7 support team for auto repair inquiries and workshop listings.',
    keywords: ['AutoRepara contact', 'customer support Mexico', 'list workshop Mexico', 'auto repair assistance', 'MX mechanic directory'],
    alternates: {
        canonical: '/contact',
        languages: {
            'es-MX': '/es/contact',
            'en-US': '/contact'
        }
    },
    openGraph: {
        title: 'Contact AutoRepara - Professional Support for Drivers & Shops',
        description: 'Need help finding a mechanic or listing your workshop? The AutoRepara team is here to help you across Mexico.',
        url: 'https://www.autorepara.net/contact',
        siteName: 'AutoRepara',
        images: [
            {
                url: '/uploads/workshops/autorepara.png',
                width: 1200,
                height: 630,
                alt: 'Contact AutoRepara Support'
            }
        ],
        locale: 'es_MX',
        type: 'website',
    }
};

export default function ContactPage() {
    return (
        <>
            <ContactClient />
        </>
    );
}

import { Metadata } from 'next';
import AboutClient from '@/components/pages/AboutClient';

export const metadata: Metadata = {
    title: {
        default: 'About AutoRepara - #1 Auto Repair Directory in Mexico',
        template: '%s | AutoRepara'
    },
    description: 'AutoRepara is Mexico\'s most trusted directory for certified auto repair shops. Since 2018, we have connected drivers with over 5,000 verified mechanics across 32 states.',
    keywords: ['AutoRepara', 'about autorepara', 'auto repair directory Mexico', 'certified mechanics network', 'Mexico automotive services'],
    alternates: {
        canonical: '/about',
        languages: {
            'es-MX': '/es/about',
            'en-US': '/about'
        }
    },
    openGraph: {
        title: 'About AutoRepara - Building Trust in Mexican Auto Repair',
        description: 'Discover the mission behind AutoRepara. We are transforming how drivers find and trust mechanics in Mexico through transparency and verification.',
        url: 'https://www.autorepara.net/about',
        siteName: 'AutoRepara',
        images: [
            {
                url: '/uploads/workshops/autorepara.png',
                width: 1200,
                height: 630,
                alt: 'About AutoRepara México'
            }
        ],
        locale: 'es_MX',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'About AutoRepara - Mexico\'s Trusted Mechanic Network',
        description: 'Learn how AutoRepara is revolutionizing the automotive service industry in Mexico.',
        images: ['/uploads/workshops/autorepara.png'],
    }
};

export default function AboutPage() {
    return (
        <>
            <AboutClient />
        </>
    );
}

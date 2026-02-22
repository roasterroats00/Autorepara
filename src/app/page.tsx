import { Metadata } from 'next';
import HomeClient from '@/components/pages/HomeClient';

export const metadata: Metadata = {
  title: 'AutoRepara - #1 Auto Repair Shop Directory in Mexico | Verified Mechanics',
  description: 'Find trusted, certified auto repair shops across Mexico. Search over 5,000 verified workshops, compare ratings, and read real reviews. From CDMX to Monterrey, find your mechanic today.',
  keywords: [
    'auto repair Mexico',
    'best mechanics Mexico',
    'certified workshops',
    'car service directory',
    'talleres mecanicos mexico',
    'taller mecanico cerca de mi',
    'reparacion de autos mexico',
    'best car repair MX'
  ],
  alternates: {
    canonical: 'https://www.autorepara.net',
    languages: {
      'en-US': 'https://www.autorepara.net',
      'es-MX': 'https://www.autorepara.net/es',
    },
  },
  openGraph: {
    title: 'AutoRepara - Find Trusted Auto Repair Shops in Mexico',
    description: 'Connect with verified mechanics in your city. Real reviews, certified workshops, and professional service across all 32 Mexican states.',
    url: 'https://www.autorepara.net',
    siteName: 'AutoRepara',
    images: [
      {
        url: '/uploads/workshops/autorepara.png',
        width: 1200,
        height: 630,
        alt: 'AutoRepara México - Directory of Verified Workshops'
      }
    ],
    locale: 'en_US',
    type: 'website',
  }
};

export default function HomePage() {
  return <HomeClient />;
}

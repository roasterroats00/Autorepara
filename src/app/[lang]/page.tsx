import { Metadata } from 'next';
import HomeClient from '@/components/pages/HomeClient';

type Props = {
    params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const lang = (await params).lang;

    if (lang === 'es') {
        return {
            title: 'AutoRepara - Directorio #1 de Talleres Mecánicos en México | Talleres Verificados',
            description: 'Encuentra talleres mecánicos de confianza en todo México. Más de 5,000 talleres verificados, reseñas reales y servicio profesional. Localiza el mejor taller en tu ciudad hoy mismo.',
            keywords: [
                'talleres mecánicos México',
                'reparación automotriz',
                'mecánicos certificados México',
                'mejor taller mecánico',
                'taller mecanico cerca de mi',
                'servicio automotriz mexico',
                'mecanicos de confianza'
            ],
            alternates: {
                canonical: 'https://www.autorepara.net/es',
                languages: {
                    'en-US': 'https://www.autorepara.net',
                    'es-MX': 'https://www.autorepara.net/es',
                },
            },
            openGraph: {
                title: 'AutoRepara - Directorio #1 de Talleres Mecánicos en México',
                description: 'Localiza talleres mecánicos certificados. Reseñas reales, talleres verificados y servicio profesional en todo el país.',
                url: 'https://www.autorepara.net/es',
                locale: 'es_MX',
                type: 'website',
                images: [
                    {
                        url: '/uploads/workshops/autorepara.png',
                        width: 1200,
                        height: 630,
                        alt: 'AutoRepara México - Directorio de Talleres'
                    }
                ],
            }
        };
    }

    return {
        title: 'AutoRepara - #1 Auto Repair Shop Directory in Mexico',
        description: 'Find the best certified auto repair shops in Mexico. Verified mechanics and real customer reviews.',
    };
}

export default function HomePageLang() {
    return <HomeClient />;
}

import { Metadata } from 'next';
import AboutClient from '@/components/pages/AboutClient';

type Props = {
    params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const lang = (await params).lang;

    if (lang === 'es') {
        return {
            title: 'Acerca de AutoRepara - Directorio Líder de Talleres Mecánicos en México',
            description: 'Conoce AutoRepara, la plataforma líder de talleres mecánicos en México. Conectamos a conductores con talleres certificados en todo el país. Desde 2018 brindando confianza.',
            keywords: ['AutoRepara', 'talleres mecánicos México', 'mecánicos certificados', 'reparación automotriz'],
        };
    }

    return {
        title: 'About AutoRepara - Leading Auto Repair Directory in Mexico',
        description: 'Learn about AutoRepara, Mexico\'s leading auto repair directory platform. We connect thousands of customers with certified workshops nationwide.',
    };
}

export default function AboutPageLang() {
    return <AboutClient />;
}

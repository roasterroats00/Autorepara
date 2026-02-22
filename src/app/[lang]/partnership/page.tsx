import { Metadata } from 'next';
import PartnershipClient from '@/components/pages/PartnershipClient';

type Props = {
    params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const lang = (await params).lang;

    if (lang === 'es') {
        return {
            title: 'Asóciate con AutoRepara - Impulsa tu Taller Mecánico en México',
            description: 'Únete a la red más grande de talleres mecánicos certificados en México. Aumenta la visibilidad de tu negocio, atrae a más clientes y profesionaliza tu presencia digital con AutoRepara.',
            keywords: ['asociación talleres', 'socios mecánicos', 'crece mi negocio México', 'aliados AutoRepara'],
        };
    }

    return {
        title: 'Workshop Partnership Program - Grow with AutoRepara Mexico',
        description: 'Join the largest network of certified auto repair shops in Mexico. Grow your workshop business with us.',
    };
}

export default function PartnershipPageLang() {
    return <PartnershipClient />;
}

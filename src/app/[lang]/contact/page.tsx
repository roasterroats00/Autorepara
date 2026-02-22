import { Metadata } from 'next';
import ContactClient from '@/components/pages/ContactClient';

type Props = {
    params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const lang = (await params).lang;

    if (lang === 'es') {
        return {
            title: 'Contacto AutoRepara - Estamos para Ayudarte en Todo México',
            description: 'Ponte en contacto con AutoRepara para cualquier duda sobre talleres mecánicos en México. Oficinas en CDMX, Guadalajara y Monterrey. Soporte bilingüe disponible.',
            keywords: ['contacto talleres', 'soporte mecánicos México', 'AutoRepara teléfono', 'ayuda automotriz'],
        };
    }

    return {
        title: 'Contact AutoRepara - Get in Touch with Us in Mexico',
        description: 'Contact AutoRepara for any inquiries about auto repair services in Mexico. Support available nationwide.',
    };
}

export default function ContactPageLang() {
    return <ContactClient />;
}

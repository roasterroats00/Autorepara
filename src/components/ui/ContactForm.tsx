'use client';

import { useState } from 'react';

interface ContactFormProps {
    workshopName: string;
    workshopId: string;
    locale: string;
    onClose?: () => void;
}

export default function ContactForm({ workshopName, workshopId, locale, onClose }: ContactFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setError(null);

        try {
            // In a real app, this would send to an API
            // For now, we'll simulate a successful submission
            await new Promise(resolve => setTimeout(resolve, 1000));

            // You can add API call here:
            // await fetch('/api/contact', {
            //     method: 'POST',
            //     body: JSON.stringify({ ...formData, workshopId }),
            // });

            setSent(true);
            setFormData({ name: '', email: '', phone: '', message: '' });
        } catch {
            setError(locale === 'es'
                ? 'Error al enviar el mensaje. Por favor intenta de nuevo.'
                : 'Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const t = {
        title: locale === 'es' ? 'Contactar' : 'Contact',
        name: locale === 'es' ? 'Tu Nombre' : 'Your Name',
        email: locale === 'es' ? 'Correo Electrónico' : 'Email',
        phone: locale === 'es' ? 'Teléfono (opcional)' : 'Phone (optional)',
        message: locale === 'es' ? 'Tu Mensaje' : 'Your Message',
        messagePlaceholder: locale === 'es'
            ? `Hola, estoy interesado en los servicios de ${workshopName}...`
            : `Hi, I'm interested in ${workshopName}'s services...`,
        send: locale === 'es' ? 'Enviar Mensaje' : 'Send Message',
        sending: locale === 'es' ? 'Enviando...' : 'Sending...',
        successTitle: locale === 'es' ? '¡Mensaje Enviado!' : 'Message Sent!',
        successMessage: locale === 'es'
            ? 'Tu mensaje ha sido enviado. El taller se pondrá en contacto contigo pronto.'
            : 'Your message has been sent. The workshop will contact you soon.',
        close: locale === 'es' ? 'Cerrar' : 'Close',
    };

    if (sent) {
        return (
            <div className="bg-mf-card rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-mf-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-mf-green text-3xl">check_circle</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{t.successTitle}</h3>
                <p className="text-gray-400 mb-4">{t.successMessage}</p>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-[#26342b] text-white rounded-lg hover:bg-[#2f3e2b] transition-colors"
                    >
                        {t.close}
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="bg-mf-card rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-mf-green">mail</span>
                {t.title} {workshopName}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-400 text-sm mb-1">{t.name} *</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-mf-green/50"
                    />
                </div>

                <div>
                    <label className="block text-gray-400 text-sm mb-1">{t.email} *</label>
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-mf-green/50"
                    />
                </div>

                <div>
                    <label className="block text-gray-400 text-sm mb-1">{t.phone}</label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-mf-green/50"
                    />
                </div>

                <div>
                    <label className="block text-gray-400 text-sm mb-1">{t.message} *</label>
                    <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        placeholder={t.messagePlaceholder}
                        className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-mf-green/50 resize-none"
                    />
                </div>

                {error && (
                    <div className="text-red-400 text-sm">{error}</div>
                )}

                <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-mf-green hover:bg-mf-green-hover text-mf-dark font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="material-symbols-outlined">send</span>
                    {sending ? t.sending : t.send}
                </button>
            </form>
        </div>
    );
}

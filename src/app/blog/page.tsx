import BlogClient from '@/components/pages/BlogClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Auto Care Blog | AutoRepara',
    description: 'Expert tips, maintenance guides, and the latest auto repair news from AutoRepara.',
};

export default function BlogPage() {
    return <BlogClient />;
}

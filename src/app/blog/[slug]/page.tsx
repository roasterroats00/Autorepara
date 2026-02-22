import BlogDetailClient from '@/components/pages/BlogDetailClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog Article | AutoRepara',
    description: 'Read the latest auto care articles and maintenance guides.',
};

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return <BlogDetailClient slug={slug} />;
}

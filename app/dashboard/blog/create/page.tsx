import type { Metadata } from 'next';

import PageEditorContent from '@/components/dashboard/cms/pages/PageEditorContent';

export const metadata: Metadata = {
    title: 'Create Blog Post - Oohunt Dashboard',
    description: 'Create a new blog post'
};

export default function CreateBlogPage() {
    return <PageEditorContent />;
} 
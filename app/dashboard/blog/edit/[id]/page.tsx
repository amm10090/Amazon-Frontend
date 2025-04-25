import type { Metadata } from 'next';

import PageEditorContent from '@/components/dashboard/cms/pages/PageEditorContent';

export const metadata: Metadata = {
    title: 'Edit Blog Post - Oohunt Dashboard',
    description: 'Edit blog post content'
};

export default function EditBlogPage() {
    return <PageEditorContent />;
} 
import type { Metadata } from 'next';

import PageEditorContent from '@/components/dashboard/cms/pages/PageEditorContent';

export const metadata: Metadata = {
    title: 'Edit Content Page - Oohunt Dashboard',
    description: 'Edit a content page'
};

export default function EditCMSPagePage() {
    return <PageEditorContent />;
} 
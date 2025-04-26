import type { Metadata } from 'next';

import PageEditorContent from '@/components/dashboard/cms/pages/PageEditorContent';

export const metadata: Metadata = {
    title: 'Create Content Page - Oohunt Dashboard',
    description: 'Create a new content page'
};

export default function CreateCMSPagePage() {
    return <PageEditorContent />;
} 
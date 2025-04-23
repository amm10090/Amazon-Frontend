import type { Metadata } from 'next';

import PageEditorContent from '@/components/dashboard/cms/pages/PageEditorContent';

export const metadata: Metadata = {
    title: '编辑内容页面 - Oohunt Dashboard',
    description: '编辑内容页面'
};

export default function EditCMSPagePage() {
    return <PageEditorContent />;
} 
import type { Metadata } from 'next';

import PageEditorContent from '@/components/dashboard/cms/pages/PageEditorContent';

export const metadata: Metadata = {
    title: '创建内容页面 - Oohunt Dashboard',
    description: '创建新的内容页面'
};

export default function CreateCMSPagePage() {
    return <PageEditorContent />;
} 
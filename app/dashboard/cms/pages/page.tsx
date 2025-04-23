import type { Metadata } from 'next';

import CmsPagesContent from '@/components/dashboard/cms/pages/CmsPagesContent';

export const metadata: Metadata = {
    title: '内容页面管理 - Oohunt Dashboard',
    description: '管理网站内容页面'
};

export default function CMSPagesPage() {
    return <CmsPagesContent />;
} 
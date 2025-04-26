import type { Metadata } from 'next';

import CmsPagesContent from '@/components/dashboard/cms/pages/CmsPagesContent';

export const metadata: Metadata = {
    title: 'Content Page Management - Oohunt Dashboard',
    description: 'Manage website content pages'
};

export default function CMSPagesPage() {
    return <CmsPagesContent />;
} 
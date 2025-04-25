import type { Metadata } from 'next';

import CmsPagesContent from '@/components/dashboard/cms/pages/CmsPagesContent';

export const metadata: Metadata = {
    title: 'Blog Management - Oohunt Dashboard',
    description: 'Manage blog posts'
};

export default function BlogManagementPage() {
    return <CmsPagesContent />;
}

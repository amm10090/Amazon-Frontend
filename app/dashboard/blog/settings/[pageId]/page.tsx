import type { Metadata } from 'next';

// 复用CMS页面设置组件
import PageSettingsPage from '@/app/dashboard/cms/pages/settings/[pageId]/page';

export const metadata: Metadata = {
    title: 'Blog Post Settings - Oohunt Dashboard',
    description: 'Modify blog post settings and metadata'
};

export default PageSettingsPage; 
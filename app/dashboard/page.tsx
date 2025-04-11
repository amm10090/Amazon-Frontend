import type { Metadata } from 'next';

import DashboardOverview from '@/components/dashboard/DashboardOverview';

export const metadata: Metadata = {
    title: 'Oohunt-Dashboard',
    description: 'Dashboard for Oohunt'
};

export default function DashboardPage() {
    return <DashboardOverview />;
}

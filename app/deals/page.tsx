import type { Metadata } from 'next';

import DealsPage from './DealsContent';

export const metadata: Metadata = {
    title: 'Oohunt-Deals',
    description: 'Limited time deals and discounts on top products'
};

export default function DealsPageWrapper() {
    return <DealsPage />;
} 
import type { Metadata } from 'next';

import ManualProductContent from '@/components/dashboard/products/ManualProductContent';

export const metadata: Metadata = {
    title: 'Oohunt - Manual Product Addition ',
    description: 'Manually add a new product to the database.'
};

export default function ManualProductAddPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Manually Add Product</h1>
            <ManualProductContent />
        </div>
    );
} 
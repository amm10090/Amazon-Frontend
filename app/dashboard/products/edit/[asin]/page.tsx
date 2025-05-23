import type { Metadata } from 'next';

import EditProductContent from '@/components/dashboard/products/EditProductContent';

export const metadata: Metadata = {
    title: 'Oohunt - Edit Product',
    description: 'Edit product information in the database.'
};

interface EditProductPageProps {
    params: Promise<{
        asin: string;
    }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
    const { asin } = await params;
    
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Edit Product</h1>
            <EditProductContent asin={asin} />
        </div>
    );
} 
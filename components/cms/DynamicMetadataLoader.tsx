'use client';

import { useMemo } from 'react';
import useSWR from 'swr';

import { productsApi } from '@/lib/api';
import { adaptProducts } from '@/lib/utils';
import type { ComponentProduct } from '@/types';

import { FIELD_RENDERERS } from './ProductMetadataBlot'; // Import renderers from ProductMetadataBlot

// Define Props interface
interface DynamicMetadataLoaderProps {
    productId: string;
    fieldId: string;
}

// --- Fetcher Function ---
// (Can reuse fetcher logic from ProductMetadataBlot, or adjust as needed)
// Create a type to adapt different API responses
interface ProductApiData {
    id?: string;
    asin?: string;
    sku?: string;
    title?: string;
    name?: string;
    price?: number;
    current_price?: number;
    original_price?: number | null;
    originalPrice?: number | null;
    list_price?: number | null;
    discount?: number | null;
    discount_percentage?: number | null;
    brand?: string | null;
    manufacturer?: string | null;
    main_image?: string | null;
    image_url?: string | null;
    image?: string | null;
    images?: string[] | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

const fetcher = async (productId: string): Promise<ComponentProduct> => {
    try {
        const response = await productsApi.getProductById(productId);
        let productData;

        if (response.data?.data) {
            productData = response.data.data;
        } else if (response.data) {
            productData = response.data;
        } else {
            throw new Error('Failed to parse product data format');
        }

        let dataToAdapt: ProductApiData[] = Array.isArray(productData) ? productData : [productData];

        dataToAdapt = dataToAdapt.map(item => {
            const mappedItem: ProductApiData = {
                id: item.id || item.asin || item.sku || '',
                title: item.title || item.name || 'Unnamed Product',
                price: item.price || item.current_price || 0,
                original_price: item.original_price || item.originalPrice || item.list_price || null,
                discount: item.discount || item.discount_percentage || null,
                brand: item.brand || item.manufacturer || null,
                image: item.main_image || item.image_url || item.image ||
                    (item.images && item.images.length > 0 ? item.images[0] : null) ||
                    '/placeholder-product.jpg',
                asin: item.asin || item.sku || '',
                ...item
            };

            return mappedItem;
        });

        // @ts-ignore Ignore type checking
        const adaptedProducts = adaptProducts(dataToAdapt);

        if (adaptedProducts.length === 0) {
            throw new Error('Product data is empty after adaptation');
        }

        return adaptedProducts[0];
    } catch (error) {
        throw error;
    }
};

// --- Dynamic Metadata Loader Component ---
export default function DynamicMetadataLoader({ productId, fieldId }: DynamicMetadataLoaderProps) {
    const { data: product, error, isLoading } = useSWR<ComponentProduct>(
        productId ? ['product-metadata', productId] : null, // Use different key from ProductMetadataBlot to avoid conflicts, or share key
        () => fetcher(productId),
        {
            revalidateOnFocus: false, // Configure SWR options as needed
            shouldRetryOnError: false,
            dedupingInterval: 30000, // Reduce duplicate request interval
        }
    );

    // Get renderer
    const renderer = FIELD_RENDERERS[fieldId];

    // Calculate display value
    const displayValue = useMemo(() => {
        if (isLoading) return 'Loading...'; // Loading state
        if (error) return 'Failed to load'; // Error state
        if (!product) return 'No data'; // No product data found

        const value = product[fieldId as keyof ComponentProduct];

        if (value === undefined || value === null) return 'No data available'; // Field value is empty

        try {
            // Use corresponding renderer to format data
            return renderer ? renderer(value) : String(value);
        } catch {
            // If rendering fails, display raw value
            return String(value);
        }
    }, [product, fieldId, error, isLoading, renderer]);

    // Render calculated value, use span to maintain inline characteristics
    return (
        <span className="dynamic-metadata text-sm"> {/* Add class for styling */}
            {displayValue}
        </span>
    );
} 
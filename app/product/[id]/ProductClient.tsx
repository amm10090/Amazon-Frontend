"use client";

import { useMemo } from 'react';

import Breadcrumb, { type BreadcrumbItem } from '@/components/ui/Breadcrumb';
import type { ComponentProduct } from '@/types';

import ProductImageGallery from './ProductImageGallery';
import ProductInfo from './ProductInfo';

export default function ProductClient({ product }: { product: ComponentProduct }) {
    // Generate breadcrumb navigation based on product data
    const breadcrumbItems = useMemo(() => {
        const items: BreadcrumbItem[] = [
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
        ];

        // Parse product.category with fallback handling
        const category = product.category || '';
        const categoryName = category ||
            (product.title?.includes('Digital') ? 'Digital Devices & Accessories' : '');

        // Only add category if we have a valid name
        if (categoryName) {
            // 先将空格替换为+号，然后使用encodeURIComponent但保留+号
            const productGroup = encodeURIComponent(categoryName).replace(/%20/g, '+');

            items.push({
                label: categoryName,
                href: `/products?product_groups=${productGroup}`
            });
        }

        return items;
    }, [product]);

    // Ensure no extra rendering
    const cleanedProduct = useMemo(() => {
        // Create a new object to avoid directly modifying original data
        return {
            ...product,
            // Ensure any properties that might cause zero rendering are properly handled
        };
    }, [product]);

    return (
        <div className="container mx-auto px-4">
            {/* Breadcrumb navigation with all items clickable */}
            <Breadcrumb items={breadcrumbItems} allItemsClickable={true} />

            {/* Product detail card */}
            <div className="product-container bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md mb-8 relative">
                {/* Prime badge - moved to the top right of the entire product card */}
                {product.isPrime && (
                    <div className="absolute top-2 right-2 z-10">
                        <div className="bg-[#0574F7] text-white text-sm font-bold px-3 py-1 rounded-md">
                            Prime
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    {/* Product image gallery */}
                    <div className="product-gallery p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
                        <ProductImageGallery product={cleanedProduct} />
                    </div>

                    {/* Product information */}
                    <div className="product-info p-6 md:p-8">
                        <ProductInfo product={cleanedProduct} />
                    </div>
                </div>
            </div>
        </div>
    );
} 
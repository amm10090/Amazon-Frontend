"use client";

import { motion } from 'framer-motion';
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            {/* Breadcrumb navigation with all items clickable */}
            <div className="mb-6">
                <Breadcrumb items={breadcrumbItems} allItemsClickable={true} />
            </div>

            {/* Product detail card */}
            <div className="product-container bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md mb-8 relative">
                {/* Prime badge - 移至外部容器并设置为绝对定位 */}
                {product.isPrime && (
                    <div className="absolute top-4 right-4 z-20">
                        <div className="bg-[#0574F7] text-white text-sm font-bold px-3 py-1.5 rounded-md shadow-sm">
                            Prime
                        </div>
                    </div>
                )}

                {/* 调整为平板和移动设备使用上下布局 */}
                <div className="flex flex-col lg:flex-row">
                    {/* Product image gallery - 调整宽度比例 */}
                    <div className="w-full lg:w-1/2 p-4 sm:p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700">
                        <ProductImageGallery product={cleanedProduct} />
                    </div>

                    {/* Product information - 调整宽度比例 */}
                    <div className="w-full lg:w-1/2 p-4 sm:p-6 md:p-8">
                        <ProductInfo product={cleanedProduct} />
                    </div>
                </div>
            </div>
        </div>
    );
} 
"use client";

import { useMemo } from 'react';

import type { ComponentProduct } from '@/types';

import ProductImageGallery from './ProductImageGallery';
import ProductInfo from './ProductInfo';

export default function ProductClient({ product }: { product: ComponentProduct }) {
    // Ensure no extra rendering
    const cleanedProduct = useMemo(() => {
        // Create a new object to avoid directly modifying original data
        return {
            ...product,
            // Ensure any properties that might cause zero rendering are properly handled
        };
    }, [product]);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-0 sm:pt-2">
            {/* Product detail card */}
            <div className="product-container bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md mb-6 relative">
                {/* 调整为平板和移动设备使用上下布局 */}
                <div className="flex flex-col lg:flex-row">
                    {/* Product image gallery - 调整宽度比例 */}
                    <div className="w-full lg:w-1/2 p-2 sm:p-3 md:p-4 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700">
                        <ProductImageGallery product={cleanedProduct} />
                    </div>

                    {/* Product information - 调整宽度比例 */}
                    <div className="w-full lg:w-1/2 p-2 sm:p-3 md:p-4">
                        <ProductInfo product={cleanedProduct} />
                    </div>
                </div>
            </div>
        </div>
    );
} 
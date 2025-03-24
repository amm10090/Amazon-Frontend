"use client";

import type { ComponentProduct } from '@/types';

import ProductImageGallery from './ProductImageGallery';
import ProductInfo from './ProductInfo';

export default function ProductClient({ product }: { product: ComponentProduct }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Image Gallery */}
                <ProductImageGallery product={product} />

                {/* Product Information */}
                <ProductInfo product={product} />
            </div>
        </div>
    );
} 
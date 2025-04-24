'use client';

import React from 'react';
import useSWR from 'swr';

import { productsApi } from '@/lib/api';
import { adaptProducts } from '@/lib/utils';
import type { ComponentProduct, Product } from '@/types';

// Assuming product display components are moved or accessible from here
// You might need to adjust these import paths
import CardProductElement from './Template/CardProductElement';
import HorizontalProductElement from './Template/HorizontalProductElement';
import MiniProductElement from './Template/MiniProductElement';
import SimpleProductElement from './Template/SimpleProductElement';

// --- Product Display Components (Moved from ContentRenderer or separate files) ---
// Note: Ensure these components now accept `{ product: ComponentProduct }` props
// and remove any internal default value logic relying on old props.

// SimpleProductElement, CardProductElement, HorizontalProductElement, MiniProductElement
// should be defined here or imported correctly.

// --- Skeleton Placeholder ---
// 修改 ProductSkeletonPlaceholder 返回 span
const ProductSkeletonPlaceholder = ({ style }: { style: string }) => {
    const baseClasses = "my-4 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 align-middle"; // 添加 align-middle
    let styleClasses = "inline-block w-full h-24"; // 默认 inline-block

    if (style === 'card') {
        styleClasses = "inline-block w-full max-w-[280px] h-96 rounded-lg shadow-md mx-auto"; // card 需要特定尺寸和边距
    } else if (style === 'horizontal') {
        styleClasses = "inline-flex items-center w-full h-28 border rounded-lg overflow-hidden shadow-sm p-3"; // horizontal 使用 inline-flex
    } else if (style === 'mini') {
        styleClasses = "inline-flex items-center space-x-2 h-16 w-60 border rounded-lg p-2 shadow-sm overflow-hidden"; // mini 使用 inline-flex
    }

    // 返回 span
    return <span className={`${baseClasses} ${styleClasses}`} />;
};

// --- DynamicProductLoader ---

interface DynamicProductLoaderProps {
    productId: string;
    style?: string;
    alignment?: 'left' | 'center' | 'right';
}

// Fetcher function for SWR
const fetchProduct = async (productId: string): Promise<ComponentProduct | null> => {
    if (!productId) return null;
    try {
        // Prefer getProductById if it's not an ASIN, otherwise try queryProduct
        const isAsin = /^[A-Z0-9]{10,13}$/.test(productId.toUpperCase());
        let apiResponse;

        if (isAsin) {
            apiResponse = await productsApi.queryProduct({ asins: [productId.toUpperCase()], include_browse_nodes: null });
        } else {
            apiResponse = await productsApi.getProductById(productId);
        }

        if (apiResponse?.data) {
            // Handle both array (from query) and single object (from getById)
            const productData = Array.isArray(apiResponse.data) ? apiResponse.data[0] : apiResponse.data;

            if (!productData) {
                return null;
            }
            // Adapt the single product data
            // Ensure adaptProducts handles the structure correctly
            const adapted = adaptProducts([productData as Product]);

            return adapted[0] || null;
        }

        return null;
    } catch (error) {
        // Re-throw or return null to let SWR handle the error state
        throw error; // Let SWR handle the error state
    }
};

export default function DynamicProductLoader({ productId, style = 'simple' }: DynamicProductLoaderProps) {
    const { data: product, error, isLoading } = useSWR<ComponentProduct | null>(
        productId ? ['product', productId] : null,
        () => fetchProduct(productId),
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false,
            dedupingInterval: 60000,
        }
    );

    // 加载状态 - 现在也需要考虑对齐
    if (isLoading) {
        return (
            <span className="inline-block align-middle">
                <ProductSkeletonPlaceholder style={style} />
            </span>
        );
    }

    // 错误状态 - 改用 span 并应用内联样式
    if (error || !product) {
        return (
            // Change outer div to span, add inline-block and vertical-align
            <span className="inline-block align-middle my-4 text-center"> {/* Center text within span */}
                {/* Change inner div to span */}
                <span className="inline-flex items-center justify-center p-3 border rounded-md bg-red-50 text-red-700 shadow-sm text-xs max-w-md">
                    无法加载产品信息 (ID: {productId})。
                </span>
            </span>
        );
    }

    // 渲染产品组件 (不变)
    let productElement: React.ReactNode | null = null;

    switch (style) {
        case 'card': productElement = <CardProductElement product={product} />; break;
        case 'horizontal': productElement = <HorizontalProductElement product={product} />; break;
        case 'mini': productElement = <MiniProductElement product={product} />; break;
        case 'simple': default: productElement = <SimpleProductElement product={product} />; break;
    }

    // 直接返回产品元素，移除包裹 span
    return productElement;
} 

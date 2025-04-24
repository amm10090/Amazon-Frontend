'use client';

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

// --- Skeleton Placeholder --- (Replace with your actual Skeleton component) ---
const ProductSkeletonPlaceholder = ({ style }: { style: string }) => {
    let className = "w-full h-24 my-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md";

    if (style === 'card') {
        className = "my-4 w-full max-w-[280px] mx-auto h-96 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg shadow-md";
    } else if (style === 'horizontal') {
        className = "flex w-full h-28 my-4 border rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-sm animate-pulse p-3 items-center";
    } else if (style === 'mini') {
        className = "inline-flex items-center space-x-2 h-16 w-60 my-2 border rounded-lg p-2 bg-gray-200 dark:bg-gray-700 shadow-sm animate-pulse";
    }

    return <div className={className} />;
};

// --- DynamicProductLoader --- 

interface DynamicProductLoaderProps {
    productId: string;
    style?: string;
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
        // Use a stable key based on productId
        productId ? ['product', productId] : null,
        () => fetchProduct(productId),
        {
            revalidateOnFocus: false, // Optional: prevent refetch on window focus
            shouldRetryOnError: false, // Optional: prevent retries on fetch error
            dedupingInterval: 60000, // Optional: prevent re-fetching same key within 60s
        }
    );

    if (isLoading) {
        // Render skeleton based on style
        return <ProductSkeletonPlaceholder style={style} />;
    }

    if (error || !product) {

        return (
            <div className="flex items-center justify-center my-4 p-3 border rounded-md bg-red-50 text-red-700 shadow-sm text-xs">
                无法加载产品信息 (ID: {productId})。
            </div>
        );
    }

    // Dynamically import components to potentially optimize bundle size
    // This is more advanced and might require Suspense boundaries
    // For simplicity, direct rendering is used here.

    // Render the correct component based on style
    switch (style) {
        case 'card':
            return <CardProductElement product={product} />; // Ensure this component is imported/defined
        case 'horizontal':
            return <HorizontalProductElement product={product} />; // Ensure this component is imported/defined
        case 'mini':
            return <MiniProductElement product={product} />; // Ensure this component is imported/defined
        case 'simple':
        default:
            return <SimpleProductElement product={product} />; // Ensure this component is imported/defined
    }
} 

'use client';

import { Node, mergeAttributes, type CommandProps } from '@tiptap/core';
import { ReactNodeViewRenderer, type RawCommands, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useMemo } from 'react';
import useSWR from 'swr';

import { productsApi } from '@/lib/api';
import { adaptProducts, formatPrice } from '@/lib/utils';
import type { ComponentProduct } from '@/types';

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

// Metadata field category definitions
export const METADATA_FIELDS = {
    basic: [
        { id: 'title', name: 'Title', render: (value: string) => value },
        { id: 'brand', name: 'Brand', render: (value: string) => value },
        { id: 'description', name: 'Description', render: (value: string) => value }
    ],
    price: [
        { id: 'price', name: 'Current Price', render: (value: number) => formatPrice(value) },
        { id: 'originalPrice', name: 'Original Price', render: (value: number) => formatPrice(value) },
        { id: 'discount', name: 'Discount Rate', render: (value: number) => `${value}%` }
    ],
    shipping: [
        { id: 'isPrime', name: 'Prime Status', render: (value: boolean) => value ? 'Yes' : 'No' },
        { id: 'isFreeShipping', name: 'Free Shipping', render: (value: boolean) => value ? 'Yes' : 'No' }
    ],
    coupon: [
        { id: 'couponType', name: 'Coupon Type', render: (value: string) => value },
        { id: 'couponValue', name: 'Coupon Value', render: (value: number) => formatPrice(value) },
        { id: 'couponExpirationDate', name: 'Expiration Date', render: (value: string) => new Date(value).toLocaleDateString('en-US') }
    ]
} as const;

// Get all field IDs
export const ALL_FIELD_IDS = Object.values(METADATA_FIELDS).flatMap(group =>
    group.map(field => field.id)
);

// Field renderer mapping
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FIELD_RENDERERS = Object.values(METADATA_FIELDS).reduce<Record<string, (value: any) => string>>((acc, group) => {
    group.forEach(field => {
        acc[field.id] = field.render;
    });

    return acc;
}, {});

// Export node attributes interface
export interface ProductMetadataAttributes {
    productId: string;
    fieldId: string;
    value?: unknown;
}

// Modify fetcher function
const fetcher = async (productId: string): Promise<ComponentProduct> => {
    try {
        const response = await productsApi.getProductById(productId);

        // Add debug logs

        // Handle different data structure scenarios
        let productData;

        if (response.data?.data) {
            productData = response.data.data;
        } else if (response.data) {
            // May directly return data object
            productData = response.data;
        } else {
            throw new Error('Failed to parse product data format');
        }

        // Check if it's an array or single object
        let dataToAdapt: ProductApiData[] = Array.isArray(productData) ? productData : [productData];

        // Ensure data conforms to API product data format
        dataToAdapt = dataToAdapt.map(item => {
            // Basic field mapping, handle possible different field names
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
                // Other fields
                ...item
            };

            return mappedItem;
        });

        // @ts-ignore Temporarily ignore type checking as we've done appropriate field mapping
        const adaptedProducts = adaptProducts(dataToAdapt);

        if (adaptedProducts.length === 0) {
            throw new Error('Product data is empty after adaptation');
        }

        return adaptedProducts[0];
    } catch (error) {
        throw error;
    }
};

// Product metadata view component
const ProductMetadataView = ({ node }: NodeViewProps) => {
    const { productId, fieldId } = node.attrs;

    const { data: product, error } = useSWR<ComponentProduct>(
        productId ? ['product-metadata', productId] : null,
        () => fetcher(productId),
        {
            revalidateOnFocus: false,
            dedupingInterval: 10000, // No duplicate requests within 10 seconds
        }
    );

    // Get renderer
    const renderer = FIELD_RENDERERS[fieldId];

    // Debug information

    // Calculate display value
    const displayValue = useMemo(() => {
        if (error) return 'Failed to load';
        if (!product) return 'Loading...';

        const value = product[fieldId as keyof ComponentProduct];

        if (value === undefined || value === null) return 'No data available';

        try {
            return renderer ? renderer(value) : String(value);
        } catch {
            return String(value);
        }
    }, [product, fieldId, error, renderer]);

    return (
        <NodeViewWrapper as="span">
            <span className="inline text-sm">
                {displayValue}
            </span>
        </NodeViewWrapper>
    );
};

// Product metadata node definition
export const ProductMetadataBlot = Node.create<ProductMetadataAttributes>({
    name: 'productMetadata',
    group: 'inline',
    inline: true,
    atom: true,

    addAttributes() {
        return {
            productId: {
                default: '',
                parseHTML: element => element.getAttribute('data-product-id'),
                renderHTML: attributes => ({ 'data-product-id': attributes.productId })
            },
            fieldId: {
                default: '',
                parseHTML: element => element.getAttribute('data-field-id'),
                renderHTML: attributes => ({ 'data-field-id': attributes.fieldId })
            }
        };
    },

    parseHTML() {
        return [{
            tag: 'span[data-type="product-metadata"]'
        }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(
            { 'data-type': 'product-metadata' },
            HTMLAttributes
        )];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ProductMetadataView);
    },

    addCommands() {
        return {
            insertProductMetadata:
                (attributes: ProductMetadataAttributes) =>
                    ({ chain }: CommandProps) => {
                        return chain()
                            .insertContent({
                                type: this.name,
                                attrs: attributes
                            })
                            .run();
                    }
        } as unknown as Partial<RawCommands>;
    }
});

// Modify command type definition
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        productMetadata: {
            insertProductMetadata: (attributes: ProductMetadataAttributes) => ReturnType;
        };
    }
} 
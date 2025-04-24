'use client';

import { Node, mergeAttributes, type ChainedCommands } from '@tiptap/core';
import { type Node as ProseMirrorNode } from '@tiptap/pm/model';
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { type FC } from 'react';
import useSWR from 'swr'; // Import useSWR

// Import necessary functions and types
import { productsApi } from '@/lib/api';
import { adaptProducts } from '@/lib/utils'; // Import adaptProducts
import type { ComponentProduct, Product } from '@/types'; // Import ComponentProduct

// Import the actual display components
import CardProductElement from './Template/CardProductElement';
import HorizontalProductElement from './Template/HorizontalProductElement';
import MiniProductElement from './Template/MiniProductElement';
import SimpleProductElement from './Template/SimpleProductElement';

// Define a similar skeleton placeholder for the editor preview
const ProductSkeletonPlaceholder = ({ style }: { style: string }) => {
    let className = "w-full h-24 my-2 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md";

    if (style === 'card') {
        className = "my-2 w-full max-w-[280px] mx-auto h-96 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg shadow-md";
    } else if (style === 'horizontal') {
        className = "flex w-full h-28 my-2 border rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-sm animate-pulse p-3 items-center";
    } else if (style === 'mini') {
        className = "inline-flex items-center my-2 border rounded-lg p-2 bg-gray-200 dark:bg-gray-700 shadow-sm animate-pulse max-w-full w-64 overflow-hidden";
    }

    return <div className={className} />;
};


// Fetcher function for SWR (similar to DynamicProductLoader)
const fetchEditorProduct = async (productIdOrAsin: string): Promise<ComponentProduct | null> => {
    if (!productIdOrAsin) return null;
    try {
        const isAsin = /^[A-Z0-9]{10,13}$/.test(productIdOrAsin.toUpperCase());
        let apiResponse;

        if (isAsin) {
            // console.log(`[Editor Fetch] ASIN: ${productIdOrAsin}`);
            apiResponse = await productsApi.queryProduct({ asins: [productIdOrAsin.toUpperCase()], include_browse_nodes: null });
        } else {
            // console.log(`[Editor Fetch] ID: ${productIdOrAsin}`);
            apiResponse = await productsApi.getProductById(productIdOrAsin);
        }

        if (apiResponse?.data) {
            const productData = Array.isArray(apiResponse.data) ? apiResponse.data[0] : apiResponse.data;

            if (!productData) return null;
            const adapted = adaptProducts([productData as Product]);

            return adapted[0] || null;
        }

        return null;
    } catch (error) {
        throw error; // Let SWR handle the error state
    }
};


// 产品节点的属性接口 - 添加 alignment
export interface ProductAttributes {
    id: string;
    title?: string;
    price?: number;
    image?: string;
    asin?: string;
    style?: string;
    url?: string;
    cj_url?: string;
    originalPrice?: number | null;
    discount?: number | null;
    couponType?: 'percentage' | 'fixed' | null;
    couponValue?: number | null;
    couponExpirationDate?: string | null;
    isPrime?: boolean | null;
    isFreeShipping?: boolean | null;
    brand?: string | null;
    alignment?: 'left' | 'center' | 'right';
}

type ProductComponentProps = NodeViewProps;

// 定义产品样式 (导出以便在 RichTextEditor 中使用)
export const PRODUCT_STYLES = [
    { id: 'simple', name: '简单' },
    { id: 'card', name: '卡片' },
    { id: 'horizontal', name: '水平' },
    { id: 'mini', name: '迷你' }
];

// 产品节点组件 - 应用 inline-block 样式
const ProductComponent: FC<ProductComponentProps> = ({ node, selected }) => {
    const { id: productId, style = 'simple' } = node.attrs as ProductAttributes;

    // Fetch data using SWR based on the product ID
    const { data: product, error, isLoading } = useSWR<ComponentProduct | null>(
        productId ? ['editor-product', productId] : null, // Unique key for editor product
        () => fetchEditorProduct(productId),
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false,
            dedupingInterval: 60000, // Cache for 1 minute
        }
    );

    // Renders the actual product based on fetched data and style
    const renderFetchedProduct = () => {
        if (isLoading) {
            return <ProductSkeletonPlaceholder style={style} />;
        }

        if (error || !product) {
            return (
                <div className="flex items-center justify-center my-2 p-3 border rounded-md bg-red-50 text-red-700 shadow-sm text-xs">
                    无法加载产品预览 (ID: {productId})。
                </div>
            );
        }

        // Render the correct component based on style attribute
        switch (style) {
            case 'card':
                return <CardProductElement product={product} />;
            case 'horizontal':
                return <HorizontalProductElement product={product} />;
            case 'mini':
                return <MiniProductElement product={product} />;
            case 'simple':
            default:
                return <SimpleProductElement product={product} />;
        }
    };

    // 移除 alignmentClass 计算

    return (
        // 应用 inline-block 样式
        <NodeViewWrapper as="span" className="product-node-wrapper relative group inline-block align-middle">
            {/* 内部容器 */}
            <div
                data-product-id={productId}
                data-node-type="product"
                data-style={style}
                // 移除内联的 textAlign 样式
                className={`relative p-1 border ${selected ? 'ring-2 ring-blue-500 border-transparent' : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800'} rounded-lg overflow-hidden bg-white dark:bg-gray-800`} // 添加背景色以防透明
            >
                {renderFetchedProduct()}

                {/* 产品标签 */}
                <div className={`absolute top-1 right-1 flex items-center gap-1 z-10 transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <div className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-200 rounded-full shadow-sm transition-colors" contentEditable={false}>产品</div>
                </div>
            </div>
        </NodeViewWrapper>
    );
};

// 命令参数的接口


// 创建一个自定义的序列化函数，用于序列化产品节点 - Keep for saving
// const createProductSerializer = () => {
//     // 序列化函数，将节点转换为DOM元素
//     const productNodeToDom = (node: ProseMirrorNodeType) => {
//         const el = document.createElement('div');
//
//         el.setAttribute('data-node-type', 'product');
//         // Primarily save ID and Style for frontend rendering
//         el.setAttribute('data-product-id', node.attrs.id || '');
//         el.setAttribute('data-style', node.attrs.style || 'simple'); // 添加样式属性
//
//         // Optionally save other attributes if needed for backend/other purposes
//         // or as fallback data if dynamic loading fails? (decision needed)
//         // Example: keeping title as fallback
//         if (node.attrs.title) el.setAttribute('data-title', node.attrs.title);
//         if (node.attrs.price) el.setAttribute('data-price', String(node.attrs.price));
//         if (node.attrs.image) el.setAttribute('data-image', node.attrs.image);
//         if (node.attrs.asin) el.setAttribute('data-asin', node.attrs.asin);
//         if (node.attrs.url) el.setAttribute('data-url', node.attrs.url);
//         if (node.attrs.cj_url) el.setAttribute('data-cj-url', node.attrs.cj_url);
//         if (node.attrs.brand) el.setAttribute('data-brand', node.attrs.brand);
//         if (node.attrs.originalPrice) el.setAttribute('data-original-price', String(node.attrs.originalPrice));
//         if (node.attrs.discount) el.setAttribute('data-discount', String(node.attrs.discount));
//         if (node.attrs.couponType) el.setAttribute('data-coupon-type', node.attrs.couponType);
//         if (node.attrs.couponValue) el.setAttribute('data-coupon-value', String(node.attrs.couponValue));
//         if (node.attrs.couponExpirationDate) el.setAttribute('data-coupon-expiration-date', node.attrs.couponExpirationDate);
//         if (typeof node.attrs.isPrime === 'boolean') el.setAttribute('data-is-prime', String(node.attrs.isPrime));
//         if (typeof node.attrs.isFreeShipping === 'boolean') el.setAttribute('data-is-free-shipping', String(node.attrs.isFreeShipping));
//
//         // 对于叶子节点，创建自闭合的HTML元素
//         return el;
//     };
//
//     // 扩展DOMSerializer，添加对产品节点的支持
//     const originalFromSchema = DOMSerializer.fromSchema;
//
//     // Check if already modified to prevent infinite loops or errors
//     if (!(DOMSerializer.fromSchema as ExtendedFromSchema).__customProductSerializerAttached) {
//         DOMSerializer.fromSchema = function (schema) {
//             const serializer = originalFromSchema.call(this, schema);
//             const productNodeType = schema.nodes.product;
//
//             if (productNodeType && !serializer.nodes.product) { // Attach only if not present
//                 serializer.nodes.product = productNodeToDom;
//             }
//
//             return serializer;
//         };
//         (DOMSerializer.fromSchema as ExtendedFromSchema).__customProductSerializerAttached = true;
//     }
// };


// 标准的 ProseMirror 节点规范中的 toDOM 函数 - 移除 style 处理
// const productToDOM = (node: ProseMirrorNodeType) => {
//     const attrs: Record<string, string | number | boolean | null | undefined> = {
//         'data-node-type': 'product',
//         'data-product-id': node.attrs.id || '',
//         'data-style': node.attrs.style || 'simple',
//         'data-alignment': node.attrs.alignment,
//         'data-title': node.attrs.title,
//         'data-price': node.attrs.price,
//         'data-image': node.attrs.image,
//         'data-asin': node.attrs.asin,
//         'data-url': node.attrs.url,
//         'data-cj-url': node.attrs.cj_url,
//         'data-brand': node.attrs.brand,
//         'data-original-price': node.attrs.originalPrice,
//         'data-discount': node.attrs.discount,
//         'data-coupon-type': node.attrs.couponType,
//         'data-coupon-value': node.attrs.couponValue,
//         'data-coupon-expiration-date': node.attrs.couponExpirationDate,
//         'data-is-prime': node.attrs.isPrime,
//         'data-is-free-shipping': node.attrs.isFreeShipping
//     };
//
//     // Clean up null/undefined and convert booleans/numbers, and default 'left' alignment
//     Object.keys(attrs).forEach(key => {
//         if (attrs[key] === undefined || attrs[key] === null) {
//             delete attrs[key];
//         } else if (key === 'alignment' && attrs[key] === 'left') {
//             delete attrs[key]; // 不保存默认的左对齐
//         } else if (typeof attrs[key] === 'boolean') {
//             attrs[key] = String(attrs[key]);
//         } else if (typeof attrs[key] === 'number') {
//             attrs[key] = String(attrs[key]);
//         }
//     });
//
//     return ['div', attrs as Record<string, string>];
// };

// TipTap产品节点扩展 - 修改 group 和 inline
export const ProductBlot = Node.create<ProductAttributes>({
    name: 'product',
    group: 'inline',
    atom: true,
    inline: true,
    draggable: true,
    content: '',

    addAttributes() {
        return {
            id: { // Essential
                default: '',
                parseHTML: element => element.getAttribute('data-product-id'),
                renderHTML: attributes => ({ 'data-product-id': attributes.id }),
            },
            style: { // Essential for rendering
                default: 'simple',
                parseHTML: element => element.getAttribute('data-style'),
                renderHTML: attributes => ({ 'data-style': attributes.style }),
            },
            alignment: { // <-- 新增
                default: 'left',
                parseHTML: element => element.getAttribute('data-alignment') || 'left',
                // 仅在非默认值时渲染 HTML 属性
                renderHTML: attributes => attributes.alignment && attributes.alignment !== 'left' ? { 'data-alignment': attributes.alignment } : {},
            },
            // Keep other attributes for node structure, insertion, and parsing
            title: {
                default: '未命名产品',
                parseHTML: element => element.getAttribute('data-title'),
                renderHTML: attributes => attributes.title ? { 'data-title': attributes.title } : {},
            },
            price: {
                default: 0,
                parseHTML: element => parseFloat(element.getAttribute('data-price') || '0'),
                renderHTML: attributes => typeof attributes.price === 'number' ? { 'data-price': String(attributes.price) } : {},
            },
            image: {
                default: '/placeholder-product.jpg',
                parseHTML: element => element.getAttribute('data-image'),
                renderHTML: attributes => attributes.image ? { 'data-image': attributes.image } : {},
            },
            asin: {
                default: '',
                parseHTML: element => element.getAttribute('data-asin'),
                renderHTML: attributes => attributes.asin ? { 'data-asin': attributes.asin } : {},
            },
            url: {
                default: '',
                parseHTML: element => element.getAttribute('data-url'),
                renderHTML: attributes => attributes.url ? { 'data-url': attributes.url } : {},
            },
            cj_url: {
                default: '',
                parseHTML: element => element.getAttribute('data-cj-url'),
                renderHTML: attributes => attributes.cj_url ? { 'data-cj-url': attributes.cj_url } : {},
            },
            brand: {
                default: null,
                parseHTML: element => element.getAttribute('data-brand'),
                renderHTML: attributes => attributes.brand ? { 'data-brand': attributes.brand } : {},
            },
            originalPrice: {
                default: null,
                parseHTML: element => {
                    const v = element.getAttribute('data-original-price');

                    return v ? parseFloat(v) : null;
                },
                renderHTML: attributes => attributes.originalPrice ? { 'data-original-price': String(attributes.originalPrice) } : {},
            },
            discount: {
                default: null,
                parseHTML: element => {
                    const v = element.getAttribute('data-discount');

                    return v ? parseFloat(v) : null;
                },
                renderHTML: attributes => attributes.discount ? { 'data-discount': String(attributes.discount) } : {},
            },
            couponType: {
                default: null,
                parseHTML: element => element.getAttribute('data-coupon-type') as ProductAttributes['couponType'],
                renderHTML: attributes => attributes.couponType ? { 'data-coupon-type': attributes.couponType } : {},
            },
            couponValue: {
                default: null,
                parseHTML: element => {
                    const v = element.getAttribute('data-coupon-value');

                    return v ? parseFloat(v) : null;
                },
                renderHTML: attributes => attributes.couponValue ? { 'data-coupon-value': String(attributes.couponValue) } : {},
            },
            couponExpirationDate: {
                default: null,
                parseHTML: element => element.getAttribute('data-coupon-expiration-date'),
                renderHTML: attributes => attributes.couponExpirationDate ? { 'data-coupon-expiration-date': attributes.couponExpirationDate } : {},
            },
            isPrime: {
                default: null,
                parseHTML: element => element.getAttribute('data-is-prime') === 'true',
                renderHTML: attributes => typeof attributes.isPrime === 'boolean' ? { 'data-is-prime': String(attributes.isPrime) } : {},
            },
            isFreeShipping: {
                default: null,
                parseHTML: element => element.getAttribute('data-is-free-shipping') === 'true',
                renderHTML: attributes => typeof attributes.isFreeShipping === 'boolean' ? { 'data-is-free-shipping': String(attributes.isFreeShipping) } : {},
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-node-type="product"]',
                getAttrs: (dom) => {
                    const element = dom as HTMLElement;
                    const getNullableFloat = (attr: string) => {
                        const v = element.getAttribute(attr);

                        return v ? parseFloat(v) : null;
                    };
                    const getNullableString = (attr: string) => element.getAttribute(attr) || null;
                    const getBoolean = (attr: string) => element.getAttribute(attr) === 'true';

                    return {
                        id: element.getAttribute('data-product-id') || '',
                        style: element.getAttribute('data-style') || 'simple',
                        alignment: (element.getAttribute('data-alignment') || 'left') as ProductAttributes['alignment'],
                        title: element.getAttribute('data-title') || '未命名产品',
                        price: parseFloat(element.getAttribute('data-price') || '0'),
                        image: element.getAttribute('data-image') || '/placeholder-product.jpg',
                        asin: element.getAttribute('data-asin') || '',
                        url: element.getAttribute('data-url') || '',
                        cj_url: element.getAttribute('data-cj-url') || '',
                        brand: getNullableString('data-brand'),
                        originalPrice: getNullableFloat('data-original-price'),
                        discount: getNullableFloat('data-discount'),
                        couponType: getNullableString('data-coupon-type') as ProductAttributes['couponType'],
                        couponValue: getNullableFloat('data-coupon-value'),
                        couponExpirationDate: getNullableString('data-coupon-expiration-date'),
                        isPrime: getBoolean('data-is-prime'),
                        isFreeShipping: getBoolean('data-is-free-shipping'),
                    };
                }
            },
        ];
    },

    // 直接定义 toDOM 方法，并为 node 添加类型
    toDOM(node: ProseMirrorNode) {
        const attrs: Record<string, string | number | boolean | null | undefined> = {
            'data-node-type': 'product',
            'data-product-id': node.attrs.id || '',
            'data-style': node.attrs.style || 'simple',
            'data-alignment': node.attrs.alignment,
            'data-title': node.attrs.title,
            'data-price': node.attrs.price,
            'data-image': node.attrs.image,
            'data-asin': node.attrs.asin,
            'data-url': node.attrs.url,
            'data-cj-url': node.attrs.cj_url,
            'data-brand': node.attrs.brand,
            'data-original-price': node.attrs.originalPrice,
            'data-discount': node.attrs.discount,
            'data-coupon-type': node.attrs.couponType,
            'data-coupon-value': node.attrs.couponValue,
            'data-coupon-expiration-date': node.attrs.couponExpirationDate,
            'data-is-prime': node.attrs.isPrime,
            'data-is-free-shipping': node.attrs.isFreeShipping
        };

        Object.keys(attrs).forEach(key => {
            const value = attrs[key];

            if (value === undefined || value === null) {
                delete attrs[key];
            } else if (key === 'alignment' && value === 'left') {
                delete attrs[key];
            } else if (typeof value === 'boolean') {
                attrs[key] = String(value);
            } else if (typeof value === 'number') {
                attrs[key] = String(value);
            }
        });

        return ['span', attrs as Record<string, string>];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes({ 'data-node-type': 'product' }, HTMLAttributes)];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ProductComponent);
    },

    addCommands() {
        return {
            insertProduct: (attributes: Partial<ProductAttributes>) => ({ commands }: { commands: ChainedCommands }) => {
                const validAttributes: Partial<ProductAttributes> = {};
                const allowedKeys: Array<keyof ProductAttributes> = [
                    'id', 'title', 'price', 'image', 'asin', 'style', 'url', 'cj_url',
                    'brand', 'originalPrice', 'discount', 'couponType', 'couponValue',
                    'couponExpirationDate', 'isPrime', 'isFreeShipping', 'alignment'
                ];

                allowedKeys.forEach(key => {
                    if (attributes[key] !== undefined) {
                        (validAttributes as Record<keyof ProductAttributes, string | number | boolean | null | undefined>)[key] = attributes[key];
                    }
                });

                const fullAttributes: ProductAttributes = {
                    id: validAttributes.id ?? '',
                    title: validAttributes.title ?? '未命名产品',
                    price: validAttributes.price ?? 0,
                    image: validAttributes.image ?? '/placeholder-product.jpg',
                    asin: validAttributes.asin ?? '',
                    style: validAttributes.style ?? 'simple',
                    alignment: validAttributes.alignment ?? 'left',
                    url: validAttributes.url ?? '',
                    cj_url: validAttributes.cj_url ?? '',
                    brand: validAttributes.brand ?? null,
                    originalPrice: validAttributes.originalPrice ?? null,
                    discount: validAttributes.discount ?? null,
                    couponType: validAttributes.couponType ?? null,
                    couponValue: validAttributes.couponValue ?? null,
                    couponExpirationDate: validAttributes.couponExpirationDate ?? null,
                    isPrime: validAttributes.isPrime ?? null,
                    isFreeShipping: validAttributes.isFreeShipping ?? null,
                };

                return commands.insertContent({
                    type: this.name,
                    attrs: fullAttributes
                });
            },
        } as unknown as Record<string, (...args: unknown[]) => (props: { commands: ChainedCommands }) => boolean>;
    },
});

export default ProductBlot; 
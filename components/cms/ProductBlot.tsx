'use client';

import { Node, mergeAttributes, type ChainedCommands } from '@tiptap/core';
import { DOMSerializer, type Node as ProseMirrorNodeType } from '@tiptap/pm/model';
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { type FC, useState } from 'react';
import useSWR from 'swr'; // Import useSWR

// 从 @tiptap/pm/model 导入需要的类型和类
type ExtendedFromSchema = typeof DOMSerializer.fromSchema & {
    __customProductSerializerAttached?: boolean;
};

interface InsertContentPayload {
    type: string;
    attrs: Required<ProductAttributes>;
}

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


// 产品节点的属性接口 (Keep this as it defines node attributes for saving)
export interface ProductAttributes {
    id: string; // Keep ID as the primary identifier
    title?: string; // Make others optional, mainly for initial insertion/fallback
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
}

type ProductComponentProps = NodeViewProps;

const PRODUCT_STYLES = [
    { id: 'simple', name: '简单布局' },
    { id: 'card', name: '卡片布局' },
    { id: 'horizontal', name: '水平布局' },
    { id: 'mini', name: '迷你布局' }
];

// 产品节点组件 - Now fetches data
const ProductComponent: FC<ProductComponentProps> = ({ node, selected, updateAttributes }) => {
    const { id: productId, style = 'simple' } = node.attrs as ProductAttributes; // Primarily need id and style
    const [showStyleSelector, setShowStyleSelector] = useState(false);

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

    // 样式选择处理函数
    const handleStyleChange = (newStyle: string) => {
        updateAttributes({ style: newStyle });
        setShowStyleSelector(false);
    };

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

    return (
        <NodeViewWrapper className="product-node-wrapper my-2 relative group overflow-hidden">
            <div
                data-product-id={productId}
                data-node-type="product"
                data-style={style}
                className={`relative p-1 border ${selected ? 'ring-2 ring-blue-500 rounded-lg border-transparent' : 'border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-200 dark:hover:border-blue-800'}`}
            >
                {renderFetchedProduct()}

                <div className={`absolute top-1 right-1 flex items-center gap-1 z-10 transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <div
                        className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full cursor-pointer shadow-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                        onClick={(e) => { e.stopPropagation(); setShowStyleSelector(!showStyleSelector); }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowStyleSelector(!showStyleSelector);
                            }
                        }}
                        role="button"
                        tabIndex={0}
                        contentEditable={false}
                    >
                        {PRODUCT_STYLES.find(s => s.id === style)?.name || '样式'}
                    </div>
                    <div className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-200 rounded-full shadow-sm transition-colors" contentEditable={false}>产品</div>
                </div>
            </div>

            {showStyleSelector && (
                <div className="absolute top-10 right-1 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 p-2 w-36">
                    <div className="text-xs font-medium mb-1 px-2 py-1 text-gray-500 dark:text-gray-400">选择样式</div>
                    {PRODUCT_STYLES.map((styleOption) => (
                        <button
                            key={styleOption.id}
                            className={`block w-full text-left px-3 py-1.5 text-sm cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${style === styleOption.id ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-200' : 'text-gray-700 dark:text-gray-200'}`}
                            onClick={(e) => { e.stopPropagation(); handleStyleChange(styleOption.id); }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleStyleChange(styleOption.id);
                                }
                            }}
                            contentEditable={false}
                        >
                            {styleOption.name}
                        </button>
                    ))}
                </div>
            )}
        </NodeViewWrapper>
    );
};

// 命令参数的接口
interface CommandProps {
    commands: ChainedCommands;
}

// 创建一个自定义的序列化函数，用于序列化产品节点 - Keep for saving
const createProductSerializer = () => {
    // 序列化函数，将节点转换为DOM元素
    const productNodeToDom = (node: ProseMirrorNodeType) => {
        const el = document.createElement('div');

        el.setAttribute('data-node-type', 'product');
        // Primarily save ID and Style for frontend rendering
        el.setAttribute('data-product-id', node.attrs.id || '');
        el.setAttribute('data-style', node.attrs.style || 'simple'); // 添加样式属性

        // Optionally save other attributes if needed for backend/other purposes
        // or as fallback data if dynamic loading fails? (decision needed)
        // Example: keeping title as fallback
        if (node.attrs.title) el.setAttribute('data-title', node.attrs.title);
        if (node.attrs.price) el.setAttribute('data-price', String(node.attrs.price));
        if (node.attrs.image) el.setAttribute('data-image', node.attrs.image);
        if (node.attrs.asin) el.setAttribute('data-asin', node.attrs.asin);
        if (node.attrs.url) el.setAttribute('data-url', node.attrs.url);
        if (node.attrs.cj_url) el.setAttribute('data-cj-url', node.attrs.cj_url);
        if (node.attrs.brand) el.setAttribute('data-brand', node.attrs.brand);
        if (node.attrs.originalPrice) el.setAttribute('data-original-price', String(node.attrs.originalPrice));
        if (node.attrs.discount) el.setAttribute('data-discount', String(node.attrs.discount));
        if (node.attrs.couponType) el.setAttribute('data-coupon-type', node.attrs.couponType);
        if (node.attrs.couponValue) el.setAttribute('data-coupon-value', String(node.attrs.couponValue));
        if (node.attrs.couponExpirationDate) el.setAttribute('data-coupon-expiration-date', node.attrs.couponExpirationDate);
        if (typeof node.attrs.isPrime === 'boolean') el.setAttribute('data-is-prime', String(node.attrs.isPrime));
        if (typeof node.attrs.isFreeShipping === 'boolean') el.setAttribute('data-is-free-shipping', String(node.attrs.isFreeShipping));

        // 对于叶子节点，创建自闭合的HTML元素
        return el;
    };

    // 扩展DOMSerializer，添加对产品节点的支持
    const originalFromSchema = DOMSerializer.fromSchema;

    // Check if already modified to prevent infinite loops or errors
    if (!(DOMSerializer.fromSchema as ExtendedFromSchema).__customProductSerializerAttached) {
        DOMSerializer.fromSchema = function (schema) {
            const serializer = originalFromSchema.call(this, schema);
            const productNodeType = schema.nodes.product;

            if (productNodeType && !serializer.nodes.product) { // Attach only if not present
                serializer.nodes.product = productNodeToDom;
            }

            return serializer;
        };
        (DOMSerializer.fromSchema as ExtendedFromSchema).__customProductSerializerAttached = true;
    }
};


// 标准的 ProseMirror 节点规范中的 toDOM 函数 - Keep for node spec
const productToDOM = (node: ProseMirrorNodeType) => {
    // This defines how the node is represented *internally* in ProseMirror's DOM view,
    // and is also used by renderHTML. Keep saving necessary attributes.
    const attrs: Record<string, string | number | boolean | null | undefined> = {
        'data-node-type': 'product',
        'data-product-id': node.attrs.id || '',
        'data-style': node.attrs.style || 'simple',
        // Include other attributes needed for saving/parsing
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

    // Clean up null/undefined and convert booleans (same as before)
    Object.keys(attrs).forEach(key => {
        if (attrs[key] === undefined || attrs[key] === null) {
            delete attrs[key];
        } else if (typeof attrs[key] === 'boolean') {
            attrs[key] = String(attrs[key]);
        } else if (typeof attrs[key] === 'number') {
            attrs[key] = String(attrs[key]); // Ensure numbers are strings for HTML attributes
        }
    });

    // 修改: 确保返回值格式正确 - 对于叶子节点, 不能有"内容洞"(content hole)
    // 返回空数组表示没有子内容，不要返回0或null，这可能会被解释为内容洞
    return ['div', attrs as Record<string, string>];
};

// TipTap产品节点扩展
export const ProductBlot = Node.create<ProductAttributes>({
    name: 'product',
    group: 'block',
    atom: true, // atom: true means it's treated as a single block, content not directly editable
    inline: false,
    draggable: true,
    content: '', // 显式声明为空内容

    // Keep extending spec with toDOM
    extending: {
        spec: {
            toDOM: productToDOM
        }
    },

    // Keep onTransaction to ensure serializer (though its necessity is reduced now)
    onTransaction() {
        createProductSerializer();

        return false; // return false means transaction is not stopped
    },


    // addAttributes: Keep ALL attributes defined here.
    // They define the node's schema and are used by parseHTML and insertProduct.
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

    // parseHTML: Keep this. It defines how to read attributes from saved HTML
    // back into node attributes when loading content into the editor.
    parseHTML() {
        return [
            {
                tag: 'div[data-node-type="product"]',
                // getAttrs needs to read all attributes defined in addAttributes
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
                        // Parse all other attributes back into the node
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

    // renderHTML: Keep this. It uses the result of renderHTML from addAttributes
    // and merges them with the node type attribute. Crucial for saving.
    renderHTML({ HTMLAttributes }) {
        // HTMLAttributes here are the result of calling renderHTML for each attribute in addAttributes
        return [
            'div',
            mergeAttributes({ 'data-node-type': 'product' }, HTMLAttributes)
            // 修改: 移除内容洞标记，保持与toDOM一致，避免使用null或数字
        ];
    },

    // Keep addNodeView using the (now modified) ProductComponent
    addNodeView() {
        return ReactNodeViewRenderer(ProductComponent);
    },

    // addCommands: Keep this. It's how products are inserted initially.
    // It MUST provide all attributes defined in addAttributes.
    addCommands() {
        return {
            insertProduct: (attributes: Partial<ProductAttributes>) => ({ commands }: CommandProps) => {
                // Ensure ALL attributes defined in addAttributes() have a default or passed value
                const fullAttributes: Required<ProductAttributes> = {
                    id: attributes.id || '',
                    title: attributes.title || '未命名产品',
                    price: attributes.price || 0,
                    image: attributes.image || '/placeholder-product.jpg',
                    asin: attributes.asin || '',
                    style: attributes.style || 'simple',
                    url: attributes.url || '',
                    cj_url: attributes.cj_url || '',
                    brand: attributes.brand ?? null,
                    originalPrice: attributes.originalPrice ?? null,
                    discount: attributes.discount ?? null,
                    couponType: attributes.couponType ?? null,
                    couponValue: attributes.couponValue ?? null,
                    couponExpirationDate: attributes.couponExpirationDate ?? null,
                    isPrime: attributes.isPrime ?? null,
                    isFreeShipping: attributes.isFreeShipping ?? null,
                };

                // Ensure nulls are handled if the attribute definition expects string/number
                Object.keys(fullAttributes).forEach(key => {
                    if (fullAttributes[key as keyof ProductAttributes] === null) {
                        // If default is non-null, provide it? Or ensure type allows null
                        // For simplicity, we assume the receiving end handles null appropriately for now
                    }
                });


                return commands.insertContent({
                    type: this.name,
                    attrs: fullAttributes
                } satisfies InsertContentPayload);
            },
        } as unknown as Record<string, (...args: unknown[]) => (props: { commands: ChainedCommands }) => boolean>;
    },
});

// Initialize serializer (if still needed, its role is less critical now for frontend render)
createProductSerializer();

export default ProductBlot; 
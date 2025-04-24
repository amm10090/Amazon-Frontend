'use client';

import { Node, mergeAttributes, type CommandProps } from '@tiptap/core';
import { ReactNodeViewRenderer, type RawCommands, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useMemo } from 'react';
import useSWR from 'swr';

import { productsApi } from '@/lib/api';
import { adaptProducts, formatPrice } from '@/lib/utils';
import type { ComponentProduct } from '@/types';

// 创建一个类型来适配不同的API响应
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

// 元数据字段分类定义
export const METADATA_FIELDS = {
    basic: [
        { id: 'title', name: '标题', render: (value: string) => value },
        { id: 'brand', name: '品牌', render: (value: string) => value },
        { id: 'description', name: '描述', render: (value: string) => value }
    ],
    price: [
        { id: 'price', name: '当前价格', render: (value: number) => formatPrice(value) },
        { id: 'originalPrice', name: '原价', render: (value: number) => formatPrice(value) },
        { id: 'discount', name: '折扣率', render: (value: number) => `${value}%` }
    ],
    shipping: [
        { id: 'isPrime', name: 'Prime状态', render: (value: boolean) => value ? '是' : '否' },
        { id: 'isFreeShipping', name: '免运费', render: (value: boolean) => value ? '是' : '否' }
    ],
    coupon: [
        { id: 'couponType', name: '优惠券类型', render: (value: string) => value },
        { id: 'couponValue', name: '优惠券金额', render: (value: number) => formatPrice(value) },
        { id: 'couponExpirationDate', name: '到期时间', render: (value: string) => new Date(value).toLocaleDateString('zh-CN') }
    ]
} as const;

// 获取所有字段ID
export const ALL_FIELD_IDS = Object.values(METADATA_FIELDS).flatMap(group =>
    group.map(field => field.id)
);

// 字段渲染器映射
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FIELD_RENDERERS = Object.values(METADATA_FIELDS).reduce<Record<string, (value: any) => string>>((acc, group) => {
    group.forEach(field => {
        acc[field.id] = field.render;
    });

    return acc;
}, {});

// 导出节点属性接口
export interface ProductMetadataAttributes {
    productId: string;
    fieldId: string;
}

// 修改 fetcher 函数
const fetcher = async (productId: string): Promise<ComponentProduct> => {
    try {
        const response = await productsApi.getProductById(productId);

        // 添加调试日志

        // 处理不同的数据结构情况
        let productData;

        if (response.data?.data) {
            productData = response.data.data;
        } else if (response.data) {
            // 可能直接返回数据对象
            productData = response.data;
        } else {
            throw new Error('无法解析产品数据格式');
        }


        // 检查是否为数组或单个对象
        let dataToAdapt: ProductApiData[] = Array.isArray(productData) ? productData : [productData];

        // 确保数据符合API产品数据格式
        dataToAdapt = dataToAdapt.map(item => {
            // 基本字段映射，处理可能的不同字段名
            const mappedItem: ProductApiData = {
                id: item.id || item.asin || item.sku || '',
                title: item.title || item.name || '未命名产品',
                price: item.price || item.current_price || 0,
                original_price: item.original_price || item.originalPrice || item.list_price || null,
                discount: item.discount || item.discount_percentage || null,
                brand: item.brand || item.manufacturer || null,
                image: item.main_image || item.image_url || item.image ||
                    (item.images && item.images.length > 0 ? item.images[0] : null) ||
                    '/placeholder-product.jpg',
                asin: item.asin || item.sku || '',
                // 其他字段
                ...item
            };

            return mappedItem;
        });

        // @ts-ignore 暂时忽略类型检查，因为我们已经做了适当的字段映射
        const adaptedProducts = adaptProducts(dataToAdapt);

        if (adaptedProducts.length === 0) {
            throw new Error('产品数据适配后为空');
        }

        return adaptedProducts[0];
    } catch (error) {
        throw error;
    }
};

// 产品元数据视图组件
const ProductMetadataView = ({ node }: NodeViewProps) => {
    const { productId, fieldId } = node.attrs;

    const { data: product, error } = useSWR<ComponentProduct>(
        productId ? ['product-metadata', productId] : null,
        () => fetcher(productId),
        {
            revalidateOnFocus: false,
            dedupingInterval: 10000, // 10秒内不重复请求
        }
    );

    // 获取渲染器
    const renderer = FIELD_RENDERERS[fieldId];

    // 调试信息


    // 计算显示值
    const displayValue = useMemo(() => {
        if (error) return '加载失败';
        if (!product) return '加载中...';

        const value = product[fieldId as keyof ComponentProduct];

        if (value === undefined || value === null) return '暂无数据';

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

// 产品元数据节点定义
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

// 修改命令类型定义
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        productMetadata: {
            insertProductMetadata: (attributes: ProductMetadataAttributes) => ReturnType;
        };
    }
} 
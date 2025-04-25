'use client';

import { useMemo } from 'react';
import useSWR from 'swr';

import { productsApi } from '@/lib/api';
import { adaptProducts } from '@/lib/utils';
import type { ComponentProduct } from '@/types';

import { FIELD_RENDERERS } from './ProductMetadataBlot'; // 从 ProductMetadataBlot 导入渲染器

// 定义 Props 接口
interface DynamicMetadataLoaderProps {
    productId: string;
    fieldId: string;
}

// --- Fetcher Function ---
// (可以复用 ProductMetadataBlot 中的 fetcher 逻辑，或根据需要调整)
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

const fetcher = async (productId: string): Promise<ComponentProduct> => {
    try {
        const response = await productsApi.getProductById(productId);
        let productData;

        if (response.data?.data) {
            productData = response.data.data;
        } else if (response.data) {
            productData = response.data;
        } else {
            throw new Error('无法解析产品数据格式');
        }

        let dataToAdapt: ProductApiData[] = Array.isArray(productData) ? productData : [productData];

        dataToAdapt = dataToAdapt.map(item => {
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
                ...item
            };

            return mappedItem;
        });

        // @ts-ignore 忽略类型检查
        const adaptedProducts = adaptProducts(dataToAdapt);

        if (adaptedProducts.length === 0) {
            throw new Error('产品数据适配后为空');
        }

        return adaptedProducts[0];
    } catch (error) {
        throw error;
    }
};


// --- Dynamic Metadata Loader Component ---
export default function DynamicMetadataLoader({ productId, fieldId }: DynamicMetadataLoaderProps) {
    const { data: product, error, isLoading } = useSWR<ComponentProduct>(
        productId ? ['product-metadata', productId] : null, // 使用与 ProductMetadataBlot 不同的 key 以避免冲突，或共享 key
        () => fetcher(productId),
        {
            revalidateOnFocus: false, // 按需配置 SWR 选项
            shouldRetryOnError: false,
            dedupingInterval: 30000, // 减少重复请求间隔
        }
    );

    // 获取渲染器
    const renderer = FIELD_RENDERERS[fieldId];

    // 计算显示值
    const displayValue = useMemo(() => {
        if (isLoading) return '加载中...'; // 加载状态
        if (error) return '加载失败'; // 错误状态
        if (!product) return '无数据'; // 未找到产品数据

        const value = product[fieldId as keyof ComponentProduct];

        if (value === undefined || value === null) return '暂无数据'; // 字段值为空

        try {
            // 使用对应的渲染器格式化数据
            return renderer ? renderer(value) : String(value);
        } catch {
            // 如果渲染出错，直接显示原始值
            return String(value);
        }
    }, [product, fieldId, error, isLoading, renderer]);

    // 渲染计算出的值，使用 span 保持内联特性
    return (
        <span className="dynamic-metadata text-sm"> {/* 添加 class 便于样式化 */}
            {displayValue}
        </span>
    );
} 
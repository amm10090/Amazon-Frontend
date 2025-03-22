import useSWR from 'swr';
import { productsApi, userApi } from './api';
import type { Product, Category, PriceHistory, ApiResponse, CJProduct, ListResponse, CategoryStats, ProductStats } from '@/types/api';
import { AxiosResponse } from 'axios';
import { useEffect } from 'react';

// 通用fetcher类型
type Fetcher<T> = (...args: any[]) => Promise<AxiosResponse<ApiResponse<T>>>;

// SWR配置类型
type SWRHookResponse<T> = {
    data?: T;
    isLoading: boolean;
    isError: any;
    mutate?: () => Promise<any>;
};

// 产品列表
export function useProducts(params?: {
    product_type?: 'discount' | 'coupon' | 'all';
    page?: number;
    limit?: number;
    sort_by?: 'price' | 'discount' | 'created' | 'all';
    sort_order?: 'asc' | 'desc';
    min_price?: number;
    max_price?: number;
    min_discount?: number;
    is_prime_only?: boolean;
    product_groups?: string[];
    api_provider?: string;
}): SWRHookResponse<{ items: any[], total: number, page: number, page_size: number }> {
    // 创建一个唯一的key，确保参数变化时会重新获取
    const cacheKey = JSON.stringify(['/products/list', params]);

    const { data, error, isLoading } = useSWR(
        cacheKey,
        () => productsApi.getProducts(params),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            dedupingInterval: 0 // 禁用缓存去重，确保每次参数变化都重新获取
        }
    );

    // 添加额外的日志，帮助调试
    useEffect(() => {
        if (error) {
            console.error('获取产品列表时出错:', error);
        }
        if (data) {
            console.log('API响应数据:', data?.data);
        }
    }, [data, error]);

    return {
        data: data?.data?.data,
        isLoading,
        isError: error,
    };
}

// 产品详情
export function useProduct(id: string): SWRHookResponse<Product> {
    const { data: response, error, isLoading } = useSWR(
        id ? `/products/${id}` : null,
        () => productsApi.getProductById(id),
        {
            revalidateOnFocus: false,
        }
    );

    return {
        data: response?.data?.data,
        isLoading,
        isError: error,
    };
}

// 分类列表
export function useCategories(params?: {
    product_type?: 'discount' | 'coupon';
}): SWRHookResponse<Category[]> {
    const { data: response, error, isLoading } = useSWR(
        ['/categories', params],
        () => productsApi.getCategories(params),
        {
            revalidateOnFocus: false,
        }
    );

    return {
        data: response?.data?.data,
        isLoading,
        isError: error,
    };
}

// 分类统计信息
export function useCategoryStats(params?: {
    product_type?: 'discount' | 'coupon' | 'all';
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}): SWRHookResponse<CategoryStats> & { rawData?: any } {
    // 设置默认参数值
    const defaultParams = {
        page: 1,
        page_size: 50, // 最大分类数量
        sort_by: 'count',
        sort_order: 'desc' as const,
        ...params
    };

    const { data, error, isLoading } = useSWR(
        ['/api/categories/stats', defaultParams],
        () => productsApi.getCategoryStats(defaultParams),
        {
            revalidateOnFocus: false,
            refreshInterval: 300000, // 每5分钟刷新一次
        }
    );

    const defaultData: CategoryStats = {
        browse_nodes: {},
        browse_tree: {},
        bindings: {},
        product_groups: {}
    };

    // 处理API返回的数据
    const processData = (rawData: any): CategoryStats => {
        if (!rawData) {
            return defaultData;
        }

        try {
            // 直接使用API响应中的数据
            const result: CategoryStats = {
                browse_nodes: rawData.browse_nodes || {},
                browse_tree: rawData.browse_tree || {},
                bindings: rawData.bindings || {},
                product_groups: {}
            };

            // 验证和处理product_groups
            if (rawData.product_groups) {
                if (typeof rawData.product_groups === 'object' && !Array.isArray(rawData.product_groups)) {
                    // 确保所有的值都是数字，并且过滤掉count为0的分类
                    result.product_groups = Object.fromEntries(
                        Object.entries(rawData.product_groups)
                            .filter(([_, count]) => Number(count) > 0)
                            .map(([key, value]) => [
                                key,
                                Number(value) || 0
                            ])
                    );
                }
            }

            return result;
        } catch (error) {
            return defaultData;
        }
    };

    const processedData = processData(data?.data);

    return {
        data: processedData,
        rawData: data?.data,
        isLoading,
        isError: error,
    };
}

// 限时特惠
export function useDeals(params?: {
    active?: boolean;
    page?: number;
    limit?: number;
}): SWRHookResponse<Product[]> {
    const { data, error, isLoading } = useSWR(
        ['/products/list', { ...params, min_discount: 50, sort: 'discount', order: 'desc' }],
        () => productsApi.getDeals(params),
        {
            refreshInterval: 60000, // 每分钟刷新一次
        }
    );

    return {
        data: data?.data?.data?.items || [],
        isLoading,
        isError: error,
    };
}

// 价格历史
export function usePriceHistory(productId: string): SWRHookResponse<PriceHistory[]> {
    const { data: response, error, isLoading } = useSWR(
        productId ? `/products/${productId}/price-history` : null,
        () => productsApi.getPriceHistory(productId),
        {
            revalidateOnFocus: false,
        }
    );

    return {
        data: response?.data?.data,
        isLoading,
        isError: error,
    };
}

// 收藏列表
export function useFavorites(): SWRHookResponse<Product[]> & { mutate: () => Promise<any> } {
    const { data: response, error, isLoading, mutate } = useSWR(
        '/user/favorites',
        () => userApi.getFavorites(),
        {
            revalidateOnFocus: true,
        }
    );

    return {
        data: response?.data?.data,
        isLoading,
        isError: error,
        mutate,
    };
}

// CJ产品搜索
export function useCJProducts(params: {
    keyword: string;
    page?: number;
    limit?: number;
}): SWRHookResponse<CJProduct[]> {
    const { data: response, error, isLoading } = useSWR(
        params.keyword ? ['/cj/products/search', params] : null,
        () => productsApi.searchCJProducts(params),
        {
            revalidateOnFocus: false,
        }
    );

    return {
        data: response?.data?.data,
        isLoading,
        isError: error,
    };
}

// CJ产品详情
export function useCJProduct(pid: string): SWRHookResponse<CJProduct> {
    const { data: response, error, isLoading } = useSWR(
        pid ? `/cj/products/${pid}` : null,
        () => productsApi.getCJProductDetails(pid),
        {
            revalidateOnFocus: false,
        }
    );

    return {
        data: response?.data?.data,
        isLoading,
        isError: error,
    };
}

// 商品统计信息
export function useProductStats(productType?: 'discount' | 'coupon'): SWRHookResponse<ProductStats> {
    const { data, error, isLoading } = useSWR(
        ['/products/stats', productType],
        () => productsApi.getProductsStats(productType),
        {
            revalidateOnFocus: false,
            refreshInterval: 300000, // 每5分钟刷新一次
        }
    );

    const defaultStats: ProductStats = {
        total_products: 0,
        discount_products: 0,
        coupon_products: 0,
        prime_products: 0,
        avg_discount: 0,
        avg_price: 0,
        min_price: 0,
        max_price: 0
    };

    return {
        data: (data?.data?.data || defaultStats) as ProductStats,
        isLoading,
        isError: error,
    };
} 
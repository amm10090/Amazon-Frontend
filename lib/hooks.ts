import type { AxiosResponse } from 'axios';
import { useEffect } from 'react';
import useSWR from 'swr';

import type { Product, Category, PriceHistory, ApiResponse, CJProduct, CategoryStats, ProductStats, BrandStats, UserItem, ListResponse } from '@/types/api';

import { productsApi, userApi, systemApi } from './api';

// 通用fetcher类型
type _Fetcher<T> = (...args: unknown[]) => Promise<AxiosResponse<ApiResponse<T>>>;

// SWR配置类型
type SWRHookResponse<T> = {
    data?: T;
    isLoading: boolean;
    isError: unknown;
    mutate?: () => Promise<unknown>;
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
    product_groups?: string;
    brands?: string;
    api_provider?: string;
}): SWRHookResponse<{ items: Product[], total: number, page: number, page_size: number }> {
    // 创建一个唯一的key，确保参数变化时会重新获取
    const cacheKey = JSON.stringify(['/products/list', params]);

    const { data, error, isLoading, mutate } = useSWR(
        cacheKey,
        () => productsApi.getProducts(params),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            dedupingInterval: 30000, // 30秒内相同请求不重复获取
            shouldRetryOnError: true,
            errorRetryCount: 3,
            revalidateIfStale: false, // 不自动重新获取旧数据
            focusThrottleInterval: 10000, // 限制焦点重新验证的频率
        }
    );

    // 处理嵌套的API响应结构
    let processedData;

    if (data) {
        // 简化数据处理逻辑，处理多种可能的响应格式
        if (data.data?.data?.items) {
            // 处理双重嵌套 {data: {data: {items: [...]}}}
            processedData = data.data.data;
        } else if (data.data?.items) {
            // 处理单重嵌套 {data: {items: [...]}}
            processedData = data.data;
        } else if ((data as unknown as { items: Product[] }).items) {
            // 处理直接返回 {items: [...]}
            processedData = data;
        } else if (typeof data.data === 'object' && data.data && 'success' in data.data && data.data.success && 'data' in data.data) {
            // 处理 {data: {success: true, data: {items: [...]}}} 格式
            processedData = data.data.data;
        } else {
            // 默认空值
            processedData = { items: [], total: 0, page: 1, page_size: 10 };
        }
    } else {
        // 当无数据时提供默认值
        processedData = { items: [], total: 0, page: 1, page_size: 10 };
    }

    return {
        data: processedData,
        isLoading,
        isError: error,
        mutate,
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
}): SWRHookResponse<CategoryStats> & { rawData?: Record<string, unknown> } {
    // 设置默认参数值
    const defaultParams = {
        page: 1,
        page_size: 50, // 最大分类数量
        sort_by: 'count',
        sort_order: 'desc' as const,
        ...params
    };

    // 创建用于 SWR 的 fetcher 函数，直接使用新的 API 路由
    const fetcher = async (url: string, params: Record<string, unknown>) => {
        // 构建查询参数
        const queryParams = new URLSearchParams();

        // 添加所有查询参数
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, String(value));
            }
        });

        // 发起请求，利用 Next.js 的自动缓存机制
        const response = await fetch(`${url}?${queryParams.toString()}`);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return response.json();
    };

    const { data, error, isLoading } = useSWR(
        ['/api/categories/stats', defaultParams],
        ([url, params]) => fetcher(url, params),
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
    const processData = (rawData: Record<string, unknown>): CategoryStats => {
        if (!rawData) {
            return defaultData;
        }

        try {
            // 直接使用API响应中的数据
            const result: CategoryStats = {
                browse_nodes: (rawData.browse_nodes as CategoryStats['browse_nodes']) || {},
                browse_tree: (rawData.browse_tree as CategoryStats['browse_tree']) || {},
                bindings: (rawData.bindings as CategoryStats['bindings']) || {},
                product_groups: {}
            };

            // 验证和处理product_groups
            if (rawData.product_groups) {
                if (typeof rawData.product_groups === 'object' && !Array.isArray(rawData.product_groups)) {
                    // 确保所有的值都是数字，并且过滤掉count为0的分类
                    result.product_groups = Object.fromEntries(
                        Object.entries(rawData.product_groups as Record<string, number>)
                            .filter(([_, count]) => Number(count) > 0)
                            .map(([key, value]) => [
                                key,
                                Number(value) || 0
                            ])
                    );
                }
            }

            return result;
        } catch {
            return defaultData;
        }
    };

    // 根据API响应结构访问数据
    const apiData = data?.data || data;
    const processedData = processData((apiData as unknown) as Record<string, unknown> || {});

    return {
        data: processedData,
        rawData: (apiData as unknown) as Record<string, unknown>,
        isLoading,
        isError: error,
    };
}

// 限时特惠
export function useDeals(params?: {
    active?: boolean;
    page?: number;
    limit?: number;
    min_discount?: number;
    is_prime_only?: boolean;
}): SWRHookResponse<{ items: Product[], total: number, page: number, page_size: number }> {
    const { data, error, isLoading, mutate } = useSWR(
        ['/products/list', { ...params, min_discount: params?.min_discount || 50, sort_by: 'discount', sort_order: 'desc' }],
        () => productsApi.getDeals(params),
        {
            refreshInterval: 60000, // 每分钟刷新一次
        }
    );

    // 构建默认返回值
    const defaultResult = { items: [], total: 0, page: 1, page_size: 10 };

    // 处理嵌套响应 (使用类型安全的访问方式)
    let responseData;

    if (data?.data?.data) {
        // 深层嵌套，符合 ApiResponse<ListResponse<Product>> 结构
        responseData = data.data.data as ListResponse<Product>;
    } else if (data?.data) {
        // 中层嵌套，直接包含数据
        responseData = data.data as unknown as ListResponse<Product>;
    } else {
        // 默认情况
        responseData = defaultResult;
    }

    return {
        data: {
            items: responseData.items || [],
            total: responseData.total || 0,
            page: responseData.page || 1,
            page_size: responseData.page_size || 10
        },
        isLoading,
        isError: error,
        mutate,
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
export function useFavorites(): SWRHookResponse<Product[]> & { mutate: () => Promise<unknown> } {
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

// 品牌统计信息
export function useBrandStats(params?: {
    product_type?: 'discount' | 'coupon';
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}): SWRHookResponse<BrandStats> & { rawData?: Record<string, unknown> } {
    // 设置默认参数值
    const defaultParams = {
        page: 1,
        page_size: 50, // 最大品牌数量
        sort_by: 'count',
        sort_order: 'desc' as const,
        ...params
    };

    const { data, error, isLoading } = useSWR(
        ['/brands/stats', defaultParams],
        () => productsApi.getBrandStats(defaultParams),
        {
            revalidateOnFocus: false,
            refreshInterval: 300000, // 每5分钟刷新一次
        }
    );

    // 创建默认的品牌统计数据
    const defaultBrandStats: BrandStats = {
        brands: {},
        total_brands: 0,
        pagination: {
            page: 1,
            page_size: 50,
            total_count: 0,
            total_pages: 0
        }
    };

    return {
        data: data?.data || defaultBrandStats,
        rawData: (data?.data as unknown) as Record<string, unknown>,
        isLoading,
        isError: error,
    };
}

// 产品搜索
export function useProductSearch(params: {
    keyword: string;
    page?: number;
    page_size?: number;
    sort_by?: 'relevance' | 'price' | 'discount' | 'created';
    sort_order?: 'asc' | 'desc';
    min_price?: number;
    max_price?: number;
    min_discount?: number;
    is_prime_only?: boolean;
    product_groups?: string;
    brands?: string;
    api_provider?: string;
}): SWRHookResponse<{ items: Product[], total: number, page: number, page_size: number }> {
    // 只有当keyword存在且非空时才执行查询
    const shouldFetch = Boolean(params.keyword && params.keyword.trim());

    // 创建一个唯一的key，确保参数变化时会重新获取
    const cacheKey = shouldFetch ? JSON.stringify(['/search/products', params]) : null;
    const paramsString = JSON.stringify(params);

    const { data, error, isLoading, mutate } = useSWR(
        cacheKey,
        () => productsApi.searchProducts(params),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            dedupingInterval: 0, // 禁用缓存去重，确保每次参数变化都重新获取
            shouldRetryOnError: true,
            errorRetryCount: 3
        }
    );

    // 当参数变化时，主动触发重新获取数据
    useEffect(() => {
        if (shouldFetch) {
            mutate();
        }
    }, [shouldFetch, paramsString, mutate]);

    return {
        data: data?.data?.data,
        isLoading,
        isError: error,
        mutate,
    };
}

// 系统健康状态
export function useHealthStatus(): SWRHookResponse<{
    status: string;
    service: string;
    timestamp: string;
    database: {
        total_products: number;
        discount_products: number;
        coupon_products: number;
        prime_products: number;
        last_update: string;
    }
}> {
    const { data: response, error, isLoading } = useSWR(
        '/health',
        () => systemApi.getHealthStatus(),
        {
            refreshInterval: 60000, // 每分钟刷新一次
            revalidateOnFocus: false,
        }
    );

    // 使用类型断言处理响应数据
    const healthData = response?.data?.data ||
        (response?.data && typeof response.data === 'object' && ('status' in response.data || 'database' in response.data)
            ? (response.data as unknown) as {
                status: string;
                service: string;
                timestamp: string;
                database: {
                    total_products: number;
                    discount_products: number;
                    coupon_products: number;
                    prime_products: number;
                    last_update: string;
                }
            }
            : undefined);

    return {
        data: healthData,
        isLoading,
        isError: error,
    };
}

// 用户统计
export function useUserStats(): SWRHookResponse<{
    total_users: number;
    active_users: number;
    new_users_last_month: number;
    last_update: string;
}> {
    const { data: response, error, isLoading } = useSWR(
        '/stats/users',
        () => systemApi.getUserStats(),
        {
            refreshInterval: 60000, // 每分钟刷新一次
            revalidateOnFocus: false,
        }
    );

    // 使用类型断言处理响应数据
    const userData = response?.data?.data ||
        (response?.data && typeof response.data === 'object' && 'total_users' in response.data
            ? (response.data as unknown) as {
                total_users: number;
                active_users: number;
                new_users_last_month: number;
                last_update: string;
            }
            : undefined);

    return {
        data: userData,
        isLoading,
        isError: error,
    };
}

// 收藏统计
export function useFavoriteStats(): SWRHookResponse<{
    total_favorites: number;
    unique_users: number;
    last_month_favorites: number;
    last_update: string;
}> {
    const { data: response, error, isLoading } = useSWR(
        '/stats/favorites',
        () => systemApi.getFavoriteStats(),
        {
            refreshInterval: 60000, // 每分钟刷新一次
            revalidateOnFocus: false,
        }
    );

    // 使用类型断言处理响应数据
    const favoritesData = response?.data?.data ||
        (response?.data && typeof response.data === 'object' && 'total_favorites' in response.data
            ? (response.data as unknown) as {
                total_favorites: number;
                unique_users: number;
                last_month_favorites: number;
                last_update: string;
            }
            : undefined);

    return {
        data: favoritesData,
        isLoading,
        isError: error,
    };
}

// 用户列表
export function useUserList(): SWRHookResponse<UserItem[]> {
    const { data: response, error, isLoading, mutate } = useSWR(
        '/users/list',
        () => fetch('/api/users').then(res => res.json()),
        {
            revalidateOnFocus: false,
            refreshInterval: 30000, // 每30秒刷新一次
        }
    );

    return {
        data: response?.data || [],
        isLoading,
        isError: error,
        mutate,
    };
} 
import useSWR from 'swr';
import { productsApi, userApi } from './api';
import type { Product, Category, PriceHistory, ApiResponse, CJProduct, ListResponse, CategoryStats, ProductStats } from '@/types/api';
import { AxiosResponse } from 'axios';

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
    type?: 'discount' | 'coupon';
    category?: string;
    page?: number;
    limit?: number;
    sort?: 'price' | 'discount' | 'created';
    order?: 'asc' | 'desc';
    min_price?: number;
    max_price?: number;
    min_discount?: number;
    is_prime_only?: boolean;
    product_type?: string;
    browse_node_ids?: string[];
    bindings?: string[];
    product_groups?: string[];
    api_provider?: string;
    min_commission?: number;
}): SWRHookResponse<Product[]> {
    const { data, error, isLoading } = useSWR(
        ['/products/list', params],
        () => productsApi.getProducts(params),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    return {
        data: data?.data?.data?.items || [],
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
    product_type?: 'discount' | 'coupon';
}): SWRHookResponse<CategoryStats> {
    const { data, error, isLoading } = useSWR(
        ['/categories/stats', params],
        () => productsApi.getCategoryStats(params),
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

    return {
        data: (data?.data?.data || defaultData) as CategoryStats,
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
import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';

import type { Product, Category, PriceHistory, ApiResponse, CJProduct, ListResponse, CategoryStats, ProductStats, BrandStats } from '@/types/api';

// API Base URL configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const SERVER_API_URL = process.env.SERVER_API_URL || API_BASE_URL;
const DEFAULT_TIMEOUT = 15000;

// Function to determine if code is running on server or client
const isServer = () => typeof window === 'undefined';

// Create axios instance with dynamic base URL
const createApiClient = (config?: AxiosRequestConfig) => {
    return axios.create({
        baseURL: isServer() ? SERVER_API_URL : '/api',
        timeout: DEFAULT_TIMEOUT,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(process.env.NEXT_PUBLIC_API_KEY && {
                'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
            })
        },
        withCredentials: false,
        ...config
    });
};

const api = createApiClient();

// 请求拦截器
api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// API endpoints
export const productsApi = {
    /**
     * 通过ASIN查询商品详情
     * 使用POST请求，支持更丰富的查询选项
     * @param params - 查询参数
     * @param params.asin - 商品ASIN码
     * @param params.include_metadata - 是否包含原始元数据
     * @param params.include_browse_nodes - 筛选特定的浏览节点ID数组
     * @returns API响应对象，包含商品数据
     */
    queryProduct: (params: {
        asin: string;
        include_metadata?: boolean;
        include_browse_nodes?: string[] | null;
    }) => {
        if (!params.asin) {
            throw new Error('ASIN is required for product query');
        }

        return api.post<ApiResponse<Product>>('/products/query', params);
    },

    // 商品相关
    getProducts: (params?: {
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
    }) => {
        // 将前端参数映射到API参数
        const apiParams: Record<string, unknown> = { ...params };

        // 重命名一些参数以匹配API预期
        if (params?.limit) apiParams.page_size = params.limit;
        if (params?.sort_by) apiParams.sort_by = params.sort_by;
        if (params?.sort_order) apiParams.sort_order = params.sort_order;

        // 移除空的分类和品牌参数
        if (params?.brands === '') delete apiParams.brands;
        if (params?.product_groups === '') delete apiParams.product_groups;

        // 移除不需要的参数
        delete apiParams.limit;

        return api.get<ApiResponse<ListResponse<Product>>>('/products/list', { params: apiParams });
    },

    getProductsStats: (productType?: 'discount' | 'coupon') =>
        api.get<ApiResponse<ProductStats>>('/products/stats', { params: { product_type: productType } }),

    getProductById: (id: string) => api.get<ApiResponse<Product>>(`/products/${id}`),

    getCategories: (params?: {
        product_type?: 'discount' | 'coupon';
    }) => api.get<ApiResponse<Category[]>>('/categories', { params }),

    getCategoryStats: (params?: {
        page?: number;
        page_size?: number;
        sort_by?: string;
        sort_order?: 'asc' | 'desc';
    }) => api.get<ApiResponse<CategoryStats>>('/categories/stats', { params }),

    getBrandStats: (params?: {
        product_type?: 'discount' | 'coupon';
        page?: number;
        page_size?: number;
        sort_by?: string;
        sort_order?: 'asc' | 'desc';
    }) => api.get<BrandStats>('/brands/stats', { params }),

    getDeals: (params?: {
        active?: boolean;
        page?: number;
        limit?: number;
    }) => api.get<ApiResponse<ListResponse<Product>>>('/products/list', {
        params: {
            ...params,
            min_discount: 50,
            sort: 'discount',
            order: 'desc'
        }
    }),

    getPriceHistory: (productId: string, params?: {
        days?: number;
    }) => api.get<ApiResponse<PriceHistory[]>>(`/products/${productId}/price-history`, { params }),

    // CJ平台相关
    searchCJProducts: (params: {
        keyword: string;
        page?: number;
        limit?: number;
    }) => api.get<ApiResponse<CJProduct[]>>('/cj/products/search', { params }),

    getCJProductDetails: (pid: string) => api.get<ApiResponse<CJProduct>>(`/cj/products/${pid}`),

    getCJShippingInfo: (pid: string, params: {
        country: string;
        quantity: number;
    }) => api.get<ApiResponse<{
        shipping_price: number;
        shipping_time: string;
        shipping_method: string;
    }>>(`/cj/products/${pid}/shipping`, { params }),
};

export const userApi = {
    getFavorites: () => api.get<ApiResponse<Product[]>>('/user/favorites'),
    addFavorite: (productId: string) => api.post<ApiResponse<void>>(`/user/favorites/${productId}`),
    removeFavorite: (productId: string) => api.delete<ApiResponse<void>>(`/user/favorites/${productId}`),

    // 用户偏好设置
    getPreferences: () => api.get<ApiResponse<Record<string, unknown>>>('/user/preferences'),
    updatePreferences: (preferences: Record<string, unknown>) => api.put<ApiResponse<void>>('/user/preferences', preferences),
};

export default api; 
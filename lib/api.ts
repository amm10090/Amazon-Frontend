import axios, { AxiosError } from 'axios';
import type { Product, Category, PriceHistory, ApiResponse, CJProduct, ListResponse, CategoryStats, ProductStats } from '@/types/api';

const DEFAULT_API_URL = '/api';
const DEFAULT_TIMEOUT = 15000;

const api = axios.create({
    baseURL: '/api',
    timeout: DEFAULT_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(process.env.NEXT_PUBLIC_API_KEY && {
            'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
        })
    },
    withCredentials: false
});

// 请求拦截器
api.interceptors.request.use(
    (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params || {});
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 405 || error.response?.status === 403) {
            console.error('CORS错误:', {
                status: error.response?.status,
                headers: error.response?.headers,
                url: error.config?.url
            });
        }
        return Promise.reject(error);
    }
);

// API endpoints
export const productsApi = {
    // 商品相关
    getProducts: (params?: {
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
    }) => api.get<ApiResponse<ListResponse<Product>>>('/products/list', { params }),

    getProductsStats: (productType?: 'discount' | 'coupon') =>
        api.get<ApiResponse<ProductStats>>('/products/stats', { params: { product_type: productType } }),

    getProductById: (id: string) => api.get<ApiResponse<Product>>(`/products/${id}`),

    getCategories: (params?: {
        product_type?: 'discount' | 'coupon';
    }) => api.get<ApiResponse<Category[]>>('/categories', { params }),

    getCategoryStats: (params?: {
        product_type?: 'discount' | 'coupon';
        page?: number;
        page_size?: number;
        sort_by?: string;
        sort_order?: 'asc' | 'desc';
    }) => api.get<ApiResponse<CategoryStats>>('/categories/stats', { params }),

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
    getPreferences: () => api.get<ApiResponse<{ [key: string]: any }>>('/user/preferences'),
    updatePreferences: (preferences: { [key: string]: any }) => api.put<ApiResponse<void>>('/user/preferences', preferences),
};

export default api; 
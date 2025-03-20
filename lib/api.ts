import axios, { AxiosError } from 'axios';
import type { Product, Category, PriceHistory, ApiResponse, CJProduct } from '@/types/api';

const DEFAULT_API_URL = '/api';
const DEFAULT_TIMEOUT = 10000;

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL,
    timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || DEFAULT_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // 如果有API密钥，也应该从环境变量中获取
        ...(process.env.NEXT_PUBLIC_API_KEY && {
            'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
        })
    }
});

// 响应拦截器
api.interceptors.response.use(
    (response) => response.data,
    (error: AxiosError) => {
        // 处理CORS错误
        if (error.response?.status === 405 || error.response?.status === 403) {
            console.error('API Access Error:', {
                status: error.response?.status,
                url: error.config?.url,
                method: error.config?.method
            });
        }

        console.error('API Error:', {
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
            url: error.config?.url,
            method: error.config?.method
        });
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
    }) => api.get<ApiResponse<Product[]>>('/products/list', { params }),

    getProductsStats: (productType?: 'discount' | 'coupon') =>
        api.get<ApiResponse<{
            total_products: number;
            discount_products: number;
            coupon_products: number;
            prime_products: number;
            avg_discount: number;
            avg_price: number;
            min_price: number;
            max_price: number;
        }>>('/products/stats', { params: { product_type: productType } }),

    getProductById: (id: string) => api.get<ApiResponse<Product>>(`/products/${id}`),

    getCategories: (params?: {
        product_type?: 'discount' | 'coupon';
    }) => api.get<ApiResponse<Category[]>>('/categories', { params }),

    getCategoryStats: (params?: {
        product_type?: 'discount' | 'coupon';
    }) => api.get<ApiResponse<{
        browse_nodes: { [key: string]: { [key: string]: any } };
        browse_tree: { [key: string]: any };
        bindings: { [key: string]: number };
        product_groups: { [key: string]: number };
    }>>('/categories/stats', { params }),

    getDeals: (params?: {
        active?: boolean;
        page?: number;
        limit?: number;
    }) => api.get<ApiResponse<Product[]>>('/products/list', {
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
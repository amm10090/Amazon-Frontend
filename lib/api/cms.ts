import axios from 'axios';

import type { ApiResponse } from '@/types/api';
import type {
    ContentPage,
    ContentPageListResponse,
    ContentPageCreateRequest,
    ContentPageUpdateRequest,
    ContentCategory,
    ContentCategoryListResponse,
    ContentCategoryCreateRequest,
    ContentCategoryUpdateRequest,
    ContentTag,
    ContentTagListResponse,
    ContentTagCreateRequest,
    ContentTagUpdateRequest,
    ProductSelectionResponse,
    PageResponse
} from '@/types/cms';

// 服务器端环境下的BASE URL
// 忽略环境变量中的SERVER_API_URL，强制使用本地URL
const SERVER_API_URL = 'api';
const isServer = () => typeof window === 'undefined';

// 为服务器端和客户端创建单独的API客户端
const apiClient = axios.create({
    baseURL: isServer() ? SERVER_API_URL : '/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// 添加请求拦截器，确保始终使用本地URL
apiClient.interceptors.request.use((config) => {
    // 调试信息

    // 强制使用本地URL
    if (isServer()) {
        // 总是使用本地URL
        config.baseURL = '/api';
    }

    return config;
}, (error) => {

    return Promise.reject(error);
});

// 从主API模块导出CMS相关API
export const cmsApi = {
    // 内容页面相关
    getPages: (params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: 'draft' | 'published' | 'archived';
        category?: string;
        tag?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) => apiClient.get<ApiResponse<ContentPageListResponse>>('/cms/pages', { params }),

    getPageById: (id: string) =>
        apiClient.get<ApiResponse<PageResponse>>(`/cms/pages/${id}`),

    getPageBySlug: (slug: string) =>
        apiClient.get<ApiResponse<ContentPage>>(`/cms/content/${slug}`),

    createPage: (page: ContentPageCreateRequest) =>
        apiClient.post<ApiResponse<ContentPage>>('/cms/pages', page),

    updatePage: (id: string, page: ContentPageUpdateRequest) =>
        apiClient.put<ApiResponse<ContentPage>>(`/cms/pages/${id}`, page),

    deletePage: (id: string) =>
        apiClient.delete<ApiResponse<void>>(`/cms/pages/${id}`),

    // 内容分类相关
    getCategories: (params?: {
        page?: number;
        limit?: number;
        search?: string;
        parentId?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) => apiClient.get<ApiResponse<ContentCategoryListResponse>>('/cms/categories', { params }),

    getCategoryById: (id: string) =>
        apiClient.get<ApiResponse<ContentCategory>>(`/cms/categories/${id}`),

    getCategoryBySlug: (slug: string) =>
        apiClient.get<ApiResponse<ContentCategory>>(`/cms/categories/slug/${slug}`),

    createCategory: (category: ContentCategoryCreateRequest) =>
        apiClient.post<ApiResponse<ContentCategory>>('/cms/categories', category),

    updateCategory: (id: string, category: ContentCategoryUpdateRequest) =>
        apiClient.put<ApiResponse<ContentCategory>>(`/cms/categories/${id}`, category),

    deleteCategory: (id: string) =>
        apiClient.delete<ApiResponse<void>>(`/cms/categories/${id}`),

    // 内容标签相关
    getTags: (params?: {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) => apiClient.get<ApiResponse<ContentTagListResponse>>('/cms/tags', { params }),

    getTagById: (id: string) =>
        apiClient.get<ApiResponse<ContentTag>>(`/cms/tags/${id}`),

    getTagBySlug: (slug: string) =>
        apiClient.get<ApiResponse<ContentTag>>(`/cms/tags/slug/${slug}`),

    createTag: (tag: ContentTagCreateRequest) =>
        apiClient.post<ApiResponse<ContentTag>>('/cms/tags', tag),

    updateTag: (id: string, tag: ContentTagUpdateRequest) =>
        apiClient.put<ApiResponse<ContentTag>>(`/cms/tags/${id}`, tag),

    deleteTag: (id: string) =>
        apiClient.delete<ApiResponse<void>>(`/cms/tags/${id}`),

    // 产品选择相关
    getProductsForSelection: (params?: {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) => apiClient.get<ApiResponse<ProductSelectionResponse>>('/cms/products', { params }),
};

export default cmsApi; 
import api from '@/lib/api';
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
    }) => api.get<ApiResponse<ContentPageListResponse>>('/cms/pages', { params }),

    getPageById: (id: string) =>
        api.get<ApiResponse<PageResponse>>(`/cms/pages/${id}`),

    getPageBySlug: (slug: string) =>
        api.get<ApiResponse<ContentPage>>(`/cms/content/${slug}`),

    createPage: (page: ContentPageCreateRequest) =>
        api.post<ApiResponse<ContentPage>>('/cms/pages', page),

    updatePage: (id: string, page: ContentPageUpdateRequest) =>
        api.put<ApiResponse<ContentPage>>(`/cms/pages/${id}`, page),

    deletePage: (id: string) =>
        api.delete<ApiResponse<void>>(`/cms/pages/${id}`),

    // 内容分类相关
    getCategories: (params?: {
        page?: number;
        limit?: number;
        search?: string;
        parentId?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) => api.get<ApiResponse<ContentCategoryListResponse>>('/cms/categories', { params }),

    getCategoryById: (id: string) =>
        api.get<ApiResponse<ContentCategory>>(`/cms/categories/${id}`),

    getCategoryBySlug: (slug: string) =>
        api.get<ApiResponse<ContentCategory>>(`/cms/categories/slug/${slug}`),

    createCategory: (category: ContentCategoryCreateRequest) =>
        api.post<ApiResponse<ContentCategory>>('/cms/categories', category),

    updateCategory: (id: string, category: ContentCategoryUpdateRequest) =>
        api.put<ApiResponse<ContentCategory>>(`/cms/categories/${id}`, category),

    deleteCategory: (id: string) =>
        api.delete<ApiResponse<void>>(`/cms/categories/${id}`),

    // 内容标签相关
    getTags: (params?: {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) => api.get<ApiResponse<ContentTagListResponse>>('/cms/tags', { params }),

    getTagById: (id: string) =>
        api.get<ApiResponse<ContentTag>>(`/cms/tags/${id}`),

    getTagBySlug: (slug: string) =>
        api.get<ApiResponse<ContentTag>>(`/cms/tags/slug/${slug}`),

    createTag: (tag: ContentTagCreateRequest) =>
        api.post<ApiResponse<ContentTag>>('/cms/tags', tag),

    updateTag: (id: string, tag: ContentTagUpdateRequest) =>
        api.put<ApiResponse<ContentTag>>(`/cms/tags/${id}`, tag),

    deleteTag: (id: string) =>
        api.delete<ApiResponse<void>>(`/cms/tags/${id}`),

    // 产品选择相关
    getProductsForSelection: (params?: {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) => api.get<ApiResponse<ProductSelectionResponse>>('/cms/products', { params }),
};

export default cmsApi; 
/**
 * CMS内容页面模型
 */
export interface ContentPage {
    _id?: string;
    title: string;          // 页面标题，用于H1和SEO
    slug: string;           // SEO友好的URL路径
    content: string;        // 富文本HTML内容
    excerpt?: string;       // 内容摘要，用于SEO描述
    featuredImage?: string; // 特色图片URL
    categories: string[];   // 分类列表
    tags: string[];         // 标签列表
    author: string;         // 作者ID
    status: 'draft' | 'published' | 'archived'; // 页面状态
    publishedAt?: Date;     // 发布日期
    createdAt: Date;        // 创建日期
    updatedAt: Date;        // 更新日期
    metaTitle?: string;     // SEO标题，优先于title
    metaDescription?: string; // SEO描述，优先于excerpt
    metaKeywords?: string;  // SEO关键词，逗号分隔
    canonicalUrl?: string;  // 规范URL
    ogImage?: string;       // Open Graph图片URL
    seoData?: {             // 旧版SEO相关数据（保留向后兼容）
        metaTitle?: string;
        metaDescription?: string;
        canonicalUrl?: string;
        ogImage?: string;
    };
    productIds?: string[];  // 关联的产品ID列表
}

/**
 * 内容分类模型
 */
export interface ContentCategory {
    _id?: string;
    name: string;           // 分类名称
    slug: string;           // SEO友好的URL路径
    description?: string;   // 分类描述
    parentId?: string;      // 父分类ID，用于层级结构
    createdAt: Date;
    updatedAt: Date;
}

/**
 * 内容标签模型
 */
export interface ContentTag {
    _id?: string;
    name: string;           // 标签名称
    slug: string;           // SEO友好的URL路径
    createdAt: Date;
    updatedAt: Date;
}

/**
 * 内容页面列表响应
 */
export interface ContentPageListResponse {
    pages: ContentPage[];
    totalPages: number;
    currentPage: number;
    totalItems: number;
}

/**
 * 内容分类列表响应
 */
export interface ContentCategoryListResponse {
    categories: ContentCategory[];
    totalPages: number;
    currentPage: number;
    totalItems: number;
}

/**
 * 内容标签列表响应
 */
export interface ContentTagListResponse {
    tags: ContentTag[];
    totalPages: number;
    currentPage: number;
    totalItems: number;
}

/**
 * 内容页面创建请求
 */
export type ContentPageCreateRequest = Omit<ContentPage, '_id' | 'createdAt' | 'updatedAt'>;

/**
 * 内容页面更新请求
 */
export type ContentPageUpdateRequest = Partial<Omit<ContentPage, '_id' | 'createdAt' | 'updatedAt'>>;

/**
 * 内容分类创建请求
 */
export type ContentCategoryCreateRequest = Omit<ContentCategory, '_id' | 'createdAt' | 'updatedAt'>;

/**
 * 内容分类更新请求
 */
export type ContentCategoryUpdateRequest = Partial<Omit<ContentCategory, '_id' | 'createdAt' | 'updatedAt'>>;

/**
 * 内容标签创建请求
 */
export type ContentTagCreateRequest = Omit<ContentTag, '_id' | 'createdAt' | 'updatedAt'>;

/**
 * 内容标签更新请求
 */
export type ContentTagUpdateRequest = Partial<Omit<ContentTag, '_id' | 'createdAt' | 'updatedAt'>>;

/**
 * 产品选择的响应
 */
export interface ProductSelectionResponse {
    products: Array<{
        id: string;
        asin?: string;
        title: string;
        image?: string;
        price?: number;
        rating?: number;
    }>;
    totalPages: number;
    currentPage: number;
    totalItems: number;
} 
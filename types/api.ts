/**
 * 通用API响应类型
 */
export interface ApiResponse<T = unknown> {
    status: number;
    success: boolean;
    message?: string;
    data?: T;
}

/**
 * 分页响应参数
 */
export interface PaginationResponse {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

// FastAPI分页响应类型
export interface ListResponse<T> {
    items: T[];
    total: number;
    page: number;
    page_size: number;
}

// Amazon产品优惠信息
export interface ProductOffer {
    condition: string;
    price: number;
    currency: string;
    savings?: number | null;
    savings_percentage?: number | null;
    is_prime?: boolean;
    is_amazon_fulfilled?: boolean;
    is_free_shipping_eligible?: boolean;
    availability?: string;
    merchant_name?: string;
    is_buybox_winner?: boolean;
    deal_type?: string | null;
    coupon_type?: string | null;
    coupon_value?: number | null;
    coupon_history?: Record<string, unknown> | null;
    commission?: Record<string, unknown> | null;
}

// 浏览节点类型
export interface BrowseNode {
    id: string;
    name: string;
    is_root: boolean;
}

// 商品相关类型
export interface Product {
    asin?: string;
    id?: string;
    title: string;
    description?: string;
    features?: string[];
    brand?: string;
    price?: number;
    original_price?: number;
    discount_rate?: number;
    rating?: number;
    rating_count?: number;
    reviews?: number;
    main_image?: string;
    image_url?: string;
    images?: string[];
    product_group?: string;
    binding?: string;
    categories?: string[];
    rank?: number;
    availability?: string;
    url?: string;
    cj_url?: string | null;
    offers?: ProductOffer[];
    browse_nodes?: BrowseNode[];
    timestamp?: string;
    coupon_info?: Record<string, unknown>;
    api_provider?: string;
    coupon_expiration_date?: string;
    coupon_terms?: string;
    source?: string;
}

export interface ComponentProduct {
    id: string;
    title: string;
    description: string;
    price: number;
    originalPrice: number;
    discount: number;
    image: string;
    category: string;
    brand: string;
    rating: number;
    reviews: number;
    url: string;
    cj_url: string | null;
    isPrime: boolean;
    isFreeShipping: boolean;
    isAmazonFulfilled: boolean;
    availability: string;
    couponValue: number;
    couponType: string | null;
    apiProvider: string;
}

export interface PriceHistory {
    date: string;
    price: number;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
}

// CJ平台相关类型
export interface CJProduct extends Omit<Product, 'id' | 'type'> {
    pid: string;
    shipping_price: number;
}

// 分类统计接口
export interface CategoryStats {
    browse_nodes: {
        [key: string]: {
            name?: string;
            count?: number;
            products?: number;
            children?: { [key: string]: string };
            parent?: string;
            [key: string]: unknown;
        }
    };
    browse_tree: Record<string, unknown>;
    bindings: { [key: string]: number };
    product_groups: { [key: string]: number };
    total_categories?: number;
}

// 产品统计接口
export interface ProductStats {
    total_products: number;
    discount_products: number;
    coupon_products: number;
    prime_products: number;
    avg_discount: number;
    avg_price: number;
    min_price: number;
    max_price: number;
}

// 品牌统计接口
export interface BrandStats {
    brands: { [brand: string]: number };
    total_brands: number;
    pagination: {
        page: number;
        page_size: number;
        total_count: number;
        total_pages: number;
    };
}

import type { UserRole } from '@/lib/models/UserRole';

/**
 * 用户项的接口定义
 */
export interface UserItem {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    image?: string;
    createdAt: string | Date;
    updatedAt?: string | Date;
    lastLogin?: string | Date;
    provider?: string;
    status?: 'active' | 'inactive' | 'disabled';
}

/**
 * 产品项的接口定义
 */
export interface ProductItem {
    id: string;
    name: string;
    description?: string;
    sku?: string;
    price?: number;
    stockQuantity?: number;
    image?: string;
    status?: 'active' | 'draft' | 'inactive';
    categories?: string[];
    createdAt: string | Date;
    updatedAt?: string | Date;
    createdBy?: string;
    featured?: boolean;
    discount?: number;
}

/**
 * 邮箱订阅项接口定义
 */
export interface EmailItem {
    id: string;
    email: string;
    subscribedAt: string;
    isActive: boolean;
}

/**
 * 联系表单留言接口定义
 */
export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    message: string;
    subject?: string;
    phone?: string;
    createdAt: string;
    isProcessed: boolean;
    processedAt?: string;
    notes?: string;
    formSource?: 'general' | 'blog' | string;
    formId?: string;
}

// 社交媒体链接配置
export interface SocialLinks {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    pinterest?: string;
    youtube?: string;
    linkedin?: string;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * 手动添加商品的请求体结构
 * 基于 /api/products/manual API 文档
 * 注意: 复用了已有的 ProductOffer 接口定义
 */
export interface ProductInfo {
    asin: string; // 商品的唯一 ASIN (必需)
    title: string; // 商品标题 (必需)
    url: string; // 商品的亚马逊链接 (必需)
    offers: ProductOffer[]; // 包含至少一个 ProductOffer 对象的数组 (必需)
    brand?: string; // 品牌名称 (可选)
    main_image?: string; // 主图链接 (可选)
    timestamp?: string; // 数据采集的时间戳 (ISO 8601 格式) (可选)
    binding?: string; // 商品绑定类型 (可选)
    product_group?: string; // 商品分组 (可选)
    categories?: string[]; // 商品分类路径列表 (字符串数组) (可选)
    browse_nodes?: Array<{ id: string; name: string;[key: string]: unknown }>; // 亚马逊浏览节点信息列表 (可选)
    features?: string[]; // 商品特性列表 (字符串数组) (可选)
    cj_url?: string; // CJ 推广链接 (可选)
    api_provider?: string; // API 提供者标识 (默认为 "manual") (可选)
    source?: string; // 数据来源标识 (默认为 "manual") (可选)
    coupon_expiration_date?: string; // 优惠券过期日期 (ISO 8601 格式) (可选)
    coupon_terms?: string; // 优惠券使用条款 (可选)
    raw_data?: Record<string, unknown>; // 包含原始数据的 JSON 对象 (可选)
} 
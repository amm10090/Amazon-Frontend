// API响应类型
export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
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
} 
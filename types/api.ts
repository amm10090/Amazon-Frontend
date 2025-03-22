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

// 商品相关类型
export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    original_price: number;
    discount_rate: number;
    image_url: string;
    product_url: string;
    category: string;
    type: 'discount' | 'coupon';
    created_at: string;
    updated_at: string;
    end_time?: string;        // 可选的结束时间
    remaining_quantity?: number;  // 可选的剩余数量
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
            [key: string]: any
        }
    };
    browse_tree: { [key: string]: any };
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
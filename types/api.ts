// API响应类型
export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
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
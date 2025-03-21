import { Product } from '@/types/api';

/**
 * 格式化价格
 * @param price 价格数值
 * @returns 格式化后的价格字符串
 */
export function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(price);
}

/**
 * 计算折扣百分比
 * @param originalPrice 原价
 * @param currentPrice 现价
 * @returns 折扣百分比
 */
export function calculateDiscount(originalPrice: number, currentPrice: number): number {
    if (originalPrice <= 0 || currentPrice >= originalPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

/**
 * 截断文本
 * @param text 原文本
 * @param maxLength 最大长度
 * @returns 截断后的文本
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

/**
 * 格式化日期
 * @param date 日期对象或时间戳
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | number): string {
    return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(typeof date === 'number' ? new Date(date) : date);
}

/**
 * 生成随机ID
 * @param length ID长度
 * @returns 随机ID字符串
 */
export function generateId(length: number = 8): string {
    return Math.random().toString(36).substring(2, length + 2);
}

/**
 * 防抖函数
 * @param func 要执行的函数
 * @param wait 等待时间
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 节流函数
 * @param func 要执行的函数
 * @param limit 时间限制
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * 适配API产品数据为前端组件格式
 * @param product API返回的产品数据
 * @returns 适配后的产品数据
 */
export function adaptProductData(product: Product) {
    return {
        id: product.id,
        title: product.title,
        image_url: product.image_url || "",
        current_price: product.price,
        original_price: product.original_price || product.price,
        discount_rate: product.discount_rate,
        prime_eligible: false, // API暂无此字段，默认为false
        product_url: product.product_url || "",
        description: product.description || "",
        category: product.category || "",
        type: product.type || "discount",
        created_at: product.created_at || "",
        updated_at: product.updated_at || "",
        end_time: product.end_time || undefined,
        remaining_quantity: product.remaining_quantity || undefined
    };
} 
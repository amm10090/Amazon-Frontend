import axios from 'axios';
import type { MetadataRoute } from 'next';

// 产品类型定义
interface Product {
    id: string;
    title: string;
    price: number;
    originalPrice: number;
    discount: number;
    image: string;
    category: string;
    slug?: string;
    asin?: string;
    updatedAt?: string;
    createdAt?: string;
}

// API响应类型
interface ApiResponse<T> {
    items: T[];
    total: number;
    page: number;
    page_size: number;
}

// 获取产品数据函数
async function getProducts(): Promise<Product[]> {
    try {
        // 从API获取产品，每页获取100个产品
        const apiUrl = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/mock-api';
        const response = await axios.get<ApiResponse<Product>>(`${apiUrl}/products/list`, {
            params: {
                page: 1,
                page_size: 100, // 获取足够多的产品以包含在sitemap中
                sort_by: 'created',
                sort_order: 'desc'
            }
        });

        return response.data.items || [];
    } catch {

        return []; // 出错时返回空数组
    }
}

// 网站地图生成函数
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 获取动态路由数据
    const products = await getProducts();

    // 当前日期作为静态页面的最后修改日期
    const currentDate = new Date().toISOString();

    // 静态路由列表
    const staticRoutes = [
        '',
        '/about-us',
        '/contact-us',
        '/terms-of-use',
        '/privacy-policy',
        '/cookies-policy',
        '/disclaimer',
        '/affiliate-disclosure',
        '/deals',
        '/favorites',
        '/categories',
    ].map(route => ({
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.oohunt.com'}${route}`,
        lastModified: currentDate,
        changeFrequency: 'monthly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // 产品页面路由
    const productRoutes = products.map(product => ({
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.oohunt.com'}/product/${product.asin || product.id}`,
        lastModified: product.updatedAt || product.createdAt || currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // 合并所有路由
    return [...staticRoutes, ...productRoutes];
} 
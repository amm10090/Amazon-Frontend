import axios from 'axios';
import { NextResponse } from 'next/server';

import type { Product } from '@/types/api';

// 配置路由段缓存，缓存整个路由处理程序2分钟
export const revalidate = 120;

// API Base URL配置
const API_BASE_URL = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function GET(request: Request) {
    try {
        // 获取查询参数
        const { searchParams } = new URL(request.url);

        // 记录请求开始时间
        const requestStartTime = Date.now();
        const now = new Date();

        // 计算缓存过期时间
        const expiresAt = new Date(now.getTime() + revalidate * 1000);

        // 从URL查询字符串构建API参数
        const apiParams: Record<string, unknown> = {};

        // 处理所有查询参数，转换为正确的类型
        searchParams.forEach((value, key) => {
            // 数值型参数转换
            if (['page', 'page_size', 'min_price', 'max_price', 'min_discount'].includes(key)) {
                const numValue = Number(value);

                if (!isNaN(numValue)) {
                    apiParams[key] = numValue;
                }
            }
            // 布尔型参数转换
            else if (key === 'is_prime_only') {
                apiParams[key] = value === 'true';
            }
            // 保留字符串参数
            else {
                apiParams[key] = value;
            }
        });

        // 如果URL中有limit参数，将其映射为page_size
        if (searchParams.has('limit')) {
            apiParams.page_size = Number(searchParams.get('limit'));
            delete apiParams.limit;
        }

        // 为提高缓存命中率，移除空的参数
        Object.keys(apiParams).forEach(key => {
            if (apiParams[key] === '' || apiParams[key] === undefined || apiParams[key] === null) {
                delete apiParams[key];
            }
        });

        // 直接使用axios请求外部API，避免递归调用自身
        const response = await axios.get(`${API_BASE_URL}/products/list`, {
            params: apiParams,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(process.env.NEXT_PUBLIC_API_KEY && {
                    'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
                })
            }
        });

        // 获取产品列表数据
        let products: Product[] = [];
        let total = 0;
        let page = 1;
        let page_size = 10;

        // 处理响应数据
        if (response.data && response.data.data) {
            products = response.data.data.items || [];
            total = response.data.data.total || 0;
            page = response.data.data.page || 1;
            page_size = response.data.data.page_size || 10;
        } else if (response.data) {
            // 可能有不同的响应结构，尝试直接访问
            products = response.data.items || [];
            total = response.data.total || 0;
            page = response.data.page || 1;
            page_size = response.data.page_size || 10;
        }

        // 计算响应时间（毫秒）
        const responseTime = Date.now() - requestStartTime;

        // 检查是否从缓存返回的响应（通过响应时间判断）
        const isCacheHit = responseTime < 50; // 如果响应时间小于50ms，可能是缓存命中

        // 添加缓存相关的头信息，增强可观察性
        const cacheHeaders = {
            'X-Cache-Config': 'enabled',
            'X-Cache-Revalidate': `${revalidate}`,
            'X-Cache-Revalidate-Unit': 'seconds',
            'X-Cache-Max-Age': `${revalidate}`,
            'X-Cache-Expires': expiresAt.toISOString(),
            'X-Cache-Generated': now.toISOString(),
            'X-Cache-Source': isCacheHit ? 'cache-hit' : 'generated',
            'X-Response-Time': `${responseTime}ms`,
            'Cache-Control': `public, max-age=${revalidate}, stale-while-revalidate=${revalidate * 2}`
        };

        // 返回带有缓存头信息的响应
        return NextResponse.json(
            {
                success: true,
                data: {
                    items: products,
                    total,
                    page,
                    page_size
                },
                meta: {
                    cached: isCacheHit,
                    expires: expiresAt.toISOString(),
                    responseTime
                }
            },
            {
                status: 200,
                headers: cacheHeaders
            }
        );
    } catch {

        // 错误情况下也添加缓存头信息，但缓存时间较短
        const errorCacheTime = Math.floor(revalidate / 4); // 错误情况下缓存时间缩短为正常的1/4

        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch products",
                data: {
                    items: [],
                    total: 0,
                    page: 1,
                    page_size: 10
                }
            },
            {
                status: 500,
                headers: {
                    'X-Cache-Error': 'true',
                    'X-Cache-Config': 'enabled',
                    'X-Cache-Revalidate': `${errorCacheTime}`,
                    'Cache-Control': `public, max-age=${errorCacheTime}, stale-while-revalidate=${revalidate}`
                }
            }
        );
    }
} 
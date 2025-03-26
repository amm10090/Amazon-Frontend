import { NextResponse } from 'next/server';

import type { CategoryStats } from '@/types/api';

// 配置路由段缓存，缓存整个路由处理程序6小时
export const revalidate = 21600;

// API Base URL configuration
const API_BASE_URL = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function GET(request: Request) {
    try {
        // 获取查询参数
        const { searchParams } = new URL(request.url);
        const page = searchParams.get('page') || '1';
        const pageSize = searchParams.get('page_size') || '50';
        const sortBy = searchParams.get('sort_by') || 'count';
        const sortOrder = searchParams.get('sort_order') || 'desc';
        const productType = searchParams.get('product_type') || 'all';

        // 构建查询参数
        const queryParams = new URLSearchParams({
            page,
            page_size: pageSize,
            sort_by: sortBy,
            sort_order: sortOrder,
            ...(productType !== 'all' && { product_type: productType })
        });

        // 构建API URL
        const apiUrl = `${API_BASE_URL}/categories/stats?${queryParams.toString()}`;

        // 使用 fetch 请求数据，并启用缓存
        const response = await fetch(apiUrl, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(process.env.NEXT_PUBLIC_API_KEY && {
                    'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
                })
            },
            // 设置缓存策略 - 缓存数据6小时
            next: {
                revalidate: 21600
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch category stats: ${response.status}`);
        }

        const data = await response.json();

        // 计算缓存相关的时间
        const now = new Date();
        const expiresAt = new Date(now.getTime() + revalidate * 1000);

        // 设置缓存头信息
        const cacheHeaders = {
            'X-Cache-Config': 'enabled',
            'X-Cache-Revalidate': `${revalidate}`,
            'X-Cache-Revalidate-Unit': 'seconds',
            'X-Cache-Max-Age': `${revalidate}`,
            'X-Cache-Expires': expiresAt.toISOString(),
            'X-Cache-Generated': now.toISOString()
        };

        // 使用 NextResponse 返回数据并添加缓存头信息
        return NextResponse.json(data, {
            headers: cacheHeaders
        });
    } catch {

        // 返回默认的空数据结构
        const defaultData: CategoryStats = {
            browse_nodes: {},
            browse_tree: {},
            bindings: {},
            product_groups: {}
        };

        // 计算缓存相关的时间，即使是错误响应也添加缓存头
        const now = new Date();
        const expiresAt = new Date(now.getTime() + revalidate * 1000);

        // 设置缓存头信息
        const cacheHeaders = {
            'X-Cache-Config': 'enabled',
            'X-Cache-Revalidate': `${revalidate}`,
            'X-Cache-Revalidate-Unit': 'seconds',
            'X-Cache-Max-Age': `${revalidate}`,
            'X-Cache-Expires': expiresAt.toISOString(),
            'X-Cache-Generated': now.toISOString(),
            'X-Cache-Error': 'true'
        };

        return NextResponse.json(
            {
                success: false,
                data: defaultData,
            },
            {
                status: 500,
                headers: cacheHeaders
            }
        );
    }
} 
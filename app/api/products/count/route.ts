import { NextResponse } from 'next/server';

// 设置1小时的缓存时间
export const revalidate = 3600;

// API Base URL配置
const API_BASE_URL = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const productGroups = searchParams.get('product_groups');

        // 构建缓存key
        const cacheKey = `products-count-${productGroups || 'all'}`;

        // 构建API请求参数
        const params = new URLSearchParams({
            page: '1',
            page_size: '1'
        });

        if (productGroups) {
            params.append('product_groups', productGroups);
        }

        // 发送请求到实际的API
        const response = await fetch(`${API_BASE_URL}/products/list?${params.toString()}`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(process.env.NEXT_PUBLIC_API_KEY && {
                    'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
                })
            },
            next: {
                revalidate: revalidate,
                tags: [cacheKey]
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        const total = result.data?.total || 0;

        // 设置缓存头
        const now = new Date();
        const expiresAt = new Date(now.getTime() + revalidate * 1000);

        return NextResponse.json(
            {
                success: true,
                data: { total },
                meta: {
                    cached: true,
                    expires: expiresAt.toISOString()
                }
            },
            {
                headers: {
                    'Cache-Control': `public, max-age=${revalidate}, stale-while-revalidate=${revalidate * 2}`,
                    'X-Cache-Expires': expiresAt.toISOString()
                }
            }
        );
    } catch {
        return NextResponse.json(
            {
                success: false,
                data: { total: 0 },
                error: 'Failed to fetch product count'
            },
            { status: 500 }
        );
    }
} 
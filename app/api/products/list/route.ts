import { NextResponse } from 'next/server';


// 配置路由段缓存，缓存整个路由处理程序10分钟
export const revalidate = 600;

// API Base URL配置
const API_BASE_URL = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/mock-api';

export async function GET(request: Request) {
    try {
        // 获取原始URL的查询参数
        const { searchParams } = new URL(request.url);

        // 创建一个新的URLSearchParams对象，保留所有原始查询参数
        const forwardParams = new URLSearchParams();

        // 处理所有可能的查询参数，从原始请求转发到后端API
        searchParams.forEach((value, key) => {
            forwardParams.append(key, value);
        });

        // 记录请求开始时间，用于计算响应时间
        const requestStartTime = Date.now();
        const now = new Date();

        // 构建API URL，直接转发所有查询参数
        const apiUrl = `${API_BASE_URL}/products/list?${forwardParams.toString()}`;


        // 发送请求到实际的API服务器
        const response = await fetch(apiUrl, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(process.env.NEXT_PUBLIC_API_KEY && {
                    'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
                })
            },
            // 设置缓存策略
            next: {
                revalidate: revalidate
            }
        });

        // 检查响应状态
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        // 解析JSON响应
        const data = await response.json();

        // 计算响应时间
        const responseTime = Date.now() - requestStartTime;

        // 计算缓存相关的时间
        const expiresAt = new Date(now.getTime() + revalidate * 1000);

        // 检查是否从缓存返回的响应
        const isCacheHit = responseTime < 100; // 如果响应时间小于100ms，很可能是缓存命中

        // 设置缓存头信息
        const cacheHeaders = {
            'X-Cache-Config': 'enabled',
            'X-Cache-Revalidate': `${revalidate}`,
            'X-Cache-Expires': expiresAt.toISOString(),
            'X-Cache-Generated': now.toISOString(),
            'X-Cache-Source': isCacheHit ? 'cache-hit' : 'generated',
            'X-Response-Time': `${responseTime}ms`,
            'Cache-Control': `public, max-age=${revalidate}, stale-while-revalidate=${revalidate * 2}`
        };

        // 如果API成功返回结果，那么直接转发
        if (data) {
            // 返回数据和缓存头信息
            return NextResponse.json(
                {
                    success: true,
                    data: data,
                    meta: {
                        cached: isCacheHit,
                        expires: expiresAt.toISOString(),
                        responseTime: responseTime
                    }
                },
                {
                    headers: cacheHeaders
                }
            );
        } else {
            // 如果数据为空，返回空结果集但状态依然是成功
            return NextResponse.json(
                {
                    success: true,
                    data: {
                        items: [],
                        total: 0,
                        page: parseInt(searchParams.get('page') || '1'),
                        page_size: parseInt(searchParams.get('page_size') || '20')
                    },
                    meta: {
                        cached: false,
                        expires: expiresAt.toISOString(),
                        responseTime: responseTime
                    }
                },
                {
                    headers: cacheHeaders
                }
            );
        }
    } catch {

        // 如果发生错误，返回错误响应
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch products. Please try again later.',
                data: {
                    items: [],
                    total: 0,
                    page: 1,
                    page_size: 20
                }
            },
            {
                status: 500,
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                }
            }
        );
    }
} 
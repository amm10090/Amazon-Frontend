import { NextResponse } from 'next/server';

import type { Product } from '@/types/api';

// 扩展Product类型以包含discount字段
interface ProductWithDiscount extends Product {
    discount?: number;
}

// 配置路由段缓存，降低缓存时间以增加变化频率
export const revalidate = 900; // 改为15分钟

// API Base URL configuration
const API_BASE_URL = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// 商品权重配置
const WEIGHT_CONFIG = {
    DISCOUNT_THRESHOLD_HIGH: 30,    // 高折扣阈值
    DISCOUNT_THRESHOLD_MEDIUM: 20,  // 中等折扣阈值
    WEIGHT_HIGH_DISCOUNT: 3,        // 高折扣权重
    WEIGHT_MEDIUM_DISCOUNT: 2,      // 中等折扣权重
    WEIGHT_NORMAL: 1                // 普通商品权重
};

export async function GET(request: Request) {
    try {
        // 获取查询参数
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '4');

        // 使用更细粒度的时间种子（每15分钟更新一次）
        const now = new Date();
        const quarterHour = Math.floor(now.getMinutes() / 15);
        const timeSeed = now.getFullYear() * 1000000 +
            (now.getMonth() + 1) * 10000 +
            now.getDate() * 100 +
            now.getHours() * 4 +
            quarterHour;

        // 记录请求开始时间，用于计算响应时间
        const requestStartTime = Date.now();

        // 增加商品池大小到200个
        const fixedParams = new URLSearchParams({
            limit: '200',            // 显著增加商品池大小
            min_discount: '10',      // 降低初始折扣限制
            product_type: 'all',
            sort_by: 'random',       // 使用随机排序
            sort_order: 'desc'
        });

        // 构建API URL
        const apiUrl = `${API_BASE_URL}/products/list?${fixedParams.toString()}`;

        // 使用 fetch 请求数据，并启用缓存
        const response = await fetch(apiUrl, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(process.env.NEXT_PUBLIC_API_KEY && {
                    'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
                })
            },
            // 设置缓存策略 - 缓存数据30分钟
            next: {
                revalidate: 1800
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch featured products: ${response.status}`);
        }

        const data = await response.json();
        let products: Product[] = [];

        // 处理不同的API响应结构
        if (data?.data?.items && data.data.items.length > 0) {
            products = [...data.data.items];
        } else if (data?.items && data.items.length > 0) {
            products = [...data.items];
        } else {
            // 如果没有结果，尝试更宽松的查询条件
            const fallbackParams = new URLSearchParams({
                limit: '50',          // 仍然请求较大的超集
                min_discount: '10',   // 降低折扣要求
                product_type: 'all',
                sort_by: 'discount',
                sort_order: 'desc'
            });

            const fallbackUrl = `${API_BASE_URL}/products/list?${fallbackParams.toString()}`;
            const fallbackResponse = await fetch(fallbackUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(process.env.NEXT_PUBLIC_API_KEY && {
                        'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
                    })
                },
                next: {
                    revalidate: 1800
                }
            });

            if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json();

                if (fallbackData?.data?.items && fallbackData.data.items.length > 0) {
                    products = [...fallbackData.data.items];
                } else if (fallbackData?.items && fallbackData.items.length > 0) {
                    products = [...fallbackData.items];
                } else {
                    // 如果仍然没有结果，尝试任何产品
                    const anyProductsParams = new URLSearchParams({
                        limit: '50',
                        product_type: 'all',
                        sort_by: 'discount',
                        sort_order: 'desc'
                    });

                    const anyProductsUrl = `${API_BASE_URL}/products/list?${anyProductsParams.toString()}`;
                    const anyProductsResponse = await fetch(anyProductsUrl, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            ...(process.env.NEXT_PUBLIC_API_KEY && {
                                'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
                            })
                        },
                        next: {
                            revalidate: 1800
                        }
                    });

                    if (anyProductsResponse.ok) {
                        const anyProductsData = await anyProductsResponse.json();

                        if (anyProductsData?.data?.items && anyProductsData.data.items.length > 0) {
                            products = [...anyProductsData.data.items];
                        } else if (anyProductsData?.items && anyProductsData.items.length > 0) {
                            products = [...anyProductsData.items];
                        }
                    }
                }
            }
        }

        // 增强的Fisher-Yates洗牌算法，包含权重
        const shuffleWithWeightedSeed = (array: ProductWithDiscount[], seed: number) => {
            const shuffled = [...array];
            let currentSeed = seed;

            // 确定性随机数生成器
            const random = () => {
                const x = Math.sin(currentSeed++) * 10000;

                return x - Math.floor(x);
            };

            // 计算商品权重
            const getProductWeight = (product: ProductWithDiscount) => {
                const discount = product.discount || 0;

                if (discount >= WEIGHT_CONFIG.DISCOUNT_THRESHOLD_HIGH) {
                    return WEIGHT_CONFIG.WEIGHT_HIGH_DISCOUNT;
                } else if (discount >= WEIGHT_CONFIG.DISCOUNT_THRESHOLD_MEDIUM) {
                    return WEIGHT_CONFIG.WEIGHT_MEDIUM_DISCOUNT;
                }

                return WEIGHT_CONFIG.WEIGHT_NORMAL;
            };

            // 带权重的洗牌
            for (let i = shuffled.length - 1; i > 0; i--) {
                const weight1 = getProductWeight(shuffled[i]);
                const j = Math.floor(random() * (i + 1));
                const weight2 = getProductWeight(shuffled[j]);

                // 根据权重决定是否交换
                if (random() * (weight1 + weight2) < weight2) {
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
            }

            return shuffled;
        };

        // 使用增强的洗牌算法
        const shuffledProducts = shuffleWithWeightedSeed(products, timeSeed);

        // 限制返回的商品数量
        const limitedProducts = shuffledProducts.slice(0, limit);

        // 计算响应时间（毫秒）
        const responseTime = Date.now() - requestStartTime;

        // 计算缓存相关的时间
        const expiresAt = new Date(now.getTime() + revalidate * 1000);

        // 检查是否从缓存返回的响应（通过响应时间判断）
        const isCacheHit = responseTime < 100; // 如果响应时间小于100ms，很可能是缓存命中

        // 设置缓存头信息
        const cacheHeaders = {
            'X-Cache-Config': 'enabled',
            'X-Cache-Revalidate': `${revalidate}`,
            'X-Cache-Revalidate-Unit': 'seconds',
            'X-Cache-Max-Age': `${revalidate}`,
            'X-Cache-Expires': expiresAt.toISOString(),
            'X-Cache-Generated': now.toISOString(),
            'X-Cache-Source': isCacheHit ? 'cache-hit' : 'generated',
            'X-Cache-Random-Seed': `${timeSeed}`,
            'X-Response-Time': `${responseTime}ms`,
            'Cache-Control': 'public, max-age=1800, stale-while-revalidate=3600'
        };

        // 返回数据和缓存头信息
        return NextResponse.json(
            {
                success: true,
                data: limitedProducts,
                meta: {
                    seed: timeSeed,
                    cached: isCacheHit,
                    expires: expiresAt.toISOString(),
                    responseTime: responseTime
                }
            },
            {
                headers: cacheHeaders
            }
        );
    } catch {

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
            'X-Cache-Source': 'generated-error',
            'X-Cache-Error': 'true',
            'Cache-Control': 'public, max-age=300, stale-while-revalidate=1800' // 错误情况下缓存时间更短
        };

        return NextResponse.json(
            {
                success: false,
                data: [],
                error: 'Failed to fetch featured products',
                meta: {
                    cached: false,
                    expires: expiresAt.toISOString()
                }
            },
            {
                status: 500,
                headers: cacheHeaders
            }
        );
    }
} 
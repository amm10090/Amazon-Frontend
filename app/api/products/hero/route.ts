import { NextResponse } from 'next/server';

// 定义ProductOffer接口
interface ProductOffer {
    condition?: string;
    price?: number;
    currency?: string;
    savings?: number;
    savings_percentage?: number;
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

// 定义Product接口
interface Product {
    asin: string;
    title: string;
    url: string;
    brand?: string;
    main_image?: string;
    offers?: ProductOffer[];
    timestamp?: string;
    coupon_info?: Record<string, unknown> | null;
    binding?: string;
    product_group?: string;
    categories?: string[];
    browse_nodes?: Array<{ id: string; name: string; is_root: boolean }>;
    features?: string[];
    cj_url?: string | null;
    api_provider?: string;
}

// 配置路由段缓存，缓存整个路由处理程序1分钟
export const revalidate = 60;

// API Base URL configuration
const API_BASE_URL = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function GET(request: Request) {
    try {
        // 获取查询参数
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '3');

        // 计算当前分钟作为随机种子，确保一分钟内结果一致
        const now = new Date();
        const minuteSeed = now.getFullYear() * 10000000 +
            (now.getMonth() + 1) * 100000 +
            now.getDate() * 1000 +
            now.getHours() * 100 +
            now.getMinutes();

        // 记录请求开始时间，用于计算响应时间
        const requestStartTime = Date.now();

        // 随机价格范围 - 对于确定性随机，我们基于当前分钟计算固定的价格范围
        const seedBasedRandom = (seed: number) => {
            const x = Math.sin(seed) * 10000;

            return x - Math.floor(x);
        };

        // 使用种子生成固定的价格范围
        const randomPageBase = seedBasedRandom(minuteSeed) * 50;
        const randomPage = Math.floor(randomPageBase) + 1;

        // 使用固定参数获取一个较大的商品集合
        const fixedParams = new URLSearchParams({
            page: randomPage.toString(),
            page_size: '50',          // 获取足够多的商品以供随机选择
            min_price: '3',
            max_price: '700',
            min_discount: '20',       // 设置折扣阈值
            is_prime_only: 'true',
            product_type: 'all',
            sort_by: 'discount',
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
            // 设置缓存策略 - 缓存数据1分钟
            next: {
                revalidate: 60
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch hero products: ${response.status}`);
        }

        const data = await response.json();
        let products: Product[] = [];

        // 处理不同的API响应结构
        if (data?.data?.items && data.data.items.length > 0) {
            products = [...data.data.items];
        } else if (data?.items && data.items.length > 0) {
            products = [...data.items];
        } else {
            // 如果没有结果，返回空数组
            products = [];
        }

        // 自定义Fisher-Yates洗牌算法，使用基于时间的种子
        const shuffleWithSeed = (array: Product[], seed: number) => {
            const shuffled = [...array];
            let m = shuffled.length, t, i;
            let currentSeed = seed;

            // 使用种子生成确定性随机数
            const random = () => {
                const x = Math.sin(currentSeed++) * 10000;

                return x - Math.floor(x);
            };

            // 洗牌算法
            while (m) {
                i = Math.floor(random() * m--);
                t = shuffled[m];
                shuffled[m] = shuffled[i];
                shuffled[i] = t;
            }

            return shuffled;
        };

        // 使用时间种子进行确定性随机洗牌
        const shuffledProducts = shuffleWithSeed(products, minuteSeed);

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
            'X-Cache-Random-Seed': `${minuteSeed}`,
            'X-Response-Time': `${responseTime}ms`,
            'Cache-Control': `public, max-age=${revalidate}, stale-while-revalidate=${revalidate * 2}`
        };

        // 处理产品数据，转换为促销卡片格式
        const promoCards = limitedProducts.map((product, index) => {
            const offer = product.offers && product.offers.length > 0 ? product.offers[0] : {};
            const isCoupon = offer.coupon_type && offer.coupon_value;

            // 确定折扣文本
            let discountText = '';

            if (isCoupon) {
                // 如果是优惠券类型
                if (offer.coupon_type === 'fixed') {
                    discountText = `$${offer.coupon_value} Coupon`;
                } else {
                    discountText = `${offer.coupon_value}% Coupon`;
                }
            } else if (offer.savings_percentage) {
                // 如果是普通折扣
                discountText = `${offer.savings_percentage}% OFF`;
            }

            // 确定描述文本
            let description = product.brand || '';

            if (product.binding) {
                description += (description ? ' · ' : '') + product.binding;
            }

            return {
                id: index + 1,
                title: product.title,
                description: description,
                discount: discountText,
                ctaText: isCoupon ? "Get Coupon" : "Shop Now",
                link: product.url,
                image: product.main_image,
                brand: product.brand,
                productId: product.asin
            };
        });

        // 返回数据和缓存头信息
        return NextResponse.json(
            {
                success: true,
                products: limitedProducts,
                promoCards: promoCards,
                meta: {
                    seed: minuteSeed,
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

        // 创建备选促销卡片数据
        const fallbackPromoCards = [
            {
                id: 1,
                title: "Flash Sale",
                description: "Kitchen Appliances Promotion",
                discount: "Up to 70% OFF",
                ctaText: "Shop Now",
                link: "/category/kitchen-appliances",
                brand: "Kitchen Appliances",
                productId: "fallback-product-1"
            },
            {
                id: 2,
                title: "New Arrivals",
                description: "Smart Home Device Specials",
                discount: "15% OFF First Order",
                ctaText: "Learn More",
                link: "/category/smart-home",
                brand: "Smart Home",
                productId: "fallback-product-2"
            },
            {
                id: 3,
                title: "Member Exclusive",
                description: "Electronics Coupon Deal",
                discount: "Extra 10% OFF",
                ctaText: "Get Coupon",
                link: "/coupons/electronics",
                brand: "Electronics",
                productId: "fallback-product-3"
            }
        ];

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
            'Cache-Control': `public, max-age=${Math.floor(revalidate / 2)}, stale-while-revalidate=${revalidate}` // 错误情况下缓存时间更短
        };

        return NextResponse.json(
            {
                success: false,
                products: [],
                promoCards: fallbackPromoCards,
                error: 'Failed to fetch hero products',
                meta: {
                    cached: false,
                    expires: expiresAt.toISOString()
                }
            },
            {
                status: 200, // 返回200而不是错误状态码，因为我们有备用数据
                headers: cacheHeaders
            }
        );
    }
} 
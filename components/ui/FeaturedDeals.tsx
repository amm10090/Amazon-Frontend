"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import FavoriteButton from '@/components/common/FavoriteButton';
import { productsApi } from '@/lib/api';
import { StoreIdentifier } from '@/lib/store';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import type { Product } from '@/types/api';

// 导入FavoriteButton组件

// 定义API响应的接口，替代any类型
interface ProductResponse {
    data?: {
        items?: Product[];
    };
    items?: Product[];
}

// 辅助函数，用于安全获取响应中的商品项
function getResponseItems(response: ProductResponse): Product[] {
    // 如果response.items存在且非空，返回它
    if (response.items && response.items.length > 0) {
        return response.items;
    }
    // 如果response.data.items存在且非空，返回它
    if (response.data?.items && response.data.items.length > 0) {
        return response.data.items;
    }

    // 都不存在则返回空数组
    return [];
}

// 检查响应是否包含有效的商品
function hasValidItems(response: ProductResponse): boolean {
    if (!response) return false;

    return (Array.isArray(response.items) && response.items.length > 0) ||
        (!!response.data && Array.isArray(response.data.items) && response.data.items.length > 0);
}

interface FeaturedDealsProps {
    limit?: number;
    className?: string;
}

export function FeaturedDeals({ limit = 4, className = '' }: FeaturedDealsProps) {
    const [deals, setDeals] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch today's best deals
    useEffect(() => {
        const fetchDeals = async () => {
            try {
                setLoading(true);

                // 生成随机参数确保每次请求不同的数据
                const randomOffset = Math.floor(Math.random() * 50); // 随机起始位置
                const randomSortOptions = ['created', 'price', 'discount'] as const; // 随机排序选项
                const randomSort = randomSortOptions[Math.floor(Math.random() * randomSortOptions.length)];

                // First try with stricter filters
                const response = await productsApi.getProducts({
                    limit: limit * 3, // 获取更多商品以便随机选择
                    min_discount: 30,
                    is_prime_only: true,
                    product_type: 'all',
                    sort_by: randomSort,
                    sort_order: Math.random() > 0.5 ? 'asc' : 'desc',
                    page: randomOffset > 0 ? Math.floor(randomOffset / 10) + 1 : 1 // 随机页码
                });

                const responseData = response.data as ProductResponse || {};

                // Try different possible response structures
                if (hasValidItems(responseData)) {
                    // 使用辅助函数获取items，确保类型安全
                    const items = [...getResponseItems(responseData)];

                    // Fisher-Yates shuffle algorithm for true randomness
                    for (let i = items.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));

                        [items[i], items[j]] = [items[j], items[i]];
                    }
                    setDeals(items.slice(0, limit));
                    setLoading(false);

                    return;
                }
                else if (response.data?.data?.items && response.data.data.items.length > 0) {
                    // Randomize the items returned
                    const items = [...response.data.data.items];

                    // Fisher-Yates shuffle algorithm for true randomness
                    for (let i = items.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));

                        [items[i], items[j]] = [items[j], items[i]];
                    }
                    setDeals(items.slice(0, limit));
                    setLoading(false);

                    return;
                }
                else {
                    // If no results, try a more relaxed query
                    const fallbackResponse = await productsApi.getProducts({
                        limit: limit * 4, // 获取更多商品
                        min_discount: 10,
                        product_type: 'all',
                        is_prime_only: true,
                        sort_by: randomSort,
                        sort_order: Math.random() > 0.5 ? 'asc' : 'desc',
                        page: Math.floor(Math.random() * 3) + 1 // 随机页码1-3
                    });

                    const fallbackData = fallbackResponse.data as ProductResponse || {};

                    if (hasValidItems(fallbackData)) {
                        // 使用辅助函数获取items，确保类型安全
                        const items = [...getResponseItems(fallbackData)];

                        // Fisher-Yates shuffle algorithm for true randomness
                        for (let i = items.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));

                            [items[i], items[j]] = [items[j], items[i]];
                        }
                        setDeals(items.slice(0, limit));
                        setLoading(false);

                        return;
                    }
                    else if (fallbackResponse.data?.data?.items && fallbackResponse.data.data.items.length > 0) {
                        // Randomize the items returned
                        const items = [...fallbackResponse.data.data.items];

                        // Fisher-Yates shuffle algorithm for true randomness
                        for (let i = items.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));

                            [items[i], items[j]] = [items[j], items[i]];
                        }
                        setDeals(items.slice(0, limit));
                        setLoading(false);

                        return;
                    }
                    else {
                        // If still no results, just get any products
                        const anyProductsResponse = await productsApi.getProducts({
                            limit: limit * 4,
                            product_type: 'all',
                            sort_by: randomSort,
                            sort_order: Math.random() > 0.5 ? 'asc' : 'desc',
                            page: Math.floor(Math.random() * 5) + 1 // 随机页码1-5
                        });

                        const anyProductsData = anyProductsResponse.data as ProductResponse || {};

                        if (hasValidItems(anyProductsData)) {
                            // 使用辅助函数获取items，确保类型安全
                            const items = [...getResponseItems(anyProductsData)];

                            // Fisher-Yates shuffle algorithm for true randomness
                            for (let i = items.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));

                                [items[i], items[j]] = [items[j], items[i]];
                            }
                            setDeals(items.slice(0, limit));
                        }
                        else if (anyProductsResponse.data?.data?.items) {
                            // Randomize the items returned
                            const items = [...anyProductsResponse.data.data.items];

                            // Fisher-Yates shuffle algorithm for true randomness
                            for (let i = items.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));

                                [items[i], items[j]] = [items[j], items[i]];
                            }
                            setDeals(items.slice(0, limit));
                        }
                        else {
                            setDeals([]);
                        }
                    }
                }
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error('Failed to fetch today\'s best deals:', err);
                setError('Unable to load deals. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchDeals();
    }, [limit]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (loading) {
        return (
            <div className={`bg-gray-100 dark:bg-gray-800 rounded-xl p-6 animate-pulse ${className}`}>
                <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: limit }).map(() => {
                        // 为每个占位符生成一个唯一ID，不依赖索引
                        const uniqueId = `placeholder-${Math.random().toString(36).substring(2, 9)}`;

                        return <div key={uniqueId} className="h-64 bg-gray-300 dark:bg-gray-700 rounded-lg" />;
                    })}
                </div>
            </div>
        );
    }

    if (error || deals.length === 0) {
        return (
            <div className={`bg-gray-100 dark:bg-gray-800 rounded-xl p-6 ${className}`}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-primary-dark dark:text-white">Today&apos;s Best Deals</h2>
                </div>
                <div className="flex justify-center items-center h-64">
                    <p className="text-secondary dark:text-gray-400">{error || 'No deals available at the moment'}</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className={`bg-gray-100 dark:bg-gray-800 rounded-xl p-6 ${className}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* 标题区域：标题左对齐，右侧添加"See All"链接 */}
            <div className="flex items-center justify-between mb-4">
                <motion.h2
                    className="text-2xl font-bold text-primary-dark dark:text-white"
                    variants={itemVariants}
                >
                    Today&apos;s Best Deals
                </motion.h2>

                <motion.div variants={itemVariants}>
                    <Link
                        href="/products"
                        className="flex items-center text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 font-medium transition-colors"
                    >
                        <span>See All</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 ml-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                        </svg>
                    </Link>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {deals.map((deal, index) => {
                    try {
                        // Get main offer information
                        const mainOffer = deal.offers && deal.offers.length > 0 ? deal.offers[0] : null;

                        // Get price and discount information with enhanced error handling
                        const price = mainOffer?.price || deal.price || 0;
                        const savingsPercentage = mainOffer?.savings_percentage ||
                            deal.discount_rate ||
                            (deal.original_price && price ? calculateDiscount(deal.original_price, price) : 0);

                        const originalPrice = mainOffer && mainOffer.savings
                            ? price + mainOffer.savings
                            : deal.original_price || price;

                        // Get coupon information
                        const hasCoupon = mainOffer && mainOffer.coupon_type && mainOffer.coupon_value;
                        const couponType = mainOffer?.coupon_type;
                        const couponValue = mainOffer?.coupon_value;

                        const productId = deal.asin || deal.id || `product-${index}`;
                        const productImage = deal.main_image || deal.image_url || '';
                        const isPrime = mainOffer?.is_prime || false;
                        const title = deal.title || 'Product title not available';

                        // 获取产品链接URL
                        const productUrl = deal.url || deal.cj_url || '';

                        return (
                            <motion.div
                                key={productId}
                                variants={itemVariants}
                                custom={index}
                                className="relative"
                            >
                                {/* 收藏按钮 - 添加在商品卡片外部，确保它可以接收单独的点击事件 */}
                                <div
                                    className="absolute top-3 right-3 z-20"
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.stopPropagation()}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <FavoriteButton
                                        productId={productId}
                                        size="md"
                                        withAnimation={true}
                                        className="bg-white/80 dark:bg-gray-800/80 shadow-sm hover:bg-white dark:hover:bg-gray-800"
                                    />
                                </div>

                                <Link href={`/product/${productId}`} className="block">
                                    <motion.div
                                        className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden h-full flex flex-col"
                                        whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.07), 0 10px 10px -5px rgba(0, 0, 0, 0.03)' }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {/* Prime badge */}
                                        {isPrime && (
                                            <div className="absolute top-3 left-3 z-10">
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="bg-[#0574F7] text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm flex items-center"
                                                >
                                                    Prime
                                                </motion.div>
                                            </div>
                                        )}

                                        {/* Coupon badge - 移动到右上角但位置调整为距离右侧12px，避免与收藏按钮重叠 */}
                                        <div className="absolute top-3 right-12 z-10">
                                            {hasCoupon && (
                                                <motion.div
                                                    initial={{ scale: 0.9 }}
                                                    animate={{ scale: 1.05 }}
                                                    transition={{ duration: 0.7, repeat: Infinity, repeatType: 'reverse' }}
                                                    className="bg-warning text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                                                >
                                                    {couponType === 'percentage' ? `${couponValue}% off` : `$${couponValue} coupon`}
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Product image */}
                                        <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800">
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                className="h-full w-full relative"
                                            >
                                                {productImage ? (
                                                    <Image
                                                        src={productImage}
                                                        alt={title}
                                                        fill
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                                        className="object-cover"
                                                        priority={index < 2}
                                                        loading={index < 2 ? "eager" : "lazy"}
                                                        quality={80}
                                                        unoptimized={productImage.startsWith('data:')}
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                        No image available
                                                    </div>
                                                )}
                                            </motion.div>
                                        </div>

                                        {/* Product information */}
                                        <div className="p-4 flex-grow flex flex-col">
                                            {/* 使用StoreIdentifier组件 */}
                                            <StoreIdentifier
                                                url={productUrl}
                                                align="right"
                                            />

                                            {/* Brand information */}
                                            {deal.brand && (
                                                <div className="mb-2">
                                                    <span className="text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded inline-block">
                                                        {deal.brand}
                                                    </span>
                                                </div>
                                            )}

                                            <h3 className="text-lg font-medium line-clamp-2 mb-2 flex-grow text-primary-dark dark:text-white">
                                                {title}
                                            </h3>

                                            {/* Price and discount on the same line */}
                                            <div className="flex items-center justify-between mt-auto mb-2">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-xl font-semibold text-primary dark:text-primary-light">
                                                        {formatPrice(price)}
                                                    </span>
                                                    {originalPrice > price && (
                                                        <span className="text-sm text-secondary dark:text-gray-400 line-through">
                                                            {formatPrice(originalPrice)}
                                                        </span>
                                                    )}
                                                </div>
                                                {savingsPercentage > 0 && (
                                                    <span className={`text-xs font-bold text-white px-2 py-0.5 rounded ${savingsPercentage > 30 ? 'bg-primary-badge' :
                                                        savingsPercentage > 10 ? 'bg-accent' :
                                                            'bg-secondary'
                                                        }`}>
                                                        -{Math.round(savingsPercentage)}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action button */}
                                        <div className="px-4 pb-4">
                                            <motion.div
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                className="w-full py-2 bg-primary-button hover:bg-primary-button-hover dark:bg-primary-button-light dark:hover:bg-primary-button text-white text-center rounded-full font-medium shadow-sm transition-colors"
                                            >
                                                View Details
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                </Link>
                            </motion.div>
                        );
                    } catch (error) {
                        // eslint-disable-next-line no-console
                        console.error(`Error rendering product at index ${index}:`, error);

                        return null; // Skip rendering this product if there's an error
                    }
                }).filter(Boolean)} {/* Filter out any null values from errors */}
            </div>
        </motion.div>
    );
} 
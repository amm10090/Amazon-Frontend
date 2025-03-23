"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { productsApi } from '@/lib/api';
import { Product } from '@/types/api';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, calculateDiscount } from '@/lib/utils';

// 亚马逊Logo组件
const AmazonLogo = () => (
    <svg className="flex-shrink-0" width="60" height="30" viewBox="0 0 2000 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <path d="M1246.7 329.5h-109.2v-62h203.7v56.1l-103.3 150.5s41.3 3 59 8.9c23.6 5.9 53.1 20.7 53.1 20.7v62s-70.8-23.6-109.2-23.6c-47.2 0-109.2 23.6-109.2 23.6v-67.9l115.1-168.3zM381.9 524.4l-29.5-29.5V326.6c0-35.4-62-67.9-109.2-67.9-67.9 0-121 44.3-124 100.4H190c5.9-23.6 23.6-38.4 47.2-38.4s41.3 14.8 41.3 38.4v26.6h-59c-14.8 0-29.5 3-41.3 8.9-53.1 23.6-76.7 79.7-56.1 126.9 20.7 47.2 79.7 67.9 132.8 44.3 14.8-5.9 26.6-14.8 35.4-26.6l38.4 38.4 53.2-53.2z m-177.2-14.8c-17.7-17.7-11.8-47.2 8.9-67.9 5.9-5.9 14.8-11.8 20.7-11.8h44.3v64.9l-5.9 5.9c-20.7 20.7-50.2 23.7-68 8.9z m897.4 14.8l-29.5-29.5V326.6c0-35.4-62-67.9-109.2-67.9-67.9 0-121 44.3-124 100.4h70.8c5.9-23.6 23.6-38.4 47.2-38.4s41.3 14.8 41.3 38.4v26.6h-62c-14.8 0-29.5 3-41.3 8.9-53.1 23.6-76.7 79.7-56.1 126.9 20.7 47.2 79.7 67.9 132.8 44.3 14.8-5.9 26.6-14.8 35.4-26.6l38.4 38.4 56.2-53.2z m-174.2-14.8c-17.7-17.7-11.8-47.2 8.9-67.9 5.9-5.9 14.8-11.8 20.7-11.8h44.3v64.9l-3 3c-23.6 23.6-53.1 26.6-70.9 11.8z m0 0" fill="#221E1F"></path>
        <path d="M706.6 258.7c-32.5 0-59 20.7-70.8 56.1-14.8-35.4-41.3-56.1-73.8-56.1s-59 26.6-70.8 62v-53.1h-73.8v309.9h73.8V376.8c0-26.6 20.7-44.3 44.3-44.3 11.8 0 32.5 20.7 32.5 32.5v209.6h73.8V367.9c3-17.7 23.6-35.4 41.3-32.5 14.8 0 32.5 20.7 32.5 35.4v206.6h73.8V341.3c-12-47.2-32.7-82.6-82.8-82.6z m0 0" fill="#221E1F"></path>
        <path d="M783.3 344.3v11.8c3-2.9 3-8.9 0-11.8z m0 0" fill="#221E1F"></path>
        <path d="M1810.5 258.7c-32.5 0-59 26.6-70.8 62v-53.1h-73.8v309.9h73.8V376.8c0-26.6 20.7-44.3 44.3-44.3 11.8 0 32.5 20.7 32.5 32.5v209.6h67.9v-245c-0.1-41.4-41.4-70.9-73.9-70.9z m-309.9 0c-70.8 0-126.9 70.8-126.9 162.4 0 88.6 56.1 162.4 126.9 162.4 70.8 0 126.9-70.8 126.9-162.4-2.9-88.6-59-162.4-126.9-162.4z m38.4 218.4c0 20.7-17.7 38.4-38.4 38.4h-3c-20.7 0-38.4-17.7-38.4-38.4V362c0-20.7 17.7-38.4 38.4-38.4h3c20.7 0 38.4 17.7 38.4 38.4v115.1z m0 0" fill="#221E1F"></path>
        <path d="M381.9 604.1s194.8 124 454.6 126.9c259.8 3 354.2-73.8 377.8-79.7 23.6-5.9 17.7 20.7 0 35.4-17.7 14.8-239.1 129.9-413.3 112.2-174.2-17.7-336.5-88.6-422.1-174.2-26.6-29.5 3-20.6 3-20.6z m0 0" fill="#F59328"></path>
        <path d="M1143.4 627.7s106.3-20.7 115.1 0c8.9 20.7-20.7 97.4-32.5 118.1-8.9 14.8 11.8 17.7 20.7 8.9 8.9-11.8 59-73.8 53.1-141.7 0-23.6-17.7-29.5-50.2-29.5-20.7 0-91.5 14.8-118.1 29.5-2.8 2.9-5.8 17.6 11.9 14.7z m0 0" fill="#F59328"></path>
    </svg>
);

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

                // Try different possible response structures
                if ((response.data as any)?.items && (response.data as any).items.length > 0) {
                    // Randomize the items returned
                    const items = [...(response.data as any).items];
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

                    if ((fallbackResponse.data as any)?.items && (fallbackResponse.data as any).items.length > 0) {
                        // Randomize the items returned
                        const items = [...(fallbackResponse.data as any).items];
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

                        if ((anyProductsResponse.data as any)?.items && (anyProductsResponse.data as any).items.length > 0) {
                            // Randomize the items returned
                            const items = [...(anyProductsResponse.data as any).items];
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
                <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(limit)].map((_, i) => (
                        <div key={i} className="h-64 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || deals.length === 0) {
        return (
            <div className={`bg-gray-100 dark:bg-gray-800 rounded-xl p-6 ${className}`}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-primary-dark dark:text-white">Today's Best Deals</h2>
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
                    Today's Best Deals
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
                        const productUrl = deal.cj_url || deal.url || `/products/${productId}`;

                        return (
                            <motion.div
                                key={productId}
                                variants={itemVariants}
                                custom={index}
                                className="relative"
                            >
                                <Link href={productUrl} className="block" target={deal.url || deal.cj_url ? "_blank" : "_self"}>
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
                                                    className="bg-primary-badge text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm flex items-center"
                                                >
                                                    Prime
                                                </motion.div>
                                            </div>
                                        )}

                                        {/* Coupon badge only - discount moved to price line */}
                                        <div className="absolute top-3 right-3 z-10">
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
                                                className="h-full w-full"
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
                                            {/* 头部区域包含品牌信息和商店标识 */}
                                            <div className="flex items-center justify-between mb-2">
                                                {/* Brand information */}
                                                {deal.brand && (
                                                    <div>
                                                        <span className="text-xs font-medium text-gray-400 px-2 py-1 rounded inline-block">
                                                            {deal.brand}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Store identifier - Amazon logo (right side) */}
                                                <div className="flex items-center ml-auto">
                                                    <AmazonLogo />
                                                </div>
                                            </div>

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
                                                    <span className={`text-xs font-bold text-white px-2 py-0.5 rounded ${savingsPercentage > 30 ? 'bg-primary-badge-dark' :
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
                        console.error(`Error rendering product at index ${index}:`, error);
                        return null; // Skip rendering this product if there's an error
                    }
                }).filter(Boolean)} {/* Filter out any null values from errors */}
            </div>
        </motion.div>
    );
} 
"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { EffectCoverflow, Pagination, Navigation, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

// 导入Swiper样式
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';

import FavoriteButton from '@/components/common/FavoriteButton';
import { StoreIdentifier } from '@/lib/store';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import type { Product } from '@/types/api';

interface FeaturedDealsProps {
    limit?: number;
    className?: string;
}

export function FeaturedDeals({ limit = 4, className = '' }: FeaturedDealsProps) {
    const [deals, setDeals] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    // 根据屏幕宽度动态设置商品数量
    const [dynamicLimit, setDynamicLimit] = useState(limit);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;

            if (width >= 1280) { // xl
                setDynamicLimit(4);
                setIsMobile(false);
            } else if (width >= 768) { // md
                setDynamicLimit(3);
                setIsMobile(false);
            } else { // sm及以下使用轮播，显示9个商品
                setDynamicLimit(9);
                setIsMobile(true);
            }
        };

        // 初始化
        handleResize();

        // 监听窗口大小变化
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 使用动态limit获取商品数据
    useEffect(() => {
        const fetchDeals = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/products/featured?limit=${dynamicLimit}`);

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }

                const result = await response.json();

                if (result.success && Array.isArray(result.data)) {
                    setDeals(result.data);
                } else {
                    setDeals([]);
                    if (result.error) {
                        setError(result.error);
                    } else {
                        setError('No deals available at the moment');
                    }
                }
            } catch {
                setError('Unable to load deals. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchDeals();
    }, [dynamicLimit]);

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

    // 渲染单个商品卡片的函数
    const renderProductCard = (deal: Product, index: number) => {
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
            const _hasCoupon = mainOffer && mainOffer.coupon_type && mainOffer.coupon_value;
            const _couponType = mainOffer?.coupon_type;
            const _couponTypecouponValue = mainOffer?.coupon_value;

            const productId = deal.asin || deal.id || `product-${index}`;
            const productImage = deal.main_image || deal.image_url || '';
            const isPrime = mainOffer?.is_prime || false;
            const title = deal.title || 'Product title not available';

            // 获取产品链接URL
            const productUrl = deal.url || deal.cj_url || '';

            return (
                <motion.div
                    key={productId}
                    variants={isMobile ? undefined : itemVariants}
                    custom={index}
                    className="relative w-full"
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
                            className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden h-full flex flex-col max-w-[320px] mx-auto w-full"
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
                            {/* 优惠券标签 - 显示在右上角 
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
                            */}

                            {/* Product image */}
                            <div className="relative w-full aspect-[16/12] bg-gray-100 dark:bg-gray-800">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="h-full w-full relative"
                                >
                                    {productImage ? (
                                        <Image
                                            src={productImage}
                                            alt={title}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                            className="object-contain p-2"
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
                            <div className="p-3 flex-grow flex flex-col">
                                {/* StoreIdentifier */}
                                <StoreIdentifier
                                    url={productUrl}
                                    align="right"
                                />

                                {/* Brand information */}
                                {deal.brand && (
                                    <div className="mb-1.5">
                                        <span className="text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded inline-block">
                                            {deal.brand}
                                        </span>
                                    </div>
                                )}

                                <h3 className="text-base font-medium line-clamp-2 mb-2 flex-grow text-primary-dark dark:text-white">
                                    {title}
                                </h3>

                                {/* Price and discount */}
                                <div className="flex items-center justify-between mt-1 mb-2 flex-wrap gap-2">
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-lg font-semibold text-primary dark:text-primary-light">
                                            {formatPrice(price)}
                                        </span>
                                        {originalPrice > price && (
                                            <span className="text-xs text-secondary dark:text-gray-400 line-through">
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
                            <div className="px-3 pb-3">
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
    };

    if (loading) {
        return (
            <div className={`bg-gray-100 dark:bg-gray-800 rounded-xl p-4 sm:p-6 ${className}`}>
                <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: isMobile ? 1 : dynamicLimit }).map(() => {
                        const uniqueId = `placeholder-${Math.random().toString(36).substring(2, 9)}`;

                        return <div key={uniqueId} className="h-[360px] bg-gray-300 dark:bg-gray-700 rounded-lg" />;
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
            className={`bg-gray-100 dark:bg-gray-800 rounded-xl p-4 sm:p-6 ${className}`}
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

            {/* 移动端使用Swiper轮播 */}
            {isMobile ? (
                <div className="featured-deals-swiper-container">
                    <Swiper
                        modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
                        effect="coverflow"
                        grabCursor={true}
                        centeredSlides={true}
                        slidesPerView="auto"
                        coverflowEffect={{
                            rotate: 0,
                            stretch: 0,
                            depth: 150,
                            modifier: 3,
                            slideShadows: true
                        }}
                        pagination={{
                            clickable: true,
                            dynamicBullets: true
                        }}
                        navigation={{
                            nextEl: '.swiper-button-next',
                            prevEl: '.swiper-button-prev',
                        }}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true
                        }}
                        loop={true}
                        speed={700}
                        className="featured-deals-swiper"
                    >
                        {deals.map((deal, index) => (
                            <SwiperSlide key={deal.asin || deal.id || `product-${index}`} className="swiper-slide-featured">
                                {renderProductCard(deal, index)}
                            </SwiperSlide>
                        ))}
                        <div className="swiper-button-container">
                            <div className="swiper-button-prev custom-nav-btn" />
                            <div className="swiper-button-next custom-nav-btn" />
                        </div>
                    </Swiper>

                    <style jsx global>{`
                        .featured-deals-swiper-container {
                            width: 100%;
                            padding-bottom: 60px;
                            overflow: hidden;
                            max-width: 100vw;
                            position: relative;
                            margin-top: 15px;
                        }
                        .featured-deals-swiper {
                            width: 100%;
                            padding: 15px 0;
                            max-width: 100%;
                        }
                        .swiper-slide-featured {
                            width: 75%;
                            max-width: 320px;
                            height: auto;
                            max-height: 450px;
                            flex-shrink: 0;
                            opacity: 0.65;
                            filter: blur(2px);
                            transition: all 0.3s ease;
                            transform-origin: center center;
                        }
                        .swiper-slide-featured.swiper-slide-active {
                            opacity: 1;
                            filter: blur(0);
                            transform: scale(1.2);
                            z-index: 2;
                        }
                        .swiper-slide-featured.swiper-slide-prev,
                        .swiper-slide-featured.swiper-slide-next {
                            opacity: 0.75;
                            filter: blur(1px);
                            z-index: 1;
                            transform: scale(0.85);
                        }
                        .swiper-slide-featured .max-w-[320px] {
                            max-width: 100% !important;
                            box-shadow: 0 8px 20px rgba(0,0,0,0.1);
                            transition: all 0.3s ease;
                            display: flex;
                            flex-direction: column;
                        }
                        .swiper-slide-active .max-w-[320px] {
                            box-shadow: 0 15px 30px rgba(0,0,0,0.2);
                            aspect-ratio: 1.1/1;
                            overflow: hidden;
                            width: 100%;
                        }
                        .swiper-slide-active .relative.w-full.aspect-\[16\/12\] {
                            aspect-ratio: 1.1/1 !important;
                            flex: 0 0 60%;
                        }
                        .swiper-slide-active .p-3 {
                            padding: 10px !important;
                            flex: 0 0 auto;
                        }
                        .swiper-slide-active h3 {
                            font-size: 1rem;
                            font-weight: 600;
                            margin-bottom: 5px !important;
                            line-clamp: 1;
                            -webkit-line-clamp: 1;
                        }
                        .swiper-slide-active .text-lg {
                            font-size: 1.15rem !important;
                        }
                        .swiper-slide-active .mb-1.5,
                        .swiper-slide-active .mb-2 {
                            margin-bottom: 2px !important;
                        }
                        .swiper-slide-active .text-xs.font-medium.bg-blue-50 {
                            display: none;
                        }
                        .swiper-slide-active .py-2 {
                            padding-top: 5px !important;
                            padding-bottom: 5px !important;
                        }
                        .swiper-slide-active .px-3.pb-3 {
                            padding-bottom: 10px !important;
                        }
                        .swiper-pagination {
                            bottom: 0 !important;
                            padding: 10px 0;
                        }
                        .swiper-pagination-bullet {
                            background: rgba(100, 100, 100, 0.5);
                            opacity: 0.5;
                            width: 8px;
                            height: 8px;
                            transition: all 0.3s ease;
                        }
                        .swiper-pagination-bullet-active {
                            background: #4CAF50;
                            opacity: 1;
                            width: 20px;
                            border-radius: 4px;
                        }
                        .swiper-pagination-bullets.swiper-pagination-horizontal {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            gap: 6px;
                        }
                        .swiper-button-container {
                            position: absolute;
                            width: 100%;
                            top: 50%;
                            transform: translateY(-50%);
                            z-index: 10;
                            display: flex;
                            justify-content: space-between;
                            padding: 0 10px;
                            pointer-events: none;
                        }
                        .custom-nav-btn {
                            width: 35px;
                            height: 35px;
                            border-radius: 50%;
                            background: rgba(255, 255, 255, 0.8);
                            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            pointer-events: auto;
                            cursor: pointer;
                            opacity: 0;
                            transition: all 0.3s ease;
                        }
                        .custom-nav-btn:after {
                            font-size: 15px;
                            color: #4CAF50;
                        }
                        .featured-deals-swiper:hover .custom-nav-btn {
                            opacity: 0.8;
                        }
                        .custom-nav-btn:hover {
                            background: white;
                            opacity: 1 !important;
                        }
                        
                        /* 修改导航按钮位置，给更大的卡片留出空间 */
                        .swiper-button-prev {
                            left: 5px !important;
                        }
                        .swiper-button-next {
                            right: 5px !important;
                        }
                    `}</style>
                </div>
            ) : (
                // 大屏幕保持网格布局
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {deals.map((deal, index) => renderProductCard(deal, index)).filter(Boolean)}
                </div>
            )}
        </motion.div>
    );
}
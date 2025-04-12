"use client";

import axios from 'axios';
import { motion, useAnimation } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

import FavoriteButton from '@/components/common/FavoriteButton';

interface Bubble {
    top: string;
    left: string;
    width: string;
    height: string;
    delay: number;
}

interface ProductOffer {
    condition: string;
    price: number;
    currency: string;
    savings: number;
    savings_percentage: number;
    is_prime: boolean;
    is_amazon_fulfilled: boolean;
    is_free_shipping_eligible: boolean;
    availability: string;
    merchant_name: string;
    is_buybox_winner: boolean;
    deal_type: string | null;
    coupon_type: string | null;
    coupon_value: number | null;
    coupon_history: Record<string, unknown> | null;
    commission: Record<string, unknown> | null;
}

interface BrowseNode {
    id: string;
    name: string;
    is_root: boolean;
}

interface Product {
    asin: string;
    title: string;
    url: string;
    brand: string;
    main_image: string;
    offers: ProductOffer[];
    timestamp: string;
    coupon_info: Record<string, unknown> | null;
    binding: string;
    product_group: string;
    categories: string[];
    browse_nodes: BrowseNode[];
    features: string[];
    cj_url: string | null;
    api_provider: string;
}

interface PromoCard {
    id: number;
    title: string;
    description: string;
    discount: string;
    ctaText: string;
    link: string;
    image?: string;
    brand?: string;
    productId?: string;
}

export function HeroSection() {
    const [_bubbles, setBubbles] = useState<Bubble[]>([]);
    const [activePromo, setActivePromo] = useState(0);
    const [_products, setProducts] = useState<Product[]>([]);
    const [promoCards, setPromoCards] = useState<PromoCard[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { theme } = useTheme();
    const _isDark = theme === 'dark';

    // 动画控制器
    const controls = useAnimation();

    // 获取产品数据
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);

                // 请求新的Hero API
                const response = await axios.get('/api/products/hero', {
                    params: {
                        limit: 3
                    }
                });

                if (response.data && response.data.success) {
                    // 直接使用API返回的处理好的数据
                    if (response.data.products) {
                        setProducts(response.data.products);
                    }

                    if (response.data.promoCards) {
                        setPromoCards(response.data.promoCards);
                    }
                }

                setIsLoading(false);
            } catch {
                setError('Failed to load deals');
                setIsLoading(false);

                // 使用备选促销卡片数据
                setPromoCards([
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
                ]);
            }
        };

        fetchProducts();
    }, []);

    // 生成随机气泡 - 在客户端渲染后进行
    useEffect(() => {
        const generateBubbles = () => {
            const newBubbles = Array.from({ length: 8 }).map(() => ({
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${10 + Math.random() * 40}px`,
                height: `${10 + Math.random() * 40}px`,
                delay: Math.random() * 1
            }));

            setBubbles(newBubbles);
        };

        generateBubbles();
    }, []);

    // 自动轮播促销卡片
    useEffect(() => {
        if (promoCards.length === 0) return;

        const interval = setInterval(() => {
            setActivePromo((prev) => (prev + 1) % promoCards.length);
        }, 5000);

        // 初始动画
        controls.start({
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" }
        });

        return () => clearInterval(interval);
    }, [promoCards.length, controls]);

    // 液态按钮SVG过滤器定义
    const svgFilters = (
        <svg width="0" height="0" className="absolute">
            <defs>
                <filter id="liquid-button" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                    <feBlend in="SourceGraphic" in2="goo" />
                </filter>
                <filter id="glow-effect">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feColorMatrix
                        in="blur"
                        type="matrix"
                        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -5"
                        result="glow"
                    />
                    <feComposite in="SourceGraphic" in2="glow" operator="over" />
                </filter>
                <filter id="frosted-glass" x="-10%" y="-10%" width="120%" height="120%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="7" />
                    <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" />
                </filter>
            </defs>
        </svg>
    );

    return (
        // 适应新布局结构，不再全宽显示
        <div className="relative w-full rounded-xl">
            {/* SVG过滤器 */}
            {svgFilters}

            {/* 替换背景为浅蓝色 */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#1B5479] to-[#287EB7] dark:from-[#1B5479] dark:to-[#287EB7]" style={{ zIndex: 2 }} />

            {/* 简化背景装饰元素 */}
            <div className="absolute inset-0 overflow-hidden rounded-xl" style={{ zIndex: 1 }}>
                {/* 简化左侧装饰球 */}
                <motion.div
                    className="absolute -left-16 top-1/4 w-32 h-32 rounded-full bg-[#287EB7] dark:bg-[#287EB7]"
                    animate={{
                        y: [0, -10, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        repeatType: "mirror"
                    }}
                />

                {/* 简化右侧装饰球 */}
                <motion.div
                    className="absolute -right-20 top-2/3 w-40 h-40 rounded-full bg-[#1B5479] dark:bg-[#1B5479]"
                    animate={{
                        y: [0, 10, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        repeatType: "mirror",
                        delay: 1
                    }}
                />
            </div>

            {/* 主要内容 */}
            <div
                className="relative py-8 rounded-xl overflow-hidden"
                style={{ zIndex: 3 }}
            >
                {/* 内容容器，保持居中 */}
                <div className="px-4 md:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center">
                        {/* 左侧文本区域 (占7列) */}
                        <motion.div
                            className="md:col-span-7 z-10"
                            initial={{ opacity: 0, y: 50 }}
                            animate={controls}
                        >
                            {/* 移除背景以显示蓝色底色，并确保文字为白色 */}
                            <div className="relative p-4 sm:p-6 rounded-xl">
                                {/* 标题 */}
                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 sm:mb-3 tracking-tight">
                                    <motion.span
                                        className="inline-block"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{
                                            opacity: 1,
                                            x: 0
                                        }}
                                        transition={{
                                            duration: 0.7,
                                            delay: 0.1
                                        }}
                                    >
                                        Hunt
                                    </motion.span>{" "}
                                    <motion.span
                                        className="inline-block"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{
                                            opacity: 1,
                                            x: 0
                                        }}
                                        transition={{
                                            duration: 0.7,
                                            delay: 0.2
                                        }}
                                    >
                                        Smart.
                                    </motion.span>{" "}
                                    <motion.span
                                        className="relative inline-block"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{
                                            opacity: 1,
                                            x: 0
                                        }}
                                        transition={{
                                            duration: 0.7,
                                            delay: 0.3
                                        }}
                                    >
                                        <span className="relative z-10">Save Big.</span>
                                        <motion.span
                                            className="absolute bottom-1 sm:bottom-2 left-0 h-2 sm:h-3 bg-[#F59328] dark:bg-[#F59328] -z-10"
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 0.8, delay: 0.8 }}
                                        />
                                    </motion.span>
                                </h1>

                                {/* 副标题 */}
                                <motion.p
                                    className="text-base sm:text-lg md:text-xl text-white max-w-xl mb-6 sm:mb-8"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{
                                        opacity: 1,
                                        y: 0
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        delay: 0.5
                                    }}
                                >
                                    OOHunt tracks the best deals, sales, and coupons from Amazon, Walmart, Target and more - all in one place.
                                </motion.p>

                                {/* 按钮组 */}
                                <div className="flex flex-wrap gap-3 sm:gap-4">
                                    {/* 修改按钮为橙色 */}
                                    <motion.div
                                        className="relative group w-full sm:w-auto"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Link
                                            href="/deals"
                                            className="relative inline-flex items-center justify-center w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 font-medium z-10 bg-[#F59328] hover:bg-[#F7A14A] text-white rounded-lg"
                                        >
                                            Start Shopping Smart
                                        </Link>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>

                        {/* 右侧促销卡片 (占5列) */}
                        <motion.div
                            className="md:col-span-5 z-10 mt-8 md:mt-0"
                        >
                            <div className="relative w-full max-w-md mx-auto md:ml-auto h-72 sm:h-80 md:h-96">
                                {isLoading ? (
                                    <div className="absolute inset-0 w-full h-full bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-7 shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
                                    </div>
                                ) : error ? (
                                    <div className="absolute inset-0 w-full h-full bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-7 shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                        <p className="text-secondary dark:text-gray-300 text-center">Unable to load deals. Please try again later.</p>
                                    </div>
                                ) : (
                                    promoCards.map((card, index) => (
                                        <motion.div
                                            key={card.id}
                                            initial={false}
                                            animate={{
                                                scale: activePromo === index ? 1 : 0.9,
                                                opacity: activePromo === index ? 1 : 0,
                                                x: activePromo === index ? 0 : 50,
                                                rotateY: activePromo === index ? 0 : -15,
                                                zIndex: activePromo === index ? 20 : 10,
                                            }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 20
                                            }}
                                            className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden shadow-xl"
                                            style={{
                                                display: activePromo === index ? 'block' : 'none'
                                            }}
                                        >
                                            {/* 收藏按钮 - 放置在卡片外层，使用绝对定位 */}
                                            {activePromo === index && (
                                                <div
                                                    className="absolute top-3 right-3 z-20"
                                                    onClick={(e) => e.stopPropagation()}
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                    role="button"
                                                    tabIndex={0}
                                                >
                                                    <FavoriteButton
                                                        productId={card.productId || card.id.toString()}
                                                        size="sm"
                                                        className="bg-white/80 dark:bg-gray-800/80 shadow-sm hover:bg-white dark:hover:bg-gray-800"
                                                    />
                                                </div>
                                            )}

                                            {/* 产品图片背景 - 全尺寸，提高可视性 */}
                                            {card.image ? (
                                                <div className="absolute inset-0 w-full h-full group">
                                                    <div className="relative w-full h-full">
                                                        <Image
                                                            src={card.image}
                                                            alt={card.title}
                                                            fill
                                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                            style={{ objectFit: 'cover' }}
                                                            priority={index === 0}
                                                            className="transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                    </div>
                                                    {/* 简化渐变叠加层 - 使用半透明纯色 */}
                                                    <div className="absolute inset-0 bg-black/40 transition-opacity duration-500 group-hover:opacity-50" />
                                                </div>
                                            ) : (
                                                <div className="absolute inset-0 w-full h-full bg-primary dark:bg-primary">
                                                    {/* 移除背景纹理 */}
                                                </div>
                                            )}

                                            {/* 卡片内容 - 采用顶部标题和底部操作按钮的布局 */}
                                            <div className="absolute inset-0 p-5 sm:p-6 flex flex-col h-full">
                                                {/* 顶部区域 */}
                                                <div className="mb-auto">
                                                    {/* 简化折扣标签 */}
                                                    <motion.div
                                                        className="inline-block mb-3 bg-accent dark:bg-accent text-white font-bold px-3 py-1.5 rounded-lg text-sm shadow-md"
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                                    >
                                                        {card.discount}
                                                    </motion.div>

                                                    <motion.h3
                                                        className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 line-clamp-3 leading-tight"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.1 }}
                                                    >
                                                        {card.title}
                                                    </motion.h3>
                                                </div>

                                                {/* 底部区域 - 使用简单纯色背景 */}
                                                <div className="mt-auto">
                                                    {/* 简化半透明背景 */}
                                                    <div className="bg-black/30 rounded-xl py-2.5 px-4 shadow-lg transform transition-all duration-300 hover:bg-black/40">
                                                        <div className="flex flex-row items-center sm:justify-between gap-3">
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                {/* 动态品牌图标 */}
                                                                <div className="w-6 h-6 rounded-full flex-shrink-0 bg-white/20 flex items-center justify-center">
                                                                    {card.brand ? (
                                                                        <span className="text-xs font-bold text-white">
                                                                            {card.brand.substring(0, 1).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                                                                        </span>
                                                                    ) : (
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01" />
                                                                        </svg>
                                                                    )}
                                                                </div>

                                                                <div className="truncate">
                                                                    {/* 品牌名称 */}
                                                                    {card.brand && (
                                                                        <motion.p
                                                                            className="text-xs text-white/80 truncate"
                                                                            initial={{ opacity: 0, x: -5 }}
                                                                            animate={{ opacity: 1, x: 0 }}
                                                                            transition={{ delay: 0.15 }}
                                                                        >
                                                                            {card.brand}
                                                                        </motion.p>
                                                                    )}

                                                                    {/* 产品描述 */}
                                                                    <motion.p
                                                                        className="text-sm text-white font-medium truncate"
                                                                        initial={{ opacity: 0, x: -10 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ delay: 0.2 }}
                                                                        title={card.description}
                                                                    >
                                                                        {card.description}
                                                                    </motion.p>
                                                                </div>
                                                            </div>

                                                            <motion.div
                                                                className="flex-shrink-0"
                                                                initial={{ opacity: 0, x: 10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: 0.3 }}
                                                                whileTap={{ scale: 0.97 }}
                                                            >
                                                                <Link
                                                                    href={card.link}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="group inline-flex items-center justify-center h-8 px-3.5 sm:px-4 bg-success hover:bg-success/90 dark:bg-success dark:hover:bg-success/90 text-white rounded-full text-xs sm:text-sm font-medium transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                                                                >
                                                                    <span>{card.ctaText}</span>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                                    </svg>
                                                                </Link>
                                                            </motion.div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 指示器 - 更简洁的设计 */}
                                            <div className="absolute bottom-3 sm:bottom-4 right-4 flex gap-1.5">
                                                {promoCards.map((card) => (
                                                    <button
                                                        key={`promo-indicator-${card.id}`}
                                                        onClick={() => setActivePromo(promoCards.findIndex(c => c.id === card.id))}
                                                        className={`w-2 h-2 rounded-full transition-all ${activePromo === promoCards.findIndex(c => c.id === card.id)
                                                            ? 'bg-white w-4 sm:w-5'
                                                            : 'bg-white/40 hover:bg-white/60'
                                                            }`}
                                                        aria-label={`Switch to promo card ${card.title}`}
                                                    />
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
} 
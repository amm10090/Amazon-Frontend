"use client";

import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import axios from 'axios';

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
    coupon_history: any | null;
    commission: any | null;
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
    coupon_info: any | null;
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
}

export function HeroSection() {
    const [bubbles, setBubbles] = useState<Bubble[]>([]);
    const [activePromo, setActivePromo] = useState(0);
    const [products, setProducts] = useState<Product[]>([]);
    const [promoCards, setPromoCards] = useState<PromoCard[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // 动画控制器
    const controls = useAnimation();

    // 获取产品数据
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);

                // 随机生成页码 (1-50)
                const randomPage = Math.floor(Math.random() * 50) + 1;

                // 随机生成价格范围 (3-700)
                const minPrice = 3;
                const maxPrice = 700;

                // 请求API
                const response = await axios.get('/api/products/list', {
                    params: {
                        page: randomPage,
                        page_size: 3,
                        min_price: minPrice,
                        max_price: maxPrice,
                        min_discount: 20,
                        is_prime_only: true,
                        product_type: 'all'
                    }
                });

                if (response.data && response.data.items) {
                    setProducts(response.data.items);

                    // 转换为促销卡片格式
                    const cards = response.data.items.map((product: Product, index: number) => {
                        const offer = product.offers[0] || {};
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
                            brand: product.brand
                        };
                    });

                    setPromoCards(cards);
                }

                setIsLoading(false);
            } catch (err) {
                console.error('Failed to fetch products:', err);
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
                        brand: "Kitchen Appliances"
                    },
                    {
                        id: 2,
                        title: "New Arrivals",
                        description: "Smart Home Device Specials",
                        discount: "15% OFF First Order",
                        ctaText: "Learn More",
                        link: "/category/smart-home",
                        brand: "Smart Home"
                    },
                    {
                        id: 3,
                        title: "Member Exclusive",
                        description: "Electronics Coupon Deal",
                        discount: "Extra 10% OFF",
                        ctaText: "Get Coupon",
                        link: "/coupons/electronics",
                        brand: "Electronics"
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
        // 突破容器限制，实现全宽设计
        <div className="relative w-[100vw] left-[calc(-50vw+50%)] right-0 -mt-5">
            {/* SVG过滤器 */}
            {svgFilters}

            {/* 渐变光晕背景 - 使用更高级的渐变色 */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/40 via-purple-500/30 to-fuchsia-400/30 dark:from-indigo-700/40 dark:via-purple-600/30 dark:to-fuchsia-500/30" style={{ zIndex: 2 }}></div>

            {/* 背景装饰元素 */}
            <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 1 }}>
                {/* 左侧装饰球 */}
                <motion.div
                    className="absolute -left-16 top-1/4 w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 backdrop-blur-xl"
                    animate={{
                        y: [0, -20, 0],
                        scale: [1, 1.05, 1],
                        rotate: [0, 5, 0]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        repeatType: "mirror"
                    }}
                />

                {/* 右侧装饰球 */}
                <motion.div
                    className="absolute -right-20 top-2/3 w-40 h-40 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-400/20 backdrop-blur-xl"
                    animate={{
                        y: [0, 20, 0],
                        scale: [1, 1.1, 1],
                        rotate: [0, -5, 0]
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        repeatType: "mirror",
                        delay: 1
                    }}
                />

                {/* 底部波浪效果 */}
                <div className="absolute bottom-0 left-0 right-0 h-16">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full">
                        <path
                            fill="rgba(255,255,255,0.05)"
                            fillOpacity="1"
                            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,197.3C672,192,768,160,864,165.3C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                        ></path>
                    </svg>
                </div>
            </div>

            {/* 主要内容 */}
            <div
                className="relative py-8 sm:py-10 md:py-14 lg:py-18 overflow-hidden"
                style={{ zIndex: 3 }}
            >
                {/* 内容容器，保持居中 */}
                <div className="container mx-auto px-4 sm:px-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 md:gap-8 items-center">
                        {/* 左侧文本区域 (占7列) */}
                        <motion.div
                            className="md:col-span-7 z-10"
                            initial={{ opacity: 0, y: 50 }}
                            animate={controls}
                        >
                            {/* 标题 */}
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white dark:text-white mb-2 sm:mb-3 tracking-tight">
                                <motion.span
                                    className="inline-block"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                        scale: [1, 1.03, 1]  // 呼吸效果稍微增强
                                    }}
                                    transition={{
                                        duration: 0.7,
                                        delay: 0.1,
                                        scale: {
                                            duration: 4,
                                            repeat: Infinity,
                                            repeatType: "mirror",
                                            ease: "easeInOut",
                                            delay: 1.2  // 统一的呼吸动画延迟
                                        }
                                    }}
                                >
                                    Amazon
                                </motion.span>{" "}
                                <motion.span
                                    className="inline-block"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                        scale: [1, 1.03, 1]  // 呼吸效果稍微增强
                                    }}
                                    transition={{
                                        duration: 0.7,
                                        delay: 0.2,
                                        scale: {
                                            duration: 4,
                                            repeat: Infinity,
                                            repeatType: "mirror",
                                            ease: "easeInOut",
                                            delay: 1.2  // 统一的呼吸动画延迟
                                        }
                                    }}
                                >
                                    Deals
                                </motion.span>{" "}
                                <motion.span
                                    className="relative inline-block"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                        scale: [1, 1.03, 1]  // 呼吸效果稍微增强
                                    }}
                                    transition={{
                                        duration: 0.7,
                                        delay: 0.3,
                                        scale: {
                                            duration: 4,
                                            repeat: Infinity,
                                            repeatType: "mirror",
                                            ease: "easeInOut",
                                            delay: 1.2  // 统一的呼吸动画延迟
                                        }
                                    }}
                                >
                                    <span className="relative z-10">Explorer</span>
                                    <motion.span
                                        className="absolute bottom-1 sm:bottom-2 left-0 h-2 sm:h-3 bg-fuchsia-500 dark:bg-fuchsia-400 -z-10"
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 0.8, delay: 0.8 }}
                                    />
                                </motion.span>
                            </h1>

                            {/* 副标题 */}
                            <motion.p
                                className="text-base sm:text-lg md:text-xl text-white/90 dark:text-white/90 max-w-xl mb-6 sm:mb-8"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: [1, 1.03, 1]  // 呼吸效果稍微增强
                                }}
                                transition={{
                                    duration: 0.5,
                                    delay: 0.5,
                                    scale: {
                                        duration: 4,
                                        repeat: Infinity,
                                        repeatType: "mirror",
                                        ease: "easeInOut",
                                        delay: 1.2  // 统一的呼吸动画延迟
                                    }
                                }}
                            >
                                Find the best Amazon deals, limited-time offers, and exclusive coupons to save on your shopping!
                            </motion.p>

                            {/* 按钮组 */}
                            <div className="flex flex-wrap gap-3 sm:gap-4">
                                {/* 液态按钮效果 */}
                                <motion.div
                                    className="relative group w-full sm:w-auto"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{ filter: 'url(#liquid-button)' }}
                                >
                                    <Link
                                        href="/deals"
                                        className="relative inline-flex items-center justify-center w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 font-medium text-indigo-800 dark:text-indigo-900 bg-white hover:bg-white/90 dark:bg-white dark:hover:bg-white/90 rounded-full shadow-lg group-hover:shadow-xl transition-all z-10"
                                    >
                                        Browse All Deals

                                        {/* 动态背景球体 */}
                                        <motion.span
                                            className="absolute -top-2 -right-2 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-fuchsia-500 dark:bg-fuchsia-400"
                                            animate={{
                                                x: [0, 5, 0],
                                                y: [0, -5, 0],
                                                scale: [1, 1.2, 1]
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                repeatType: "mirror"
                                            }}
                                        />
                                    </Link>
                                </motion.div>

                                {/* 发光按钮效果 */}
                                <motion.div
                                    className="w-full sm:w-auto"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{ filter: 'url(#glow-effect)' }}
                                >
                                    <Link
                                        href="/category/top-deals"
                                        className="inline-flex w-full sm:w-auto items-center justify-center h-12 sm:h-14 px-6 sm:px-8 font-medium text-white bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-700 hover:to-indigo-700 dark:from-fuchsia-500 dark:to-indigo-500 dark:hover:from-fuchsia-600 dark:hover:to-indigo-600 dark:text-white rounded-full shadow-lg hover:shadow-xl transition-all"
                                    >
                                        Today's Hot Deals
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* 右侧促销卡片 (占5列) */}
                        <motion.div
                            className="md:col-span-5 z-10 mt-8 md:mt-0"
                        >
                            <div className="relative w-full max-w-md mx-auto md:ml-auto h-72 sm:h-80 md:h-96">
                                {isLoading ? (
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent dark:from-gray-800/30 dark:to-transparent backdrop-blur-md rounded-2xl p-5 sm:p-7 shadow-xl overflow-hidden border border-white/20 dark:border-indigo-500/20 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                                    </div>
                                ) : error ? (
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent dark:from-gray-800/30 dark:to-transparent backdrop-blur-md rounded-2xl p-5 sm:p-7 shadow-xl overflow-hidden border border-white/20 dark:border-indigo-500/20 flex items-center justify-center">
                                        <p className="text-white text-center">Unable to load deals. Please try again later.</p>
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
                                            {/* 产品图片背景 - 全尺寸，提高可视性 */}
                                            {card.image ? (
                                                <div className="absolute inset-0 w-full h-full group">
                                                    <Image
                                                        src={card.image}
                                                        alt={card.title}
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                        quality={90}
                                                        className="transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                    {/* 改进的渐变叠加层 - 更好的对比度和视觉效果 */}
                                                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/70 via-transparent to-black/70 transition-opacity duration-500 group-hover:opacity-80"></div>

                                                    {/* 卡片装饰元素 */}
                                                    <div className="absolute -top-3 -right-3 w-24 h-24 opacity-70">
                                                        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-indigo-500/30">
                                                            <path d="M42.8,-68.2C55.5,-60.2,66.1,-49.4,71.9,-36.5C77.7,-23.7,78.7,-8.9,77.7,6C76.7,21,73.7,36.1,64.8,46.9C55.9,57.7,41.1,64.3,26.6,68.1C12,71.9,-2.2,73,-16.9,70.8C-31.6,68.6,-46.9,63.1,-57.5,52.8C-68.1,42.6,-74.1,27.8,-74.9,12.9C-75.6,-2,-71.1,-16.9,-64.2,-30.2C-57.3,-43.5,-48,-55.2,-36.5,-63.7C-25,-72.2,-11.2,-77.5,1.3,-79.6C13.8,-81.6,30.1,-76.2,42.8,-68.2Z" transform="translate(100 100)" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-600 to-fuchsia-600 dark:from-indigo-700 dark:to-fuchsia-700">
                                                    {/* 背景纹理 */}
                                                    <div className="absolute inset-0 opacity-20 mix-blend-overlay">
                                                        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                                                            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                                                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                                                            </pattern>
                                                            <rect width="100" height="100" fill="url(#grid)" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            )}

                                            {/* 卡片内容 - 采用顶部标题和底部操作按钮的布局 */}
                                            <div className="absolute inset-0 p-5 sm:p-6 flex flex-col h-full">
                                                {/* 顶部区域 */}
                                                <div className="mb-auto">
                                                    {/* 优化折扣标签 - 添加微交互和改进视觉效果 */}
                                                    <motion.div
                                                        className="inline-block mb-3 bg-gradient-to-r from-fuchsia-600 to-indigo-600 dark:from-fuchsia-500 dark:to-indigo-500 text-white font-bold px-3 py-1.5 rounded-lg text-sm shadow-md"
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

                                                {/* 底部区域 - 使用毛玻璃效果 - 左右布局 */}
                                                <div className="mt-auto">
                                                    {/* 优化后的毛玻璃效果底部信息栏 - 添加品牌图标 */}
                                                    <div className="backdrop-blur-xl bg-white/15 dark:bg-white/10 rounded-xl py-2.5 px-4 shadow-lg border border-white/30 dark:border-white/20 transform transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/15">
                                                        <div className="flex flex-row items-center sm:justify-between gap-3">
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                {/* 动态品牌图标 */}
                                                                <div className="w-6 h-6 rounded-full flex-shrink-0 bg-white/20 backdrop-blur-md flex items-center justify-center">
                                                                    {card.brand ? (
                                                                        <span className="text-xs font-bold text-white">
                                                                            {card.brand.substring(0, 1).toUpperCase()}
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
                                                                        className="text-sm text-white font-medium truncate drop-shadow-sm"
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
                                                                    className="group inline-flex items-center justify-center h-8 px-3.5 sm:px-4 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-700 hover:to-indigo-700 dark:from-fuchsia-500 dark:to-indigo-500 dark:hover:from-fuchsia-600 dark:hover:to-indigo-600 text-white rounded-full text-xs sm:text-sm font-medium transition-all shadow-md hover:shadow-lg whitespace-nowrap"
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

                                            {/* 指示器 - 移至卡片顶部、更加醒目 */}
                                            <div className="absolute bottom-3 sm:bottom-4 right-4 flex gap-1.5">
                                                {promoCards.map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setActivePromo(i)}
                                                        className={`w-2 h-2 rounded-full transition-all ${activePromo === i
                                                            ? 'bg-white w-4 sm:w-5'
                                                            : 'bg-white/40 hover:bg-white/60'
                                                            }`}
                                                        aria-label={`Switch to promo card ${i + 1}`}
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
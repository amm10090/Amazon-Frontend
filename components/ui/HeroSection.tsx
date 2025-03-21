"use client";

import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';

interface Bubble {
    top: string;
    left: string;
    width: string;
    height: string;
    delay: number;
}

interface PromoCard {
    id: number;
    title: string;
    description: string;
    discount: string;
    ctaText: string;
    link: string;
}

export function HeroSection() {
    const [bubbles, setBubbles] = useState<Bubble[]>([]);
    const [activePromo, setActivePromo] = useState(0);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // 动画控制器
    const controls = useAnimation();

    // 示例促销卡片数据
    const promoCards: PromoCard[] = [
        {
            id: 1,
            title: "Flash Sale",
            description: "Kitchen Appliances Promotion",
            discount: "Up to 70% OFF",
            ctaText: "Shop Now",
            link: "/category/kitchen-appliances"
        },
        {
            id: 2,
            title: "New Arrivals",
            description: "Smart Home Device Specials",
            discount: "15% OFF First Order",
            ctaText: "Learn More",
            link: "/category/smart-home"
        },
        {
            id: 3,
            title: "Member Exclusive",
            description: "Electronics Coupon Deal",
            discount: "Extra 10% OFF",
            ctaText: "Get Coupon",
            link: "/coupons/electronics"
        }
    ];

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

        // 自动轮播促销卡片
        const interval = setInterval(() => {
            setActivePromo((prev) => (prev + 1) % promoCards.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [promoCards.length]);

    // 自动轮播促销卡片
    useEffect(() => {
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
            </defs>
        </svg>
    );

    return (
        // 突破容器限制，实现全宽设计
        <div className="relative w-[100vw] left-[calc(-50vw+50%)] right-0 -mt-5">
            {/* SVG过滤器 */}
            {svgFilters}

            {/* 渐变光晕背景 */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 dark:from-primary-dark/30 dark:to-secondary-dark/30" style={{ zIndex: 2 }}></div>

            {/* 主要内容 */}
            <div
                className="relative py-6 sm:py-8 md:py-12 lg:py-16 overflow-hidden"
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
                                        className="absolute bottom-1 sm:bottom-2 left-0 h-2 sm:h-3 bg-accent dark:bg-accent-light -z-10"
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 0.8, delay: 0.8 }}
                                    />
                                </motion.span>
                            </h1>

                            {/* 副标题 */}
                            <motion.p
                                className="text-base sm:text-lg md:text-xl text-white/80 dark:text-white/80 max-w-xl mb-6 sm:mb-8"
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
                                        className="relative inline-flex items-center justify-center w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 font-medium text-primary-dark dark:text-primary-dark bg-white hover:bg-white/90 dark:bg-white dark:hover:bg-white/90 rounded-full shadow-lg group-hover:shadow-xl transition-all z-10"
                                    >
                                        Browse All Deals

                                        {/* 动态背景球体 */}
                                        <motion.span
                                            className="absolute -top-2 -right-2 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-accent dark:bg-accent-light"
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
                                        className="inline-flex w-full sm:w-auto items-center justify-center h-12 sm:h-14 px-6 sm:px-8 font-medium text-white bg-accent hover:bg-accent-dark dark:bg-accent-light dark:hover:bg-accent dark:text-text-dark rounded-full shadow-lg hover:shadow-xl transition-all"
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
                            <div className="relative w-full max-w-md mx-auto md:ml-auto h-64 sm:h-72 md:h-80">
                                {promoCards.map((card, index) => (
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
                                        className="absolute inset-0 w-full h-full backdrop-blur-md bg-white/10 dark:bg-gray-800/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl overflow-hidden border border-white/20 dark:border-gray-700/20"
                                        style={{
                                            background: activePromo === index
                                                ? 'linear-gradient(145deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))'
                                                : 'none',
                                            display: activePromo === index ? 'block' : 'none'
                                        }}
                                    >
                                        {/* 漂浮元素装饰 */}
                                        <motion.div
                                            className="absolute -top-6 -right-6 w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-accent/20 dark:bg-accent-light/20"
                                            animate={{
                                                y: [0, 10, 0],
                                                rotate: [0, 5, 0]
                                            }}
                                            transition={{
                                                duration: 5,
                                                repeat: Infinity,
                                                repeatType: "mirror"
                                            }}
                                        />

                                        {/* 折扣标签 */}
                                        <div className="absolute top-0 right-0 bg-accent dark:bg-accent-light text-white dark:text-text-dark font-bold px-3 sm:px-4 py-1 rounded-bl-lg text-sm sm:text-base">
                                            {card.discount}
                                        </div>

                                        <motion.h3
                                            className="text-xl sm:text-2xl font-bold text-white dark:text-white mb-2 sm:mb-3"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            {card.title}
                                        </motion.h3>

                                        <motion.p
                                            className="text-sm sm:text-base text-white/90 dark:text-white/90 mb-4 sm:mb-6"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            {card.description}
                                        </motion.p>

                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <Link
                                                href={card.link}
                                                className="inline-block px-4 sm:px-6 py-2 sm:py-2.5 bg-white/20 hover:bg-white/30 dark:bg-white/20 dark:hover:bg-white/30 backdrop-blur-sm text-white rounded-full text-xs sm:text-sm font-medium transition-colors border border-white/30 dark:border-white/10"
                                            >
                                                {card.ctaText}
                                            </Link>
                                        </motion.div>

                                        {/* 指示器 */}
                                        <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 flex justify-center gap-2">
                                            {promoCards.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setActivePromo(i)}
                                                    className={`w-2 h-2 rounded-full transition-all ${activePromo === i
                                                        ? 'bg-white w-3 sm:w-4'
                                                        : 'bg-white/40'
                                                        }`}
                                                    aria-label={`Switch to promo card ${i + 1}`}
                                                />
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
} 
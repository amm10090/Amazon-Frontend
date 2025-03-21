"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { productsApi } from '@/lib/api';
import type { Product } from '@/types/api';
import { useUserStore } from '@/store';
import Link from 'next/link';
import Image from 'next/image';

interface RecommendationCarouselProps {
    limit?: number;
    title?: string;
    className?: string;
}

export function RecommendationCarousel({
    limit = 6,
    title = "为你推荐",
    className = ""
}: RecommendationCarouselProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [autoPlay, setAutoPlay] = useState(true);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const favorites = useUserStore((state) => state.favorites);

    // 获取推荐商品
    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                setLoading(true);
                // 通过API获取推荐商品，这里可以根据用户收藏或浏览历史进行筛选
                const response = await productsApi.getProducts({
                    limit,
                    sort: 'discount',
                    order: 'desc',
                    min_discount: 30
                });

                if (response.data?.data?.items) {
                    setProducts(response.data.data.items);
                }
            } catch (err) {
                console.error('获取推荐商品失败:', err);
                setError('无法加载推荐商品，请稍后再试');
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [limit]);

    // 自动轮播
    useEffect(() => {
        if (autoPlay && products.length > 0) {
            timerRef.current = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
            }, 5000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [autoPlay, products.length]);

    // 处理鼠标悬停，暂停自动轮播
    const handleMouseEnter = () => setAutoPlay(false);
    const handleMouseLeave = () => setAutoPlay(true);

    // 处理手动切换
    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + products.length) % products.length);
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
    };

    const handleDotClick = (index: number) => {
        setCurrentIndex(index);
    };

    // 动画变体
    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0
        })
    };

    // 卡通图标列表
    const cartoonIcons = [
        { emoji: '🎁', text: '超值礼物' },
        { emoji: '💰', text: '省钱助手' },
        { emoji: '🔥', text: '热门好物' },
        { emoji: '✨', text: '精选推荐' },
        { emoji: '🎯', text: '为你挑选' },
        { emoji: '🛒', text: '购物必看' }
    ];

    // 随机为商品分配卡通图标
    const getRandomIcon = (productId: string) => {
        const hashCode = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return cartoonIcons[hashCode % cartoonIcons.length];
    };

    if (loading) {
        return (
            <div className={`bg-gradient-to-r from-secondary-light/20 to-primary-light/20 rounded-xl p-6 animate-pulse ${className}`}>
                <div className="h-8 w-48 bg-gray-300 rounded mb-4"></div>
                <div className="flex space-x-4">
                    <div className="h-64 w-full bg-gray-300 rounded-lg"></div>
                </div>
            </div>
        );
    }

    if (error || products.length === 0) {
        return (
            <div className={`bg-gradient-to-r from-secondary-light/20 to-primary-light/20 rounded-xl p-6 ${className}`}>
                <h2 className="text-xl font-bold mb-4 text-primary">{title}</h2>
                <div className="flex justify-center items-center h-64">
                    <p className="text-text-light">{error || '暂无推荐商品'}</p>
                </div>
            </div>
        );
    }

    // 计算显示的点的数量，最多显示5个
    const maxDots = 5;
    const visibleDots = products.length > maxDots ? maxDots : products.length;

    return (
        <div
            className={`bg-gradient-to-r from-secondary-light/20 to-primary-light/20 rounded-xl p-6 ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <motion.div
                        animate={{ rotate: [0, 10, 0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="mr-2 text-2xl"
                    >
                        {getRandomIcon(products[currentIndex]?.id || '').emoji}
                    </motion.div>
                    <h2 className="text-xl font-bold text-primary">{title}</h2>
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={handlePrev}
                        className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                        ←
                    </button>
                    <button
                        onClick={handleNext}
                        className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                        →
                    </button>
                </div>
            </div>

            <div className="relative overflow-hidden rounded-lg h-[350px]">
                <AnimatePresence initial={false} custom={1}>
                    <motion.div
                        key={currentIndex}
                        custom={1}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
                            {/* 当前显示的商品 */}
                            <Link href={`/products/${products[currentIndex].id}`} className="block h-full">
                                <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col transform hover:scale-[1.02] transition-transform">
                                    <div className="relative h-48 bg-gray-100">
                                        <Image
                                            src={products[currentIndex].image_url}
                                            alt={products[currentIndex].title}
                                            fill
                                            className="object-contain"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            priority
                                        />
                                        {/* 卡通标签 */}
                                        <div className="absolute top-3 right-3">
                                            <motion.div
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                className="bg-accent text-text-dark px-3 py-1 rounded-full text-sm font-medium shadow-md flex items-center"
                                            >
                                                {getRandomIcon(products[currentIndex].id).emoji} {getRandomIcon(products[currentIndex].id).text}
                                            </motion.div>
                                        </div>
                                        {/* 折扣标签 */}
                                        {products[currentIndex].discount_rate > 0 && (
                                            <div className="absolute top-3 left-3">
                                                <div className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                                                    -{Math.round(products[currentIndex].discount_rate)}%
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 flex-grow flex flex-col">
                                        <h3 className="text-lg font-medium line-clamp-2 mb-2 flex-grow">
                                            {products[currentIndex].title}
                                        </h3>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xl font-bold text-primary">
                                                ¥{products[currentIndex].price.toFixed(2)}
                                            </span>
                                            {products[currentIndex].original_price > products[currentIndex].price && (
                                                <span className="text-sm text-text-light line-through">
                                                    ¥{products[currentIndex].original_price.toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            {/* 预览下一个商品 */}
                            {products.length > 1 && (
                                <div className="hidden md:block">
                                    <Link href={`/products/${products[(currentIndex + 1) % products.length].id}`} className="block h-full">
                                        <div className="bg-white/80 rounded-lg shadow-sm overflow-hidden h-full flex flex-col transform hover:scale-[1.02] transition-transform opacity-70 hover:opacity-100">
                                            <div className="relative h-48 bg-gray-100">
                                                <Image
                                                    src={products[(currentIndex + 1) % products.length].image_url}
                                                    alt={products[(currentIndex + 1) % products.length].title}
                                                    fill
                                                    className="object-contain"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <h3 className="text-lg font-medium line-clamp-1">
                                                    {products[(currentIndex + 1) % products.length].title}
                                                </h3>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            )}

                            {/* 预览下下个商品 */}
                            {products.length > 2 && (
                                <div className="hidden lg:block">
                                    <Link href={`/products/${products[(currentIndex + 2) % products.length].id}`} className="block h-full">
                                        <div className="bg-white/60 rounded-lg shadow-sm overflow-hidden h-full flex flex-col transform hover:scale-[1.02] transition-transform opacity-50 hover:opacity-90">
                                            <div className="relative h-48 bg-gray-100">
                                                <Image
                                                    src={products[(currentIndex + 2) % products.length].image_url}
                                                    alt={products[(currentIndex + 2) % products.length].title}
                                                    fill
                                                    className="object-contain"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <h3 className="text-lg font-medium line-clamp-1">
                                                    {products[(currentIndex + 2) % products.length].title}
                                                </h3>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* 底部导航点 */}
            <div className="flex justify-center space-x-2 mt-4">
                {Array.from({ length: visibleDots }).map((_, i) => {
                    // 如果商品数量超过最大点数，需要映射索引
                    const dotIndex = products.length > maxDots
                        ? Math.floor((i / maxDots) * products.length)
                        : i;

                    return (
                        <motion.button
                            key={i}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDotClick(dotIndex)}
                            className={`w-3 h-3 rounded-full ${currentIndex === dotIndex ? 'bg-primary' : 'bg-gray-300'
                                }`}
                        />
                    );
                })}
            </div>
        </div>
    );
} 
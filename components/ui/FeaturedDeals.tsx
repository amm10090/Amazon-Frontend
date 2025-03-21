"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { productsApi } from '@/lib/api';
import { Product } from '@/types/api';
import { CountdownTimer } from './CountdownTimer';
import Link from 'next/link';
import Image from 'next/image';

interface FeaturedDealsProps {
    limit?: number;
    className?: string;
}

export function FeaturedDeals({ limit = 4, className = '' }: FeaturedDealsProps) {
    const [deals, setDeals] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 计算24小时后的时间作为结束时间
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 24);

    // 获取限时特惠商品
    useEffect(() => {
        const fetchDeals = async () => {
            try {
                setLoading(true);
                const response = await productsApi.getDeals({
                    limit,
                    active: true
                });

                if (response.data?.data?.items) {
                    setDeals(response.data.data.items);
                }
            } catch (err) {
                console.error('获取限时特惠商品失败:', err);
                setError('无法加载限时特惠商品，请稍后再试');
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
            <div className={`bg-gradient-to-r from-primary-light/10 to-secondary-light/10 rounded-xl p-6 animate-pulse ${className}`}>
                <div className="h-8 w-48 bg-gray-300 rounded mb-4"></div>
                <div className="h-16 w-64 bg-gray-300 rounded mx-auto mb-6"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(limit)].map((_, i) => (
                        <div key={i} className="h-64 bg-gray-300 rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || deals.length === 0) {
        return (
            <div className={`bg-gradient-to-r from-primary-light/10 to-secondary-light/10 rounded-xl p-6 ${className}`}>
                <h2 className="text-2xl font-bold mb-4 text-primary text-center">限时抢购</h2>
                <div className="flex justify-center items-center h-64">
                    <p className="text-text-light">{error || '暂无限时特惠商品'}</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className={`bg-gradient-to-r from-primary-light/10 to-secondary-light/10 rounded-xl p-6 ${className}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.h2
                className="text-2xl font-bold mb-4 text-primary text-center"
                variants={itemVariants}
            >
                限时抢购
            </motion.h2>

            <motion.div
                className="mx-auto mb-8 max-w-sm"
                variants={itemVariants}
            >
                <CountdownTimer endTime={endTime} />
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {deals.map((deal, index) => (
                    <motion.div
                        key={deal.id}
                        variants={itemVariants}
                        custom={index}
                        className="relative"
                    >
                        <Link href={`/products/${deal.id}`} className="block">
                            <motion.div
                                className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col"
                                whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* 闪电图标 */}
                                <div className="absolute top-3 left-3 z-10">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="bg-accent text-text-dark px-3 py-1 rounded-full text-sm font-bold shadow-neon-lemon flex items-center"
                                    >
                                        ⚡ 闪购
                                    </motion.div>
                                </div>

                                {/* 折扣标签 */}
                                {deal.discount_rate > 0 && (
                                    <div className="absolute top-3 right-3 z-10">
                                        <motion.div
                                            initial={{ rotate: -5 }}
                                            animate={{ rotate: 5 }}
                                            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                                            className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold shadow-neon"
                                        >
                                            -{Math.round(deal.discount_rate)}%
                                        </motion.div>
                                    </div>
                                )}

                                {/* 商品图片 */}
                                <div className="relative w-full h-48 bg-gray-100">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className="h-full w-full"
                                    >
                                        <Image
                                            src={deal.image_url}
                                            alt={deal.title}
                                            fill
                                            className="object-contain"
                                            sizes="(max-width: 768px) 100vw, 300px"
                                            priority
                                        />
                                    </motion.div>
                                </div>

                                {/* 商品信息 */}
                                <div className="p-4 flex-grow flex flex-col">
                                    <h3 className="text-lg font-medium line-clamp-2 mb-2 flex-grow text-text">
                                        {deal.title}
                                    </h3>

                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xl font-bold text-primary">
                                            ¥{deal.price.toFixed(2)}
                                        </span>
                                        {deal.original_price > deal.price && (
                                            <span className="text-sm text-text-light line-through">
                                                ¥{deal.original_price.toFixed(2)}
                                            </span>
                                        )}
                                    </div>

                                    {/* 进度条 */}
                                    {deal.remaining_quantity !== undefined && (
                                        <div className="mt-3">
                                            <div className="flex justify-between text-xs text-text-light mb-1">
                                                <span>已售 {Math.round((1 - deal.remaining_quantity / 100) * 100)}%</span>
                                                <span>剩余 {deal.remaining_quantity}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-primary rounded-full"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(1 - deal.remaining_quantity / 100) * 100}%` }}
                                                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 购买按钮 */}
                                <div className="px-4 pb-4">
                                    <motion.div
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="w-full py-2 bg-primary text-white text-center rounded-full font-medium shadow-md hover:bg-primary-dark transition-colors"
                                    >
                                        立即抢购
                                    </motion.div>
                                </div>
                            </motion.div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
} 
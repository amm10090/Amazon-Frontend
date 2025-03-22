"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useDeals } from '@/lib/hooks';
import ProductCard from '@/components/product/ProductCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { useEffect, useState } from 'react';
import { adaptProductData } from '@/lib/utils';

// 动画变体
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function DealsPage() {
    const [isDebugMode, setIsDebugMode] = useState(false);

    const { data: deals, isLoading, isError } = useDeals({
        limit: 40,
        active: true
    });

    // 开启调试模式的键盘快捷键
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+Alt+D 组合键开启/关闭调试模式
            if (e.ctrlKey && e.altKey && e.key === 'd') {
                setIsDebugMode(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    if (isError) {
        return <ErrorMessage message="加载特惠数据时出错" />;
    }

    // 计算剩余时间 (示例函数)
    const getTimeRemaining = (endTimeStr?: string) => {
        if (!endTimeStr) return null;

        const endTime = new Date(endTimeStr);
        const now = new Date();
        const diff = endTime.getTime() - now.getTime();

        if (diff <= 0) return { expired: true };

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return { days, hours, minutes, expired: false };
    };

    return (
        <div className="min-h-screen py-8 px-4">
            {/* 调试面板 */}
            {isDebugMode && (
                <div className="fixed top-20 right-4 z-50 w-96 max-w-full">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                        <h2 className="text-lg font-semibold mb-2">API 调试面板</h2>
                        <p className="text-xs text-gray-500 mb-4">按 Ctrl+Alt+D 关闭</p>
                        <ApiDebugger data={deals} title="特惠商品数据" initialExpanded={true} />
                    </div>
                </div>
            )}

            <div className="container mx-auto">
                {/* 英雄区域 */}
                <section className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative bg-gradient-primary rounded-xl py-16 px-8 text-center text-white overflow-hidden"
                    >
                        <h1 className="text-4xl font-bold mb-4">限时特惠</h1>
                        <p className="text-xl opacity-90 mb-6">
                            精选商品，限时折扣，把握优惠机会
                        </p>
                        <div className="absolute inset-0 -z-10 opacity-20">
                            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full filter blur-3xl"></div>
                            <div className="absolute bottom-0 right-0 w-60 h-60 bg-yellow-300 rounded-full filter blur-3xl"></div>
                        </div>
                    </motion.div>
                </section>

                {/* 商品列表 */}
                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        <AnimatePresence mode="wait">
                            {deals?.map((product) => (
                                <motion.div
                                    key={product.id}
                                    variants={itemVariants}
                                    layout
                                >
                                    <ProductCard product={adaptProductData(product)} />

                                    {/* 如果有结束时间，显示倒计时 */}
                                    {product.end_time && (
                                        <div className="mt-2 text-center">
                                            {(() => {
                                                const timeLeft = getTimeRemaining(product.end_time);
                                                if (!timeLeft) return null;

                                                if (timeLeft.expired) {
                                                    return <span className="text-red-500 text-sm font-medium">优惠已结束</span>;
                                                }

                                                return (
                                                    <span className="text-primary text-sm font-medium">
                                                        剩余时间: {timeLeft.days}天 {timeLeft.hours}小时 {timeLeft.minutes}分钟
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* 无数据提示 */}
                {!isLoading && (!deals || deals.length === 0) && (
                    <div className="text-center py-16">
                        <h3 className="text-xl font-medium text-gray-500">当前没有限时特惠商品</h3>
                        <p className="mt-2 text-gray-400">请稍后再来查看</p>
                    </div>
                )}
            </div>
        </div>
    );
} 
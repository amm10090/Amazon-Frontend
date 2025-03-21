"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { formatPrice, calculateDiscount } from '@/lib/utils';

interface ProductCardProps {
    product: {
        id: string;
        title: string;
        image_url: string;
        current_price: number;
        original_price: number;
        discount_rate?: number;
        prime_eligible?: boolean;
        product_url?: string;
    };
    showActions?: boolean;
    isNew?: boolean;
}

export default function ProductCard({ product, showActions = false, isNew = false }: ProductCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const discount = product.discount_rate || calculateDiscount(product.original_price, product.current_price);

    return (
        <motion.div
            whileHover={{ y: -8 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="group relative bg-background rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300"
        >
            <Link href={`/product/${product.id}`} className="block">
                {/* 新品标签 */}
                {isNew && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 left-4 z-10"
                    >
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                            新品
                        </div>
                    </motion.div>
                )}

                {/* 折扣标签 */}
                {discount > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4 z-10"
                    >
                        <div className="bg-accent text-text font-bold px-3 py-1 rounded-full text-sm">
                            -{Math.round(discount)}%
                        </div>
                    </motion.div>
                )}

                {/* Prime标签 */}
                {product.prime_eligible && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`absolute ${isNew ? 'top-16' : 'top-4'} left-4 z-10`}
                    >
                        <div className="bg-[#00A8E1] text-white px-3 py-1 rounded-full text-sm">
                            Prime
                        </div>
                    </motion.div>
                )}

                {/* 商品图片 */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <motion.div
                        animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full"
                    >
                        <Image
                            src={product.image_url}
                            alt={product.title}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            priority
                        />
                    </motion.div>
                </div>

                {/* 商品信息 */}
                <div className="p-4">
                    <h3 className="text-lg font-medium line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {product.title}
                    </h3>

                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-primary">
                            {formatPrice(product.current_price)}
                        </span>
                        {product.original_price > product.current_price && (
                            <span className="text-sm text-text-light line-through">
                                {formatPrice(product.original_price)}
                            </span>
                        )}
                    </div>
                </div>

                {/* 悬浮效果 */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    className="absolute inset-0 bg-gradient-primary opacity-10 pointer-events-none"
                />
            </Link>

            {/* 快捷操作按钮 */}
            {showActions && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex justify-center space-x-2">
                        <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href={product.product_url || `https://amazon.com/dp/${product.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                            查看详情
                        </motion.a>
                    </div>
                </div>
            )}
        </motion.div>
    );
} 
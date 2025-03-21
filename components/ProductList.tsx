"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types';

interface ProductListProps {
    products: Product[];
    renderProduct: (product: Product) => React.ReactNode;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

// 动画变量
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

export default function ProductList({
    products,
    renderProduct,
    currentPage,
    totalPages,
    onPageChange
}: ProductListProps) {
    if (!products || products.length === 0) {
        return null; // 空状态由父组件ApiStateWrapper处理
    }

    return (
        <div className="space-y-8">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
                <AnimatePresence mode="wait">
                    {products.map((product) => (
                        <motion.div
                            key={product.id}
                            variants={itemVariants}
                            layout
                        >
                            {renderProduct(product)}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* 分页控制 */}
            {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className={`px-4 py-2 rounded-lg ${currentPage <= 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                        >
                            上一页
                        </button>

                        <div className="flex items-center space-x-1">
                            {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                                let pageNum = currentPage <= 3
                                    ? idx + 1
                                    : currentPage + idx - 2;

                                if (pageNum > totalPages) return null;

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => onPageChange(pageNum)}
                                        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${currentPage === pageNum
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            {totalPages > 5 && currentPage < totalPages - 2 && (
                                <>
                                    <span className="px-1">...</span>
                                    <button
                                        onClick={() => onPageChange(totalPages)}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200"
                                    >
                                        {totalPages}
                                    </button>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            className={`px-4 py-2 rounded-lg ${currentPage >= totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                        >
                            下一页
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComponentProduct } from '@/types';

interface ProductListProps {
    products: ComponentProduct[];
    renderProduct: (product: ComponentProduct) => React.ReactNode;
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
        <div className="space-y-6 md:space-y-8">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
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

            {/* 分页控制 - 移动端优化 */}
            {totalPages > 1 && (
                <div className="mt-8 md:mt-12 flex justify-center">
                    <div className="flex flex-wrap justify-center gap-2">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base ${currentPage <= 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                        >
                            <span className="hidden sm:inline">Previous</span>
                            <span className="sm:hidden">←</span>
                        </button>

                        <div className="flex items-center gap-1 md:gap-2">
                            {/* 当页码大于3时，显示第1页链接和省略号 */}
                            {currentPage > 3 && (
                                <>
                                    <button
                                        onClick={() => onPageChange(1)}
                                        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-sm md:text-base"
                                    >
                                        1
                                    </button>
                                    <span className="px-1">...</span>
                                </>
                            )}

                            {/* 移动端显示较少页码，平板和桌面端显示更多 */}
                            {[...Array(window.innerWidth < 640 ? Math.min(3, totalPages) : Math.min(5, totalPages))].map((_, idx) => {
                                let pageNum = currentPage <= 3
                                    ? idx + 1
                                    : currentPage + idx - (window.innerWidth < 640 ? 1 : 2);

                                if (pageNum > totalPages) return null;

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => onPageChange(pageNum)}
                                        className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition-all text-sm md:text-base ${currentPage === pageNum
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
                                        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-sm md:text-base"
                                    >
                                        {totalPages}
                                    </button>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base ${currentPage >= totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                        >
                            <span className="hidden sm:inline">Next</span>
                            <span className="sm:hidden">→</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

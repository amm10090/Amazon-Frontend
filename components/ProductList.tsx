"use client";

import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

import type { ComponentProduct } from '@/types';

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
                className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 md:gap-6"
            >
                <AnimatePresence mode="wait">
                    {products.map((product) => (
                        <motion.div
                            key={product.id}
                            variants={itemVariants}
                            layout
                            className="h-full grid-item"
                        >
                            {renderProduct(product)}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* 分页控制 - 移动端优化 */}
            {totalPages > 1 && (
                <div className="mt-6 md:mt-10 flex justify-center">
                    <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm md:text-base ${currentPage <= 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
                                }`}
                            aria-label="Previous page"
                        >
                            <span className="hidden sm:inline">Previous</span>
                            <span className="sm:hidden">←</span>
                        </button>

                        <div className="flex items-center gap-1 md:gap-2">
                            {/* 当页码大于2时，显示第1页链接和省略号 */}
                            {currentPage > 2 && (
                                <>
                                    <button
                                        onClick={() => onPageChange(1)}
                                        className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white text-xs sm:text-sm md:text-base"
                                        aria-label="Go to page 1"
                                    >
                                        1
                                    </button>
                                    {currentPage > 3 && (
                                        <span className="px-1 text-gray-500 dark:text-gray-400">...</span>
                                    )}
                                </>
                            )}

                            {/* 动态计算要显示的页码 */}
                            {(() => {
                                // 在小屏幕上展示较少页码
                                const maxDisplayedPages = window.innerWidth < 640 ? 3 : 5;
                                let startPage = Math.max(1, currentPage - Math.floor(maxDisplayedPages / 2));
                                const endPage = Math.min(totalPages, startPage + maxDisplayedPages - 1);

                                // 如果不能显示最大页数，则调整起始页
                                if (endPage - startPage + 1 < maxDisplayedPages && startPage > 1) {
                                    startPage = Math.max(1, endPage - maxDisplayedPages + 1);
                                }

                                return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(pageNum => (
                                    <button
                                        key={pageNum}
                                        onClick={() => onPageChange(pageNum)}
                                        className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg transition-all text-xs sm:text-sm md:text-base ${currentPage === pageNum
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
                                            }`}
                                        aria-label={`Go to page ${pageNum}`}
                                        aria-current={currentPage === pageNum ? 'page' : undefined}
                                    >
                                        {pageNum}
                                    </button>
                                ));
                            })()}

                            {/* 如果总页数大于显示的页码范围，且当前页不接近最后一页，显示省略号和最后一页 */}
                            {currentPage < totalPages - 2 && (
                                <>
                                    {currentPage < totalPages - 3 && (
                                        <span className="px-1 text-gray-500 dark:text-gray-400">...</span>
                                    )}
                                    <button
                                        onClick={() => onPageChange(totalPages)}
                                        className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white text-xs sm:text-sm md:text-base"
                                        aria-label={`Go to page ${totalPages}`}
                                    >
                                        {totalPages}
                                    </button>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm md:text-base ${currentPage >= totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
                                }`}
                            aria-label="Next page"
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

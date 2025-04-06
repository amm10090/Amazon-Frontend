import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

const Pagination = ({ currentPage, totalPages, onPageChange, className = '' }: PaginationProps) => {
    const [maxDisplayedPages, setMaxDisplayedPages] = useState(5);

    // 响应窗口大小变化，调整显示的页码数量
    useEffect(() => {
        const handleResize = () => {
            setMaxDisplayedPages(window.innerWidth < 640 ? 3 : 5);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (totalPages <= 1) return null;

    return (
        <div className={`mt-6 md:mt-10 flex justify-center ${className}`}>
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                {/* 上一页按钮 */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
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
                </motion.button>

                <div className="flex items-center gap-1 md:gap-2">
                    {/* 当页码大于2时，显示第1页链接和省略号 */}
                    {currentPage > 2 && (
                        <>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onPageChange(1)}
                                className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white text-xs sm:text-sm md:text-base"
                                aria-label="Go to page 1"
                            >
                                1
                            </motion.button>
                            {currentPage > 3 && (
                                <span className="px-1 text-gray-500 dark:text-gray-400">...</span>
                            )}
                        </>
                    )}

                    {/* 动态计算要显示的页码 */}
                    {(() => {
                        let startPage = Math.max(1, currentPage - Math.floor(maxDisplayedPages / 2));
                        const endPage = Math.min(totalPages, startPage + maxDisplayedPages - 1);

                        // 如果不能显示最大页数，则调整起始页
                        if (endPage - startPage + 1 < maxDisplayedPages && startPage > 1) {
                            startPage = Math.max(1, endPage - maxDisplayedPages + 1);
                        }

                        return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(pageNum => (
                            <motion.button
                                key={pageNum}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onPageChange(pageNum)}
                                className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg transition-all text-xs sm:text-sm md:text-base ${currentPage === pageNum
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
                                    }`}
                                aria-label={`Go to page ${pageNum}`}
                                aria-current={currentPage === pageNum ? 'page' : undefined}
                            >
                                {pageNum}
                            </motion.button>
                        ));
                    })()}

                    {/* 如果总页数大于显示的页码范围，且当前页不接近最后一页，显示省略号和最后一页 */}
                    {currentPage < totalPages - 2 && (
                        <>
                            {currentPage < totalPages - 3 && (
                                <span className="px-1 text-gray-500 dark:text-gray-400">...</span>
                            )}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onPageChange(totalPages)}
                                className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white text-xs sm:text-sm md:text-base"
                                aria-label={`Go to page ${totalPages}`}
                            >
                                {totalPages}
                            </motion.button>
                        </>
                    )}
                </div>

                {/* 下一页按钮 */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
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
                </motion.button>
            </div>
        </div>
    );
};

export default Pagination; 
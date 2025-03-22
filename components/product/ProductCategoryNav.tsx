import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCategoryStats } from '@/lib/hooks';
import axios from 'axios';

type ProductCategoryNavProps = {
    selectedCategory: string;
    onCategorySelect: (category: string) => void;
};

// 动画变体配置
const variants = {
    container: {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    },
    item: {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
        hover: { scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }
    }
};

export function ProductCategoryNav({
    selectedCategory,
    onCategorySelect
}: ProductCategoryNavProps) {
    const [showAll, setShowAll] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const { data, isLoading, isError } = useCategoryStats({
        sort_by: 'count',
        sort_order: 'desc',
        page_size: 50
    });

    const [directData, setDirectData] = useState<any>(null);
    const [directLoading, setDirectLoading] = useState(false);

    // 检测设备类型
    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // 初次加载检测
        checkIsMobile();

        // 监听窗口大小变化
        window.addEventListener('resize', checkIsMobile);

        // 清理函数
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    // If SWR fetch fails, use axios directly
    useEffect(() => {
        const fetchDirectlyIfNeeded = async () => {
            if ((isError || (!data && !isLoading)) && !directData && !directLoading) {
                try {
                    console.log('Attempting to fetch category stats directly');
                    setDirectLoading(true);

                    const response = await axios.get('/api/categories/stats', {
                        params: {
                            sort_by: 'count',
                            sort_order: 'desc',
                            page: 1,
                            page_size: 50
                        }
                    });
                    console.log('Directly fetched category data:', response.data);
                    setDirectData(response.data);
                } catch (err) {
                    console.error('Failed to fetch category data directly:', err);
                } finally {
                    setDirectLoading(false);
                }
            }
        };

        fetchDirectlyIfNeeded();
    }, [isError, data, isLoading, directData]);

    // Get category data, prioritize SWR data, if not available use directly fetched data
    const categoryData = data || (directData?.data);
    const productGroups = categoryData?.product_groups || {};

    // Get category list and sort by product count
    const categories = Object.entries(productGroups)
        .map(([name, count]) => ({
            name,
            count: Number(count)
        }))
        .sort((a, b) => b.count - a.count);

    // 确定显示的类别 - 移动端显示全部，桌面端根据展开状态决定
    const visibleCategories = isMobile ? categories : (showAll ? categories : categories.slice(0, 8));

    // 判断是否为桌面端且未展开状态
    const isDesktopCollapsed = !isMobile && !showAll;

    // Handle click on "All" button
    const handleAllClick = () => {
        onCategorySelect('');
    };

    // Handle click on category button
    const handleCategorySelect = (category: string) => {
        onCategorySelect(category);
    };

    // Toggle show more/less
    const toggleShowAll = () => {
        setShowAll(!showAll);
    };

    if (isLoading || directLoading) {
        return (
            <div className="py-6 overflow-x-auto scrollbar-hide">
                <div className="animate-pulse flex space-x-3 pb-2">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full w-28 flex-shrink-0"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`py-4 ${isMobile ? 'overflow-x-auto scrollbar-hide' : ''}`}>
            <motion.div
                className={`flex items-center gap-2 pb-2 ${isMobile ? 'flex-nowrap' : isDesktopCollapsed ? 'flex-wrap justify-between' : 'flex-wrap'}`}
                variants={variants.container}
                initial="hidden"
                animate="show"
            >
                <motion.button
                    variants={variants.item}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center h-10 flex-shrink-0 min-w-[80px] ${selectedCategory === ''
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                        }`}
                    onClick={handleAllClick}
                >
                    <span className="mr-1">🏠</span>
                    All
                </motion.button>

                <div className={`flex ${isDesktopCollapsed ? 'flex-1 justify-between' : 'flex-wrap gap-2'}`}>
                    <AnimatePresence mode="popLayout">
                        {visibleCategories.map((category, index) => (
                            <motion.button
                                key={category.name}
                                variants={variants.item}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`px-3 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center h-10 
                                ${isDesktopCollapsed ? 'flex-1 mx-1 min-w-[90px] max-w-[150px]' : 'flex-shrink-0'} 
                                ${selectedCategory === category.name
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                onClick={() => handleCategorySelect(category.name)}
                                layout
                            >
                                <span className="truncate max-w-[120px]">{category.name}</span>
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>

                {!isMobile && categories.length > 8 && (
                    <motion.button
                        variants={variants.item}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center h-10 bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-gray-700 dark:text-indigo-300 dark:hover:bg-gray-600 shadow-md flex-shrink-0"
                        onClick={toggleShowAll}
                    >
                        {showAll ? "Collapse ↑" : "Expand All ↓"}
                    </motion.button>
                )}
            </motion.div>
        </div>
    );
} 
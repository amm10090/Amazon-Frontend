import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCategoryStats } from '@/lib/hooks';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';

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

// 按字母分组分类
const groupCategoriesByAlphabet = (categories: Array<{ name: string, count: number }>) => {
    const groups: Record<string, Array<{ name: string, count: number }>> = {};

    // 对分类按首字母分组
    categories.forEach(category => {
        // 获取首字母并转为大写
        const firstLetter = category.name.charAt(0).toUpperCase();
        // 如果该字母组不存在，则创建
        if (!groups[firstLetter]) {
            groups[firstLetter] = [];
        }
        // 将分类添加到对应字母组
        groups[firstLetter].push(category);
    });

    // 按字母顺序排序
    return Object.entries(groups)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([letter, categories]) => ({
            letter,
            categories
        }));
};

// 字母索引组件
const AlphabetIndex = ({
    groups,
    onSelectLetter,
    activeLetter
}: {
    groups: Array<{ letter: string, categories: Array<{ name: string, count: number }> }>,
    onSelectLetter: (letter: string) => void,
    activeLetter: string | null
}) => {
    return (
        <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 border-b border-gray-200 dark:border-gray-700">
            <div className="flex overflow-x-auto py-3 px-4 no-scrollbar">
                {groups.map(({ letter }) => (
                    <button
                        key={letter}
                        className={`
                            min-w-[36px] h-9 flex items-center justify-center text-sm font-medium 
                            rounded-md mx-1 transition-colors duration-200
                            ${activeLetter === letter
                                ? 'bg-indigo-100 text-indigo-600 dark:bg-gray-800 dark:text-indigo-400'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}
                        `}
                        onClick={() => onSelectLetter(letter)}
                    >
                        {letter}
                    </button>
                ))}
            </div>
        </div>
    );
};

// 分类组组件
const CategoryGroups = ({
    groups,
    selectedCategory,
    onCategorySelect
}: {
    groups: Array<{ letter: string, categories: Array<{ name: string, count: number }> }>,
    selectedCategory: string,
    onCategorySelect: (category: string) => void
}) => {
    return (
        <div className="px-4 pb-8 overflow-y-auto">
            {groups.map(({ letter, categories }) => (
                <div key={letter} id={`group-${letter}`} className="mb-6">
                    <h3 className="text-lg font-bold mb-3 sticky top-[60px] bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm py-2 z-[5]">
                        {letter}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                        {categories.map(category => (
                            <motion.button
                                key={category.name}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`
                                    px-3 py-2 rounded-lg text-sm font-medium 
                                    transition-all duration-200 flex items-center justify-between
                                    ${selectedCategory === category.name
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                                    }
                                `}
                                onClick={() => onCategorySelect(category.name)}
                            >
                                <span className="truncate flex-1 text-left">{category.name}</span>
                                <span className="ml-1 text-xs opacity-70 flex-shrink-0">({category.count})</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export function ProductCategoryNav({
    selectedCategory,
    onCategorySelect
}: ProductCategoryNavProps) {
    const [showAll, setShowAll] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    // 使用useRef记住上一次通过点击设置的分类
    const lastSelectedCategoryRef = useRef('');
    // 添加一个ref来标记组件是否已挂载
    const isMountedRef = useRef(false);

    // 从URL中读取分类参数，优先级：category > product_groups > props中的selectedCategory
    const categoryFromUrl = searchParams.get('category') || searchParams.get('product_groups') || '';
    // 如果URL中有分类参数，则使用URL中的参数，否则使用props中传入的参数
    const actualSelectedCategory = categoryFromUrl || selectedCategory;

    // 只在组件初始挂载时从URL更新分类，避免循环调用
    useEffect(() => {
        // 如果已经挂载过，则跳过
        if (isMountedRef.current) return;

        // 标记为已挂载
        isMountedRef.current = true;

        // 只在URL有分类参数，且与当前选中分类不同时更新父组件状态
        if (categoryFromUrl && categoryFromUrl !== selectedCategory) {
            console.log('组件挂载时，从URL加载分类:', categoryFromUrl);
            onCategorySelect(categoryFromUrl);
        }
    }, [categoryFromUrl, selectedCategory, onCategorySelect]);

    const { data, isLoading, isError } = useCategoryStats({
        sort_by: 'count',
        sort_order: 'desc',
        page_size: 50
    });

    const [directData, setDirectData] = useState<any>(null);
    const [directLoading, setDirectLoading] = useState(false);

    // 检测设备类型
    useEffect(() => {
        const checkDeviceType = () => {
            setIsMobile(window.innerWidth < 640);
            setIsTablet(window.innerWidth >= 640 && window.innerWidth < 768);
        };

        // 初次加载检测
        checkDeviceType();

        // 监听窗口大小变化
        window.addEventListener('resize', checkDeviceType);

        // 清理函数
        return () => window.removeEventListener('resize', checkDeviceType);
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

    // 按字母分组分类
    const groupedCategories = useMemo(() => {
        return groupCategoriesByAlphabet(categories);
    }, [categories]);

    // 显示的类别数量 - 根据设备类型决定
    const mobileLimit = 9;
    const tabletLimit = 12;
    const desktopLimit = 8;

    // 确定显示的类别
    const getVisibleCategories = useCallback(() => {
        if (isMobile) {
            return showAll ? categories : categories.slice(0, mobileLimit);
        } else if (isTablet) {
            return showAll ? categories : categories.slice(0, tabletLimit);
        } else {
            return showAll ? categories : categories.slice(0, desktopLimit);
        }
    }, [categories, isMobile, isTablet, showAll, mobileLimit, tabletLimit, desktopLimit]);

    const visibleCategories = useMemo(() => getVisibleCategories(), [getVisibleCategories]);

    // 根据设备类型判断是否应当显示展开按钮
    const shouldShowExpandButton = useCallback(() => {
        if (isMobile && categories.length > mobileLimit) return true;
        if (isTablet && categories.length > tabletLimit) return true;
        if (!isMobile && !isTablet && categories.length > desktopLimit) return true;
        return false;
    }, [categories.length, isMobile, isTablet, mobileLimit, tabletLimit, desktopLimit]);

    // Handle click on "All" button
    const handleAllClick = useCallback(() => {
        console.log('点击全部分类按钮');

        // 记住这次选择的分类
        lastSelectedCategoryRef.current = '';

        // 构建新的URL
        const params = new URLSearchParams(window.location.search);
        // 清除分类参数
        params.delete('product_groups');
        params.delete('category');
        params.set('page', '1'); // 重置页码

        // 添加时间戳防止缓存问题
        params.set('_ts', Date.now().toString());

        // 更新URL
        const newPath = `${window.location.pathname}?${params.toString()}`;
        router.replace(newPath, { scroll: false });

        // 同时更新父组件状态
        onCategorySelect('');
    }, [onCategorySelect, router]);

    // Handle click on category button
    const handleCategorySelect = useCallback((category: string) => {
        console.log('点击分类按钮:', category);

        // 记住这次选择的分类
        lastSelectedCategoryRef.current = category;

        // 构建新的URL
        const params = new URLSearchParams(window.location.search);
        if (category) {
            params.set('product_groups', category);
        } else {
            params.delete('product_groups');
        }
        params.delete('category'); // 清除旧的category参数
        params.set('page', '1'); // 重置页码

        // 添加时间戳防止缓存问题
        params.set('_ts', Date.now().toString());

        // 更新URL
        const newPath = `${window.location.pathname}?${params.toString()}`;
        router.replace(newPath, { scroll: false });

        // 同时更新父组件状态
        onCategorySelect(category);
    }, [onCategorySelect, router]);

    // Toggle show more/less or navigate to categories page
    const toggleShowAll = useCallback(() => {
        if (isMobile || isTablet) {
            // 在导航前存储当前路径（完整URL）
            const currentPath = window.location.pathname + window.location.search;
            console.log('保存当前路径:', currentPath);
            sessionStorage.setItem('prevPath', currentPath);

            // 导航到分类页面并传递当前选中的分类
            router.push(`/categories${actualSelectedCategory ? `?category=${encodeURIComponent(actualSelectedCategory)}` : ''}`);
        } else {
            setShowAll(!showAll);
        }
    }, [isMobile, isTablet, showAll, router, actualSelectedCategory]);

    if (isLoading || directLoading) {
        return (
            <div className="py-3 sm:py-4 md:py-6">
                <div className="animate-pulse grid grid-cols-3 sm:grid-cols-4 md:flex md:flex-wrap gap-2 sm:gap-3">
                    {[...Array(isMobile ? 6 : 9)].map((_, i) => (
                        <div key={i} className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-full w-full md:w-auto md:min-w-[100px] flex-shrink-0"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="py-2 sm:py-3 md:py-4 relative">
            <motion.div
                className={`
                    ${isMobile || isTablet
                        ? 'grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3'
                        : 'flex flex-wrap items-center gap-2 md:gap-3'
                    }
                `}
                variants={variants.container}
                initial="hidden"
                animate="show"
            >
                {/* All Categories 按钮 - 使其在移动端和平板端也明显可见 */}
                <motion.button
                    variants={variants.item}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                        px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium 
                        transition-all duration-200 flex items-center justify-center h-10
                        ${actualSelectedCategory === ''
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                        }
                        ${isMobile || isTablet ? 'col-span-1' : 'min-w-[90px]'}
                    `}
                    onClick={handleAllClick}
                >
                    <span className="mr-1">🏠</span>
                    全部
                </motion.button>

                {/* 分类按钮 */}
                <AnimatePresence mode="popLayout">
                    {visibleCategories.map((category) => (
                        <motion.button
                            key={category.name}
                            variants={variants.item}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`
                                px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium 
                                transition-all duration-200 flex items-center justify-center h-10
                                ${actualSelectedCategory === category.name
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                                }
                                ${isMobile || isTablet ? 'col-span-1' : 'min-w-[90px]'}
                            `}
                            onClick={() => handleCategorySelect(category.name)}
                            layout
                        >
                            <span className="truncate max-w-[100px] sm:max-w-[120px]">{category.name}</span>
                        </motion.button>
                    ))}
                </AnimatePresence>

                {/* 展开/收起按钮 */}
                {shouldShowExpandButton() && (
                    <motion.button
                        variants={variants.item}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`
                            px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium 
                            transition-all duration-200 flex items-center justify-center h-10
                            bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-gray-700 
                            dark:text-indigo-300 dark:hover:bg-gray-600 shadow-md
                            ${isMobile || isTablet ? 'col-span-1' : 'min-w-[90px]'}
                        `}
                        onClick={toggleShowAll}
                    >
                        {(isMobile || isTablet) ? "更多分类 ↓" : (showAll ? "收起 ↑" : "展开 ↓")}
                    </motion.button>
                )}
            </motion.div>
        </div>
    );
} 
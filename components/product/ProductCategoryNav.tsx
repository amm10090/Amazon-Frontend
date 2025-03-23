import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import { useCategoryStats } from '@/lib/hooks';


type ProductCategoryNavProps = {
    selectedCategory: string;
    onCategorySelect: (category: string) => void;
    displayMode?: 'scroll' | 'expand'; // 显示模式: scroll-滚动模式, expand-展开收起模式
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
    onCategorySelect,
    displayMode = 'scroll' // 默认为滚动模式
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

    // 展开模式下的动画配置
    const expandAnimationVariants = {
        hidden: {
            opacity: 0,
            height: 0,
            overflow: "hidden"
        },
        visible: {
            opacity: 1,
            height: "auto",
            overflow: "visible",
            transition: {
                duration: 0.3,
                ease: "easeInOut",
                staggerChildren: 0.05,
                when: "beforeChildren"
            }
        }
    };

    // 获取初始显示的分类数量和扩展分类
    const getInitialAndExtendedCategories = useCallback(() => {
        if (displayMode === 'expand') {
            // 桌面展开模式
            const initialCategories = categories.slice(0, desktopLimit);
            const extendedCategories = categories.slice(desktopLimit);

            return { initialCategories, extendedCategories };
        } else {
            // 滚动模式下根据设备类型决定
            if (isMobile) {
                const initialCategories = categories.slice(0, mobileLimit);
                const extendedCategories = categories.slice(mobileLimit);

                return { initialCategories, extendedCategories };
            } else if (isTablet) {
                const initialCategories = categories.slice(0, tabletLimit);
                const extendedCategories = categories.slice(tabletLimit);

                return { initialCategories, extendedCategories };
            } else {
                return { initialCategories: categories, extendedCategories: [] };
            }
        }
    }, [categories, displayMode, isMobile, isTablet, mobileLimit, tabletLimit, desktopLimit]);

    const { initialCategories, extendedCategories } = useMemo(
        () => getInitialAndExtendedCategories(),
        [getInitialAndExtendedCategories]
    );

    // 根据设备类型和显示模式判断是否应当显示展开按钮
    const shouldShowExpandButton = useCallback(() => {
        // 滚动模式下，移动端和平板端才显示"更多"按钮
        if (displayMode === 'scroll') {
            if (isMobile && categories.length > mobileLimit) return true;
            if (isTablet && categories.length > tabletLimit) return true;

            return false;
        }

        // 展开模式下，桌面端显示"展开/收起"按钮
        if (displayMode === 'expand' && categories.length > desktopLimit) {
            return true;
        }

        return false;
    }, [categories.length, isMobile, isTablet, mobileLimit, tabletLimit, desktopLimit, displayMode]);

    // 判断当前分类是否在初始或扩展列表中
    const isInInitialList = useCallback((categoryName: string) => {
        return initialCategories.some(cat => cat.name === categoryName);
    }, [initialCategories]);

    const isInExtendedList = useCallback((categoryName: string) => {
        return extendedCategories.some(cat => cat.name === categoryName);
    }, [extendedCategories]);

    // 根据displayMode返回不同的布局样式
    const getContainerClassName = () => {
        if (displayMode === 'expand') {
            return "flex flex-wrap items-center gap-1.5";
        }

        return "flex items-center space-x-1.5 min-w-max";
    };

    // 获取按钮的样式类
    const getButtonClassName = (isSelected: boolean) => {
        return `
            h-7 px-3 py-1 rounded-full text-sm font-medium 
            flex items-center justify-center whitespace-nowrap
            ${isSelected
                ? 'bg-[#10b981] text-[#ffffff]'
                : 'bg-[#f3f4f6] text-[#374151] hover:bg-[#e5e7eb] dark:bg-[#1f2937] dark:text-[#e5e7eb] dark:hover:bg-[#374151]'
            }
        `;
    };

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
        if (displayMode === 'expand') {
            // 展开模式下直接切换显示状态
            setShowAll(!showAll);

            return;
        }

        if (isMobile || isTablet) {
            // 滚动模式下的移动端和平板端导航到分类页面
            // 在导航前存储当前路径（完整URL）
            const currentPath = window.location.pathname + window.location.search;

            console.log('保存当前路径:', currentPath);
            sessionStorage.setItem('prevPath', currentPath);

            // 导航到分类页面并传递当前选中的分类
            router.push(`/categories${actualSelectedCategory ? `?category=${encodeURIComponent(actualSelectedCategory)}` : ''}`);
        } else {
            setShowAll(!showAll);
        }
    }, [isMobile, isTablet, showAll, router, actualSelectedCategory, displayMode]);

    if (isLoading || directLoading) {
        return (
            <div className="py-2">
                <div className="animate-pulse flex items-center space-x-1 overflow-x-auto">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-7 bg-gray-200 dark:bg-gray-700 rounded-full w-16 md:w-20 flex-shrink-0" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="py-1">
            {/* 初始分类列表（总是显示） */}
            <motion.div
                className={getContainerClassName()}
                variants={variants.container}
                initial="hidden"
                animate="show"
            >
                {/* 全部分类按钮 */}
                <motion.button
                    variants={variants.item}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={getButtonClassName(actualSelectedCategory === '')}
                    onClick={handleAllClick}
                >
                    <span className="mr-1">🏠</span>
                    All
                </motion.button>

                {/* 初始分类按钮 */}
                <AnimatePresence mode="popLayout">
                    {initialCategories.map((category) => (
                        <motion.button
                            key={category.name}
                            variants={variants.item}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            layout
                            className={getButtonClassName(actualSelectedCategory === category.name)}
                            onClick={() => handleCategorySelect(category.name)}
                        >
                            <span>{category.name}</span>
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
                            h-7 px-3 py-1 rounded-full text-sm font-medium 
                            flex items-center justify-center whitespace-nowrap
                            bg-[#dcfce7] text-[#16a34a] dark:bg-[#064e3b] dark:text-[#86efac]
                            hover:bg-[#10b981] hover:text-[#ffffff] dark:hover:bg-[#059669]
                            transition-colors duration-200
                        `}
                        onClick={toggleShowAll}
                    >
                        {displayMode === 'expand'
                            ? (showAll ? "Collapse ↑" : "Expand ↓")
                            : ((isMobile || isTablet) ? "More Categories ↓" : (showAll ? "Collapse ↑" : "Expand ↓"))}
                    </motion.button>
                )}
            </motion.div>

            {/* 扩展分类列表（展开模式且showAll为true时显示） */}
            {displayMode === 'expand' && extendedCategories.length > 0 && (
                <motion.div
                    className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-[#e5e7eb] dark:border-[#374151]"
                    initial="hidden"
                    animate={showAll ? "visible" : "hidden"}
                    variants={expandAnimationVariants}
                >
                    {extendedCategories.map((category, index) => (
                        <motion.button
                            key={category.name}
                            variants={{
                                hidden: { opacity: 0, y: 10 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    transition: {
                                        delay: index * 0.03,
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 24
                                    }
                                }
                            }}
                            whileHover={{ scale: 1.05, boxShadow: "0px 2px 4px rgba(0,0,0,0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            className={getButtonClassName(actualSelectedCategory === category.name)}
                            onClick={() => handleCategorySelect(category.name)}
                        >
                            <span>{category.name}</span>
                        </motion.button>
                    ))}
                </motion.div>
            )}

            {/* 当前选中分类不在可见范围时的提示 */}
            {displayMode === 'expand' &&
                actualSelectedCategory &&
                !isInInitialList(actualSelectedCategory) &&
                !showAll && (
                    <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>Current Selection: </span>
                        <span className="ml-1 px-2 py-0.5 bg-[#dcfce7] text-[#16a34a] dark:bg-[#064e3b] dark:text-[#86efac] rounded-full">
                            {actualSelectedCategory}
                        </span>
                        <button
                            className="ml-2 text-[#10b981] hover:text-[#059669] dark:text-[#4ade80] dark:hover:text-[#86efac]"
                            onClick={toggleShowAll}
                        >
                            Expand to View ↓
                        </button>
                    </div>
                )}
        </div>
    );
} 
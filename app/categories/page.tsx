'use client';

import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

import { ProductCategoryNav } from '@/components/product/ProductCategoryNav';
import { useCategoryStats } from '@/lib/hooks';




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
        <div className="pb-8">
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

export default function CategoriesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeLetter, setActiveLetter] = useState<string | null>(null);
    const selectedCategory = searchParams.get('category') || searchParams.get('product_groups') || '';
    const [isNavigating, setIsNavigating] = useState(false);

    const { data, isLoading } = useCategoryStats({
        sort_by: 'count',
        sort_order: 'desc',
        page_size: 100 // 获取更多分类
    });

    // 处理分类选择
    const handleCategorySelect = useCallback((category: string) => {
        // 设置导航状态
        setIsNavigating(true);

        console.log('选中分类:', category);

        // 获取存储的原始路径（使用 try-catch 防止服务器端错误）
        let prevPath = '/products'; // 默认导航到商品页面

        try {
            const storedPath = sessionStorage.getItem('prevPath');

            if (storedPath) {
                prevPath = storedPath;
                console.log('从sessionStorage读取路径:', prevPath);
            } else {
                console.log('未找到存储的路径，使用默认路径:', prevPath);
            }
        } catch (error) {
            console.error('读取sessionStorage时出错:', error);
        }

        // 检查是否是产品页面路径
        const isProductPage = prevPath.startsWith('/products');

        console.log('是否为产品页面:', isProductPage);

        // 构建URL对象更可靠地处理参数
        let url;

        try {
            url = new URL(prevPath, window.location.origin);
        } catch (error) {
            console.error('构建URL对象时出错:', error);
            url = new URL('/products', window.location.origin);
        }

        console.log('原始URL参数:', url.searchParams.toString());

        // 清除旧的分类参数（同时清除category和product_groups）
        url.searchParams.delete('category');
        url.searchParams.delete('product_groups');

        // 设置新的分类参数（统一使用product_groups保持一致性）
        if (category) {
            url.searchParams.set('product_groups', category);
            console.log('设置分类参数:', category);
        }

        // 重置分页到第一页
        if (url.searchParams.has('page')) {
            url.searchParams.set('page', '1');
        }

        // 构建最终URL (只保留pathname和search部分)
        const finalUrl = `${url.pathname}${url.search}`;

        console.log('最终导航URL:', finalUrl);

        // 添加时间戳到URL，防止缓存问题
        const urlWithTimestamp = finalUrl.includes('?')
            ? `${finalUrl}&_ts=${Date.now()}`
            : `${finalUrl}?_ts=${Date.now()}`;

        console.log('添加时间戳的URL:', urlWithTimestamp);

        // 延迟50ms后导航，确保页面状态完成更新
        setTimeout(() => {
            // 立即导航
            router.push(urlWithTimestamp);

            // 清除导航状态
            setTimeout(() => {
                setIsNavigating(false);
            }, 500);
        }, 50);
    }, [router]);

    // 处理字母选择
    const handleLetterSelect = useCallback((letter: string) => {
        const element = document.getElementById(`group-${letter}`);

        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveLetter(letter);
        }
    }, []);

    // 存储之前的路径
    useEffect(() => {
        // 获取当前完整URL
        const currentFullUrl = window.location.href;
        const currentPath = window.location.pathname;

        // 检查是否已经有存储的路径
        const existingPath = sessionStorage.getItem('prevPath');

        // 如果当前不在分类页面，或者没有存储过路径，则存储当前路径
        if (currentPath !== '/categories' || !existingPath) {
            console.log('存储导航路径:', currentFullUrl);
            sessionStorage.setItem('prevPath', currentFullUrl);
        } else {
            console.log('保持现有导航路径:', existingPath);
        }

        // 如果直接访问了分类页面且没有存储过路径，设置默认路径为产品页面
        if (currentPath === '/categories' && !existingPath) {
            console.log('设置默认导航路径为产品页面');
            sessionStorage.setItem('prevPath', '/products');
        }
    }, []);

    // 处理滚动监测当前字母组
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                        const groupId = entry.target.id;

                        if (groupId.startsWith('group-')) {
                            setActiveLetter(groupId.replace('group-', ''));
                        }
                    }
                });
            },
            { threshold: 0.5 }
        );

        // 观察所有字母组
        const letterGroups = document.querySelectorAll('[id^="group-"]');

        letterGroups.forEach(group => observer.observe(group));

        return () => observer.disconnect();
    }, [data]);

    // 从API数据中提取分类列表
    const categories = data
        ? Object.entries(data.product_groups || {})
            .map(([name, count]) => ({
                name,
                count: Number(count)
            }))
            .sort((a, b) => b.count - a.count)
        : [];

    // 按字母分组
    const groupedCategories = groupCategoriesByAlphabet(categories);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* 导航加载覆盖层 */}
            {isNavigating && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl flex flex-col items-center justify-center">
                        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mb-3" />
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-200">正在跳转到商品页面...</p>
                    </div>
                </div>
            )}

            {/* 页面头部 */}
            <header className="sticky top-0 z-20 bg-white dark:bg-gray-800 shadow-sm">
                <div className="container mx-auto px-4 py-4 flex items-center">
                    <button
                        className="p-2 mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        onClick={() => router.back()}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold">分类浏览</h1>
                </div>

                {/* 添加分类导航 */}
                <div className="hidden sm:block container mx-auto">
                    <ProductCategoryNav
                        selectedCategory={selectedCategory}
                        onCategorySelect={handleCategorySelect}
                    />
                </div>

                {/* 字母索引 */}
                {!isLoading && groupedCategories.length > 0 && (
                    <AlphabetIndex
                        groups={groupedCategories}
                        onSelectLetter={handleLetterSelect}
                        activeLetter={activeLetter}
                    />
                )}
            </header>

            {/* 页面内容 */}
            <main className="container mx-auto px-4 pb-20">
                {isLoading ? (
                    <div className="py-8 flex justify-center">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                ) : (
                    <CategoryGroups
                        groups={groupedCategories}
                        selectedCategory={selectedCategory}
                        onCategorySelect={handleCategorySelect}
                    />
                )}
            </main>
        </div>
    );
} 
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// 自定义Category接口
interface Category {
    id: string;
    name: string;
    slug: string;
    count: number;
}

export function CategoryNavigation() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const pathname = usePathname();

    // 初始加载分类
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);

                // 模拟数据
                const mockCategories: Category[] = [
                    { id: '1', name: '电子产品', slug: 'electronics', count: 243 },
                    { id: '2', name: '家居日用', slug: 'home', count: 187 },
                    { id: '3', name: '厨房用具', slug: 'kitchen', count: 152 },
                    { id: '4', name: '服装', slug: 'clothing', count: 318 },
                    { id: '5', name: '运动户外', slug: 'sports', count: 126 },
                    { id: '6', name: '美妆个护', slug: 'beauty', count: 94 }
                ];

                // 模拟网络延迟
                setTimeout(() => {
                    setCategories(mockCategories);
                    setLoading(false);
                }, 300);

            } catch (err) {
                console.error('获取分类失败:', err);
                setError('无法加载分类数据，请稍后再试');
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // 检查某个分类是否为当前活跃分类
    const isActiveCategory = (slug: string) => {
        return pathname === `/category/${slug}`;
    };

    if (loading) {
        return (
            <div className="my-8">
                <h2 className="text-2xl font-bold mb-4 text-center">热门分类</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 animate-pulse">
                            <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
                            <div className="h-5 w-24 mx-auto bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-8 text-center">
                <h2 className="text-2xl font-bold mb-4">热门分类</h2>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    >
                        重新加载
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="my-8">
            <h2 className="text-2xl font-bold mb-4 text-center">热门分类</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.map((category, index) => (
                    <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <Link
                            href={`/category/${category.slug}`}
                            className={`block group ${isActiveCategory(category.slug) ? 'pointer-events-none' : ''}`}
                        >
                            <div
                                className={`
                                    relative overflow-hidden rounded-xl 
                                    ${isActiveCategory(category.slug)
                                        ? 'bg-primary/10 dark:bg-primary-dark/20 border-2 border-primary dark:border-primary-dark'
                                        : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-700'}
                                    p-4 h-full shadow-sm 
                                    ${!isActiveCategory(category.slug) ? 'hover:shadow-md hover:border-primary/30 dark:hover:border-primary-dark/30' : ''}
                                    transition-all
                                `}
                            >
                                <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                                    {/* 占位图标 */}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`
                                            h-10 w-10 
                                            ${isActiveCategory(category.slug)
                                                ? 'text-primary dark:text-primary-light'
                                                : 'text-gray-400 dark:text-gray-500 group-hover:text-primary/70 dark:group-hover:text-primary-light/70'}
                                            transition-colors
                                        `}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3
                                    className={`
                                        text-center font-medium 
                                        ${isActiveCategory(category.slug)
                                            ? 'text-primary dark:text-primary-light'
                                            : 'text-text-dark dark:text-text-light group-hover:text-primary dark:group-hover:text-primary-light'}
                                        transition-colors
                                    `}
                                >
                                    {category.name}
                                    <span className="ml-1 text-sm text-text-light/60 dark:text-text-dark/60">({category.count})</span>
                                </h3>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
} 
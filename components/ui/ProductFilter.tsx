"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCategoryStats } from '@/lib/hooks';
import LoadingSpinner from './LoadingSpinner';
import { CategoryStats } from '@/types/api';

interface CategoryItem {
    id: string;
    name: string;
    count: number;
}

interface ProductFilterProps {
    onFilter: (category: string | null, sort: string) => void;
    selectedCategory: string | null;
    selectedSort: string;
}

export function ProductFilter({
    onFilter,
    selectedCategory,
    selectedSort
}: ProductFilterProps) {
    const [localCategory, setLocalCategory] = useState<string | null>(selectedCategory);
    const [localSort, setLocalSort] = useState<string>(selectedSort);
    const [categoryItems, setCategoryItems] = useState<CategoryItem[]>([]);

    const { data: categoryStats, isLoading: categoriesLoading } = useCategoryStats({
        page: 1,
        page_size: 100, // 获取足够多的分类
        sort_by: 'count',
        sort_order: 'desc'
    });

    // 处理分类数据，将product_groups转换为简单数组
    useEffect(() => {
        if (categoryStats && categoryStats.product_groups) {
            const items: CategoryItem[] = [];
            Object.entries(categoryStats.product_groups).forEach(([name, count]) => {
                if (count > 0) {
                    items.push({
                        id: name,
                        name: name,
                        count: count
                    });
                }
            });
            // 后端已经排序，所以不需要再排序
            setCategoryItems(items);
        }
    }, [categoryStats]);

    useEffect(() => {
        setLocalCategory(selectedCategory);
        setLocalSort(selectedSort);
    }, [selectedCategory, selectedSort]);

    const handleCategoryChange = (category: string | null) => {
        setLocalCategory(category);
        onFilter(category, localSort);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSort = e.target.value;
        setLocalSort(newSort);
        onFilter(localCategory, newSort);
    };

    return (
        <div className="mb-8 flex flex-col md:flex-row justify-between gap-6 bg-gray-50 p-4 rounded-xl">
            {/* 分类选择器 */}
            <div className="space-y-2">
                <h2 className="text-lg font-medium">商品分类</h2>
                <div className="flex flex-wrap gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCategoryChange(null)}
                        className={`px-4 py-2 rounded-full text-sm transition-all ${!localCategory
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                    >
                        全部
                    </motion.button>

                    {categoriesLoading ? (
                        <div className="flex items-center justify-center p-2">
                            <LoadingSpinner size="sm" />
                        </div>
                    ) : (
                        categoryItems.slice(0, 8).map((cat) => (
                            <motion.button
                                key={cat.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCategoryChange(cat.id)}
                                className={`px-4 py-2 rounded-full text-sm transition-all ${localCategory === cat.id
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                            >
                                {cat.name} ({cat.count})
                            </motion.button>
                        ))
                    )}
                </div>
            </div>

            {/* 排序选择器 */}
            <div className="space-y-2">
                <h2 className="text-lg font-medium">排序方式</h2>
                <select
                    value={localSort}
                    onChange={handleSortChange}
                    className="px-4 py-2 border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary"
                >
                    <option value="created_desc">最新上架</option>
                    <option value="price_asc">价格低到高</option>
                    <option value="price_desc">价格高到低</option>
                    <option value="discount_desc">最高折扣</option>
                </select>
            </div>
        </div>
    );
} 
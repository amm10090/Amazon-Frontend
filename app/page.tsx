"use client";

import { useState, useEffect, useRef } from "react";

import { CategoryNavigation } from "@/components/ui/CategoryNavigation";
import { CategoryProducts } from "@/components/ui/CategoryProducts";
import { FeaturedDeals } from "@/components/ui/FeaturedDeals";
import { HeroSection } from "@/components/ui/HeroSection";
import { NewsletterSubscribe } from "@/components/ui/NewsletterSubscribe";
import { useCategoryStats } from "@/lib/hooks";

// 定义分类接口
interface Category {
    name: string;
    slug: string;
}

// 产品组到分类的映射 - 与CategoryNavigation中的映射保持一致
const productGroupToCategoryMapping: Record<string, { slug: string, name: string }> = {
    'Electronics': { slug: 'Electronics', name: 'Electronics' },
    'Home': { slug: 'Home', name: 'Home & Kitchen' },
    'Kitchen': { slug: 'Kitchen', name: 'Kitchen' },
    'Apparel': { slug: 'Apparel', name: 'Apparel' },
    'Sports': { slug: 'Sports', name: 'Sports & Outdoors' },
    'Beauty': { slug: 'Beauty', name: 'Beauty & Care' },
    'Furniture': { slug: 'Furniture', name: 'Furniture' },
    'Shoes': { slug: 'Shoes', name: 'Shoes' },
    'Personal Computer': { slug: 'Personal Computer', name: 'Computers' },
    'Lawn & Patio': { slug: 'Lawn & Patio', name: 'Garden & Patio' },
    'Wireless': { slug: 'Wireless', name: 'Wireless Devices' },
    'Drugstore': { slug: 'Drugstore', name: 'Health & Household' },
    'Automotive Parts and Accessories': { slug: 'Automotive Parts and Accessories', name: 'Automotive' }
};

export default function Home() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [processed, setProcessed] = useState(false);
    const catalogRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const mainContentRef = useRef<HTMLDivElement>(null);

    // 使用useCategoryStats钩子获取分类数据
    const { data: categoryStats, isLoading } = useCategoryStats({
        page: 1,
        page_size: 50,
        sort_by: 'count',
        sort_order: 'desc'
    });

    // 当分类数据加载完成后处理 - 仅在数据第一次加载或明确改变时处理
    useEffect(() => {
        // 如果正在加载或已经处理过数据，则跳过
        if (isLoading || processed || !categoryStats || !categoryStats.product_groups) {
            return;
        }

        try {
            // 转换product_groups数据为分类列表
            const productGroups = categoryStats.product_groups;

            // 将对象转换为数组，过滤数量大于50的分类，并按照数量排序
            const sortedCategories = Object.entries(productGroups)
                .filter(([_groupName, count]) => count > 50)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8) // 取前8个
                .map(([groupName]) => {
                    // 使用原始的groupName作为slug，确保与API参数一致
                    const slug = groupName;

                    // 从映射中获取显示名称，如果没有则使用原始分类名称
                    const displayName = productGroupToCategoryMapping[groupName]?.name || groupName;

                    return {
                        name: displayName,
                        slug: slug
                    };
                });

            setCategories(sortedCategories);
            // 标记为已处理
            setProcessed(true);
        }
        catch {
            // 出错时也标记为已处理，避免重复尝试
            setProcessed(true);
        }
    }, [isLoading, categoryStats, processed]);

    // Add scroll handling effect
    useEffect(() => {
        const handleScroll = () => {
            if (!sidebarRef.current || !mainContentRef.current || !catalogRef.current) return;

            const sidebarElem = sidebarRef.current;
            const catalogRect = catalogRef.current.getBoundingClientRect();
            const mainContentRect = mainContentRef.current.getBoundingClientRect();
            const sidebarRect = sidebarElem.getBoundingClientRect();

            // 固定偏移量（导航栏高度）
            const topOffset = 110;

            // 计算父容器的位置
            const containerTop = catalogRect.top + window.scrollY;
            const _containerBottom = mainContentRect.bottom + window.scrollY;

            // 计算侧边栏的高度和当前滚动位置
            const sidebarHeight = sidebarRect.height;
            const scrollY = window.scrollY;

            // 计算主内容区域的实际高度
            const mainContentHeight = mainContentRect.height;

            // 确保侧边栏不会超出主内容区域的底部
            const maxTop = mainContentHeight - sidebarHeight;

            // 计算当前应该设置的top值
            let targetTop = scrollY + topOffset - containerTop;

            // 限制top值不超过最大值
            targetTop = Math.min(targetTop, maxTop);
            // 限制top值不小于0
            targetTop = Math.max(0, targetTop);

            // 判断滚动位置并设置样式
            if (scrollY + topOffset >= containerTop) {
                // 检查是否到达底部边界
                if (targetTop >= maxTop) {
                    // 到达底部边界，使用absolute定位
                    sidebarElem.style.position = 'absolute';
                    sidebarElem.style.top = `${maxTop}px`;
                    sidebarElem.style.bottom = 'auto';
                    sidebarElem.style.transform = 'none';
                } else {
                    // 在可视区域内，使用fixed定位
                    sidebarElem.style.position = 'fixed';
                    sidebarElem.style.top = `${topOffset}px`;
                    sidebarElem.style.bottom = 'auto';
                    sidebarElem.style.transform = 'none';
                }
            } else {
                // 回到顶部
                sidebarElem.style.position = 'absolute';
                sidebarElem.style.top = '0';
                sidebarElem.style.bottom = 'auto';
                sidebarElem.style.transform = 'none';
            }
        };

        // 添加防抖处理
        let ticking = false;
        const scrollHandler = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', scrollHandler, { passive: true });
        window.addEventListener('resize', scrollHandler, { passive: true });

        // 初始化调用一次
        handleScroll();

        return () => {
            window.removeEventListener('scroll', scrollHandler);
            window.removeEventListener('resize', scrollHandler);
        };
    }, []);

    return (
        <div className="relative min-h-screen">
            <div className="flex max-w-[1800px] mx-auto">
                {/* 左侧导航 */}
                <div className="hidden lg:block w-[240px] relative" ref={catalogRef}>
                    <div
                        ref={sidebarRef}
                        className="w-[240px] bg-white shadow-sm border-r border-gray-100 z-40"
                        style={{
                            maxHeight: 'calc(100vh - 110px)',
                            overflowY: 'auto',
                            willChange: 'transform, position, top',
                            transition: 'top 0.1s ease-out'
                        }}
                    >
                        <div className="p-4">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
                            <CategoryNavigation useAnchorLinks={true} />
                        </div>
                    </div>
                </div>

                {/* 右侧主内容区域 */}
                <main ref={mainContentRef} className="flex-1 min-h-screen">
                    <div className="px-4 lg:px-6 py-6 space-y-8">
                        {/* 顶部英雄区域 */}
                        <HeroSection />

                        {/* 限时特惠区域 */}
                        <FeaturedDeals />

                        {/* 分隔线 */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-4 text-sm text-gray-500 bg-white">
                                    Recommended for you
                                </span>
                            </div>
                        </div>

                        {/* 添加各个分类区域 - 使用从API获取的分类数据 */}
                        {categories.map((category) => (
                            <CategoryProducts
                                key={category.slug}
                                id={`category-${category.slug}`}
                                title={category.name}
                                slug={category.slug}
                                className="mb-8"
                            />
                        ))}

                        {/* 邮箱订阅组件 */}
                        <NewsletterSubscribe />
                    </div>
                </main>
            </div>
        </div>
    );
} 
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
    const [navStyle, setNavStyle] = useState<{ top: string; transform?: string }>({ top: '110px' });
    const navRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLElement | null>(null);

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

    // 添加节流函数
    const throttle = (func: (...args: unknown[]) => void, limit: number) => {
        let inThrottle: boolean;

        return function (this: unknown, ...args: unknown[]) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    };

    // 添加滚动监听
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // 获取 footer 元素
        footerRef.current = document.querySelector('footer');

        const handleScroll = throttle(() => {
            if (!navRef.current || !footerRef.current) return;

            const footerTop = footerRef.current.getBoundingClientRect().top;
            const navHeight = navRef.current.offsetHeight;
            const windowHeight = window.innerHeight;
            const bottomOffset = 240; // 距离 footer 的最小距离

            // 如果 footer 接近可视区域底部
            if (footerTop - windowHeight < bottomOffset) {
                const diff = footerTop - windowHeight;
                const newTop = windowHeight - navHeight - bottomOffset + diff;

                setNavStyle({ top: '110px', transform: `translateY(${newTop}px)` });
            } else {
                setNavStyle({ top: '110px', transform: 'none' });
            }
        }, 100);

        window.addEventListener('scroll', handleScroll);
        // 初始化时执行一次
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="max-w-[1800px] mx-auto overflow-hidden">
            <div className="relative flex">
                {/* 左侧分类导航 */}
                <div
                    ref={navRef}
                    style={navStyle}
                    className="hidden lg:block w-[240px] fixed h-auto max-h-[calc(100vh-110px)] overflow-auto bg-white pb-4 shadow-sm border-r border-gray-100 transition-transform duration-200"
                >
                    <div className="p-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
                        <CategoryNavigation useAnchorLinks={true} />
                    </div>
                </div>

                {/* 右侧主内容区域 */}
                <main className="flex-1 lg:ml-[240px] min-h-screen w-full overflow-hidden">
                    <div className="px-4 lg:px-6 py-6 space-y-8 overflow-hidden">
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
"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useMotionValue, useTransform, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useCategoryStats } from '@/lib/hooks';

// 自定义Category接口
interface Category {
    id: string;
    name: string;
    slug: string;
    count: number;
    icon?: string;
    color?: string;
}

// 产品组到分类的映射
const productGroupToCategoryMapping: Record<string, { slug: string, name: string }> = {
    'Electronics': { slug: 'electronics', name: 'Electronics' },
    'Home': { slug: 'home', name: 'Home & Kitchen' },
    'Kitchen': { slug: 'kitchen', name: 'Kitchen' },
    'Apparel': { slug: 'clothing', name: 'Clothing' },
    'Sports': { slug: 'sports', name: 'Sports & Outdoors' },
    'Beauty': { slug: 'beauty', name: 'Beauty & Personal Care' },
    'Furniture': { slug: 'furniture', name: 'Furniture' },
    'Shoes': { slug: 'shoes', name: 'Shoes' },
    'Personal Computer': { slug: 'personal_computer', name: 'Computers' },
    'Lawn & Patio': { slug: 'lawn_patio', name: 'Garden & Patio' },
    'Wireless': { slug: 'wireless', name: 'Wireless Devices' },
    'Drugstore': { slug: 'drugstore', name: 'Health & Household' },
    'Automotive Parts and Accessories': { slug: 'automotive', name: 'Automotive' }
};

// 分类图标映射
const categoryIcons: Record<string, { icon: string, color: string }> = {
    electronics: {
        icon: 'M12 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z M4.5 8.67h14.969c.76 0 1.26-.79.957-1.474L17.78 2.741A2 2 0 0 0 16 1.5H8.023a2 2 0 0 0-1.782 1.082L3.601 7.196c-.364.683.138 1.474.897 1.474h.002Z M3.75 20.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-10.5A1.5 1.5 0 0 0 18.75 8.25h-15A1.5 1.5 0 0 0 2.25 9.75v10.5a1.5 1.5 0 0 0 1.5 1.5Z',
        color: 'from-blue-500 to-indigo-600'
    },
    home: {
        icon: 'M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12 3.545l-7.5 7.5M21 3.75V21m0-17.25a.75.75 0 0 0-.75-.75H3.75a.75.75 0 0 0-.75.75v1.502h18V3.75Z',
        color: 'from-amber-500 to-orange-600'
    },
    kitchen: {
        icon: 'M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c6.011-6.01 15.766-6.01 21.776 0M12 2.25c-2.784 0-5.424.554-7.825 1.555M12 2.25c2.784 0 5.424.554 7.825 1.555M12 2.25V4.5M12 12.75a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5ZM12 12.75V16.5',
        color: 'from-emerald-500 to-green-600'
    },
    clothing: {
        icon: 'M6.96 9.47l4.55-2.16A1.08 1.08 0 0 1 12 7.27c.2 0 .38.05.55.04h.01l4.37 2.16v-.01c.2.1.39.23.55.4A2.9 2.9 0 0 1 18 9.03V4.74c0-.27-.11-.52-.31-.71l-1.13-.98a1.06 1.06 0 0 0-.66-.29H8.1c-.25 0-.5.1-.68.29l-1.13.98c-.2.19-.31.44-.31.71v4.29c0-.18.09-.34.15-.51.15-.16.34-.29.55-.38.09-.05.18-.09.28-.13V4.74M12 6s1-.33 2.25-.33c1.1 0 2.25.33 2.25.33v-.63c0-.2-.08-.39-.22-.53l-.83-.72a.78.78 0 0 0-.52-.2h-5.36c-.19 0-.38.07-.52.2l-.83.72c-.14.14-.22.33-.22.53V6S9.75 5.67 12 6m9.97 11.22L19.3 7.4c-.15-.48-.4-.93-.78-1.28-.01-.01-.03-.03-.05H5.5l-.01.01a3.2 3.2 0 0 0-.77 1.33l-2.7 9.81c-.24.87.48 1.69 1.39 1.69c.28 0 .55-.07.79-.2L8 16.73v3.02c0 .55.45 1 1 1h6a1 1 0 0 0 1-1v-3.02l3.79 1.98a1.64 1.64 0 0 0 2.18-1.47z',
        color: 'from-pink-500 to-rose-600'
    },
    sports: {
        icon: 'M11.7 6a2 2 0 0 0-2 2c0 .2.04.42.12.6.23.52.76.85 1.36.9H12.64c.6-.05 1.13-.38 1.36-.9a2 2 0 0 0-2.3-2.6zm.3 5h-1c-1.1 0-2 .9-2 2v5h2v-3h1v3h2v-5c0-1.1-.9-2-2-2zm1-9c-5.52 0-10 4.48-10 10s4.48 10 10 10s10-4.48 10-10c0-5.52-4.48-10-10-10zm6.23 15.76c-1.17 1.17-2.7 1.96-4.32 2.18v-2.22c.48-.41.8-.98.8-1.72v-1H9.3v1c0 .74.32 1.31.8 1.72v2.22c-1.63-.22-3.15-1.01-4.33-2.18C4.7 15.99 4 14.07 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8c0 2.07-.7 3.99-1.77 5.76z',
        color: 'from-cyan-500 to-blue-600'
    },
    beauty: {
        icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
        color: 'from-purple-500 to-violet-600'
    },
    furniture: {
        icon: 'M6 19V9a2 2 0 012-2h1.1a1.987 1.987 0 012.514-1.176A3.1 3.1 0 0110 3h4a3.1 3.1 0 01-1.614 2.824A1.987 1.987 0 0114.9 7H16a2 2 0 012 2v10h1V4a1 1 0 10-2 0v1H7V4a1 1 0 00-2 0v15H6z M6 19h12v-5a2 2 0 00-2-2H8a2 2 0 00-2 2v5z M5 19.5a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1z M21 19.5a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1z',
        color: 'from-brown-500 to-amber-600'
    },
    shoes: {
        icon: 'M9.29 13.29l.76.15.081.16L10 14v1A12.07 12.07 0 006 13c-2.63 0-3.44.56-3.67.72-.45.31-.33.87.22 1.02C3.12 15 5.31 15 6 15c2.67 0 5 1.86 5 4 0 .58-.47 1-1 1H5c-1.13 0-2.11-.27-2.82-.71A2.665 2.665 0 001 17V4c0-1.11.89-2 2-2h6a2 2 0 011.46.6l6.36 7.2c.38.43.64.97.64 1.7 0 1.11-.89 2-2 2h-5a2 2 0 01-1.46-.6l.29-.29a.996.996 0 000-1.41M18 15l-1.5-4h3L18 15z',
        color: 'from-yellow-500 to-red-500'
    },
    personal_computer: {
        icon: 'M2 5.5a2 2 0 012-2h16a2 2 0 012 2v11a2 2 0 01-2 2h-5.5v1.1h2.25a.4.4 0 01.4.4v.5a.5.5 0 01-.5.5h-9.5a.5.5 0 01-.5-.5v-.5a.4.4 0 01.4-.4h2.25V18.5H4a2 2 0 01-2-2v-11z M4 7h16v7H4V7z',
        color: 'from-blue-400 to-indigo-500'
    },
    lawn_patio: {
        icon: 'M17.625 4.95L18 4.5l.375.45c1.175 1.425 3.3 4.2 3.3 6.3 0 1.725-1.5 3.75-3.675 3.75-1.425 0-2.925-.6-3.9-1.575-1.05.075-3.675.15-5.1.075C7.95 14.4 6.45 15 5.025 15 2.85 15 1.35 12.975 1.35 11.25c0-2.1 2.1-4.875 3.3-6.3L5.025 4.5l.375.45C6.575 6.375 8.7 9.15 8.7 11.25c0 .075 0 .15-.025.225a82.56 82.56 0 014.65 0c0-.075-.025-.15-.025-.225-.025-2.1 2.1-4.875 4.325-6.3z',
        color: 'from-green-500 to-teal-600'
    },
    wireless: {
        icon: 'M12 21.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z M6.343 14.657a8 8 0 0111.314 0M2.929 11.243a12 12 0 0118.142 0M0 8.25a15 15 0 0124 0',
        color: 'from-sky-500 to-blue-600'
    },
    drugstore: {
        icon: 'M5 21a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5z M9 3v18 M15 3v18 M3 9h18 M3 15h18 M9 9h6 M9 15h6',
        color: 'from-red-500 to-pink-600'
    },
    automotive: {
        icon: 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-1.45-5c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.37-.66-.11-1.48-.87-1.48H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7l1.1-2h7.45zM6.16 6h12.15l-2.76 5H8.53L6.16 6z',
        color: 'from-gray-500 to-gray-700'
    }
};

export function CategoryNavigation() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const pathname = usePathname();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const controls = useAnimation();
    const x = useMotionValue(0);
    const dragStart = useRef(0);
    const dragEnd = useRef(0);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);
    const [needNavigation, setNeedNavigation] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [activeCardIndex, setActiveCardIndex] = useState(0);
    const [scrollDirection, setScrollDirection] = useState<'left' | 'right' | null>(null);
    const lastScrollPosition = useRef(0);
    const [activePointIndex, setActivePointIndex] = useState<number>(0);

    // 使用ref来跟踪已处理的数据，避免重复处理
    const processedDataRef = useRef<boolean>(false);

    // 添加存储卡片位置的ref
    const cardPositions = useRef<number[]>([]);

    // 使用 useCategoryStats 钩子获取分类数据
    const { data: categoryStats, isLoading, isError } = useCategoryStats({
        page: 1,
        page_size: 50,
        sort_by: 'count',
        sort_order: 'desc'
    });

    // 使用useScroll钩子来监听滚动容器的滚动位置
    const { scrollXProgress } = useScroll({
        container: scrollContainerRef
    });

    // 添加scrollXProgress的事件监听，用于实时更新方向和激活索引
    useMotionValueEvent(scrollXProgress, "change", (latest) => {
        if (!scrollContainerRef.current) return;

        // 更新滚动方向
        const currentScrollPosition = scrollContainerRef.current.scrollLeft;
        if (currentScrollPosition > lastScrollPosition.current) {
            setScrollDirection('right');
        } else if (currentScrollPosition < lastScrollPosition.current) {
            setScrollDirection('left');
        }
        lastScrollPosition.current = currentScrollPosition;

        // 实时更新激活索引
        updateActiveCardIndex();
    });

    // 将滚动进度映射到圆点指示器的激活进度，优化映射函数
    const indicatorProgress = useTransform(
        scrollXProgress,
        (progress) => {
            if (!scrollContainerRef.current || categories.length <= 1) return 0;

            const scrollWidth = scrollContainerRef.current.scrollWidth;
            const clientWidth = scrollContainerRef.current.clientWidth;
            const maxScroll = scrollWidth - clientWidth;

            // 将进度值(0-1)转换为实际的scrollLeft值
            const actualScrollLeft = progress * maxScroll;

            // 计算当前激活卡片的索引和进度
            let activeIndex = 0;
            let progressInCard = 0;

            for (let i = 0; i < cardPositions.current.length - 1; i++) {
                const start = cardPositions.current[i];
                const end = cardPositions.current[i + 1];

                // 扩大判断范围，使过渡更加平滑
                const cardWidth = end - start;
                const thresholdStart = start - cardWidth * 0.1;
                const thresholdEnd = end + cardWidth * 0.1;

                if (actualScrollLeft >= thresholdStart && actualScrollLeft < thresholdEnd) {
                    activeIndex = i;
                    // 计算卡片内部的精确进度，添加边界处理
                    progressInCard = Math.max(0, Math.min(1, (actualScrollLeft - start) / (end - start)));
                    break;
                }
            }

            // 如果已经滚动到最后一张卡片
            if (cardPositions.current.length > 0 &&
                actualScrollLeft >= cardPositions.current[cardPositions.current.length - 1]) {
                activeIndex = cardPositions.current.length - 1;
                progressInCard = 1;
            }

            return activeIndex + progressInCard;
        }
    );

    // 将indicatorProgress转换为整数索引，用于高亮显示当前激活的圆点
    const currentActiveIndex = useTransform(indicatorProgress, (progress) => Math.round(progress));

    // 使用useMotionValueEvent监听indicatorProgress变化并更新activePointIndex
    useMotionValueEvent(indicatorProgress, "change", (latest) => {
        const roundedIndex = Math.round(latest);
        if (roundedIndex !== activePointIndex) {
            setActivePointIndex(roundedIndex);
        }
    });

    // 预先定义固定数量的点指示器transform，避免在map循环中创建
    const dotScales = Array.from({ length: 10 }).map((_, i) =>
        useTransform(indicatorProgress, (p) => {
            const diff = Math.abs(p - i);
            return diff <= 0.5 ? 1.3 - (0.3 * (diff * 2)) : 1;
        })
    );

    const indicatorOpacities = Array.from({ length: 10 }).map((_, i) =>
        useTransform(indicatorProgress, (p) => {
            const diff = Math.abs(p - i);
            return diff < 0.8 ? Math.max(0, 1 - (diff / 0.8)) : 0;
        })
    );

    const indicatorScaleXs = Array.from({ length: 10 }).map((_, i) =>
        useTransform(indicatorProgress, (p) => {
            const diff = Math.abs(p - i);
            return diff < 0.8 ? Math.max(0, 1 - (diff / 0.8)) : 0;
        })
    );

    const buttonScales = Array.from({ length: 10 }).map((_, i) =>
        useTransform(indicatorProgress, (p) => {
            const diff = Math.abs(p - i);
            return diff <= 0.5 ? 1 + (0.15 * (1 - diff * 2)) : 1;
        })
    );

    const dotColors = Array.from({ length: 10 }).map((_, i) =>
        useTransform(currentActiveIndex, (activeIndex) =>
            activeIndex === i ? 'var(--color-primary)' : 'var(--color-gray-300)'
        )
    );

    // 检查是否需要导航控件（当内容宽度超过容器宽度时）
    const checkIfNavigationNeeded = () => {
        if (!scrollContainerRef.current) return;

        const { scrollWidth, clientWidth } = scrollContainerRef.current;
        const needsNav = scrollWidth > clientWidth + 10; // 添加一点余量
        setNeedNavigation(needsNav);

        // 检查是否为移动设备
        const newIsMobile = window.innerWidth < 768;
        setIsMobile(newIsMobile);

        // 如果需要导航，则同时检查箭头状态
        if (needsNav) {
            const { scrollLeft } = scrollContainerRef.current;
            setShowLeftArrow(scrollLeft > 20);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
        }
    };

    // 检测滚动容器的滚动位置，更新箭头显示状态
    const handleScroll = () => {
        if (!scrollContainerRef.current || !needNavigation) return;

        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeftArrow(scrollLeft > 20);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    };

    // 监听窗口尺寸变化
    useEffect(() => {
        const handleResize = () => {
            checkIfNavigationNeeded();
        };

        // 初始检查
        handleResize();

        // 添加窗口尺寸变化监听
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [categories]);

    // 处理API返回的分类数据 - 重写依赖处理逻辑
    useEffect(() => {
        // 当数据加载中或已经处理过且数据没变，就不重复处理
        if (isLoading || (processedDataRef.current && !isError)) {
            return;
        }

        // 如果有错误，设置错误状态
        if (isError) {
            setError('Unable to load categories. Please try again later.');
            processedDataRef.current = true;
            return;
        }

        // 数据已加载且未处理过
        if (categoryStats && categoryStats.product_groups && !processedDataRef.current) {
            try {
                // 转换product_groups数据为分类列表
                const productGroups = categoryStats.product_groups;

                // 将对象转换为数组，过滤数量大于50的分类，并按照数量排序
                const sortedCategories = Object.entries(productGroups)
                    .filter(([groupName, count]) => count > 50)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 8) // 取前8个
                    .map(([groupName, count], index) => {
                        // 尝试从映射中获取分类信息
                        const categoryInfo = productGroupToCategoryMapping[groupName] || {
                            slug: groupName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                            name: groupName
                        };

                        // 尝试从映射中获取图标和颜色
                        const iconInfo = categoryIcons[categoryInfo.slug] || {
                            icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
                            color: 'from-gray-400 to-gray-600'
                        };

                        return {
                            id: index.toString(),
                            name: categoryInfo.name,
                            slug: categoryInfo.slug,
                            count: count,
                            icon: iconInfo.icon,
                            color: iconInfo.color
                        };
                    });

                setCategories(sortedCategories);
                setError(null);
                processedDataRef.current = true;
            } catch (err) {
                setError('Unable to load categories. Please try again later.');
                processedDataRef.current = true;
            }
        }
    }, [isLoading, isError, categoryStats]);

    // 添加滚动事件监听
    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll);
            scrollContainer.addEventListener('scroll', updateActiveCardIndex);

            // 添加触摸事件监听，优化移动端体验
            scrollContainer.addEventListener('touchend', updateActiveCardIndex);
            // 添加滚动结束事件监听
            let scrollTimeout: ReturnType<typeof setTimeout>;
            const handleScrollEnd = () => {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    updateActiveCardIndex();
                }, 150); // 滚动停止150ms后更新
            };
            scrollContainer.addEventListener('scroll', handleScrollEnd);

            // 初始化检查是否需要导航
            checkIfNavigationNeeded();

            // 初始化后延迟更新一次指示器状态
            setTimeout(updateActiveCardIndex, 300);
        }

        return () => {
            if (scrollContainer) {
                scrollContainer.removeEventListener('scroll', handleScroll);
                scrollContainer.removeEventListener('scroll', updateActiveCardIndex);
                scrollContainer.removeEventListener('touchend', updateActiveCardIndex);
                scrollContainer.removeEventListener('scroll', function handleScrollEnd() { });
            }
        };
    }, []); // 保持空依赖数组，避免重复添加事件监听

    // 当分类数据变化时更新激活卡片索引
    useEffect(() => {
        if (categories.length > 0) {
            // 分类数据加载后更新一次指示器状态
            setTimeout(updateActiveCardIndex, 300);
        }
    }, [categories]);

    // 更新当前激活的卡片索引 - 优化性能和精确度
    const updateActiveCardIndex = () => {
        if (!scrollContainerRef.current || categories.length === 0) return;

        const container = scrollContainerRef.current;
        const { scrollLeft, clientWidth } = container;
        const scrollCenter = scrollLeft + clientWidth / 2;

        // 获取所有卡片元素
        const cards = Array.from(container.querySelectorAll('.snap-center'));

        // 找到中心点最接近的卡片
        let closestCardIndex = 0;
        let minDistance = Infinity;

        cards.forEach((card, index) => {
            const cardElement = card as HTMLElement;
            const cardCenter = cardElement.offsetLeft + cardElement.offsetWidth / 2;
            const distance = Math.abs(scrollCenter - cardCenter);

            if (distance < minDistance) {
                minDistance = distance;
                closestCardIndex = index;
            }
        });

        // 只有当索引变化时才更新状态，减少不必要的渲染
        if (closestCardIndex !== activeCardIndex) {
            setActiveCardIndex(closestCardIndex);
        }
    };

    // 检查某个分类是否为当前活跃分类
    const isActiveCategory = (slug: string) => {
        return pathname === `/category/${slug}`;
    };

    // 滚动到左侧
    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            const containerWidth = scrollContainerRef.current.clientWidth;
            const scrollAmount = containerWidth * 0.8; // 滚动容器宽度的80%
            const targetPosition = scrollContainerRef.current.scrollLeft - scrollAmount;

            scrollContainerRef.current.scrollTo({
                left: Math.max(0, targetPosition),
                behavior: 'smooth'
            });
        }
    };

    // 滚动到右侧
    const scrollRight = () => {
        if (scrollContainerRef.current) {
            const containerWidth = scrollContainerRef.current.clientWidth;
            const scrollAmount = containerWidth * 0.8; // 滚动容器宽度的80%
            const maxScroll = scrollContainerRef.current.scrollWidth - containerWidth;
            const targetPosition = scrollContainerRef.current.scrollLeft + scrollAmount;

            scrollContainerRef.current.scrollTo({
                left: Math.min(maxScroll, targetPosition),
                behavior: 'smooth'
            });
        }
    };

    // 滚动到指定卡片
    const scrollToCard = (index: number) => {
        if (!scrollContainerRef.current || !categories[index]) return;

        const container = scrollContainerRef.current;
        const cards = Array.from(container.querySelectorAll('.snap-center'));

        if (cards[index]) {
            const card = cards[index] as HTMLElement;
            // 计算目标滚动位置，使卡片居中显示
            const cardWidth = card.offsetWidth;
            const containerWidth = container.clientWidth;
            const scrollPosition = card.offsetLeft - (containerWidth / 2 - cardWidth / 2);

            // 滚动到目标位置
            container.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });

            // 更新激活索引
            setActiveCardIndex(index);
        }
    };

    // 添加触摸事件处理，优化移动端体验
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleTouchStart = () => {
            // 记录滚动起始位置
            lastScrollPosition.current = container.scrollLeft;
        };

        const handleTouchEnd = () => {
            // 触摸结束时更新激活索引
            updateActiveCardIndex();
        };

        container.addEventListener('touchstart', handleTouchStart);
        container.addEventListener('touchend', handleTouchEnd);

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);

    // 计算每个卡片的位置
    useEffect(() => {
        if (!scrollContainerRef.current || categories.length === 0) return;

        const container = scrollContainerRef.current;
        const cards = Array.from(container.querySelectorAll('.snap-center'));
        const positions: number[] = [];

        cards.forEach((card) => {
            const cardElement = card as HTMLElement;
            positions.push(cardElement.offsetLeft);
        });

        cardPositions.current = positions;

        // 初始更新一次激活的卡片索引
        updateActiveCardIndex();
    }, [categories]);

    if (isLoading) {
        return (
            <div className="relative my-6 px-2 md:px-4">
                <h2 className="text-2xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Popular Categories</h2>
                <div className="overflow-hidden">
                    <div className="flex space-x-4 py-2">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div key={index} className="flex-shrink-0 w-32 md:w-40">
                                <div className="bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl p-4 animate-pulse h-40">
                                    <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>
                                    <div className="h-4 w-20 mx-auto bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-6 text-center px-4">
                <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Popular Categories</h2>
                <div className="p-6 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-md rounded-xl shadow-lg border border-red-100 dark:border-red-800/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-red-600 dark:text-red-400 mb-4 font-medium">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    >
                        Reload
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative my-6">
            <div className="absolute left-0 right-0 h-48 bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 -z-10 blur-3xl opacity-50"></div>

            <h2 className="text-2xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Popular Categories</h2>

            <div className="relative px-4 md:px-6">
                {/* 左边滚动按钮 - 仅在非移动端且需要导航时显示 */}
                <AnimatePresence>
                    {needNavigation && showLeftArrow && !isMobile && (
                        <motion.button
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-1.5 md:p-2 rounded-full shadow-md border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary-light/50"
                            onClick={scrollLeft}
                            aria-label="Scroll left"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* 右边滚动按钮 - 仅在非移动端且需要导航时显示 */}
                <AnimatePresence>
                    {needNavigation && showRightArrow && !isMobile && (
                        <motion.button
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-1.5 md:p-2 rounded-full shadow-md border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary-light/50"
                            onClick={scrollRight}
                            aria-label="Scroll right"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* 添加渐变边缘遮罩，解决割裂感 */}
                {needNavigation && (
                    <>
                        <div className="absolute left-0 top-2 bottom-2 w-8 sm:w-12 bg-gradient-to-r from-white via-white/95 to-transparent dark:from-gray-900 dark:via-gray-900/95 dark:to-transparent pointer-events-none z-10"></div>
                        <div className="absolute right-0 top-2 bottom-2 w-8 sm:w-12 bg-gradient-to-l from-white via-white/95 to-transparent dark:from-gray-900 dark:via-gray-900/95 dark:to-transparent pointer-events-none z-10"></div>
                    </>
                )}

                {/* 滚动容器 */}
                <div
                    ref={scrollContainerRef}
                    className="overflow-x-auto hide-scrollbar pb-2 pt-1 snap-x snap-mandatory"
                    style={{
                        scrollbarWidth: 'none', // Firefox
                        msOverflowStyle: 'none', // IE and Edge
                        scrollBehavior: 'smooth'
                    }}
                    onScroll={handleScroll}
                >
                    <div className="flex space-x-3 sm:space-x-4 md:space-x-5 lg:space-x-7 px-2 md:px-4">
                        {categories.map((category, index) => (
                            <motion.div
                                key={category.id}
                                className="flex-shrink-0 w-[110px] sm:w-[135px] md:w-[160px] lg:w-[180px] snap-center"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.08,
                                    ease: [0.4, 0.0, 0.2, 1]
                                }}
                                whileHover={{ y: -8, transition: { duration: 0.3, type: "spring", stiffness: 300 } }}
                                whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
                            >
                                <Link
                                    href={`/category/${category.slug}`}
                                    className={`block group ${isActiveCategory(category.slug) ? 'pointer-events-none' : ''}`}
                                >
                                    <motion.div
                                        className={`
                                            relative overflow-hidden rounded-xl h-40 sm:h-44 md:h-48
                                            ${isActiveCategory(category.slug)
                                                ? 'bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-primary/30 dark:to-secondary/30 ring-2 ring-primary/50 dark:ring-primary-light/50'
                                                : 'bg-white/40 dark:bg-gray-800/40 backdrop-blur-md hover:bg-gradient-to-br hover:from-gray-50/80 hover:to-white/80 dark:hover:from-gray-800/80 dark:hover:to-gray-700/80 border border-gray-100/80 dark:border-gray-700/50 hover:border-primary/20 dark:hover:border-primary-light/20'
                                            }
                                            p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center
                                        `}
                                        whileHover={{
                                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                                            transition: { duration: 0.3 }
                                        }}
                                    >
                                        {/* 装饰元素 - 随机位置的小圆点 */}
                                        <motion.div
                                            className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 opacity-10"
                                            animate={{
                                                rotate: [0, 180],
                                                scale: [1, 1.05, 1],
                                            }}
                                            transition={{
                                                duration: 20,
                                                repeat: Infinity,
                                                repeatType: "reverse"
                                            }}
                                        >
                                            <div className={`w-full h-full rounded-full bg-gradient-to-r ${category.color || 'from-gray-400 to-gray-500'}`}></div>
                                        </motion.div>

                                        {/* 类别图标 */}
                                        <motion.div
                                            className={`
                                                relative w-14 h-14 sm:w-16 sm:h-16 rounded-full mb-3 sm:mb-4 flex items-center justify-center 
                                                ${isActiveCategory(category.slug)
                                                    ? `bg-gradient-to-br ${category.color || 'from-gray-400 to-gray-500'} text-white`
                                                    : `bg-gradient-to-br ${category.color ? `${category.color}/10` : 'from-gray-400/10 to-gray-500/10'} text-gray-700 dark:text-gray-200 group-hover:${category.color ? `${category.color}/20` : 'from-gray-400/20 to-gray-500/20'}`
                                                }
                                                shadow-sm group-hover:shadow-md transition-all duration-300
                                            `}
                                            whileHover={{
                                                scale: 1.1,
                                                rotate: [0, 5, -5, 0],
                                                transition: {
                                                    scale: { duration: 0.2 },
                                                    rotate: { duration: 0.5, repeat: 0 }
                                                }
                                            }}
                                            animate={{
                                                scale: [1, 1.03, 1],
                                                rotate: [0, 2, -2, 0],
                                            }}
                                            transition={{
                                                duration: 4,
                                                repeat: Infinity,
                                                repeatType: "reverse",
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <motion.svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className={`h-7 w-7 sm:h-8 sm:w-8 ${isActiveCategory(category.slug) ? 'text-white' : 'group-hover:text-gray-700 dark:group-hover:text-gray-300'}`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                initial={{ opacity: 0.8 }}
                                                animate={{ opacity: 1 }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    repeatType: "reverse"
                                                }}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={category.icon || 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'} />
                                            </motion.svg>

                                            {/* 高亮光效果 */}
                                            <motion.div
                                                className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                                                animate={{
                                                    scale: [1, 1.1, 1],
                                                    opacity: [0, 0.2, 0]
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    repeatType: "reverse"
                                                }}
                                            ></motion.div>

                                            {/* 添加装饰性粒子效果 */}
                                            <motion.div
                                                className="absolute w-full h-full"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                            >
                                                {[...Array(3)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        className={`absolute w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gradient-to-r ${category.color || 'from-gray-300 to-gray-400'}`}
                                                        initial={{
                                                            x: 0,
                                                            y: 0,
                                                            opacity: 0
                                                        }}
                                                        animate={{
                                                            x: [0, (i + 1) * 6, (i + 1) * -4, 0],
                                                            y: [0, (i + 1) * -6, (i + 1) * 4, 0],
                                                            opacity: [0, 0.7, 0.7, 0],
                                                            scale: [0, 1, 1, 0]
                                                        }}
                                                        transition={{
                                                            duration: 4 + i,
                                                            repeat: Infinity,
                                                            repeatType: "loop",
                                                            delay: i * 0.7,
                                                            ease: "easeInOut"
                                                        }}
                                                    />
                                                ))}
                                            </motion.div>
                                        </motion.div>

                                        {/* 类别名称 */}
                                        <motion.h3
                                            className={`
                                                text-center font-medium text-xs sm:text-sm md:text-base
                                                ${isActiveCategory(category.slug)
                                                    ? 'text-primary dark:text-primary-light'
                                                    : 'text-gray-700 dark:text-gray-200 group-hover:text-primary/80 dark:group-hover:text-primary-light/80'
                                                }
                                                transition-colors
                                            `}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.08 + 0.2 }}
                                            whileHover={{
                                                scale: 1.05,
                                                transition: { duration: 0.2 }
                                            }}
                                        >
                                            {category.name}
                                        </motion.h3>
                                    </motion.div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 添加自定义CSS，隐藏滚动条但保留滚动功能，并增加滑动过渡效果 */}
            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                    scroll-behavior: smooth;
                    -webkit-overflow-scrolling: touch;
                }
                @media (max-width: 767px) {
                    .hide-scrollbar {
                        scroll-snap-type: x mandatory;
                        scroll-snap-stop: always;
                    }
                }
                .snap-center {
                    scroll-snap-align: center;
                }
                .snap-x {
                    scroll-snap-type: x mandatory;
                }
            `}</style>
        </div>
    );
}
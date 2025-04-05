"use client";

import { motion, useAnimation, useMotionValue, useTransform, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';

import { useCategoryStats } from '@/lib/hooks';

// 自定义Category接口
interface Category {
    id: string;
    name: string;
    slug: string;
    count: number;
    icon?: React.ReactNode | string;
    emoji?: string; // 添加emoji属性
    color?: string;
}

// 添加组件属性接口，包含useAnchorLinks选项
interface CategoryNavigationProps {
    useAnchorLinks?: boolean; // 是否使用锚链接
}

// 产品组到分类的映射
const productGroupToCategoryMapping: Record<string, { slug: string, name: string }> = {
    'Electronics': { slug: 'Electronics', name: 'Electronics' },
    'Home': { slug: 'Home', name: 'Home & Kitchen' },
    'Kitchen': { slug: 'Kitchen', name: 'Kitchen' },
    'Apparel': { slug: 'Apparel', name: 'Apparel' },
    'Sports': { slug: 'Sports', name: 'Sports & Outdoors' },
    'Beauty': { slug: 'Beauty', name: 'Beauty & Personal Care' },
    'Furniture': { slug: 'Furniture', name: 'Furniture' },
    'Shoes': { slug: 'Shoes', name: 'Shoes' },
    'Personal Computer': { slug: 'Personal Computer', name: 'Computers' },
    'Lawn & Patio': { slug: 'Lawn & Patio', name: 'Garden & Patio' },
    'Wireless': { slug: 'Wireless', name: 'Wireless Devices' },
    'Drugstore': { slug: 'Drugstore', name: 'Health & Household' },
    'Automotive Parts and Accessories': { slug: 'Automotive Parts and Accessories', name: 'Automotive' }
};

// 分类图标映射 - 使用emoji表情替代Lucide图标
const categoryIcons: Record<string, { emoji: string, color: string }> = {
    electronics: {
        emoji: '📱',
        color: 'from-[#5a8a9f] to-[#3d5a80]'
    },
    home: {
        emoji: '🏠',
        color: 'from-[#81a4c4] to-[#5a8a9f]'
    },
    kitchen: {
        emoji: '☕',
        color: 'from-[#6b8ea1] to-[#4d6d85]'
    },
    apparel: {
        emoji: '👕',
        color: 'from-[#5a8a9f] to-[#3d5a80]'
    },
    sports: {
        emoji: '🏋️',
        color: 'from-[#4d6d85] to-[#3d5a80]'
    },
    beauty: {
        emoji: '✨',
        color: 'from-[#81a4c4] to-[#5a8a9f]'
    },
    furniture: {
        emoji: '🛋️',
        color: 'from-[#6b8ea1] to-[#4d6d85]'
    },
    shoes: {
        emoji: '👟',
        color: 'from-[#5a8a9f] to-[#3d5a80]'
    },
    computers: {
        emoji: '💻',
        color: 'from-[#4d6d85] to-[#3d5a80]'
    },
    'personal computer': {
        emoji: '💻',
        color: 'from-[#4d6d85] to-[#3d5a80]'
    },
    'lawn & patio': {
        emoji: '🌿',
        color: 'from-[#6b8ea1] to-[#4d6d85]'
    },
    garden: {
        emoji: '🌿',
        color: 'from-[#6b8ea1] to-[#4d6d85]'
    },
    wireless: {
        emoji: '📶',
        color: 'from-[#5a8a9f] to-[#3d5a80]'
    },
    drugstore: {
        emoji: '💊',
        color: 'from-[#81a4c4] to-[#5a8a9f]'
    },
    health: {
        emoji: '💊',
        color: 'from-[#81a4c4] to-[#5a8a9f]'
    },
    automotive: {
        emoji: '🚗',
        color: 'from-[#7f8c8d] to-[#2c3e50]'
    },
    'automotive parts and accessories': {
        emoji: '🚗',
        color: 'from-[#7f8c8d] to-[#2c3e50]'
    },
    grocery: {
        emoji: '🛒',
        color: 'from-[#5a8a9f] to-[#3d5a80]'
    },
    'sports & fitness': {
        emoji: '🏀',
        color: 'from-[#4d6d85] to-[#3d5a80]'
    },
    gaming: {
        emoji: '🎮',
        color: 'from-[#5a8a9f] to-[#3d5a80]'
    },
    'baby & kids': {
        emoji: '👶',
        color: 'from-[#81a4c4] to-[#5a8a9f]'
    },
    fashion: {
        emoji: '👗',
        color: 'from-[#5a8a9f] to-[#3d5a80]'
    },
    travel: {
        emoji: '✈️',
        color: 'from-[#6b8ea1] to-[#4d6d85]'
    },
    gifts: {
        emoji: '🎁',
        color: 'from-[#5a8a9f] to-[#3d5a80]'
    }
};

export function CategoryNavigation({ useAnchorLinks = false }: CategoryNavigationProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [_activeTab, _setActiveTab] = useState<string | null>(null);
    const pathname = usePathname();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const _controls = useAnimation();
    const _x = useMotionValue(0);
    const _dragStart = useRef(0);
    const _dragEnd = useRef(0);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);
    const [needNavigation, setNeedNavigation] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [activeCardIndex, setActiveCardIndex] = useState(0);
    const [_scrollDirection, setScrollDirection] = useState<'left' | 'right' | null>(null);
    const lastScrollPosition = useRef(0);
    const [activePointIndex, setActivePointIndex] = useState<number>(0);

    // 使用ref来跟踪已处理的数据，避免重复处理
    const processedDataRef = useRef<boolean>(false);

    // 添加存储卡片位置的ref
    const cardPositions = useRef<number[]>([]);

    // 更新当前激活的卡片索引 - 优化性能和精确度
    const updateActiveCardIndex = useCallback(() => {
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
    }, [categories.length, activeCardIndex]);

    // 检查是否需要导航控件（当内容宽度超过容器宽度时）
    const checkIfNavigationNeeded = useCallback(() => {
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
    }, []);

    // 检测滚动容器的滚动位置，更新箭头显示状态
    const handleScroll = useCallback(() => {
        if (!scrollContainerRef.current || !needNavigation) return;

        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

        setShowLeftArrow(scrollLeft > 20);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    }, [needNavigation]);

    // 使用 useCategoryStats 钩子获取分类数据
    const { data: categoryStats, isLoading, isError } = useCategoryStats({
        page: 1,
        page_size: 50,
        sort_by: 'count',
        sort_order: 'desc'
    });

    // 使用useScroll钩子来监听滚动容器的滚动位置
    const { scrollXProgress } = useScroll({
        container: scrollContainerRef,
        layoutEffect: false
    });

    // 添加scrollXProgress的事件监听，用于实时更新方向和激活索引
    useMotionValueEvent(scrollXProgress, "change", (_latest) => {
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
    const _currentActiveIndex = useTransform(indicatorProgress, (progress) => Math.round(progress));

    // 使用useMotionValueEvent监听indicatorProgress变化并更新activePointIndex
    useMotionValueEvent(indicatorProgress, "change", (latest) => {
        const roundedIndex = Math.round(latest);

        if (roundedIndex !== activePointIndex) {
            setActivePointIndex(roundedIndex);
        }
    });

    // 改为使用普通函数，而不是在循环中使用React Hooks
    const _calculateDotScale = (progress: number, index: number) => {
        const diff = Math.abs(progress - index);

        return diff <= 0.5 ? 1.3 - (0.3 * (diff * 2)) : 1;
    };

    const _calculateOpacity = (progress: number, index: number) => {
        const diff = Math.abs(progress - index);

        return diff < 0.8 ? Math.max(0, 1 - (diff / 0.8)) : 0;
    };

    const _calculateScaleX = (progress: number, index: number) => {
        const diff = Math.abs(progress - index);

        return diff < 0.8 ? Math.max(0, 1 - (diff / 0.8)) : 0;
    };

    const _calculateButtonScale = (progress: number, index: number) => {
        const diff = Math.abs(progress - index);

        return diff <= 0.5 ? 1 + (0.15 * (1 - diff * 2)) : 1;
    };

    const _getDotColor = (activeIndex: number, index: number) => {
        return activeIndex === index ? 'var(--color-primary)' : 'var(--color-gray-300)';
    };

    // 使用useTransform转换indicatorProgress的值
    const _transformedIndicatorProgress = useTransform(indicatorProgress, value => value);

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
    }, [checkIfNavigationNeeded]); // 添加checkIfNavigationNeeded作为依赖项

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
                    .filter(([_groupName, count]) => count > 50)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 8) // 取前8个
                    .map(([groupName, count], index) => {
                        // 使用原始的groupName作为slug，确保与API参数一致
                        const slug = groupName;

                        // 从映射中获取显示名称，如果没有则使用原始分类名称
                        const displayName = productGroupToCategoryMapping[groupName]?.name || groupName;

                        // 尝试从映射中获取图标和颜色
                        // 使用转换为小写的原始分类名称作为键来匹配图标
                        const slugKey = groupName.toLowerCase();
                        const iconInfo = categoryIcons[slugKey] ||
                            // 尝试使用映射后的名称作为键
                            categoryIcons[productGroupToCategoryMapping[groupName]?.slug.toLowerCase()] ||
                        // 默认图标
                        {
                            emoji: '🛒',
                            color: 'from-gray-400 to-gray-600'
                        };

                        return {
                            id: index.toString(),
                            name: displayName,
                            slug: slug, // 使用原始分类名称作为slug
                            count: count,
                            emoji: iconInfo.emoji,
                            color: iconInfo.color
                        };
                    });

                setCategories(sortedCategories);
                setError(null);
                processedDataRef.current = true;
            } catch {
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
    }, [handleScroll, updateActiveCardIndex, checkIfNavigationNeeded]); // 添加checkIfNavigationNeeded作为依赖项

    // 当分类数据变化时更新激活卡片索引
    useEffect(() => {
        if (categories.length > 0) {
            // 分类数据加载后更新一次指示器状态
            setTimeout(updateActiveCardIndex, 300);
        }
    }, [categories, updateActiveCardIndex]); // 添加updateActiveCardIndex依赖项

    // 判断一个分类是否被激活
    const isActiveCategory = (slug: string) => {
        // 检查当前路径
        if (pathname === '/') {
            // 在主页上，检查当前滚动位置是否在对应分类区域
            const categoryElement = document.getElementById(`category-${slug}`);

            if (categoryElement) {
                const rect = categoryElement.getBoundingClientRect();
                // 考虑到顶部导航栏的高度（120px），以及一些容差值
                const topOffset = 120;
                const bottomOffset = window.innerHeight / 2;

                return rect.top >= -topOffset && rect.top <= bottomOffset;
            }

            return false;
        } else if (pathname.startsWith('/products')) {
            // 在产品页面上，检查 URL 参数
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const productGroups = urlParams.get('product_groups');

                return productGroups === slug;
            } catch {
                return false;
            }
        }

        return false;
    };

    // 添加滚动监听
    useEffect(() => {
        if (useAnchorLinks) {
            const handleScroll = () => {
                // 强制重新渲染以更新激活状态
                setCategories([...categories]);
            };

            // 使用节流函数来限制滚动事件的触发频率
            let timeoutId: ReturnType<typeof setTimeout> | null = null;
            const throttledHandleScroll = () => {
                if (!timeoutId) {
                    timeoutId = setTimeout(() => {
                        handleScroll();
                        timeoutId = null;
                    }, 100); // 每 100ms 最多触发一次
                }
            };

            window.addEventListener('scroll', throttledHandleScroll);

            return () => {
                window.removeEventListener('scroll', throttledHandleScroll);
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            };
        }
    }, [categories, useAnchorLinks]);

    // 处理分类点击事件
    const handleCategoryClick = (slug: string) => {
        if (!slug) return;

        if (useAnchorLinks) {
            // 使用锚点链接滚动到对应分类区域
            const categoryElement = document.getElementById(`category-${slug}`);

            if (categoryElement) {
                // 滚动到元素，添加一些顶部偏移以避免被导航栏遮挡
                window.scrollTo({
                    top: categoryElement.offsetTop - 120, // 120px的偏移，根据需要调整
                    behavior: 'smooth'
                });
            }
        } else {
            // 原有行为：构建产品页面URL，使用原始分类名称作为product_groups参数
            const productPageUrl = `/products?product_groups=${encodeURIComponent(slug)}`;

            // 使用window.location导航
            window.location.href = productPageUrl;
        }
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
    const _scrollToCard = (index: number) => {
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
    }, [updateActiveCardIndex]); // 添加依赖项

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
    }, [categories, updateActiveCardIndex]); // 添加updateActiveCardIndex依赖项

    // 检查是否在侧边栏中
    const _isSidebar = typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : false;

    useEffect(() => {
        const checkIsSidebar = () => {
            if (typeof window !== 'undefined') {
                const newIsSidebar = window.matchMedia('(min-width: 1024px)').matches;

                setIsMobile(!newIsSidebar);
            }
        };

        // 初始检查
        checkIsSidebar();

        // 添加窗口尺寸变化监听
        window.addEventListener('resize', checkIsSidebar);

        return () => {
            window.removeEventListener('resize', checkIsSidebar);
        };
    }, []);

    if (isLoading) {
        return (
            <div className="relative my-6 lg:my-0 px-2 md:px-4 lg:px-0">
                <h2 className="text-2xl font-bold mb-4 text-center lg:hidden bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Popular Categories</h2>
                <div className="overflow-hidden">
                    <div className="flex lg:flex-col space-x-4 lg:space-x-0 lg:space-y-3 py-2">
                        {Array.from({ length: 8 }).map((_, i) => {
                            // 生成唯一标识符，避免使用索引作为key
                            const uniqueId = `skeleton-${i}-${Math.random().toString(36).substring(2, 9)}`;

                            return (
                                <div key={uniqueId} className="flex-shrink-0 w-32 md:w-40 lg:w-full">
                                    <div className="bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl p-4 animate-pulse h-40 lg:h-16">
                                        <div className="w-16 h-16 mx-auto lg:hidden bg-gray-200 dark:bg-gray-700 rounded-full mb-4" />
                                        <div className="h-4 w-20 lg:w-full mx-auto bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-6 lg:my-0 text-center px-4 lg:px-0">
                <h2 className="text-2xl font-bold mb-4 lg:hidden text-primary">Popular Categories</h2>
                <div className="p-6 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-md rounded-xl shadow-lg border border-red-100 dark:border-red-800/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-error mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-error dark:text-error mb-4 font-medium">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2.5 bg-error text-white rounded-full hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-error focus:ring-opacity-50"
                    >
                        Reload
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative my-6 lg:my-0">
            <div className="absolute left-0 right-0 h-48 lg:h-full bg-gray-100 dark:bg-gray-800/20 -z-10 opacity-50" />

            {/* Mobile and tablet title, hidden on large screens */}
            <h2 className="text-2xl font-bold mb-4 text-center lg:hidden text-primary-dark dark:text-white">Popular Categories</h2>

            <div className="relative px-3 md:px-4 lg:px-0">
                {/* Left scroll button - visible in non-desktop mode */}
                <AnimatePresence>
                    {needNavigation && showLeftArrow && !isMobile && (
                        <motion.button
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-gray-800 p-1.5 md:p-2 rounded-full shadow-md border border-gray-200 dark:border-gray-700 text-primary-dark dark:text-white hover:text-primary dark:hover:text-primary-light focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary-light/50 lg:hidden"
                            onClick={scrollLeft}
                            aria-label="Scroll left"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Right scroll button - visible in non-desktop mode */}
                <AnimatePresence>
                    {needNavigation && showRightArrow && !isMobile && (
                        <motion.button
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-gray-800 p-1.5 md:p-2 rounded-full shadow-md border border-gray-200 dark:border-gray-700 text-primary-dark dark:text-white hover:text-primary dark:hover:text-primary-light focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary-light/50 lg:hidden"
                            onClick={scrollRight}
                            aria-label="Scroll right"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Add gradient edge masks to solve the cutoff feeling - visible in non-desktop mode */}
                {needNavigation && (
                    <div className="lg:hidden">
                        <div className="absolute left-0 top-2 bottom-2 w-8 sm:w-12 bg-gradient-to-r from-white via-white/95 to-transparent dark:from-gray-900 dark:via-gray-900/95 dark:to-transparent pointer-events-none z-10" />
                        <div className="absolute right-0 top-2 bottom-2 w-8 sm:w-12 bg-gradient-to-l from-white via-white/95 to-transparent dark:from-gray-900 dark:via-gray-900/95 dark:to-transparent pointer-events-none z-10" />
                    </div>
                )}

                {/* Category list - scrollable in non-desktop, vertical list in desktop */}
                <div id="categoriesContainer"
                    ref={scrollContainerRef}
                    className={`
                        overflow-x-auto lg:overflow-x-visible overflow-y-hidden lg:overflow-y-visible 
                        scrollbar-hide relative pb-4 lg:pb-0
                        flex lg:flex-col whitespace-nowrap space-x-4 lg:space-x-0 lg:space-y-2
                    `}
                    onScroll={handleScroll}
                >
                    {/* All Categories button */}
                    <motion.div
                        key="all-categories"
                        className="flex-shrink-0 w-32 sm:w-40 lg:w-full"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.5,
                            delay: 0.05,
                            ease: [0.4, 0.0, 0.2, 1]
                        }}
                        whileHover={{ y: isMobile ? -8 : 0, transition: { duration: 0.3, type: "spring", stiffness: 300 } }}
                        whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
                    >
                        {useAnchorLinks ? (
                            <button
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }
                                }}
                                className="block cursor-pointer w-full text-left"
                                aria-label="查看所有分类"
                            >
                                <motion.div
                                    className={`
                                        relative overflow-hidden rounded-xl lg:rounded-md
                                        ${!isMobile ? 'h-40 sm:h-44 md:h-48 lg:h-auto lg:py-2.5' : 'h-40 sm:h-44 md:h-48'}
                                        bg-gray-100 dark:bg-gray-800/60
                                        border border-gray-200 dark:border-gray-700
                                        p-3 sm:p-4 lg:py-2.5 lg:px-3 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col lg:flex-row items-center lg:items-center lg:justify-start w-full
                                    `}
                                    whileHover={{
                                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                                        transition: { duration: 0.3 }
                                    }}
                                >
                                    {/* Icon */}
                                    <motion.div
                                        className="relative w-9 h-9 sm:w-10 sm:h-10 lg:w-9 lg:h-9 rounded-full mb-3 sm:mb-4 lg:mb-0 lg:mr-3 flex items-center justify-center bg-white dark:bg-gray-700 text-primary dark:text-primary-light shadow-sm group-hover:shadow-md transition-all duration-300"
                                        whileHover={{
                                            scale: isMobile ? 1.1 : 1.05,
                                            transition: { duration: 0.2 }
                                        }}
                                    >
                                        <span className="text-xl lg:text-lg">🔍</span>
                                    </motion.div>

                                    {/* Text */}
                                    <motion.h3
                                        className="text-center lg:text-left font-medium text-xs sm:text-sm md:text-base lg:text-sm text-primary-dark dark:text-white transition-colors lg:flex-1"
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.2 }}
                                    >
                                        All Categories
                                    </motion.h3>
                                </motion.div>
                            </button>
                        ) : (
                            <Link
                                href="/products"
                                className={`block ${isActiveCategory('all') ? 'pointer-events-none' : ''}`}
                            >
                                <motion.div
                                    className={`
                                        relative overflow-hidden rounded-xl lg:rounded-md
                                        ${!isMobile ? 'h-40 sm:h-44 md:h-48 lg:h-auto lg:py-2.5' : 'h-40 sm:h-44 md:h-48'}
                                        bg-gray-100 dark:bg-gray-800/60
                                        border border-gray-200 dark:border-gray-700
                                        p-3 sm:p-4 lg:py-2.5 lg:px-3 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col lg:flex-row items-center lg:items-center lg:justify-start w-full
                                    `}
                                    whileHover={{
                                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                                        transition: { duration: 0.3 }
                                    }}
                                >
                                    {/* Icon */}
                                    <motion.div
                                        className="relative w-9 h-9 sm:w-10 sm:h-10 lg:w-9 lg:h-9 rounded-full mb-3 sm:mb-4 lg:mb-0 lg:mr-3 flex items-center justify-center bg-white dark:bg-gray-700 text-primary dark:text-primary-light shadow-sm group-hover:shadow-md transition-all duration-300"
                                        whileHover={{
                                            scale: isMobile ? 1.1 : 1.05,
                                            transition: { duration: 0.2 }
                                        }}
                                    >
                                        <span className="text-xl lg:text-lg">🔍</span>
                                    </motion.div>

                                    {/* Text */}
                                    <motion.h3
                                        className="text-center lg:text-left font-medium text-xs sm:text-sm md:text-base lg:text-sm text-primary-dark dark:text-white transition-colors lg:flex-1"
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.2 }}
                                    >
                                        All Categories
                                    </motion.h3>
                                </motion.div>
                            </Link>
                        )}
                    </motion.div>

                    {/* Dynamic categories */}
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.slug}
                            className="flex-shrink-0 w-32 sm:w-40 lg:w-full group"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.5,
                                delay: index * 0.08,
                                ease: [0.4, 0.0, 0.2, 1]
                            }}
                            whileHover={{ y: isMobile ? -8 : 0, transition: { duration: 0.3, type: "spring", stiffness: 300 } }}
                            whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
                        >
                            {useAnchorLinks ? (
                                <button
                                    className={`block cursor-pointer w-full text-left ${isActiveCategory(category.slug) ? 'pointer-events-none' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCategoryClick(category.slug);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleCategoryClick(category.slug);
                                        }
                                    }}
                                    aria-label={`查看${category.name}分类`}
                                >
                                    <motion.div
                                        className={`
                                            relative overflow-hidden rounded-xl lg:rounded-md
                                            ${!isMobile ? 'h-40 sm:h-44 md:h-48 lg:h-auto lg:py-2' : 'h-40 sm:h-44 md:h-48'}
                                            ${isActiveCategory(category.slug)
                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400'
                                                : 'bg-white dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-700/80 border border-gray-100 dark:border-gray-700/50'
                                            }
                                            p-3 sm:p-4 lg:py-2 lg:px-3 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col lg:flex-row items-center lg:items-center lg:justify-start w-full mb-1.5
                                        `}
                                        whileHover={{
                                            boxShadow: "0 8px 20px -4px rgba(0, 0, 0, 0.1), 0 6px 8px -4px rgba(0, 0, 0, 0.03)",
                                            transition: { duration: 0.3 }
                                        }}
                                    >
                                        {/* Category icon */}
                                        <motion.div
                                            className={`
                                                relative w-9 h-9 sm:w-10 sm:h-10 lg:w-9 lg:h-9 rounded-full mb-3 sm:mb-4 lg:mb-0 lg:mr-3 flex items-center justify-center 
                                                ${isActiveCategory(category.slug)
                                                    ? 'bg-blue-500 dark:bg-blue-400 text-white'
                                                    : 'bg-gray-50 dark:bg-gray-700/60 text-gray-700 dark:text-gray-200'
                                                }
                                                shadow-sm transition-all duration-300
                                            `}
                                            whileHover={{
                                                scale: isMobile ? 1.1 : 1.05,
                                                transition: { duration: 0.2 }
                                            }}
                                        >
                                            {/* 显示emoji图标 */}
                                            <span className="text-xl lg:text-lg">
                                                {category.emoji || categoryIcons[category.slug.toLowerCase()]?.emoji || '🛒'}
                                            </span>
                                        </motion.div>

                                        {/* Category name and count */}
                                        <div className="lg:flex-1 text-center lg:text-left w-full">
                                            <motion.h3
                                                className={`
                                                    text-xs sm:text-sm md:text-base lg:text-sm font-medium mb-1 sm:mb-2 lg:mb-0 transition-colors truncate
                                                    ${isActiveCategory(category.slug)
                                                        ? 'text-blue-700 dark:text-blue-300'
                                                        : 'text-gray-700 dark:text-gray-200'
                                                    }
                                                `}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: 0.1 }}
                                            >
                                                {category.name}
                                            </motion.h3>
                                            {category.count > 0 && (
                                                <motion.p
                                                    className={`
                                                        text-xs transition-colors
                                                        ${isActiveCategory(category.slug)
                                                            ? 'text-blue-500/70 dark:text-blue-400/70'
                                                            : 'text-gray-500 dark:text-gray-400'
                                                        }
                                                    `}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.3, delay: 0.2 }}
                                                >
                                                    {category.count} items
                                                </motion.p>
                                            )}
                                        </div>
                                    </motion.div>
                                </button>
                            ) : (
                                <Link
                                    href={`/products?product_groups=${encodeURIComponent(category.slug)}`}
                                    className={`block ${isActiveCategory(category.slug) ? 'pointer-events-none' : ''}`}
                                >
                                    <motion.div
                                        className={`
                                            relative overflow-hidden rounded-xl lg:rounded-md
                                            ${!isMobile ? 'h-40 sm:h-44 md:h-48 lg:h-auto lg:py-2' : 'h-40 sm:h-44 md:h-48'}
                                            ${isActiveCategory(category.slug)
                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400'
                                                : 'bg-white dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-700/80 border border-gray-100 dark:border-gray-700/50'
                                            }
                                            p-3 sm:p-4 lg:py-2 lg:px-3 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col lg:flex-row items-center lg:items-center lg:justify-start w-full mb-1.5
                                        `}
                                        whileHover={{
                                            boxShadow: "0 8px 20px -4px rgba(0, 0, 0, 0.1), 0 6px 8px -4px rgba(0, 0, 0, 0.03)",
                                            transition: { duration: 0.3 }
                                        }}
                                    >
                                        {/* Category icon */}
                                        <motion.div
                                            className={`
                                                relative w-9 h-9 sm:w-10 sm:h-10 lg:w-9 lg:h-9 rounded-full mb-3 sm:mb-4 lg:mb-0 lg:mr-3 flex items-center justify-center 
                                                ${isActiveCategory(category.slug)
                                                    ? 'bg-blue-500 dark:bg-blue-400 text-white'
                                                    : 'bg-gray-50 dark:bg-gray-700/60 text-gray-700 dark:text-gray-200'
                                                }
                                                shadow-sm transition-all duration-300
                                            `}
                                            whileHover={{
                                                scale: isMobile ? 1.1 : 1.05,
                                                transition: { duration: 0.2 }
                                            }}
                                        >
                                            {/* 显示emoji图标 */}
                                            <span className="text-xl lg:text-lg">
                                                {category.emoji || categoryIcons[category.slug.toLowerCase()]?.emoji || '🛒'}
                                            </span>
                                        </motion.div>

                                        {/* Category name and count */}
                                        <div className="lg:flex-1 text-center lg:text-left w-full">
                                            <motion.h3
                                                className={`
                                                    text-xs sm:text-sm md:text-base lg:text-sm font-medium mb-1 sm:mb-2 lg:mb-0 transition-colors truncate
                                                    ${isActiveCategory(category.slug)
                                                        ? 'text-blue-700 dark:text-blue-300'
                                                        : 'text-gray-700 dark:text-gray-200'
                                                    }
                                                `}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: 0.1 }}
                                            >
                                                {category.name}
                                            </motion.h3>
                                            {category.count > 0 && (
                                                <motion.p
                                                    className={`
                                                        text-xs transition-colors
                                                        ${isActiveCategory(category.slug)
                                                            ? 'text-blue-500/70 dark:text-blue-400/70'
                                                            : 'text-gray-500 dark:text-gray-400'
                                                        }
                                                    `}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.3, delay: 0.2 }}
                                                >
                                                    {category.count} items
                                                </motion.p>
                                            )}
                                        </div>
                                    </motion.div>
                                </Link>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
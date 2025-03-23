"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useMotionValue, useTransform, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useCategoryStats } from '@/lib/hooks';
// 导入Lucide图标组件
import {
    Smartphone,
    Shirt,
    Home,
    Coffee,
    Sofa,
    ShoppingBag,
    Dumbbell,
    Sparkles,
    Monitor,
    Footprints,
    Wifi,
    Leaf,
    Pill,
    Car
} from 'lucide-react';

// 自定义Category接口
interface Category {
    id: string;
    name: string;
    slug: string;
    count: number;
    icon?: React.ReactNode | string;
    color?: string;
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

// 分类图标映射 - 使用Lucide图标替换SVG路径
const categoryIcons: Record<string, { icon: React.ReactNode, color: string }> = {
    electronics: {
        icon: <Smartphone className="w-full h-full" />,
        color: 'from-blue-500 to-indigo-600'
    },
    home: {
        icon: <Home className="w-full h-full" />,
        color: 'from-amber-500 to-orange-600'
    },
    kitchen: {
        icon: <Coffee className="w-full h-full" />,
        color: 'from-emerald-500 to-green-600'
    },
    apparel: {
        icon: <Shirt className="w-full h-full" />,
        color: 'from-pink-500 to-rose-600'
    },
    sports: {
        icon: <Dumbbell className="w-full h-full" />,
        color: 'from-cyan-500 to-blue-600'
    },
    beauty: {
        icon: <Sparkles className="w-full h-full" />,
        color: 'from-purple-500 to-violet-600'
    },
    furniture: {
        icon: <Sofa className="w-full h-full" />,
        color: 'from-brown-500 to-amber-600'
    },
    shoes: {
        icon: <Footprints className="w-full h-full" />,
        color: 'from-yellow-500 to-red-500'
    },
    computers: {
        icon: <Monitor className="w-full h-full" />,
        color: 'from-blue-400 to-indigo-500'
    },
    'personal computer': {
        icon: <Monitor className="w-full h-full" />,
        color: 'from-blue-400 to-indigo-500'
    },
    'lawn & patio': {
        icon: <Leaf className="w-full h-full" />,
        color: 'from-green-500 to-teal-600'
    },
    garden: {
        icon: <Leaf className="w-full h-full" />,
        color: 'from-green-500 to-teal-600'
    },
    wireless: {
        icon: <Wifi className="w-full h-full" />,
        color: 'from-sky-500 to-blue-600'
    },
    drugstore: {
        icon: <Pill className="w-full h-full" />,
        color: 'from-red-500 to-pink-600'
    },
    health: {
        icon: <Pill className="w-full h-full" />,
        color: 'from-red-500 to-pink-600'
    },
    automotive: {
        icon: <Car className="w-full h-full" />,
        color: 'from-gray-500 to-gray-700'
    },
    'automotive parts and accessories': {
        icon: <Car className="w-full h-full" />,
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
                            icon: <ShoppingBag className="w-full h-full" />,
                            color: 'from-gray-400 to-gray-600'
                        };

                        return {
                            id: index.toString(),
                            name: displayName,
                            slug: slug, // 使用原始分类名称作为slug
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

    // 判断一个分类是否被激活
    const isActiveCategory = (slug: string) => {
        // 检查当前路径是否为产品页面
        if (pathname.startsWith('/products')) {
            // 尝试从URL获取product_groups参数
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const productGroups = urlParams.get('product_groups');
                return productGroups === slug;
            } catch (error) {
                // 如果解析URL参数出错，返回false
                return false;
            }
        }
        return false;
    };

    // 处理分类点击事件
    const handleCategoryClick = (slug: string) => {
        if (!slug) return;

        // 构建产品页面URL，使用原始分类名称作为product_groups参数
        const productPageUrl = `/products?product_groups=${encodeURIComponent(slug)}`;

        // 使用window.location导航
        window.location.href = productPageUrl;
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

    // 检查是否在侧边栏中
    const isSidebar = typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : false;
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
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div key={index} className="flex-shrink-0 w-32 md:w-40 lg:w-full">
                                <div className="bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl p-4 animate-pulse h-40 lg:h-16">
                                    <div className="w-16 h-16 mx-auto lg:hidden bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>
                                    <div className="h-4 w-20 lg:w-full mx-auto bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
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
            <div className="my-6 lg:my-0 text-center px-4 lg:px-0">
                <h2 className="text-2xl font-bold mb-4 lg:hidden bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Popular Categories</h2>
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
        <div className="relative my-6 lg:my-0">
            <div className="absolute left-0 right-0 h-48 lg:h-full bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 -z-10 blur-3xl opacity-50"></div>

            {/* Mobile and tablet title, hidden on large screens */}
            <h2 className="text-2xl font-bold mb-4 text-center lg:hidden bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Popular Categories</h2>

            <div className="relative px-3 md:px-4 lg:px-0">
                {/* Left scroll button - visible in non-desktop mode */}
                <AnimatePresence>
                    {needNavigation && showLeftArrow && !isMobile && (
                        <motion.button
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-1.5 md:p-2 rounded-full shadow-md border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary-light/50 lg:hidden"
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
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-1.5 md:p-2 rounded-full shadow-md border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary-light/50 lg:hidden"
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
                        <div className="absolute left-0 top-2 bottom-2 w-8 sm:w-12 bg-gradient-to-r from-white via-white/95 to-transparent dark:from-gray-900 dark:via-gray-900/95 dark:to-transparent pointer-events-none z-10"></div>
                        <div className="absolute right-0 top-2 bottom-2 w-8 sm:w-12 bg-gradient-to-l from-white via-white/95 to-transparent dark:from-gray-900 dark:via-gray-900/95 dark:to-transparent pointer-events-none z-10"></div>
                    </div>
                )}

                {/* Scroll container - vertical layout on large screens */}
                <div
                    ref={scrollContainerRef}
                    className="overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto hide-scrollbar pb-2 pt-1 lg:pt-0 lg:pb-0 lg:max-h-[calc(100vh-12rem)] snap-x lg:snap-none snap-mandatory"
                    style={{
                        scrollbarWidth: 'none', // Firefox
                        msOverflowStyle: 'none', // IE and Edge
                        scrollBehavior: 'smooth'
                    }}
                    onScroll={handleScroll}
                >
                    <div className="flex lg:flex-col space-x-3 lg:space-x-0  sm:space-x-4 md:space-x-5 lg:space-y-3 px-2 md:px-4 lg:px-0">
                        {/* All Categories 按钮 - 始终显示在最前面 */}
                        <motion.div
                            className="flex-shrink-0 w-[110px] sm:w-[135px] md:w-[160px] lg:w-full snap-center lg:snap-align-none"
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
                            <Link
                                href="/categories"
                                className="block group"
                            >
                                <motion.div
                                    className={`
                                        relative overflow-hidden rounded-xl lg:rounded-lg
                                        ${!isMobile ? 'h-40 sm:h-44 md:h-48 lg:h-auto lg:py-3' : 'h-40 sm:h-44 md:h-48'}
                                        bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20
                                        border border-primary/20 dark:border-primary-light/20
                                        p-3 sm:p-4 lg:py-3 lg:px-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col lg:flex-row items-center lg:items-center lg:justify-start
                                    `}
                                    whileHover={{
                                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                                        transition: { duration: 0.3 }
                                    }}
                                >
                                    {/* Icon */}
                                    <motion.div
                                        className="relative w-14 h-14 sm:w-16 sm:h-16 lg:w-10 lg:h-10 rounded-full mb-3 sm:mb-4 lg:mb-0 lg:mr-3 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 text-primary dark:text-primary-light shadow-sm group-hover:shadow-md transition-all duration-300"
                                        whileHover={{
                                            scale: isMobile ? 1.1 : 1.05,
                                            transition: { duration: 0.2 }
                                        }}
                                    >
                                        <motion.svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-7 w-7 sm:h-8 sm:w-8 lg:h-5 lg:w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                                        </motion.svg>
                                    </motion.div>

                                    {/* Text */}
                                    <motion.h3
                                        className="text-center lg:text-left font-medium text-xs sm:text-sm md:text-base lg:text-sm text-primary dark:text-primary-light transition-colors lg:flex-1"
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.2 }}
                                    >
                                        All Categories
                                    </motion.h3>

                                    {/* Count badge - only shown on large screens */}
                                    <div className="hidden lg:block">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                                            All
                                        </span>
                                    </div>
                                </motion.div>
                            </Link>
                        </motion.div>

                        {/* 分类卡片 */}
                        {categories.map((category, index) => (
                            <motion.div
                                key={category.id}
                                className="flex-shrink-0 w-[110px] sm:w-[135px] md:w-[160px] lg:w-full snap-center lg:snap-align-none"
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
                                <Link
                                    href={`/products?product_groups=${encodeURIComponent(category.slug)}`}
                                    className={`block ${isActiveCategory(category.slug) ? 'pointer-events-none' : ''}`}
                                >
                                    <motion.div
                                        className={`
                                            relative overflow-hidden rounded-xl lg:rounded-lg
                                            ${!isMobile ? 'h-40 sm:h-44 md:h-48 lg:h-auto lg:py-2' : 'h-40 sm:h-44 md:h-48'}
                                            ${isActiveCategory(category.slug)
                                                ? 'bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-primary/30 dark:to-secondary/30 ring-2 ring-primary/50 dark:ring-primary-light/50'
                                                : 'bg-white/40 dark:bg-gray-800/40 backdrop-blur-md hover:bg-gradient-to-br hover:from-gray-50/80 hover:to-white/80 dark:hover:from-gray-800/80 dark:hover:to-gray-700/80 border border-gray-100/80 dark:border-gray-700/50 hover:border-primary/20 dark:hover:border-primary-light/20'
                                            }
                                            p-3 sm:p-4 lg:py-2 lg:px-3 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col lg:flex-row items-center lg:items-center lg:justify-start
                                        `}
                                        whileHover={{
                                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                                            transition: { duration: 0.3 }
                                        }}
                                    >
                                        {/* Decorative element - random positioned dots */}
                                        <motion.div
                                            className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 opacity-10 lg:hidden"
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

                                        {/* Category icon */}
                                        <motion.div
                                            className={`
                                                relative w-14 h-14 sm:w-16 sm:h-16 lg:w-10 lg:h-10 rounded-full mb-3 sm:mb-4 lg:mb-0 lg:mr-3 flex items-center justify-center 
                                                ${isActiveCategory(category.slug)
                                                    ? `bg-gradient-to-br ${category.color || 'from-gray-400 to-gray-500'} text-white`
                                                    : `bg-gradient-to-br ${category.color ? `${category.color}/10` : 'from-gray-400/10 to-gray-500/10'} text-gray-700 dark:text-gray-200 group-hover:${category.color ? `${category.color}/20` : 'from-gray-400/20 to-gray-500/20'}`
                                                }
                                                shadow-sm group-hover:shadow-md transition-all duration-300
                                            `}
                                            whileHover={{
                                                scale: isMobile ? 1.1 : 1.05,
                                                rotate: isMobile ? [0, 5, -5, 0] : [0, 0, 0, 0],
                                                transition: {
                                                    scale: { duration: 0.2 },
                                                    rotate: { duration: 0.5, repeat: 0 }
                                                }
                                            }}
                                            animate={isMobile ? {
                                                scale: [1, 1.03, 1],
                                                rotate: [0, 2, -2, 0],
                                            } : {
                                                scale: 1,
                                                rotate: 0
                                            }}
                                            transition={{
                                                duration: 4,
                                                repeat: Infinity,
                                                repeatType: "reverse",
                                                ease: "easeInOut"
                                            }}
                                        >
                                            {/* 动态渲染图标：如果是ReactNode直接渲染，如果是string则用作path */}
                                            {typeof category.icon === 'string' ? (
                                                <motion.svg
                                                    className={`h-7 w-7 sm:h-8 sm:w-8 lg:h-5 lg:w-5 ${isActiveCategory(category.slug) ? 'text-white' : 'group-hover:text-gray-700 dark:group-hover:text-gray-300'}`}
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
                                            ) : (
                                                <motion.div
                                                    className={`h-7 w-7 sm:h-8 sm:w-8 lg:h-5 lg:w-5 ${isActiveCategory(category.slug) ? 'text-white' : 'group-hover:text-gray-700 dark:group-hover:text-gray-300'}`}
                                                    initial={{ opacity: 0.8 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        repeatType: "reverse"
                                                    }}
                                                >
                                                    {category.icon}
                                                </motion.div>
                                            )}

                                            {/* Highlight light effect */}
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

                                            {/* Add decorative particle effect - only display in non-desktop mode */}
                                            {isMobile && (
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
                                            )}
                                        </motion.div>

                                        {/* Category name */}
                                        <motion.h3
                                            className={`
                                                text-center lg:text-left font-medium text-xs sm:text-sm md:text-base lg:text-sm
                                                ${isActiveCategory(category.slug)
                                                    ? 'text-primary dark:text-primary-light'
                                                    : 'text-gray-700 dark:text-gray-200 group-hover:text-primary/80 dark:group-hover:text-primary-light/80'
                                                }
                                                transition-colors lg:flex-1
                                            `}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.08 + 0.2 }}
                                            whileHover={{
                                                scale: isMobile ? 1.05 : 1,
                                                transition: { duration: 0.2 }
                                            }}
                                        >
                                            {category.name}
                                        </motion.h3>

                                        {/* Add count display - only shown in large screen sidebar mode */}
                                        <div className="hidden lg:block">
                                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                                                {category.count}
                                            </span>
                                        </div>
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
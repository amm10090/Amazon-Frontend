"use client";

import { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { productsApi } from '@/lib/api';
import ProductList from '@/components/ProductList';
import { ProductFilter } from '@/components/products/ProductFilter';
import { ProductCategoryNav } from '@/components/product/ProductCategoryNav';
import ApiStateWrapper from '@/components/ui/ApiStateWrapper';
import { useProducts, useCategories } from '@/lib/hooks';
import { Product } from '@/types/api';
import { AmazonProduct } from '@/types/amazonApi';
import { ComponentProduct } from '@/types';
import { adaptProducts } from '@/lib/utils';
import axios from 'axios';
import { useSearchParams, useRouter } from 'next/navigation';

// 交互式动画SVG组件替代原3D模型
const CategoryIllustration = ({ category }: { category: string }) => {
    const illustrations: Record<string, React.ReactNode> = {
        electronics: (
            <motion.div className="w-full h-full flex items-center justify-center">
                <motion.div
                    className="relative w-64 h-64"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-30"
                        animate={{
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                    />
                    <motion.div
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                            <path d="M3 7h18v10H3V7z" stroke="white" strokeWidth="2" />
                            <path d="M7 18v2M17 18v2M9 7V5M15 7V5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </motion.div>
                </motion.div>
            </motion.div>
        ),
        clothing: (
            <motion.div className="w-full h-full flex items-center justify-center">
                <motion.div
                    className="relative w-64 h-64"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full opacity-30"
                        animate={{
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                    />
                    <motion.div
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                            <path d="M6 3h12l2 4-5 2V21h-6V9L4 7l2-4z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </motion.div>
                </motion.div>
            </motion.div>
        ),
        home: (
            <motion.div className="w-full h-full flex items-center justify-center">
                <motion.div
                    className="relative w-64 h-64"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full opacity-30"
                        animate={{
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                    />
                    <motion.div
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 21v-8h6v8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </motion.div>
                </motion.div>
            </motion.div>
        ),
        default: (
            <motion.div className="w-full h-full flex items-center justify-center">
                <motion.div
                    className="relative w-64 h-64"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-30"
                        animate={{
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                    />
                    <motion.div
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32"
                        animate={{
                            rotate: 360,
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                            scale: { duration: 2, repeat: Infinity, repeatType: "reverse" }
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                            <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="2" />
                            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </motion.div>
                </motion.div>
            </motion.div>
        )
    };

    return illustrations[category] || illustrations.default;
};

// 液态按钮效果的SVG过滤器
const LiquidFilter = () => (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="liquid" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
            <feGaussianBlur in="SourceGraphic" stdDeviation={10} result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="liquid" />
            <feComposite in="SourceGraphic" in2="liquid" operator="atop" />
        </filter>
    </svg>
);

// 类型谓词函数，用于区分产品类型
const isAmazonProduct = (product: AmazonProduct | Product): product is AmazonProduct => {
    return 'asin' in product;
};

const isProduct = (product: AmazonProduct | Product): product is Product => {
    return 'id' in product;
};

export default function ProductsPage() {
    const [searchParams, setSearchParams] = useState({
        product_groups: '' as string,
        brands: '' as string,
        page: 1,
        limit: 12,
        sort_by: 'all' as 'price' | 'discount' | 'created' | 'all',
        sort_order: 'desc' as 'asc' | 'desc',
        min_price: undefined as number | undefined,
        max_price: undefined as number | undefined,
        min_discount: undefined as number | undefined,
        product_type: 'all' as 'discount' | 'coupon' | 'all',
        is_prime_only: false,
    });

    // 从URL加载参数
    const searchParamsFromUrl = useSearchParams();

    // 跟踪参数是否已从URL加载的状态
    const [urlParamsLoaded, setUrlParamsLoaded] = useState(false);

    // 添加useEffect，确保从URL参数正确加载
    useEffect(() => {
        // 获取URL参数（忽略时间戳参数_ts）
        const brands = searchParamsFromUrl.get('brands') || '';
        const product_groups = searchParamsFromUrl.get('product_groups') || '';
        const category = searchParamsFromUrl.get('category') || ''; // 兼容category参数
        const effective_category = product_groups || category; // 优先使用product_groups

        const page = Number(searchParamsFromUrl.get('page')) || 1;
        const min_price = searchParamsFromUrl.get('min_price') ? Number(searchParamsFromUrl.get('min_price')) : undefined;
        const max_price = searchParamsFromUrl.get('max_price') ? Number(searchParamsFromUrl.get('max_price')) : undefined;
        const min_discount = searchParamsFromUrl.get('min_discount') ? Number(searchParamsFromUrl.get('min_discount')) : undefined;
        const is_prime_only = searchParamsFromUrl.get('is_prime_only') === 'true';
        const sort_by = (searchParamsFromUrl.get('sort_by') as typeof searchParams.sort_by) || 'all';
        const sort_order = (searchParamsFromUrl.get('sort_order') as typeof searchParams.sort_order) || 'desc';

        // 更新searchParams状态，使用合并后的分类参数
        setSearchParams(prev => {
            const newParams = {
                ...prev,
                brands,
                product_groups: effective_category, // 使用合并后的分类参数
                page,
                min_price,
                max_price,
                min_discount,
                is_prime_only,
                sort_by,
                sort_order
            };

            return newParams;
        });

        // 标记URL参数已加载
        setUrlParamsLoaded(true);
    }, [searchParamsFromUrl]);

    // 引入useRouter和usePathname
    const router = useRouter();
    const pathname = '/products'; // 当前页面路径

    // 添加useEffect，当searchParams变化时更新URL
    useEffect(() => {
        // 创建URL参数对象
        const params = new URLSearchParams();

        // 仅添加有值的参数
        if (searchParams.product_groups) params.set('product_groups', searchParams.product_groups);
        if (searchParams.brands) params.set('brands', searchParams.brands);
        if (searchParams.page > 1) params.set('page', searchParams.page.toString());
        if (searchParams.min_price !== undefined) params.set('min_price', searchParams.min_price.toString());
        if (searchParams.max_price !== undefined) params.set('max_price', searchParams.max_price.toString());
        if (searchParams.min_discount !== undefined) params.set('min_discount', searchParams.min_discount.toString());
        if (searchParams.is_prime_only) params.set('is_prime_only', 'true');
        if (searchParams.sort_by !== 'all') params.set('sort_by', searchParams.sort_by);
        if (searchParams.sort_order !== 'desc') params.set('sort_order', searchParams.sort_order);

        // 构建查询字符串
        const queryString = params.toString();
        const url = queryString ? `${pathname}?${queryString}` : pathname;

        // 使用replace而不是push来更新URL，避免创建太多历史记录
        router.replace(url, { scroll: false });
    }, [searchParams, router, pathname]);

    // 清理URL中的时间戳参数
    useEffect(() => {
        if (typeof window !== 'undefined' && searchParamsFromUrl.has('_ts')) {
            // 创建一个新的URLSearchParams实例
            const cleanParams = new URLSearchParams();

            // 复制除了_ts之外的所有参数
            searchParamsFromUrl.forEach((value, key) => {
                if (key !== '_ts') {
                    cleanParams.append(key, value);
                }
            });

            // 构建干净的URL
            const cleanUrl = cleanParams.toString()
                ? `${pathname}?${cleanParams.toString()}`
                : pathname;

            // 延迟200ms后清理URL，避免干扰初始数据加载
            const timeoutId = setTimeout(() => {
                router.replace(cleanUrl, { scroll: false });
            }, 200);

            return () => clearTimeout(timeoutId);
        }
    }, [searchParamsFromUrl, router, pathname]);

    // 只有当urlParamsLoaded为true时才获取产品数据，确保使用的是从URL加载的参数
    const { data, isLoading, isError, mutate } = useProducts(urlParamsLoaded ? searchParams : undefined);
    const [isDirectLoading, setIsDirectLoading] = useState(false);
    const [directData, setDirectData] = useState<any>(null);
    const { scrollYProgress } = useScroll();
    const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.97]);
    const headerY = useTransform(scrollYProgress, [0, 0.2], [0, -20]);
    const catalogRef = useRef<HTMLDivElement>(null);

    // 在searchParams变化后，明确触发数据刷新
    useEffect(() => {
        if (urlParamsLoaded && mutate) {
            // 添加短暂延迟，确保URL已更新完成
            setTimeout(() => {
                mutate();
            }, 50);
        }
    }, [searchParams, urlParamsLoaded, mutate]);

    // 如果SWR获取失败，尝试直接使用axios获取
    useEffect(() => {
        const fetchDirectlyIfNeeded = async () => {
            if ((isError || (!data && !isLoading)) && !isDirectLoading) {
                try {
                    setIsDirectLoading(true);

                    // 创建参数对象，转换参数名
                    const apiParams: any = { ...searchParams };
                    if (searchParams.limit) apiParams.page_size = searchParams.limit;
                    delete apiParams.limit;

                    // 移除空的参数
                    if (apiParams.brands === '') delete apiParams.brands;
                    if (apiParams.product_groups === '') delete apiParams.product_groups;

                    const response = await axios.get('/api/products/list', { params: apiParams });
                    setDirectData(response.data);
                } catch (err) {
                    // 保留错误处理，但移除日志
                } finally {
                    setIsDirectLoading(false);
                }
            }
        };

        fetchDirectlyIfNeeded();

        // 每当searchParams变化时，重置directData，确保会获取新数据
        setDirectData(null);
    }, [isError, data, isLoading, searchParams]);

    // 添加页面加载完成事件
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleLoad = () => {
                // 页面完全加载后，额外进行一次数据刷新
                if (mutate) {
                    setTimeout(() => mutate(), 100);
                }
            };

            window.addEventListener('load', handleLoad);
            return () => window.removeEventListener('load', handleLoad);
        }
    }, [mutate]);

    // 将API产品数据适配为组件所需的格式
    const adaptedProducts = useMemo(() => {
        // 优先使用SWR数据，如果没有则使用直接获取的数据
        const sourceData = data?.items || directData?.items;

        if (!sourceData || !Array.isArray(sourceData)) {
            return [];
        }

        return adaptProducts(sourceData);
    }, [data, directData]);

    // 处理分类点击
    const handleCategoryClick = (category: string) => {
        setSearchParams(prev => ({
            ...prev,
            product_groups: category || '',
            page: 1
        }));

        if (catalogRef.current) {
            catalogRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // 处理分页
    const handlePageChange = (page: number) => {
        setSearchParams(prev => ({ ...prev, page }));

        if (catalogRef.current) {
            window.scrollTo({
                top: catalogRef.current.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    };

    // 处理筛选条件变更
    const handleFilterChange = (filters: any) => {
        // 移除不支持的参数
        const { api_provider, min_commission, min_rating, ...validFilters } = filters;

        // 确保品牌参数为字符串类型
        if (validFilters.brands && Array.isArray(validFilters.brands)) {
            validFilters.brands = validFilters.brands.join(',');
        }

        setSearchParams(prev => ({
            ...prev,
            ...validFilters,
            page: 1
        }));
    };

    // 渲染单个商品
    const renderProduct = (product: ComponentProduct) => {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="relative group cursor-pointer"
                onClick={() => {
                    // 优先使用cj_url，因为佣金更高，如果没有则使用普通url
                    const linkUrl = product.cj_url || product.url;
                    if (linkUrl) window.open(linkUrl, '_blank');
                }}
            >
                <div className="relative overflow-hidden rounded-lg shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300">
                    <div className="relative pb-[100%]">
                        <img
                            src={product.image}
                            alt={product.title}
                            className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Prime badge */}
                        {product.isPrime && (
                            <div className="absolute top-2 left-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded">
                                Prime
                            </div>
                        )}

                        {/* Discount tag */}
                        {product.discount > 0 && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                -{Math.round(product.discount)}%
                            </div>
                        )}

                        {/* Coupon tag */}
                        {product.couponValue && product.couponValue > 0 && (
                            <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                                Coupon: {product.couponType === 'percentage' ? `${product.couponValue}%` : `$${product.couponValue}`}
                            </div>
                        )}
                    </div>
                    <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white line-clamp-2">
                            {product.title}
                        </h3>
                        <div className="mt-2 flex items-center justify-between">
                            <div className="flex flex-col">
                                <p className="text-xl font-bold text-primary">
                                    ${product.price.toFixed(2)}
                                </p>
                                {product.discount > 0 && (
                                    <p className="text-sm text-gray-500 line-through">
                                        ${product.originalPrice.toFixed(2)}
                                    </p>
                                )}
                            </div>
                            {product.brand && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {product.brand}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    // 渲染产品列表内容
    const renderProductList = (products: ComponentProduct[]) => (
        <AnimatePresence mode="wait">
            <motion.div
                key={`products-${searchParams.product_groups || 'all'}-${searchParams.page}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                        Showing <span className="font-medium">{products.length}</span> of <span className="font-medium">{data?.total || directData?.total || 0}</span> products
                    </p>
                    <div className="flex items-center gap-2">
                        <label htmlFor="sort" className="text-sm text-gray-600 dark:text-gray-400">
                            Sort by:
                        </label>
                        <select
                            id="sort"
                            className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                            value={`${searchParams.sort_by}:${searchParams.sort_order}`}
                            onChange={(e) => {
                                const [sort_by, sort_order] = e.target.value.split(':');
                                setSearchParams(prev => ({
                                    ...prev,
                                    sort_by: sort_by as 'price' | 'discount' | 'created' | 'all',
                                    sort_order: sort_order as 'asc' | 'desc',
                                    page: 1
                                }));
                            }}
                        >
                            <option value="all:desc">Recommended</option>
                            <option value="price:asc">Price: Low to High</option>
                            <option value="price:desc">Price: High to Low</option>
                            <option value="discount:desc">Biggest Discount</option>
                            <option value="created:desc">Newest</option>
                        </select>
                    </div>
                </div>
                <ProductList
                    products={products}
                    renderProduct={renderProduct}
                    currentPage={searchParams.page}
                    totalPages={Math.ceil(((data?.total || directData?.total || 0) / searchParams.limit))}
                    onPageChange={handlePageChange}
                />
            </motion.div>
        </AnimatePresence>
    );

    return (
        <div className="min-h-screen pb-20">
            <LiquidFilter />

            {/* 英雄区块与动画SVG插图 - 优化移动端显示 */}
            <section className="relative h-[30vh] md:h-[35vh] min-h-[300px] md:min-h-[400px] w-[100vw] left-[calc(-50vw+50%)] right-0 -mt-5 overflow-hidden bg-[oklch(0.488_0.178_241.966)] bg-gradient-to-r from-[oklch(0.488_0.178_241.966)] via-[oklch(0.588_0.158_241.966)] to-[oklch(0.688_0.138_241.966)]">
                <motion.div
                    className="absolute inset-0 bg-[url('/images/dot-pattern.svg')] opacity-10"
                    animate={{
                        backgroundPosition: ['0% 0%', '100% 100%'],
                    }}
                    transition={{
                        duration: 50,
                        ease: "linear",
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
                />

                <div className="container mx-auto h-full px-4 sm:px-6 md:px-8 lg:px-12 relative z-10 flex flex-col md:flex-row items-center justify-between">
                    <motion.div
                        className="max-w-full md:max-w-2xl text-center md:text-left mt-8 md:mt-0"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 md:mb-4">Discover Premium Products</h1>
                        <p className="text-base sm:text-lg md:text-xl text-white/90 mb-4 md:mb-8">Curated global selections for an exceptional shopping experience</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-[oklch(0.588_0.178_241.966)] to-[oklch(0.688_0.158_241.966)] text-white font-semibold rounded-full shadow-lg hover:from-[oklch(0.538_0.178_241.966)] hover:to-[oklch(0.638_0.158_241.966)] transition-all duration-300"
                            onClick={() => catalogRef.current?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Explore Now
                        </motion.button>
                    </motion.div>

                    <div className="hidden md:block h-full w-1/3 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <CategoryIllustration category={searchParams.product_groups || 'default'} />
                        </div>
                    </div>
                </div>
            </section>

            {/* 分类导航 - 设备响应式设计 */}
            <motion.header
                className="sticky top-0 z-40 bg-white dark:bg-gray-900 shadow-sm"
                style={{
                    opacity: headerOpacity,
                    y: headerY,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <div className="w-full relative bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                    <div className="container mx-auto relative">
                        {/* 移动端和平板端导航 - 左右滑动 */}
                        <div className="md:hidden">
                            {/* 左右滑动箭头 */}
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 flex items-center h-full">
                                <button
                                    className="h-full px-2 flex items-center justify-center bg-gradient-to-r from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 dark:to-transparent"
                                    onClick={() => {
                                        const scrollContainer = document.querySelector('.categories-scroll-container');
                                        if (scrollContainer) {
                                            scrollContainer.scrollLeft -= 150;
                                        }
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                            </div>

                            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 flex items-center h-full">
                                <button
                                    className="h-full px-2 flex items-center justify-center bg-gradient-to-l from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 dark:to-transparent"
                                    onClick={() => {
                                        const scrollContainer = document.querySelector('.categories-scroll-container');
                                        if (scrollContainer) {
                                            scrollContainer.scrollLeft += 150;
                                        }
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            {/* 滚动区域 */}
                            <div className="overflow-x-auto scrollbar-hide px-8 py-2 categories-scroll-container">
                                <ProductCategoryNav
                                    selectedCategory={searchParams.product_groups || ''}
                                    onCategorySelect={handleCategoryClick}
                                    displayMode="scroll"
                                />
                            </div>

                            {/* 滚动指示器 */}
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-0.5 flex items-center justify-center space-x-1 mb-1">
                                <div className="w-6 h-0.5 bg-green-500 rounded-full"></div>
                                <div className="w-2 h-0.5 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                                <div className="w-2 h-0.5 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                            </div>
                        </div>

                        {/* 桌面端导航 - 展开收起 */}
                        <div className="hidden md:block px-4 py-2">
                            <ProductCategoryNav
                                selectedCategory={searchParams.product_groups || ''}
                                onCategorySelect={handleCategoryClick}
                                displayMode="expand"
                            />
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* 商品列表区域 - 响应式布局 */}
            <section ref={catalogRef} className="container mx-auto px-4 py-6 md:py-12">
                <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 lg:gap-8">
                    {/* 移动端和平板端筛选器切换按钮 */}
                    <div className="lg:hidden mb-4">
                        <button
                            className="w-full py-3 px-4 sm:py-4 sm:rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl shadow-md flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => {
                                // 使用抽屉式面板
                                const drawerElem = document.getElementById('mobile-filter-drawer');
                                const overlayElem = document.getElementById('drawer-overlay');
                                if (drawerElem && overlayElem) {
                                    // 显示遮罩和抽屉
                                    drawerElem.classList.remove('translate-y-full');
                                    // 使用opacity-70替代完全不透明，保持遮罩半透明效果
                                    overlayElem.classList.remove('opacity-0');
                                    overlayElem.classList.add('opacity-70');
                                    overlayElem.classList.remove('pointer-events-none');
                                    // 防止背景滚动
                                    document.body.classList.add('overflow-hidden');
                                }
                            }}
                        >
                            <span className="font-medium">Filter Products</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    {/* 移动端和平板端抽屉式筛选器面板的背景遮罩 */}
                    <div id="drawer-overlay" className="fixed inset-0 bg-black bg-opacity-50 z-40 opacity-0 pointer-events-none transition-opacity duration-300 ease-in-out"
                        onClick={() => {
                            // 关闭抽屉
                            const drawerElem = document.getElementById('mobile-filter-drawer');
                            const overlayElem = document.getElementById('drawer-overlay');
                            if (drawerElem && overlayElem) {
                                drawerElem.classList.add('translate-y-full');
                                overlayElem.classList.remove('opacity-70');
                                overlayElem.classList.add('opacity-0');
                                overlayElem.classList.add('pointer-events-none');
                                document.body.classList.remove('overflow-hidden');
                            }
                        }}
                    ></div>

                    {/* 移动端和平板端抽屉式筛选器面板 */}
                    <div id="mobile-filter-drawer" className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-lg z-50 transform translate-y-full transition-transform duration-300 ease-in-out max-h-[85vh] overflow-y-auto sm:max-h-[90vh] sm:overflow-y-auto no-scrollbar">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filter Options</h3>
                                <button
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    onClick={() => {
                                        // 关闭抽屉
                                        const drawerElem = document.getElementById('mobile-filter-drawer');
                                        const overlayElem = document.getElementById('drawer-overlay');
                                        if (drawerElem && overlayElem) {
                                            drawerElem.classList.add('translate-y-full');
                                            overlayElem.classList.remove('opacity-70');
                                            overlayElem.classList.add('opacity-0');
                                            overlayElem.classList.add('pointer-events-none');
                                            document.body.classList.remove('overflow-hidden');
                                        }
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            {/* 可拖动条示意 - 在平板端隐藏 */}
                            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mt-1 sm:hidden"></div>
                        </div>

                        {/* 移动端显示常规ProductFilter */}
                        <div className="sm:hidden p-4 no-scrollbar">
                            <ProductFilter
                                onFilter={(filters) => {
                                    handleFilterChange(filters);
                                    // 关闭抽屉
                                    const drawerElem = document.getElementById('mobile-filter-drawer');
                                    const overlayElem = document.getElementById('drawer-overlay');
                                    if (drawerElem && overlayElem) {
                                        drawerElem.classList.add('translate-y-full');
                                        overlayElem.classList.remove('opacity-70');
                                        overlayElem.classList.add('opacity-0');
                                        overlayElem.classList.add('pointer-events-none');
                                        document.body.classList.remove('overflow-hidden');
                                    }
                                }}
                            />
                        </div>

                        {/* 平板端显示网格布局的筛选区 */}
                        <div className="hidden sm:block p-6 pb-20 no-scrollbar">
                            <ProductFilter
                                onFilter={(filters) => {
                                    handleFilterChange(filters);
                                    // 关闭抽屉
                                    const drawerElem = document.getElementById('mobile-filter-drawer');
                                    const overlayElem = document.getElementById('drawer-overlay');
                                    if (drawerElem && overlayElem) {
                                        drawerElem.classList.add('translate-y-full');
                                        overlayElem.classList.remove('opacity-70');
                                        overlayElem.classList.add('opacity-0');
                                        overlayElem.classList.add('pointer-events-none');
                                        document.body.classList.remove('overflow-hidden');
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* 桌面端左侧筛选器 */}
                    <div className="hidden lg:block lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="sticky top-28 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-md"
                        >
                            <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Filter</h2>
                            <ProductFilter
                                onFilter={handleFilterChange}
                            />
                        </motion.div>
                    </div>

                    {/* 右侧商品列表 */}
                    <div className="lg:col-span-3">
                        <ApiStateWrapper
                            isLoading={isLoading || isDirectLoading}
                            isError={isError && !directData}
                            isEmpty={!adaptedProducts?.length}
                            emptyMessage="No matching products found"
                            data={adaptedProducts}
                        >
                            {renderProductList}
                        </ApiStateWrapper>
                    </div>
                </div>
            </section>
        </div>
    );
}
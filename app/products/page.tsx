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
        product_groups: [] as string[],
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

    const { data, isLoading, isError } = useProducts(searchParams);
    const [isDirectLoading, setIsDirectLoading] = useState(false);
    const [directData, setDirectData] = useState<any>(null);
    const { scrollYProgress } = useScroll();
    const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.97]);
    const headerY = useTransform(scrollYProgress, [0, 0.2], [0, -20]);
    const catalogRef = useRef<HTMLDivElement>(null);

    // 添加数据处理日志
    useEffect(() => {
        console.log('原始API数据:', data);
    }, [data]);

    // 如果SWR获取失败，尝试直接使用axios获取
    useEffect(() => {
        const fetchDirectlyIfNeeded = async () => {
            if ((isError || (!data && !isLoading)) && !isDirectLoading) {
                try {
                    console.log('尝试直接使用axios获取数据');
                    setIsDirectLoading(true);

                    // 创建参数对象，转换参数名
                    const apiParams: any = { ...searchParams };
                    if (searchParams.limit) apiParams.page_size = searchParams.limit;
                    delete apiParams.limit;

                    const response = await axios.get('/api/products/list', { params: apiParams });
                    console.log('直接获取的数据:', response.data);
                    setDirectData(response.data);
                } catch (err) {
                    console.error('直接获取数据失败:', err);
                } finally {
                    setIsDirectLoading(false);
                }
            }
        };

        fetchDirectlyIfNeeded();

        // 每当searchParams变化时，重置directData，确保会获取新数据
        setDirectData(null);
    }, [isError, data, isLoading, searchParams]);

    // 将API产品数据适配为组件所需的格式
    const adaptedProducts = useMemo(() => {
        // 优先使用SWR数据，如果没有则使用直接获取的数据
        const sourceData = data?.items || directData?.items;

        if (!sourceData || !Array.isArray(sourceData)) {
            console.log('没有商品数据可用');
            return [];
        }

        console.log('正在适配商品数据:', sourceData.length, '个商品');
        return adaptProducts(sourceData);
    }, [data, directData]);

    // 添加适配后的数据日志
    useEffect(() => {
        console.log('适配后的商品数据:', adaptedProducts);
    }, [adaptedProducts]);

    // 处理分类点击
    const handleCategoryClick = (category: string) => {
        setSearchParams(prev => ({
            ...prev,
            product_groups: category ? [category] : [],
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
        const { api_provider, min_commission, min_rating, brands, ...validFilters } = filters;

        // 处理品牌筛选，转换为product_groups
        if (brands && brands.length > 0) {
            validFilters.product_groups = brands;
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

    return (
        <div className="min-h-screen pb-20">
            <LiquidFilter />

            {/* 英雄区块与动画SVG插图 */}
            <section className="relative h-[50vh] min-h-[400px] overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
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

                <div className="container mx-auto h-full px-4 relative z-10 flex items-center justify-between">
                    <motion.div
                        className="max-w-2xl"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h1 className="text-5xl font-bold text-white mb-4">Discover Premium Products</h1>
                        <p className="text-xl text-white/90 mb-8">Curated global selections for an exceptional shopping experience</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                            onClick={() => catalogRef.current?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Explore Now
                        </motion.button>
                    </motion.div>

                    <div className="hidden lg:block h-full w-1/3 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <CategoryIllustration category={searchParams.product_groups[0] || 'default'} />
                        </div>
                    </div>
                </div>
            </section>

            {/* 分类导航 */}
            <motion.header
                className="sticky top-0 z-40 bg-white dark:bg-gray-900 shadow-md"
                style={{
                    opacity: headerOpacity,
                    y: headerY,
                    backdropFilter: "blur(10px)",
                    backgroundColor: "rgba(255, 255, 255, 0.85)",
                }}
            >
                <div className="container mx-auto">
                    <ProductCategoryNav
                        selectedCategory={searchParams.product_groups[0] || ''}
                        onCategorySelect={handleCategoryClick}
                    />
                </div>
            </motion.header>

            {/* 商品列表区域 */}
            <section ref={catalogRef} className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* 左侧筛选器 */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="sticky top-28 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md"
                        >
                            <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Filters</h2>
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
                            {(products: ComponentProduct[]) => (
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={`products-${searchParams.product_groups[0] || 'all'}-${searchParams.page}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="mb-6 flex items-center justify-between">
                                            <p className="text-gray-600 dark:text-gray-300">
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
                                                            sort_by: sort_by as any,
                                                            sort_order: sort_order as any,
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
                            )}
                        </ApiStateWrapper>
                    </div>
                </div>
            </section>
        </div>
    );
}

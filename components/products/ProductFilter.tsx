"use client";

import { motion } from 'framer-motion';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';

import { useBrandStats } from '@/lib/hooks';

export type ProductFilterProps = {
    onFilter: (filter: Record<string, unknown>) => void;
    hideButtons?: boolean;
}

export type FilterState = {
    price: [number, number];
    discount: number;
    brands: string;
    isPrime: boolean;
}

const discountOptions = [80, 60, 40, 20, 10];

// Custom slider component with improved UI and animations
function PriceRangeSlider({ min, max, step, value, onChange }: {
    min: number;
    max: number;
    step: number;
    value: [number, number];
    onChange: (value: [number, number]) => void;
}) {
    // Track active thumb for focused styling
    const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null);

    // Format price with currency symbol
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="pt-6 pb-2">
            {/* Slider track and range */}
            <div className="relative h-2 mb-6">
                {/* Background track */}
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full" />

                {/* Selected range */}
                <motion.div
                    className="absolute h-2 bg-gradient-to-r from-blue-500 to-green-400 rounded-full"
                    style={{
                        left: `${((value[0] - min) / (max - min)) * 100}%`,
                        width: `${((value[1] - value[0]) / (max - min)) * 100}%`
                    }}
                    layout
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />

                {/* Min thumb with floating label */}
                <div className="relative">
                    <motion.div
                        className={`absolute w-6 h-6 bg-white border-2 border-blue-500 rounded-full -mt-2 -ml-3 cursor-grab shadow-md ${activeThumb === 'min' ? 'ring-2 ring-blue-500 ring-opacity-50 z-20' : 'z-10'}`}
                        style={{ left: `${((value[0] - min) / (max - min)) * 100}%` }}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 1.15, cursor: "grabbing" }}
                        onMouseDown={() => setActiveThumb('min')}
                        onMouseUp={() => setActiveThumb(null)}
                        onTouchStart={() => setActiveThumb('min')}
                        onTouchEnd={() => setActiveThumb(null)}
                        layout
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />

                    {/* Floating min price label */}
                    <motion.div
                        className={`absolute -mt-9 ml-0 px-2 py-1 rounded bg-blue-500 text-white text-xs font-bold whitespace-nowrap transform -translate-x-1/2 pointer-events-none ${activeThumb === 'min' ? 'opacity-100' : 'opacity-0'}`}
                        style={{ left: `${((value[0] - min) / (max - min)) * 100}%` }}
                        animate={{ opacity: activeThumb === 'min' ? 1 : 0, y: activeThumb === 'min' ? 0 : 5 }}
                        transition={{ duration: 0.2 }}
                    >
                        {formatPrice(value[0])}
                        <div className="absolute left-1/2 top-full w-2 h-2 bg-blue-500 transform -translate-x-1/2 rotate-45" />
                    </motion.div>
                </div>

                {/* Max thumb with floating label */}
                <div className="relative">
                    <motion.div
                        className={`absolute w-6 h-6 bg-white border-2 border-green-500 rounded-full -mt-2 -ml-3 cursor-grab shadow-md ${activeThumb === 'max' ? 'ring-2 ring-green-500 ring-opacity-50 z-20' : 'z-10'}`}
                        style={{ left: `${((value[1] - min) / (max - min)) * 100}%` }}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 1.15, cursor: "grabbing" }}
                        onMouseDown={() => setActiveThumb('max')}
                        onMouseUp={() => setActiveThumb(null)}
                        onTouchStart={() => setActiveThumb('max')}
                        onTouchEnd={() => setActiveThumb(null)}
                        layout
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />

                    {/* Floating max price label */}
                    <motion.div
                        className={`absolute -mt-9 ml-0 px-2 py-1 rounded bg-green-500 text-white text-xs font-bold whitespace-nowrap transform -translate-x-1/2 pointer-events-none ${activeThumb === 'max' ? 'opacity-100' : 'opacity-0'}`}
                        style={{ left: `${((value[1] - min) / (max - min)) * 100}%` }}
                        animate={{ opacity: activeThumb === 'max' ? 1 : 0, y: activeThumb === 'max' ? 0 : 5 }}
                        transition={{ duration: 0.2 }}
                    >
                        {formatPrice(value[1])}
                        <div className="absolute left-1/2 top-full w-2 h-2 bg-green-500 transform -translate-x-1/2 rotate-45" />
                    </motion.div>
                </div>

                {/* Hidden range inputs for accessibility and functionality */}
                <input
                    type="range"
                    aria-label="Minimum price"
                    min={min}
                    max={max}
                    step={step}
                    value={value[0]}
                    onChange={(e) => {
                        const newVal = Number(e.target.value);

                        if (newVal < value[1]) {
                            onChange([newVal, value[1]]);
                        }
                    }}
                    className="absolute w-full h-8 opacity-0 cursor-pointer z-10"
                    onFocus={() => setActiveThumb('min')}
                    onBlur={() => setActiveThumb(null)}
                />
                <input
                    type="range"
                    aria-label="Maximum price"
                    min={min}
                    max={max}
                    step={step}
                    value={value[1]}
                    onChange={(e) => {
                        const newVal = Number(e.target.value);

                        if (newVal > value[0]) {
                            onChange([value[0], newVal]);
                        }
                    }}
                    className="absolute w-full h-8 opacity-0 cursor-pointer z-10"
                    onFocus={() => setActiveThumb('max')}
                    onBlur={() => setActiveThumb(null)}
                />
            </div>

            {/* Direct price input fields */}
            <div className="flex items-center justify-between mt-2 gap-2">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">$</span>
                    </div>
                    <input
                        type="number"
                        min={min}
                        max={value[1]}
                        value={value[0]}
                        onChange={(e) => {
                            const newVal = Number(e.target.value);

                            if (!isNaN(newVal) && newVal >= min && newVal < value[1]) {
                                onChange([newVal, value[1]]);
                            }
                        }}
                        className="pl-7 pr-2 py-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        aria-label="Minimum price input"
                    />
                </div>
                <span className="text-gray-400">—</span>
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">$</span>
                    </div>
                    <input
                        type="number"
                        min={value[0]}
                        max={max}
                        value={value[1]}
                        onChange={(e) => {
                            const newVal = Number(e.target.value);

                            if (!isNaN(newVal) && newVal <= max && newVal > value[0]) {
                                onChange([value[0], newVal]);
                            }
                        }}
                        className="pl-7 pr-2 py-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-green-500"
                        aria-label="Maximum price input"
                    />
                </div>
            </div>

            {/* Quick price range selectors */}
            <div className="flex flex-wrap gap-2 mt-4">
                {[
                    { label: "Under $25", values: [0, 25] },
                    { label: "$25-$50", values: [25, 50] },
                    { label: "$50-$100", values: [50, 100] },
                    { label: "$100+", values: [100, max] }
                ].map((range, _) => (
                    <button
                        key={`price-range-${range.label}`}
                        onClick={() => onChange([range.values[0], range.values[1]])}
                        className={`text-xs py-1 px-2 rounded-full transition-colors ${value[0] === range.values[0] && value[1] === range.values[1]
                            ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        {range.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

// Modern checkbox component with animations
function Checkbox({ id, checked, onChange, label }: {
    id: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
}) {
    return (
        <div className="relative inline-flex items-center gap-2">
            <input
                type="checkbox"
                id={id}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only"
            />
            <div className={`w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center ${checked ? 'bg-yellow-400 border-yellow-500' : 'border-gray-300 dark:border-gray-600'}`}>
                {checked && (
                    <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="white"
                        className="w-4 h-4"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </motion.svg>
                )}
            </div>
            {label && (
                <label htmlFor={id} className="text-sm cursor-pointer text-gray-700 dark:text-gray-200">
                    {label}
                </label>
            )}
        </div>
    );
}

export function ProductFilter({ onFilter, hideButtons }: ProductFilterProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const isInitialMount = useRef(true);

    // Get initial filter state from URL parameters - 使用正确的API参数名称
    const initialMinPrice = Number(searchParams.get('min_price')) || 0;
    const initialMaxPrice = Number(searchParams.get('max_price')) || 1000;
    const initialDiscount = Number(searchParams.get('min_discount')) || 0;
    const initialBrands = searchParams.get('brands') || '';
    const initialIsPrime = searchParams.get('is_prime_only') === 'true';

    const [filter, setFilter] = useState<FilterState>({
        price: [initialMinPrice, initialMaxPrice],
        discount: initialDiscount,
        brands: initialBrands,
        isPrime: initialIsPrime
    });

    const [availableBrands, setAvailableBrands] = useState<string[]>([]);
    const [loading, _setLoading] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        price: true,
        discount: true,
        brands: true
    });

    // 添加这个useEffect，监听URL参数变化并更新filter状态
    useEffect(() => {
        // 获取当前URL参数
        const minPrice = Number(searchParams.get('min_price')) || 0;
        const maxPrice = Number(searchParams.get('max_price')) || 1000;
        const discount = Number(searchParams.get('min_discount')) || 0;
        const brands = searchParams.get('brands') || '';
        const isPrime = searchParams.get('is_prime_only') === 'true';

        // 更新filter状态以反映URL参数
        setFilter({
            price: [minPrice, maxPrice],
            discount,
            brands,
            isPrime
        });
    }, [searchParams]); // 依赖于searchParams，确保URL变化时会更新

    // 使用品牌统计hook获取真实数据
    const { data: brandStats, isLoading: isBrandStatsLoading } = useBrandStats({
        sort_by: 'count',
        sort_order: 'desc',
        page_size: 50
    });

    // 使用ref保存上一次的过滤条件，避免无限循环
    const prevFilter = useRef<FilterState>(filter);

    // Toggle section expansion
    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // 获取品牌数据 - 使用useRef防止无限循环
    const brandsDataProcessed = useRef(false);

    useEffect(() => {
        // 只有当品牌数据发生变化，且还没有处理过，或显式设置重新处理时才执行
        if (brandStats?.brands && !isBrandStatsLoading && !brandsDataProcessed.current) {
            try {
                // 从API获取的品牌数据转换为数组
                const brandsArray = Object.keys(brandStats.brands)
                    .filter(brand => brand && brand.trim() !== "") // 过滤空品牌
                    .sort((a, b) => (brandStats.brands[b] || 0) - (brandStats.brands[a] || 0)); // 按数量排序

                // 设置品牌数据，不会导致循环更新
                setAvailableBrands(brandsArray);
                // 标记品牌数据已处理
                brandsDataProcessed.current = true;
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('处理品牌数据时出错:', error);
                setAvailableBrands([]);
            }
        }
    }, [brandStats?.brands, isBrandStatsLoading]);

    // 重置处理标记，以便于下次重新处理
    useEffect(() => {
        if (isBrandStatsLoading) {
            brandsDataProcessed.current = false;
        }
    }, [isBrandStatsLoading]);

    // Create a function to build URLSearchParams that doesn't depend on filter
    const buildUrlParams = useCallback((currentFilter: FilterState) => {
        // 基于当前URL的searchParams创建新实例，保留所有现有参数
        const params = new URLSearchParams(searchParams.toString());

        // 确保保留分类相关参数（这一步可以省略，因为我们已经基于现有searchParams创建了params）
        // 以防万一，我们可以确保这些参数一定存在
        const productGroups = searchParams.get('product_groups');
        const category = searchParams.get('category');

        if (productGroups) params.set('product_groups', productGroups);
        if (category) params.set('category', category);

        // Only add to URL when value is not default - 使用正确的API参数名称
        if (currentFilter.price[0] > 0) params.set('min_price', currentFilter.price[0].toString());
        else params.delete('min_price');

        if (currentFilter.price[1] < 1000) params.set('max_price', currentFilter.price[1].toString());
        else params.delete('max_price');

        if (currentFilter.discount > 0) params.set('min_discount', currentFilter.discount.toString());
        else params.delete('min_discount');

        if (currentFilter.brands && currentFilter.brands.trim() !== '') params.set('brands', currentFilter.brands);
        else params.delete('brands');

        if (currentFilter.isPrime) params.set('is_prime_only', 'true');
        else params.delete('is_prime_only');

        // 添加时间戳参数，防止缓存问题
        params.set('_ts', Date.now().toString());

        return params;
    }, [searchParams]); // 添加searchParams依赖

    // Update URL parameters function with dependency check to prevent loops
    const updateUrlParams = useCallback(() => {
        const currentFilterSnapshot = filter;

        // 比较当前过滤器和之前的过滤器
        if (JSON.stringify(currentFilterSnapshot) !== JSON.stringify(prevFilter.current)) {
            // 更新上一次的过滤条件引用
            prevFilter.current = { ...currentFilterSnapshot };
            // 构建URL参数
            const params = buildUrlParams(currentFilterSnapshot);

            // eslint-disable-next-line no-console
            console.log('更新URL参数:', params.toString(), '原有分类参数:', searchParams.get('product_groups') || searchParams.get('category'));
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }
    }, [filter, buildUrlParams, pathname, router, searchParams]);

    // Listen for filter changes and update URL (skip initial mount)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;

            return;
        }

        // Debounce to reduce URL update frequency
        const timeoutId = setTimeout(() => {
            updateUrlParams();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [updateUrlParams]); // 只依赖于updateUrlParams，不直接依赖filter

    // 优化handleBrandChange函数，避免不必要的状态更新
    const handleBrandChange = useCallback((brand: string, checked: boolean) => {
        // 将字符串转为数组以便于修改
        const brandsArray = filter.brands ? filter.brands.split(',').filter(b => b) : [];

        // 检查品牌是否已经在数组中，避免不必要的更新
        const brandExists = brandsArray.includes(brand);

        if ((checked && brandExists) || (!checked && !brandExists)) {
            return; // 不需要更新
        }

        // 更新数组
        const updatedBrandsArray = checked
            ? [...brandsArray, brand]
            : brandsArray.filter(b => b !== brand);

        // 将数组转回字符串
        const updatedBrands = updatedBrandsArray.join(',');

        // 先调用onFilter，传递新的筛选条件
        if (onFilter) {
            onFilter({ brands: updatedBrands });
        }

        // 然后更新本地状态
        setFilter(prev => ({
            ...prev,
            brands: updatedBrands
        }));
    }, [filter.brands, onFilter]);

    // 使用useCallback包装其他处理函数
    const handlePriceChange = useCallback((value: [number, number]) => {
        // 检查值是否变化
        if (filter.price[0] === value[0] && filter.price[1] === value[1]) {
            return; // 不需要更新
        }

        // 先调用onFilter
        if (onFilter) {
            onFilter({ min_price: value[0], max_price: value[1] });
        }

        // 再更新本地状态
        setFilter(prev => ({ ...prev, price: value }));
    }, [filter.price, onFilter]);

    const handleDiscountChange = useCallback((value: number) => {
        // 检查值是否变化
        if (filter.discount === value) {
            return; // 不需要更新
        }

        // 先调用onFilter
        if (onFilter) {
            onFilter({ min_discount: value });
        }

        // 再更新本地状态
        setFilter(prev => ({ ...prev, discount: value }));
    }, [filter.discount, onFilter]);

    const handlePrimeChange = useCallback((checked: boolean) => {
        // 检查值是否变化
        if (filter.isPrime === checked) {
            return; // 不需要更新
        }

        // 先调用onFilter
        if (onFilter) {
            onFilter({ is_prime_only: checked });
        }

        // 再更新本地状态
        setFilter(prev => ({ ...prev, isPrime: checked }));
    }, [filter.isPrime, onFilter]);

    // 清除所有筛选条件
    const handleClearFilters = useCallback(() => {
        // 先调用onFilter
        if (onFilter) {
            onFilter({
                min_price: undefined,
                max_price: undefined,
                min_discount: undefined,
                brands: '',
                is_prime_only: false
            });
        }

        // 再更新本地状态
        setFilter({
            price: [0, 1000],
            discount: 0,
            brands: '',
            isPrime: false
        });

        // 清除URL中的筛选参数，但保留分类参数 - 使用正确的API参数名称
        const params = new URLSearchParams(searchParams.toString());

        params.delete('min_price');
        params.delete('max_price');
        params.delete('min_discount');
        params.delete('brands');
        params.delete('is_prime_only');

        // 保留分类参数（可选，因为我们已经基于现有searchParams创建了params）
        const productGroups = searchParams.get('product_groups');
        const category = searchParams.get('category');

        if (productGroups) params.set('product_groups', productGroups);
        if (category) params.set('category', category);

        // 添加时间戳防止缓存问题
        params.set('_ts', Date.now().toString());

        // 更新URL
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [onFilter, searchParams, router, pathname]);

    return (
        <div className="space-y-6">
            {/* Price Filter Section */}
            <div className="border-b pb-4 dark:border-gray-700">
                <div
                    className="flex justify-between items-center mb-4 cursor-pointer"
                    onClick={() => toggleSection('price')}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleSection('price');
                        }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-expanded={expandedSections.price}
                >
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Price Range</h3>
                    <motion.span
                        animate={{ rotate: expandedSections.price ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </motion.span>
                </div>

                {expandedSections.price && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <PriceRangeSlider
                            min={0}
                            max={1000}
                            step={5}
                            value={filter.price}
                            onChange={handlePriceChange}
                        />
                    </motion.div>
                )}
            </div>

            {/* Discount Filter Section */}
            <div className="border-b pb-4 dark:border-gray-700">
                <div
                    className="flex justify-between items-center mb-4 cursor-pointer"
                    onClick={() => toggleSection('discount')}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleSection('discount');
                        }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-expanded={expandedSections.discount}
                >
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Discount</h3>
                    <motion.span
                        animate={{ rotate: expandedSections.discount ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </motion.span>
                </div>

                {expandedSections.discount && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2"
                    >
                        {discountOptions.map(discount => (
                            <div key={`discount-option-${discount}`} className="flex items-center">
                                <Checkbox
                                    id={`discount-${discount}`}
                                    checked={filter.discount >= discount}
                                    onChange={() => handleDiscountChange(filter.discount === discount ? 0 : discount)}
                                    label={`${discount}% or more`}
                                />
                            </div>
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Brand Filter Section */}
            <div className="border-b pb-4 dark:border-gray-700">
                <div
                    className="flex justify-between items-center mb-4 cursor-pointer"
                    onClick={() => toggleSection('brands')}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleSection('brands');
                        }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-expanded={expandedSections.brands}
                >
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Brands</h3>
                    <motion.span
                        animate={{ rotate: expandedSections.brands ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </motion.span>
                </div>

                {expandedSections.brands && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2 max-h-60 overflow-y-auto pr-1 no-scrollbar"
                    >
                        {loading || isBrandStatsLoading ? (
                            <div className="animate-pulse space-y-2">
                                {['first', 'second', 'third', 'fourth', 'fifth'].map((id) => (
                                    <div key={`brand-skeleton-${id}`} className="h-6 bg-gray-200 dark:bg-gray-700 rounded" />
                                ))}
                            </div>
                        ) : availableBrands.length > 0 ? (
                            availableBrands.map(brand => (
                                <div key={brand} className="flex items-center justify-between">
                                    <div className="flex-grow min-w-0">
                                        <Checkbox
                                            id={`brand-${brand}`}
                                            checked={filter.brands.split(',').includes(brand)}
                                            onChange={(checked) => handleBrandChange(brand, checked)}
                                            label={brand}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 flex-shrink-0">
                                        {brandStats?.brands[brand] || 0}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400">无可用品牌</div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Prime Filter */}
            <div className="pb-4">
                <div className="flex items-center">
                    <Checkbox
                        id="prime-filter"
                        checked={filter.isPrime}
                        onChange={handlePrimeChange}
                        label="Prime Only"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            {!hideButtons && (
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 bg-gradient-to-r bg-primary-background text-white text-sm font-medium rounded-md flex-grow transition-all"
                        onClick={updateUrlParams}
                    >
                        Apply Filters
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white text-sm font-medium rounded-md transition-all flex-shrink-0"
                        onClick={handleClearFilters}
                    >
                        Clear
                    </motion.button>
                </div>
            )}
        </div>
    );
}

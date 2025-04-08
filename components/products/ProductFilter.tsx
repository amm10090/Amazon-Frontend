"use client";

import { motion } from 'framer-motion';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback, useRef } from 'react';

import { useBrandStats } from '@/lib/hooks';
import { UserRole } from '@/lib/models/UserRole';

// 添加用于隐藏滚动条的全局样式
const noScrollbarStyle = `
    .no-scrollbar::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
    }
    .no-scrollbar {
        -ms-overflow-style: none !important;
        scrollbar-width: none !important;
    }
`;

export type ProductFilterProps = {
    onFilter: (filter: Record<string, unknown>) => void;
    hideButtons?: boolean;
}

export type FilterState = {
    price: [number, number];
    discount: number;
    brands: string;
    isPrime: boolean;
    apiProvider?: string;
}

const discountOptions = [80, 60, 40, 20, 10];

// Custom slider component with improved UI and animations
function PriceRangeSlider({ min, max, value, onChange }: {
    min: number;
    max: number;
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

    // 计算适当的步长：价格越高，步长越大，提高用户体验
    const calculateStep = (val: number): number => {
        if (val < 100) return 5;
        if (val < 500) return 10;
        if (val < 1000) return 50;
        if (val < 5000) return 100;

        return 500;
    };

    // 确保滑块值在合理范围内
    const handleMinChange = (newVal: number) => {
        const dynamicStep = calculateStep(newVal);
        // 确保值按步长对齐
        const alignedVal = Math.round(newVal / dynamicStep) * dynamicStep;

        if (alignedVal < value[1] - dynamicStep) {
            onChange([alignedVal, value[1]]);
        }
    };

    const handleMaxChange = (newVal: number) => {
        const dynamicStep = calculateStep(newVal);
        // 确保值按步长对齐
        const alignedVal = Math.round(newVal / dynamicStep) * dynamicStep;

        if (alignedVal > value[0] + dynamicStep) {
            onChange([value[0], alignedVal]);
        }
    };

    return (
        <div className="pt-4 pb-2 w-full overflow-x-hidden">
            {/* Slider track and range */}
            <div className="relative h-2 mb-6 mx-3">
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
                    step={calculateStep(value[0])}
                    value={value[0]}
                    onChange={(e) => {
                        handleMinChange(Number(e.target.value));
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
                    step={calculateStep(value[1])}
                    value={value[1]}
                    onChange={(e) => {
                        handleMaxChange(Number(e.target.value));
                    }}
                    className="absolute w-full h-8 opacity-0 cursor-pointer z-10"
                    onFocus={() => setActiveThumb('max')}
                    onBlur={() => setActiveThumb(null)}
                />
            </div>

            {/* Direct price input fields */}
            <div className="flex items-center justify-between mt-2 gap-1 sm:gap-2 px-3">
                <div className="relative flex-1 min-w-0">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">$</span>
                    </div>
                    <input
                        type="number"
                        min={min}
                        max={value[1] - calculateStep(value[0])}
                        value={value[0]}
                        onChange={(e) => {
                            const newVal = Number(e.target.value);

                            if (!isNaN(newVal) && newVal >= min && newVal < value[1]) {
                                onChange([newVal, value[1]]);
                            }
                        }}
                        className="pl-5 sm:pl-7 pr-1 sm:pr-2 py-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs sm:text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        aria-label="Minimum price input"
                    />
                </div>
                <span className="text-gray-400 text-sm flex-shrink-0">—</span>
                <div className="relative flex-1 min-w-0">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">$</span>
                    </div>
                    <input
                        type="number"
                        min={value[0] + calculateStep(value[1])}
                        max={max}
                        value={value[1]}
                        onChange={(e) => {
                            const newVal = Number(e.target.value);

                            if (!isNaN(newVal) && newVal <= max && newVal > value[0]) {
                                onChange([value[0], newVal]);
                            }
                        }}
                        className="pl-5 sm:pl-7 pr-1 sm:pr-2 py-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs sm:text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-green-500"
                        aria-label="Maximum price input"
                    />
                </div>
            </div>

            {/* Quick price range selectors */}
            <div className="flex flex-wrap gap-1 md:gap-2 mt-4 px-3">
                {[
                    { label: "Under $200", values: [0, 200] },
                    { label: "$200-$500", values: [200, 500] },
                    { label: "$500-$1000", values: [500, 1000] },
                    { label: "$1000-$5000", values: [1000, 5000] },
                    { label: "$5000+", values: [5000, max] }
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
        <div
            className="relative inline-flex items-start gap-2 w-full cursor-pointer group"
            onClick={() => onChange(!checked)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onChange(!checked);
                }
            }}
            tabIndex={0}
            role="checkbox"
            aria-checked={checked}
        >
            <div className="flex-shrink-0 mt-0.5">
                <input
                    type="checkbox"
                    id={id}
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="sr-only"
                />
                <div className={`w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center cursor-pointer
                    ${checked ? 'bg-yellow-400 border-yellow-500' : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'}`}>
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
            </div>
            {label && (
                <span className="text-sm text-gray-700 dark:text-gray-200 truncate cursor-pointer">
                    {label}
                </span>
            )}
        </div>
    );
}

export function ProductFilter({ onFilter, hideButtons }: ProductFilterProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = useSession();
    const _isInitialMount = useRef(true);

    // 价格上限提升到10000美元
    const MAX_PRICE = 10000;

    // Get initial filter state from URL parameters - 使用正确的API参数名称
    const initialMinPrice = Number(searchParams.get('min_price')) || 0;
    const initialMaxPrice = Number(searchParams.get('max_price')) || MAX_PRICE;
    const initialDiscount = Number(searchParams.get('min_discount')) || 0;
    const initialBrands = searchParams.get('brands') || '';
    const initialIsPrime = searchParams.get('is_prime_only') === 'true';
    const initialApiProvider = searchParams.get('api_provider') || '';

    // 当前应用的筛选条件
    const [filter, setFilter] = useState<FilterState>({
        price: [initialMinPrice, initialMaxPrice] as [number, number],
        discount: initialDiscount,
        brands: initialBrands,
        isPrime: initialIsPrime,
        apiProvider: initialApiProvider
    });

    // 添加临时筛选条件状态，用于存储用户当前选择但尚未应用的筛选
    const [tempFilter, setTempFilter] = useState<FilterState>({
        price: [initialMinPrice, initialMaxPrice] as [number, number],
        discount: initialDiscount,
        brands: initialBrands,
        isPrime: initialIsPrime,
        apiProvider: initialApiProvider
    });

    // 添加一个状态表示是否有未应用的变更
    const [hasUnappliedChanges, setHasUnappliedChanges] = useState(false);

    // 跟踪筛选器是否正在应用中（防止重复点击）
    const [isApplying, setIsApplying] = useState(false);

    const [availableBrands, setAvailableBrands] = useState<string[]>([]);
    const [loading, _setLoading] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        price: true,
        discount: true,
        brands: true
    });

    // 添加品牌展开状态
    const [isBrandExpanded, setIsBrandExpanded] = useState(false);

    // 添加这个useEffect，监听URL参数变化并更新filter状态
    useEffect(() => {
        // 获取当前URL参数
        const minPrice = Number(searchParams.get('min_price')) || 0;
        const maxPrice = Number(searchParams.get('max_price')) || MAX_PRICE;
        const discount = Number(searchParams.get('min_discount')) || 0;
        const brands = searchParams.get('brands') || '';
        const isPrime = searchParams.get('is_prime_only') === 'true';
        const apiProvider = searchParams.get('api_provider') || '';

        // 更新filter状态以反映URL参数
        const newFilter: FilterState = {
            price: [minPrice, maxPrice] as [number, number],
            discount,
            brands,
            isPrime,
            apiProvider
        };

        setFilter(newFilter);
        // 同时更新临时筛选状态，确保它始终反映当前应用的筛选条件
        setTempFilter(newFilter);
        // 重置未应用变更状态
        setHasUnappliedChanges(false);
    }, [searchParams, MAX_PRICE]); // 依赖于searchParams，确保URL变化时会更新

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

    // 添加一个辅助函数，检查当前是否有活跃的筛选条件
    const hasActiveFilters = useCallback((filterState: FilterState) => {
        return (
            filterState.price[0] > 0 ||
            filterState.price[1] < MAX_PRICE ||
            filterState.discount > 0 ||
            (filterState.brands && filterState.brands.trim() !== '') ||
            filterState.isPrime ||
            !!filterState.apiProvider
        );
    }, [MAX_PRICE]);

    // Create a function to build URLSearchParams that doesn't depend on filter
    const buildUrlParams = useCallback((currentFilter: FilterState) => {
        // 基于当前URL的searchParams创建新实例，保留所有现有参数
        const params = new URLSearchParams(searchParams.toString());

        // 确保保留分类相关参数（这一步可以省略，因为我们已经基于现有searchParams创建了params）
        // 以防万一，我们可以确保这些参数一定存在
        const productGroups = searchParams.get('product_groups');
        const category = searchParams.get('category');
        const page = searchParams.get('page');

        // 先清除所有筛选相关参数
        params.delete('min_price');
        params.delete('max_price');
        params.delete('min_discount');
        params.delete('brands');
        params.delete('is_prime_only');
        params.delete('api_provider');
        // 也清除时间戳参数，稍后根据条件再添加
        params.delete('_ts');

        // 保留必要的导航参数
        if (productGroups) params.set('product_groups', productGroups);
        if (category) params.set('category', category);
        if (page) params.set('page', page);

        // 使用辅助函数检查是否有活跃的筛选条件
        const hasFilters = hasActiveFilters(currentFilter);

        // Only add to URL when value is not default - 使用正确的API参数名称
        if (currentFilter.price[0] > 0) {
            params.set('min_price', currentFilter.price[0].toString());
        }

        if (currentFilter.price[1] < MAX_PRICE) {
            params.set('max_price', currentFilter.price[1].toString());
        }

        if (currentFilter.discount > 0) {
            params.set('min_discount', currentFilter.discount.toString());
        }

        if (currentFilter.brands && currentFilter.brands.trim() !== '') {
            params.set('brands', currentFilter.brands);
        }

        if (currentFilter.isPrime) {
            params.set('is_prime_only', 'true');
        }

        if (currentFilter.apiProvider) {
            params.set('api_provider', currentFilter.apiProvider);
        }

        // 添加时间戳参数，防止缓存问题 - 只在有实际筛选条件时添加
        if (hasFilters) {
            params.set('_ts', Date.now().toString());
        }

        return params;
    }, [searchParams, MAX_PRICE, hasActiveFilters]); // 添加hasActiveFilters依赖

    // Update URL parameters function - 优化为只在明确应用筛选时调用
    const applyFilters = useCallback(() => {
        // 防止重复应用
        if (isApplying) return;

        setIsApplying(true);

        try {
            // 检查临时筛选条件是否与当前应用的筛选条件不同
            if (JSON.stringify(tempFilter) !== JSON.stringify(filter)) {
                // 将临时筛选条件应用到主筛选条件
                setFilter(tempFilter);
                prevFilter.current = { ...tempFilter };

                // 构建URL参数
                const params = buildUrlParams(tempFilter);

                // 更新URL，一次性应用所有筛选条件
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                // 如果有onFilter回调，调用它
                if (onFilter) {
                    const filterParams: Record<string, unknown> = {};

                    if (tempFilter.price[0] > 0) filterParams.min_price = tempFilter.price[0];
                    if (tempFilter.price[1] < MAX_PRICE) filterParams.max_price = tempFilter.price[1];
                    if (tempFilter.discount > 0) filterParams.min_discount = tempFilter.discount;
                    if (tempFilter.brands) filterParams.brands = tempFilter.brands;
                    if (tempFilter.isPrime) filterParams.is_prime_only = tempFilter.isPrime;
                    if (tempFilter.apiProvider) filterParams.api_provider = tempFilter.apiProvider;

                    onFilter(filterParams);
                }

                // 重置未应用变更状态
                setHasUnappliedChanges(false);
            }
        } finally {
            setIsApplying(false);
        }
    }, [tempFilter, filter, buildUrlParams, onFilter, pathname, router, isApplying, MAX_PRICE]);

    // 优化handleBrandChange函数，更新临时状态而非直接更新筛选
    const handleBrandChange = useCallback((brand: string, checked: boolean) => {
        // 将字符串转为数组以便于修改
        const brandsArray = tempFilter.brands ? tempFilter.brands.split(',').filter(b => b) : [];

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

        // 更新临时筛选状态
        setTempFilter(prev => ({
            ...prev,
            brands: updatedBrands
        }));

        // 标记有未应用的变更
        setHasUnappliedChanges(true);
    }, [tempFilter.brands]);

    // 使用useCallback包装其他处理函数，更新临时状态
    const handlePriceChange = useCallback((value: [number, number]) => {
        // 检查值是否变化
        if (tempFilter.price[0] === value[0] && tempFilter.price[1] === value[1]) {
            return; // 不需要更新
        }

        // 更新临时筛选状态
        setTempFilter(prev => ({ ...prev, price: value }));

        // 标记有未应用的变更
        setHasUnappliedChanges(true);
    }, [tempFilter.price]);

    const handleDiscountChange = useCallback((value: number) => {
        // 检查值是否变化
        if (tempFilter.discount === value) {
            return; // 不需要更新
        }

        // 更新临时筛选状态
        setTempFilter(prev => ({ ...prev, discount: value }));

        // 标记有未应用的变更
        setHasUnappliedChanges(true);
    }, [tempFilter.discount]);

    const handlePrimeChange = useCallback((checked: boolean) => {
        // 检查值是否变化
        if (tempFilter.isPrime === checked) {
            return; // 不需要更新
        }

        // 更新临时筛选状态
        setTempFilter(prev => ({ ...prev, isPrime: checked }));

        // 标记有未应用的变更
        setHasUnappliedChanges(true);
    }, [tempFilter.isPrime]);

    // 添加处理CJ商品筛选的函数
    const handleApiProviderChange = useCallback((checked: boolean) => {
        // 检查值是否变化
        if ((tempFilter.apiProvider === 'cj-api') === checked) {
            return; // 不需要更新
        }

        // 更新临时筛选状态
        setTempFilter(prev => ({
            ...prev,
            apiProvider: checked ? 'cj-api' : ''
        }));

        // 标记有未应用的变更
        setHasUnappliedChanges(true);
    }, [tempFilter.apiProvider]);

    // 更新清除筛选条件函数
    const handleClearFilters = useCallback(() => {

        // 重置临时筛选条件到默认值
        const defaultFilter: FilterState = {
            price: [0, MAX_PRICE] as [number, number],
            discount: 0,
            brands: '',
            isPrime: false,
            apiProvider: ''
        };

        // 设置临时过滤器为默认值
        setTempFilter(defaultFilter);

        // 直接应用清除操作，不使用setTimeout
        setFilter(defaultFilter);
        const _params = buildUrlParams(defaultFilter);


        // 尝试使用window.location.href直接修改URL
        const baseUrl = window.location.href.split('?')[0];

        window.location.href = baseUrl;

        // 如果有onFilter回调，调用它
        if (onFilter) {
            onFilter({});
        }

        // 重置未应用变更状态
        setHasUnappliedChanges(false);
    }, [MAX_PRICE, buildUrlParams, onFilter]);

    // 添加取消更改函数，恢复到当前应用的筛选条件
    const handleCancelChanges = useCallback(() => {
        setTempFilter(filter);
        setHasUnappliedChanges(false);
    }, [filter]);

    return (
        <div className="space-y-4 w-full overflow-x-hidden">
            {/* 添加全局样式 */}
            <style jsx global>{noScrollbarStyle}</style>

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
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <PriceRangeSlider
                            min={0}
                            max={MAX_PRICE}
                            value={tempFilter.price}
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
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="space-y-2 overflow-hidden"
                    >
                        {discountOptions.map(discount => (
                            <div key={`discount-option-${discount}`} className="flex items-center">
                                <Checkbox
                                    id={`discount-${discount}`}
                                    checked={tempFilter.discount >= discount}
                                    onChange={() => handleDiscountChange(tempFilter.discount === discount ? 0 : discount)}
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
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="relative"
                    >
                        {/* 使用双层容器结构 */}
                        <div
                            className={`overflow-hidden ${!isBrandExpanded ? 'h-36' : 'h-[300px]'}`}
                            style={{ WebkitMaskImage: !isBrandExpanded ? 'linear-gradient(to bottom, black 80%, transparent 100%)' : 'none' }}
                        >
                            <div
                                className="h-full pr-4 -mr-4 overflow-y-auto space-y-2 no-scrollbar"
                                style={{
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none',
                                    WebkitOverflowScrolling: 'touch'
                                }}
                            >
                                {loading || isBrandStatsLoading ? (
                                    <div className="animate-pulse space-y-2">
                                        {['first', 'second', 'third', 'fourth'].map((id) => (
                                            <div key={`brand-skeleton-${id}`} className="h-6 bg-gray-200 dark:bg-gray-700 rounded" />
                                        ))}
                                    </div>
                                ) : availableBrands.length > 0 ? (
                                    availableBrands.map(brand => (
                                        <div key={brand} className="flex items-center justify-between w-full">
                                            <div className="flex-grow min-w-0 mr-2">
                                                <Checkbox
                                                    id={`brand-${brand}`}
                                                    checked={tempFilter.brands.split(',').includes(brand)}
                                                    onChange={(checked) => handleBrandChange(brand, checked)}
                                                    label={brand}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                                {brandStats?.brands[brand] || 0}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">无可用品牌</div>
                                )}
                            </div>
                        </div>

                        {availableBrands.length > 4 && (
                            <div className="flex items-center justify-center">
                                <button
                                    onClick={() => setIsBrandExpanded(!isBrandExpanded)}
                                    className="mt-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                                >
                                    <span>{isBrandExpanded ? 'Hide' : 'Show More'}</span>
                                    <motion.svg
                                        className="w-4 h-4"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        animate={{ rotate: isBrandExpanded ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </motion.svg>
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Prime Filter */}
            <div className="pb-4">
                <div className="flex items-center">
                    <Checkbox
                        id="prime-filter"
                        checked={tempFilter.isPrime}
                        onChange={handlePrimeChange}
                        label="Prime Only"
                    />
                </div>
            </div>

            {/* CJ商品筛选 - 仅对管理员显示 */}
            {session?.user?.role && [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(session.user.role as UserRole) && (
                <div className="pb-4 border-t pt-4 dark:border-gray-700">
                    <div className="flex items-center">
                        <Checkbox
                            id="cj-filter"
                            checked={tempFilter.apiProvider === 'cj-api'}
                            onChange={handleApiProviderChange}
                            label="CJ Products Only"
                        />
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {!hideButtons && (
                <div className="flex gap-2 flex-wrap sm:flex-nowrap sticky bottom-0 pt-2 bg-white dark:bg-gray-800 z-10">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-4 py-2 ${hasUnappliedChanges
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                            : 'bg-gradient-to-r bg-primary-background'} 
                            text-white text-sm font-medium rounded-md flex-grow transition-all shadow-sm
                            ${isApplying ? 'opacity-70 cursor-not-allowed' : ''}`}
                        onClick={applyFilters}
                        disabled={isApplying}
                    >
                        {isApplying ? 'Applying...' : 'Apply Filters'}
                        {hasUnappliedChanges && (
                            <span className="ml-1 inline-flex items-center justify-center w-2 h-2 bg-red-500 rounded-full" />
                        )}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white text-sm font-medium rounded-md transition-all flex-shrink-0 shadow-sm"
                        onClick={hasUnappliedChanges ? handleCancelChanges : handleClearFilters}
                    >
                        {hasUnappliedChanges ? 'Cancel' : (hasActiveFilters(filter) ? 'Clear All' : 'Clear')}
                    </motion.button>
                </div>
            )}
        </div>
    );
}

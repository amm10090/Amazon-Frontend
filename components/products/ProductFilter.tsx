"use client";

import { Slider } from "@heroui/react";
import { motion } from 'framer-motion';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback, useRef } from 'react';


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
    isPrime: boolean;
    apiProvider?: string;
}

const discountOptions = [80, 60, 40, 20, 10];

// HeroUI slider component with advanced features
function PriceRangeSlider({ min, max, value, onChange }: {
    min: number;
    max: number;
    value: [number, number];
    onChange: (value: [number, number]) => void;
}) {
    // Format price with currency symbol
    const _formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(price);
    };

    // Custom step calculation based on price range
    const _getStep = useCallback(() => {
        const range = max - min;

        if (range <= 100) return 1;
        if (range <= 500) return 5;
        if (range <= 1000) return 10;
        if (range <= 5000) return 50;

        return 100;
    }, [min, max]);

    // Quick price range options
    const quickRanges = [
        { label: "Under $200", values: [0, 200] },
        { label: "$200-$500", values: [200, 500] },
        { label: "$500-$1000", values: [500, 1000] },
        { label: "$1000-$5000", values: [1000, 5000] },
        { label: "$5000+", values: [5000, max] }
    ];

    return (
        <div className="pt-4 pb-2 w-full">
            {/* HeroUI Range Slider */}
            <div className="px-3 mb-6">
                <Slider
                    label="Price Range"
                    size="sm"
                    step={2000}
                    minValue={min}
                    maxValue={max}
                    value={value}
                    showTooltip
                    showSteps={true}
                    classNames={{

                        step: "bg-[#e2e8f0] data-[in-range=true]:bg-[#475569] dark:bg-[#4a5568] dark:data-[in-range=true]:bg-[#cbd5e0]"
                    }}
                    tooltipProps={{
                        className: "py-1 px-2 rounded-md font-medium bg-[#475569] text-white shadow-lg dark:bg-[#cbd5e0] dark:text-[#1a202c]"
                    }}
                    startContent={
                        <div className="flex h-full items-center">
                            <span className="text-xs text-[#64748b] dark:text-[#a0aec0]">${min}</span>
                        </div>
                    }
                    endContent={
                        <div className="flex h-full items-center">
                            <span className="text-xs text-[#64748b] dark:text-[#a0aec0]">${max}</span>
                        </div>
                    }
                    onChange={(value) => {
                        if (Array.isArray(value)) {
                            onChange(value as [number, number]);
                        }
                    }}
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
                        max={value[1] - 1}
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
                        min={value[0] + 1}
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
                {quickRanges.map((range) => (
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
    label?: string | React.ReactNode;
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
    const { data: _session } = useSession();
    const _isInitialMount = useRef(true);

    // 价格上限提升到10000美元
    const MAX_PRICE = 10000;

    // Get initial filter state from URL parameters
    const initialMinPrice = Number(searchParams.get('min_price')) || 0;
    const initialMaxPrice = Number(searchParams.get('max_price')) || MAX_PRICE;
    const initialDiscount = Number(searchParams.get('min_discount')) || 0;
    const initialIsPrime = searchParams.get('is_prime_only') === 'true';
    const initialApiProvider = searchParams.get('api_provider') || '';

    // 当前应用的筛选条件
    const [filter, setFilter] = useState<FilterState>({
        price: [initialMinPrice, initialMaxPrice] as [number, number],
        discount: initialDiscount,
        isPrime: initialIsPrime,
        apiProvider: initialApiProvider
    });

    // 添加临时筛选条件状态
    const [tempFilter, setTempFilter] = useState<FilterState>({
        price: [initialMinPrice, initialMaxPrice] as [number, number],
        discount: initialDiscount,
        isPrime: initialIsPrime,
        apiProvider: initialApiProvider
    });

    // 添加一个状态表示是否有未应用的变更
    const [_hasUnappliedChanges, setHasUnappliedChanges] = useState(false);

    // 跟踪筛选器是否正在应用中
    const [isApplying, setIsApplying] = useState(false);

    // 添加debounce计时器ref
    const debouncedApplyRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [expandedSections, setExpandedSections] = useState({
        price: true,
        discount: true
    });

    // Toggle section expansion
    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // 添加useEffect，监听URL参数变化并更新filter状态
    useEffect(() => {
        // 获取当前URL参数
        const minPrice = Number(searchParams.get('min_price')) || 0;
        const maxPrice = Number(searchParams.get('max_price')) || MAX_PRICE;
        const discount = Number(searchParams.get('min_discount')) || 0;
        const isPrime = searchParams.get('is_prime_only') === 'true';
        const apiProvider = searchParams.get('api_provider') || '';

        // 更新filter状态以反映URL参数
        const newFilter: FilterState = {
            price: [minPrice, maxPrice] as [number, number],
            discount,
            isPrime,
            apiProvider
        };

        setFilter(newFilter);
        // 同时更新临时筛选状态，确保它始终反映当前应用的筛选条件
        setTempFilter(newFilter);
        // 重置未应用变更状态
        setHasUnappliedChanges(false);
    }, [searchParams, MAX_PRICE]); // 依赖于searchParams，确保URL变化时会更新

    // 使用ref保存上一次的过滤条件，避免无限循环
    const prevFilter = useRef<FilterState>(filter);

    // 添加一个辅助函数，检查当前是否有活跃的筛选条件
    const hasActiveFilters = useCallback((filterState: FilterState) => {
        return (
            filterState.price[0] > 0 ||
            filterState.price[1] < MAX_PRICE ||
            filterState.discount > 0 ||
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

    // 创建自动应用筛选函数，使用debounce减少频繁更新
    const autoApplyFilters = useCallback((newFilter: FilterState) => {
        // 取消之前的计时器
        if (debouncedApplyRef.current) {
            clearTimeout(debouncedApplyRef.current);
        }

        // 设置新的计时器，缩短为200ms应用筛选
        debouncedApplyRef.current = setTimeout(() => {
            // 只有当临时筛选条件与当前应用的筛选条件不同时才应用
            if (JSON.stringify(newFilter) !== JSON.stringify(filter)) {
                setFilter(newFilter);
                prevFilter.current = { ...newFilter };

                // 构建URL参数并更新
                const params = buildUrlParams(newFilter);

                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                // 调用回调
                if (onFilter) {
                    const filterParams: Record<string, unknown> = {};

                    if (newFilter.price[0] > 0) filterParams.min_price = newFilter.price[0];
                    if (newFilter.price[1] < MAX_PRICE) filterParams.max_price = newFilter.price[1];
                    if (newFilter.discount > 0) filterParams.min_discount = newFilter.discount;
                    if (newFilter.isPrime) filterParams.is_prime_only = newFilter.isPrime;
                    if (newFilter.apiProvider) filterParams.api_provider = newFilter.apiProvider;

                    onFilter(filterParams);
                }
            }

            // 始终重置未应用变更状态
            setHasUnappliedChanges(false);
            debouncedApplyRef.current = null;
        }, 200); // 缩短到200ms
    }, [filter, buildUrlParams, onFilter, pathname, router, MAX_PRICE]);

    // 更新URL parameters function - 优化为只在明确应用筛选时调用
    const _applyFilters = useCallback(() => {
        // 防止重复应用
        if (isApplying) return;

        // 取消任何正在进行的自动应用
        if (debouncedApplyRef.current) {
            clearTimeout(debouncedApplyRef.current);
            debouncedApplyRef.current = null;
        }

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

    // 更新清除筛选条件函数
    const handleClearFilters = useCallback(() => {
        // 取消任何正在进行的自动应用
        if (debouncedApplyRef.current) {
            clearTimeout(debouncedApplyRef.current);
            debouncedApplyRef.current = null;
        }

        // 重置临时筛选条件到默认值
        const defaultFilter: FilterState = {
            price: [0, MAX_PRICE] as [number, number],
            discount: 0,
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
    const _handleCancelChanges = useCallback(() => {
        // 取消任何正在进行的自动应用
        if (debouncedApplyRef.current) {
            clearTimeout(debouncedApplyRef.current);
            debouncedApplyRef.current = null;
        }

        setTempFilter(filter);
        setHasUnappliedChanges(false);
    }, [filter]);

    // 组件卸载时清理计时器
    useEffect(() => {
        return () => {
            if (debouncedApplyRef.current) {
                clearTimeout(debouncedApplyRef.current);
            }
        };
    }, []);

    return (
        <div className="space-y-4 w-full overflow-x-hidden overscroll-contain">
            {/* 添加全局样式 */}
            <style jsx global>{noScrollbarStyle}</style>

            {/* Prime Filter Section - New Premium Position */}
            <div className="border-b pb-4 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Prime Eligible</h3>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-r from-[#0574F7]/10 to-[#0574F7]/5 rounded-lg p-4"
                >
                    <div className="flex items-center justify-between">
                        <Checkbox
                            id="prime-filter"
                            checked={tempFilter.isPrime}
                            onChange={(checked) => {
                                const newFilter = { ...tempFilter, isPrime: checked };

                                setTempFilter(newFilter);
                                setHasUnappliedChanges(true);
                                autoApplyFilters(newFilter);
                            }}
                            label={
                                <div className="flex items-center gap-2">
                                    <span className="text-[#0574F7] font-semibold">Prime</span>
                                    <svg className="w-5 h-5 text-[#0574F7]" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            }
                        />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        Show only items that are eligible for Prime delivery
                    </p>
                </motion.div>
            </div>

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
                            onChange={(value) => {
                                const newFilter = { ...tempFilter, price: value };

                                setTempFilter(newFilter);
                                setHasUnappliedChanges(true);
                                autoApplyFilters(newFilter);
                            }}
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
                                    onChange={() => {
                                        const newDiscount = tempFilter.discount === discount ? 0 : discount;
                                        const newFilter = { ...tempFilter, discount: newDiscount };

                                        setTempFilter(newFilter);
                                        setHasUnappliedChanges(true);
                                        autoApplyFilters(newFilter);
                                    }}
                                    label={`${discount}% or more`}
                                />
                            </div>
                        ))}
                    </motion.div>
                )}
            </div>

            {/* 只保留Clear按钮 */}
            {!hideButtons && hasActiveFilters(filter) && (
                <div className="sticky bottom-0 pt-2 bg-white dark:bg-gray-800 z-10">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white text-sm font-medium rounded-md transition-all shadow-sm"
                        onClick={handleClearFilters}
                    >
                        Clear All Filters
                    </motion.button>
                </div>
            )}
        </div>
    );
}

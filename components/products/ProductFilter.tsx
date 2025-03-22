"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { productsApi } from '@/lib/api';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

type FilterState = {
    price: [number, number];
    discount: number;
    brands: string[];
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
                    className="absolute h-2 bg-gradient-to-r from-primary/80 to-primary rounded-full"
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
                        className={`absolute w-6 h-6 bg-white border-2 border-primary rounded-full -mt-2 -ml-3 cursor-grab shadow-md ${activeThumb === 'min' ? 'ring-2 ring-primary ring-opacity-50 z-20' : 'z-10'}`}
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
                        className={`absolute -mt-9 ml-0 px-2 py-1 rounded bg-primary text-white text-xs font-bold whitespace-nowrap transform -translate-x-1/2 pointer-events-none ${activeThumb === 'min' ? 'opacity-100' : 'opacity-0'}`}
                        style={{ left: `${((value[0] - min) / (max - min)) * 100}%` }}
                        animate={{ opacity: activeThumb === 'min' ? 1 : 0, y: activeThumb === 'min' ? 0 : 5 }}
                        transition={{ duration: 0.2 }}
                    >
                        {formatPrice(value[0])}
                        <div className="absolute left-1/2 top-full w-2 h-2 bg-primary transform -translate-x-1/2 rotate-45"></div>
                    </motion.div>
                </div>

                {/* Max thumb with floating label */}
                <div className="relative">
                    <motion.div
                        className={`absolute w-6 h-6 bg-white border-2 border-primary rounded-full -mt-2 -ml-3 cursor-grab shadow-md ${activeThumb === 'max' ? 'ring-2 ring-primary ring-opacity-50 z-20' : 'z-10'}`}
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
                        className={`absolute -mt-9 ml-0 px-2 py-1 rounded bg-primary text-white text-xs font-bold whitespace-nowrap transform -translate-x-1/2 pointer-events-none ${activeThumb === 'max' ? 'opacity-100' : 'opacity-0'}`}
                        style={{ left: `${((value[1] - min) / (max - min)) * 100}%` }}
                        animate={{ opacity: activeThumb === 'max' ? 1 : 0, y: activeThumb === 'max' ? 0 : 5 }}
                        transition={{ duration: 0.2 }}
                    >
                        {formatPrice(value[1])}
                        <div className="absolute left-1/2 top-full w-2 h-2 bg-primary transform -translate-x-1/2 rotate-45"></div>
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
                        className="pl-7 pr-2 py-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
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
                        className="pl-7 pr-2 py-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
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
                ].map((range, index) => (
                    <button
                        key={index}
                        onClick={() => onChange([range.values[0], range.values[1]])}
                        className={`text-xs py-1 px-2 rounded-full transition-colors ${value[0] === range.values[0] && value[1] === range.values[1]
                                ? 'bg-primary text-white'
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
            <div className={`w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center ${checked ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600'}`}>
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

interface ProductFilterProps {
    onFilter?: (filters: any) => void;
}

export function ProductFilter({ onFilter }: ProductFilterProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const isInitialMount = useRef(true);

    // Get initial filter state from URL parameters
    const initialMinPrice = Number(searchParams.get('minPrice')) || 0;
    const initialMaxPrice = Number(searchParams.get('maxPrice')) || 1000;
    const initialDiscount = Number(searchParams.get('discount')) || 0;
    const initialBrands = searchParams.get('brands') ? searchParams.get('brands')!.split(',') : [];
    const initialIsPrime = searchParams.get('isPrime') === 'true';

    const [filter, setFilter] = useState<FilterState>({
        price: [initialMinPrice, initialMaxPrice],
        discount: initialDiscount,
        brands: initialBrands,
        isPrime: initialIsPrime
    });

    const [availableBrands, setAvailableBrands] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        price: true,
        discount: true,
        brands: true
    });

    // Toggle section expansion
    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Fetch available brands
    useEffect(() => {
        const fetchBrands = async () => {
            try {
                setLoading(true);
                // Mock data to avoid API errors
                setAvailableBrands([
                    'Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Nike',
                    'Adidas', 'Puma', 'Sony', 'LG', 'Panasonic'
                ]);
            } catch (error) {
                console.error('Unable to fetch brand list:', error);
                // Show some mock brands even if there's an error
                setAvailableBrands([
                    'Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Nike'
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchBrands();
    }, []);

    // Create a function to build URLSearchParams that doesn't depend on filter
    const buildUrlParams = useCallback((currentFilter: FilterState) => {
        const params = new URLSearchParams(searchParams.toString());

        // Only add to URL when value is not default
        if (currentFilter.price[0] > 0) params.set('minPrice', currentFilter.price[0].toString());
        else params.delete('minPrice');

        if (currentFilter.price[1] < 1000) params.set('maxPrice', currentFilter.price[1].toString());
        else params.delete('maxPrice');

        if (currentFilter.discount > 0) params.set('discount', currentFilter.discount.toString());
        else params.delete('discount');

        if (currentFilter.brands.length > 0) params.set('brands', currentFilter.brands.join(','));
        else params.delete('brands');

        if (currentFilter.isPrime) params.set('isPrime', 'true');
        else params.delete('isPrime');

        return params;
    }, [searchParams]);

    // Update URL parameters function
    const updateUrlParams = useCallback(() => {
        const currentFilterSnapshot = filter;
        const params = buildUrlParams(currentFilterSnapshot);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [filter, buildUrlParams, pathname, router]);

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
    }, [filter, updateUrlParams]);

    // Handle price change
    const handlePriceChange = (value: [number, number]) => {
        setFilter(prev => ({ ...prev, price: value }));
        if (onFilter) {
            onFilter({ min_price: value[0], max_price: value[1] });
        }
    };

    // Handle discount change
    const handleDiscountChange = (value: number) => {
        setFilter(prev => ({ ...prev, discount: value }));
        if (onFilter) {
            onFilter({ min_discount: value });
        }
    };

    // Handle brand change
    const handleBrandChange = (brand: string, checked: boolean) => {
        setFilter(prev => {
            const updatedBrands = checked
                ? [...prev.brands, brand]
                : prev.brands.filter(b => b !== brand);

            if (onFilter) {
                onFilter({ brands: updatedBrands });
            }

            return {
                ...prev,
                brands: updatedBrands
            };
        });
    };

    // Handle Prime filter change
    const handlePrimeChange = (checked: boolean) => {
        setFilter(prev => ({ ...prev, isPrime: checked }));
        if (onFilter) {
            onFilter({ is_prime_only: checked });
        }
    };

    // Clear all filters
    const handleClearFilters = () => {
        setFilter({
            price: [0, 1000],
            discount: 0,
            brands: [],
            isPrime: false
        });
        if (onFilter) {
            onFilter({
                min_price: undefined,
                max_price: undefined,
                min_discount: undefined,
                brands: [],
                is_prime_only: false
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Price Filter Section */}
            <div className="border-b pb-4 dark:border-gray-700">
                <div
                    className="flex justify-between items-center mb-4 cursor-pointer"
                    onClick={() => toggleSection('price')}
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
                            <div key={discount} className="flex items-center">
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
                        className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
                    >
                        {loading ? (
                            <div className="animate-pulse space-y-2">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                ))}
                            </div>
                        ) : (
                            availableBrands.map(brand => (
                                <div key={brand} className="flex items-center">
                                    <Checkbox
                                        id={`brand-${brand}`}
                                        checked={filter.brands.includes(brand)}
                                        onChange={(checked) => handleBrandChange(brand, checked)}
                                        label={brand}
                                    />
                                </div>
                            ))
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
            <div className="flex gap-2">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md w-full transition-all"
                    onClick={updateUrlParams}
                >
                    Apply Filters
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white text-sm font-medium rounded-md transition-all"
                    onClick={handleClearFilters}
                >
                    Clear
                </motion.button>
            </div>
        </div>
    );
} 
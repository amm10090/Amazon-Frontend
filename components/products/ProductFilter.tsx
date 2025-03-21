"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { productsApi } from '@/lib/api';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

type FilterState = {
    price: [number, number];
    rating: number;
    discount: number;
    brands: string[];
}

const ratingOptions = [5, 4, 3, 2, 1];
const discountOptions = [80, 60, 40, 20, 10];

export function ProductFilter() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // 从URL参数获取初始过滤状态
    const initialMinPrice = Number(searchParams.get('minPrice')) || 0;
    const initialMaxPrice = Number(searchParams.get('maxPrice')) || 1000;
    const initialRating = Number(searchParams.get('rating')) || 0;
    const initialDiscount = Number(searchParams.get('discount')) || 0;
    const initialBrands = searchParams.get('brands') ? searchParams.get('brands')!.split(',') : [];

    const [filter, setFilter] = useState<FilterState>({
        price: [initialMinPrice, initialMaxPrice],
        rating: initialRating,
        discount: initialDiscount,
        brands: initialBrands,
    });

    const [availableBrands, setAvailableBrands] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // 获取可用品牌列表
    useEffect(() => {
        const fetchBrands = async () => {
            try {
                setLoading(true);
                // 模拟API请求获取品牌
                // const response = await productsApi.getBrands();
                // setAvailableBrands(response.data.data);

                // 使用模拟数据，避免API请求404错误
                setAvailableBrands([
                    'Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Nike',
                    'Adidas', 'Puma', 'Sony', 'LG', 'Panasonic'
                ]);
            } catch (error) {
                console.error('无法获取品牌列表:', error);
                // 即使出错也显示一些模拟品牌
                setAvailableBrands([
                    'Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Nike'
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchBrands();
    }, []); // 空依赖数组，仅在组件挂载时获取一次

    // 使用useCallback包装更新URL的函数，避免在依赖数组中引起无限循环
    const updateUrlParams = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());

        // 只有当值不是默认值时才添加到URL
        if (filter.price[0] > 0) params.set('minPrice', filter.price[0].toString());
        else params.delete('minPrice');

        if (filter.price[1] < 1000) params.set('maxPrice', filter.price[1].toString());
        else params.delete('maxPrice');

        if (filter.rating > 0) params.set('rating', filter.rating.toString());
        else params.delete('rating');

        if (filter.discount > 0) params.set('discount', filter.discount.toString());
        else params.delete('discount');

        if (filter.brands.length > 0) params.set('brands', filter.brands.join(','));
        else params.delete('brands');

        // 使用replace而不是push，避免创建新的历史记录
        router.replace(`${pathname}?${params.toString()}`);
    }, [filter, pathname, router, searchParams]);

    // 监听过滤器变化，更新URL
    useEffect(() => {
        updateUrlParams();
    }, [filter, updateUrlParams]); // 依赖于filter和updateUrlParams

    // 处理价格范围变化
    const handlePriceChange = (value: [number, number]) => {
        setFilter(prev => ({ ...prev, price: value }));
    };

    // 处理评分过滤变化
    const handleRatingChange = (value: number) => {
        setFilter(prev => ({
            ...prev,
            rating: prev.rating === value ? 0 : value
        }));
    };

    // 处理折扣过滤变化
    const handleDiscountChange = (value: number) => {
        setFilter(prev => ({
            ...prev,
            discount: prev.discount === value ? 0 : value
        }));
    };

    // 处理品牌选择变化
    const handleBrandChange = (brand: string, checked: boolean) => {
        setFilter(prev => ({
            ...prev,
            brands: checked
                ? [...prev.brands, brand]
                : prev.brands.filter(b => b !== brand)
        }));
    };

    // 清除所有过滤器
    const handleClearFilters = () => {
        setFilter({
            price: [0, 1000],
            rating: 0,
            discount: 0,
            brands: [],
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-5">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">筛选</h3>
                <button
                    onClick={handleClearFilters}
                    className="text-primary hover:text-primary-dark text-sm font-medium"
                >
                    清除全部
                </button>
            </div>

            {/* 价格范围滑块 */}
            <div className="mb-8">
                <h4 className="font-medium text-gray-700 mb-3">价格范围</h4>
                <Slider
                    min={0}
                    max={1000}
                    step={10}
                    value={filter.price}
                    onChange={handlePriceChange}
                />
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>¥{filter.price[0]}</span>
                    <span>¥{filter.price[1]}</span>
                </div>
            </div>

            {/* 客户评分 */}
            <div className="mb-8">
                <h4 className="font-medium text-gray-700 mb-3">客户评分</h4>
                <div className="space-y-2">
                    {ratingOptions.map(rating => (
                        <div
                            key={`rating-${rating}`}
                            className={`cursor-pointer rounded-lg p-2 transition-colors ${filter.rating === rating ? 'bg-primary/10' : 'hover:bg-gray-100'
                                }`}
                            onClick={() => handleRatingChange(rating)}
                        >
                            <div className="flex items-center">
                                <div className="flex mr-2">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <svg
                                            key={index}
                                            className={`w-4 h-4 ${index < rating ? 'text-yellow-400' : 'text-gray-300'
                                                }`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600">
                                    {rating}星及以上
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 折扣 */}
            <div className="mb-8">
                <h4 className="font-medium text-gray-700 mb-3">折扣</h4>
                <div className="space-y-2">
                    {discountOptions.map(discount => (
                        <div
                            key={`discount-${discount}`}
                            className={`cursor-pointer rounded-lg p-2 transition-colors ${filter.discount === discount ? 'bg-primary/10' : 'hover:bg-gray-100'
                                }`}
                            onClick={() => handleDiscountChange(discount)}
                        >
                            <div className="flex items-center">
                                <motion.div
                                    className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md mr-2"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    {discount}% OFF
                                </motion.div>
                                <span className="text-sm text-gray-600">
                                    {discount}%折扣及以上
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 品牌 */}
            <div>
                <h4 className="font-medium text-gray-700 mb-3">品牌</h4>
                {loading ? (
                    <div className="animate-pulse space-y-2">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-6 bg-gray-200 rounded"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {availableBrands.map(brand => (
                            <div key={brand} className="flex items-center">
                                <Checkbox
                                    id={`brand-${brand}`}
                                    checked={filter.brands.includes(brand)}
                                    onChange={(checked) => handleBrandChange(brand, checked)}
                                />
                                <label
                                    htmlFor={`brand-${brand}`}
                                    className="ml-2 text-sm text-gray-600 cursor-pointer"
                                >
                                    {brand}
                                </label>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback, Suspense } from 'react';

import { productsApi } from '@/lib/api';
import type { Product, ListResponse } from '@/types/api';

// 定义筛选器选项接口
interface FilterOptions {
    minPrice?: number;
    maxPrice?: number;
    minDiscount?: number;
    isPrimeOnly?: boolean;
}

// 定义分页接口
interface PaginationState {
    page: number;
    limit: number;
    total?: number;
}

// 预定义骨架ID数组
const SKELETON_IDS = [
    'sk1', 'sk2', 'sk3', 'sk4', 'sk5', 'sk6', 'sk7', 'sk8',
    'sk9', 'sk10', 'sk11', 'sk12', 'sk13', 'sk14', 'sk15', 'sk16',
    'sk17', 'sk18', 'sk19', 'sk20', 'sk21', 'sk22', 'sk23', 'sk24'
];

const DealsPage = () => {
    // 状态管理
    const [deals, setDeals] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<FilterOptions>({
        minDiscount: 50, // 默认最低折扣50%
    });
    const [pagination, setPagination] = useState<PaginationState>({
        page: 1,
        limit: 12,
    });

    // 获取优惠商品数据
    const fetchDeals = useCallback(async () => {
        try {
            setLoading(true);
            const response = await productsApi.getDeals({
                active: true,
                page: pagination.page,
                limit: pagination.limit,
            });

            // 根据实际API响应结构获取数据
            const data = response.data;
            // API返回的是ListResponse<Product>结构，而不是嵌套在ApiResponse中
            const responseData = data as unknown as ListResponse<Product>;
            const items = responseData.items;

            if (items && items.length > 0) {
                setDeals(items);

                // 更新分页信息
                const total = responseData.total;

                setPagination(prev => ({
                    ...prev,
                    total: total
                }));
            } else {
                setDeals([]);
            }
        } catch {
            setError("获取特价商品失败，请稍后再试。");
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit]);

    // 监听分页和筛选器变化
    useEffect(() => {
        fetchDeals();
    }, [fetchDeals, filters]);

    // 处理分页变化
    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    // 渲染商品卡片
    const renderDealCard = (product: Product) => {
        // 获取主要优惠信息
        const mainOffer = product.offers && product.offers.length > 0 ? product.offers[0] : null;

        // 如果没有offers数据，使用其他可用的价格数据
        let currentPrice = 0;
        let originalPrice = 0;
        let discountPercentage = 0;

        if (mainOffer) {
            currentPrice = mainOffer.price;
            // 如果有savings，使用它计算原价
            if (mainOffer.savings) {
                originalPrice = currentPrice + mainOffer.savings;
            } else {
                // 否则使用商品自身的原价（如果有）
                originalPrice = product.original_price || currentPrice;
            }

            // 如果有折扣百分比，直接使用，否则计算
            discountPercentage = mainOffer.savings_percentage ||
                (originalPrice > 0 ? Math.round((1 - currentPrice / originalPrice) * 100) : 0);
        } else {
            // 使用产品本身的价格信息（如果有）
            currentPrice = product.price || 0;
            originalPrice = product.original_price || currentPrice;
            discountPercentage = product.discount_rate ||
                (originalPrice > 0 ? Math.round((1 - currentPrice / originalPrice) * 100) : 0);
        }

        // 如果没有足够的价格信息，跳过此产品
        if (currentPrice <= 0) {
            return null;
        }

        const productId = product.asin || product.id;

        if (!productId) {
            return null;
        }

        return (
            <div key={productId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <Link href={`/product/${productId}`}>
                    <div className="relative h-48 w-full">
                        <Image
                            src={product.main_image || product.image_url || "/placeholder.png"}
                            alt={product.title}
                            fill
                            className="object-cover"
                        />
                        {/* 折扣标签 */}
                        {discountPercentage > 0 && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded">
                                {discountPercentage}% OFF
                            </div>
                        )}
                    </div>
                    <div className="p-4">
                        <h3 className="text-lg font-semibold line-clamp-2 mb-2">{product.title}</h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-2xl font-bold text-red-500">${currentPrice.toFixed(2)}</span>
                                {originalPrice > currentPrice && (
                                    <span className="text-sm text-gray-500 line-through ml-2">
                                        ${originalPrice.toFixed(2)}
                                    </span>
                                )}
                            </div>
                            {mainOffer && mainOffer.is_prime && (
                                <div className="bg-[#0574F7] text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm flex items-center" style={{ transform: 'none' }}>
                                    Prime
                                </div>
                            )}
                        </div>
                        {/* 限时标签 */}
                        <div className="mt-2 text-sm text-gray-600">
                            Limited Time Deal
                        </div>
                    </div>
                </Link>
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* 页面标题 */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Limited Time Deals</h1>
                <p className="text-gray-600">
                    Discover amazing discounts on top products. Hurry before they&apos;re gone!
                </p>
            </div>

            {/* 筛选器区域 */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex flex-wrap gap-4">
                    <select
                        className="px-3 py-2 border rounded-md"
                        onChange={(e) => setFilters(prev => ({ ...prev, minDiscount: Number(e.target.value) }))}
                    >
                        <option value="50">50% Off or More</option>
                        <option value="60">60% Off or More</option>
                        <option value="70">70% Off or More</option>
                    </select>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            className="mr-2"
                            checked={filters.isPrimeOnly}
                            onChange={(e) => setFilters(prev => ({ ...prev, isPrimeOnly: e.target.checked }))}
                        />
                        Prime Only
                    </label>
                </div>
            </div>

            {/* 错误提示 */}
            {error && (
                <div className="text-red-500 text-center mb-4">
                    {error}
                </div>
            )}

            {/* 商品网格 */}
            <Suspense fallback={<div>Loading deals...</div>}>
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(pagination.limit)].map((_, i) => (
                            <div key={SKELETON_IDS[i]} className="animate-pulse">
                                <div className="bg-gray-200 h-48 rounded-lg mb-4" />
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                <div className="h-4 bg-gray-200 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {deals && deals.length > 0 ? (
                            deals.map(renderDealCard)
                        ) : (
                            <div className="col-span-full text-center text-gray-500">
                                暂无可用特价商品
                            </div>
                        )}
                    </div>
                )}
            </Suspense>

            {/* 分页控件 */}
            <div className="mt-8 flex justify-center">
                <button
                    className="px-4 py-2 mx-1 rounded bg-blue-500 text-white disabled:bg-gray-300"
                    disabled={pagination.page === 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                >
                    上一页
                </button>
                <span className="px-4 py-2 mx-1">
                    第 {pagination.page} 页
                </span>
                <button
                    className="px-4 py-2 mx-1 rounded bg-blue-500 text-white"
                    onClick={() => handlePageChange(pagination.page + 1)}
                >
                    下一页
                </button>
            </div>
        </div>
    );
};

export default DealsPage; 
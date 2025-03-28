/**
 * 收藏功能自定义Hook模块
 * 提供便捷的自定义hooks，简化组件中的使用
 */

import { useCallback, useEffect, useState, useMemo } from 'react';

import { productsApi } from '@/lib/api';
import type { Product } from '@/types/api';

import { useFavoritesContext } from './context';

/**
 * 用于在组件中使用收藏功能的Hook
 * 返回收藏状态和操作方法
 */
export function useFavorites() {
    const {
        favorites,
        favoriteIds,
        isLoading,
        error,
        addFavorite,
        removeFavorite,
        isFavorite,
        refreshFavorites,
        clearFavorites
    } = useFavoritesContext();

    return {
        favorites,
        favoriteIds,
        isLoading,
        error,
        addFavorite,
        removeFavorite,
        isFavorite,
        refreshFavorites,
        clearFavorites
    };
}

/**
 * 用于管理单个商品收藏状态的Hook
 * @param productId 商品ID
 * @returns 收藏状态和切换方法
 */
export function useProductFavorite(productId: string) {
    const { isFavorite, addFavorite, removeFavorite } = useFavoritesContext();
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 使用本地存储检查收藏状态
    const isProductFavorite = useMemo(() => {
        return isFavorite(productId);
    }, [isFavorite, productId]);

    // 切换收藏状态
    const toggleFavorite = useCallback(async () => {
        setIsUpdating(true);
        setError(null);

        try {
            const result = isProductFavorite
                ? await removeFavorite(productId)
                : await addFavorite(productId);

            if (!result.success) {
                setError(result.message);
            }

            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Operation failed';

            setError(errorMessage);

            return { success: false, message: errorMessage };
        } finally {
            setIsUpdating(false);
        }
    }, [isProductFavorite, addFavorite, removeFavorite, productId]);

    return {
        isFavorite: isProductFavorite,
        toggleFavorite,
        isUpdating,
        error
    };
}

/**
 * 用于获取收藏商品列表的Hook
 * 返回收藏的商品列表和加载状态
 */
export function useFavoritesList() {
    const { favorites, isLoading, error, refreshFavorites } = useFavoritesContext();

    return {
        favorites,
        isLoading,
        error,
        refreshFavorites
    };
}

/**
 * 获取带有完整商品信息的收藏列表
 * 基于收藏的ID列表，获取完整的商品信息
 */
export function useEnrichedFavorites() {
    const { favoriteIds, refreshFavorites } = useFavoritesContext();
    const [enrichedFavorites, setEnrichedFavorites] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchProductDetails() {
            if (!favoriteIds.length) {
                setEnrichedFavorites([]);
                setIsLoading(false);

                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // 对每个收藏的商品ID，获取完整信息
                const productPromises = favoriteIds.map(async (id) => {
                    try {
                        const response = await productsApi.getProductById(id);

                        // 处理不同的API响应格式
                        let productData: Product | null = null;

                        if (response.data?.data) {
                            // 标准格式: { code: 200, message: "...", data: {...} }
                            productData = response.data.data;
                        } else if (response.data && typeof response.data === 'object') {
                            // 直接是产品对象
                            productData = response.data as unknown as Product;
                        }

                        // 确保如果只有asin而没有id的情况下，也能正确处理
                        if (productData && productData.asin && !productData.id) {
                            productData.id = productData.asin;
                        }

                        // 判断数据是否有效 - 检查id或asin是否存在
                        if (!productData || (!productData.id && !productData.asin)) {
                            // 如果数据无效，返回基本信息对象
                            return {
                                id,
                                asin: id,
                                title: `Product ${id}`,
                                price: 0,
                                image_url: '/placeholder-product.jpg'
                            } as Product;
                        }

                        // 确保title字段存在，如果API返回的title是空的，则使用占位符
                        if (!productData.title || productData.title === '') {
                            productData.title = productData.title || `Product ${id}`;
                        }

                        // 确保价格字段存在
                        if (productData.price === undefined || productData.price === null) {
                            // 如果offers中有价格，使用offers中的价格
                            if (productData.offers && productData.offers.length > 0 && productData.offers[0].price) {
                                productData.price = productData.offers[0].price;
                            } else {
                                // 默认价格
                                productData.price = 0;
                            }
                        }

                        // 确保图片URL字段存在，优先使用main_image
                        if (!productData.image_url && productData.main_image) {
                            productData.image_url = productData.main_image;
                        } else if (!productData.image_url && !productData.main_image) {
                            productData.image_url = '/placeholder-product.jpg';
                        }

                        return productData;
                    } catch {
                        // 如果单个商品获取失败，返回基本信息对象
                        return {
                            id,
                            asin: id,
                            title: `Product ${id}`,
                            price: 0,
                            image_url: '/placeholder-product.jpg'
                        } as Product;
                    }
                });

                const products = await Promise.all(productPromises);
                const validProducts = products.filter(p => p && (p.id || p.asin));

                setEnrichedFavorites(validProducts);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to get favorite product details'));
            } finally {
                setIsLoading(false);
            }
        }

        fetchProductDetails();
    }, [favoriteIds]);

    return {
        favorites: enrichedFavorites,
        isLoading,
        error,
        refreshFavorites
    };
}

/**
 * 用于获取指定商品ID是否被收藏的Hook
 * @param productIds 商品ID数组
 * @returns 包含收藏状态的对象，键为商品ID
 */
export function useMultipleProductsFavoriteStatus(productIds: string[]) {
    const { isFavorite } = useFavoritesContext();

    const favoriteStatus: Record<string, boolean> = {};

    productIds.forEach(id => {
        favoriteStatus[id] = isFavorite(id);
    });

    return favoriteStatus;
}

/**
 * 用于批量操作收藏的Hook
 * 提供添加多个商品到收藏、从收藏中移除多个商品的方法
 */
export function useBatchFavorites() {
    const { addFavorite, removeFavorite } = useFavoritesContext();

    // 批量添加收藏
    const addMultipleFavorites = useCallback(async (productIds: string[]) => {
        const promises = productIds.map(id => addFavorite(id));

        await Promise.all(promises);
    }, [addFavorite]);

    // 批量移除收藏
    const removeMultipleFavorites = useCallback(async (productIds: string[]) => {
        const promises = productIds.map(id => removeFavorite(id));

        await Promise.all(promises);
    }, [removeFavorite]);

    return {
        addMultipleFavorites,
        removeMultipleFavorites
    };
} 
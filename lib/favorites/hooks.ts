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
                // 使用批量查询API获取商品信息
                const response = await productsApi.queryProducts({
                    asins: favoriteIds,
                    include_metadata: false,
                    include_browse_nodes: ["false"]
                });

                let products: Product[] = [];

                // 检查不同的响应结构
                if (response?.data?.data) {
                    // 标准API响应结构
                    products = response.data.data;
                } else if (Array.isArray(response?.data)) {
                    // 直接是数组的情况
                    products = response.data;
                } else if (response?.data) {
                    // 其他可能的响应结构
                    products = response.data as unknown as Product[];
                }

                // 确保products是数组
                if (!Array.isArray(products)) {
                    products = [];
                }

                // 处理返回的商品数组，确保每个位置都有有效的商品数据
                const matchedProducts = favoriteIds.map((id) => {
                    const product = products.find(p => p.asin === id || p.id === id);

                    if (!product) {
                        // 如果某个商品不存在，返回基本信息对象
                        return {
                            id,
                            asin: id,
                            title: `Product ${id}`,
                            price: 0,
                            image_url: '/placeholder-product.jpg'
                        } as Product;
                    }

                    return product;
                });

                setEnrichedFavorites(matchedProducts);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to get favorite product details'));
                // 在发生错误时，使用基本信息对象
                const fallbackProducts = favoriteIds.map(id => ({
                    id,
                    asin: id,
                    title: `Product ${id}`,
                    price: 0,
                    image_url: '/placeholder-product.jpg'
                })) as Product[];

                setEnrichedFavorites(fallbackProducts);
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
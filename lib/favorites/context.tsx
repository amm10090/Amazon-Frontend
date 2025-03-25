/**
 * 收藏功能Context模块
 * 提供全局的收藏状态和操作方法
 * 纯本地存储实现，不涉及API调用
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

import type { Product } from '@/types/api';

import {
    getLocalFavorites,
    addLocalFavorite,
    removeLocalFavorite,
    isLocalFavorite,
    clearLocalFavorites
} from './storage';

// 定义Context的类型
interface FavoritesContextType {
    // 状态
    favorites: Product[];          // 收藏的商品列表
    favoriteIds: string[];         // 收藏的商品ID列表
    isLoading: boolean;            // 加载状态
    error: Error | null;           // 错误信息

    // 方法
    addFavorite: (productId: string) => Promise<void>;              // 添加收藏
    removeFavorite: (productId: string) => Promise<void>;           // 移除收藏
    isFavorite: (productId: string) => boolean;                     // 判断是否已收藏
    refreshFavorites: () => Promise<void>;                          // 刷新收藏列表
    clearFavorites: () => Promise<void>;                            // 清空收藏
}

// 创建Context，设置默认值
const FavoritesContext = createContext<FavoritesContextType>({
    favorites: [],
    favoriteIds: [],
    isLoading: false,
    error: null,
    addFavorite: async () => { },
    removeFavorite: async () => { },
    isFavorite: () => false,
    refreshFavorites: async () => { },
    clearFavorites: async () => { }
});

// 定义Provider组件的Props类型
interface FavoritesProviderProps {
    children: React.ReactNode;
}

/**
 * 收藏功能Provider组件
 * 提供全局的收藏状态和操作方法
 * 纯本地存储实现，不涉及API调用
 */
export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
    // 收藏状态
    const [favorites, setFavorites] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    // 提取收藏的商品ID列表，用于快速查找
    const favoriteIds = useMemo(() => {
        return favorites.map(product => product.asin || product.id || '');
    }, [favorites]);

    /**
     * 刷新收藏列表
     * 从本地存储获取收藏ID，转换为简单的商品对象
     */
    const refreshFavorites = useCallback(async () => {
        try {
            setIsLoading(true);

            // 获取本地收藏ID列表
            const localFavoriteIds = getLocalFavorites();

            // 将ID转换为简单的商品对象
            const simpleProducts = localFavoriteIds.map(id => ({
                id,
                asin: id,
                title: `商品 ${id}`,
                price: 0,
                image_url: '/placeholder-product.jpg'
            })) as Product[];

            // 更新状态
            setFavorites(simpleProducts);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('获取收藏列表失败'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * 添加收藏
     * 直接更新本地存储，不调用API
     * @param productId 商品ID
     */
    const addFavorite = useCallback(async (productId: string) => {
        if (!productId || favoriteIds.includes(productId)) {
            return;
        }

        try {
            // 添加到本地存储
            addLocalFavorite(productId);

            // 刷新收藏列表
            await refreshFavorites();
        } catch (err) {
            setError(err instanceof Error ? err : new Error('添加收藏失败'));
        }
    }, [favoriteIds, refreshFavorites]);

    /**
     * 移除收藏
     * 直接更新本地存储，不调用API
     * @param productId 商品ID
     */
    const removeFavorite = useCallback(async (productId: string) => {
        if (!productId || !favoriteIds.includes(productId)) {
            return;
        }

        try {
            // 从本地存储中移除
            removeLocalFavorite(productId);

            // 刷新收藏列表
            await refreshFavorites();
        } catch (err) {
            setError(err instanceof Error ? err : new Error('移除收藏失败'));
        }
    }, [favoriteIds, refreshFavorites]);

    /**
     * 判断商品是否已收藏
     * @param productId 商品ID
     * @returns 是否已收藏
     */
    const isFavorite = useCallback((productId: string) => {
        return favoriteIds.includes(productId) || isLocalFavorite(productId);
    }, [favoriteIds]);

    /**
     * 清空收藏
     * 直接清空本地存储，不调用API
     */
    const clearFavorites = useCallback(async () => {
        try {
            // 清空本地收藏
            clearLocalFavorites();

            // 刷新收藏列表
            await refreshFavorites();
        } catch (err) {
            setError(err instanceof Error ? err : new Error('清空收藏失败'));
        }
    }, [refreshFavorites]);

    // 组件挂载时，从本地存储加载收藏列表
    useEffect(() => {
        refreshFavorites();
    }, [refreshFavorites]);

    // 构建Context值
    const contextValue = useMemo(() => ({
        favorites,
        favoriteIds,
        isLoading,
        error,
        addFavorite,
        removeFavorite,
        isFavorite,
        refreshFavorites,
        clearFavorites
    }), [
        favorites,
        favoriteIds,
        isLoading,
        error,
        addFavorite,
        removeFavorite,
        isFavorite,
        refreshFavorites,
        clearFavorites
    ]);

    return (
        <FavoritesContext.Provider value={contextValue}>
            {children}
        </FavoritesContext.Provider>
    );
};

/**
 * 使用收藏Context的Hook
 * @returns FavoritesContext的值
 */
export const useFavoritesContext = () => useContext(FavoritesContext);

// 导出Context
export default FavoritesContext; 
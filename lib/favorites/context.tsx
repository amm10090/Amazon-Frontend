/**
 * 收藏功能Context模块
 * 提供全局的收藏状态和操作方法
 */

import { useSession } from 'next-auth/react';
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

import type { Product } from '@/types/api';

import { favoritesApi } from './api';
import {
    getLocalFavorites,
    addLocalFavorite,
    removeLocalFavorite,
    isLocalFavorite,
    clearLocalFavorites,
    syncLocalFavorites
} from './storage';

// 定义Context的类型
interface FavoritesContextType {
    // 状态
    favorites: Product[];          // 收藏的商品列表
    favoriteIds: string[];         // 收藏的商品ID列表
    isLoading: boolean;            // 加载状态
    error: Error | null;           // 错误信息
    isAuthenticated: boolean;      // 是否已登录

    // 方法
    addFavorite: (productId: string) => Promise<{ success: boolean; message: string }>;              // 添加收藏
    removeFavorite: (productId: string) => Promise<{ success: boolean; message: string }>;           // 移除收藏
    isFavorite: (productId: string) => boolean;                     // 判断是否已收藏
    refreshFavorites: () => Promise<void>;                          // 刷新收藏列表
    clearFavorites: () => Promise<void>;                            // 清空收藏
    syncWithServer: () => Promise<void>;                           // 与服务器同步
}

// 创建Context
const FavoritesContext = createContext<FavoritesContextType>({
    favorites: [],
    favoriteIds: [],
    isLoading: false,
    error: null,
    isAuthenticated: false,
    addFavorite: async () => ({ success: true, message: '' }),
    removeFavorite: async () => ({ success: true, message: '' }),
    isFavorite: () => false,
    refreshFavorites: async () => { },
    clearFavorites: async () => { },
    syncWithServer: async () => { }
});

// Provider组件Props类型
interface FavoritesProviderProps {
    children: React.ReactNode;
}

/**
 * 收藏功能Provider组件
 */
export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
    const { data: session } = useSession();
    const [favorites, setFavorites] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    // 提取收藏的商品ID列表
    const favoriteIds = useMemo(() => {
        return favorites.map(product => product.asin || product.id || '');
    }, [favorites]);

    // 是否已登录
    const isAuthenticated = !!session?.user;

    /**
     * 刷新收藏列表
     */
    const refreshFavorites = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            if (isAuthenticated) {
                // 从服务器获取收藏列表
                const response = await favoritesApi.getFavorites();

                if (response.data.code === 200) {
                    setFavorites(response.data.data);
                    // 同步到本地存储，过滤掉 undefined 值
                    syncLocalFavorites(response.data.data.map(p => p.id || p.asin).filter((id): id is string => id !== undefined));
                } else {
                    throw new Error(response.data.message);
                }
            } else {
                // 从本地存储获取
                const localFavoriteIds = getLocalFavorites();
                const simpleProducts = localFavoriteIds.map(id => ({
                    id,
                    asin: id,
                    title: `Product ${id}`
                })) as Product[];

                setFavorites(simpleProducts);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to refresh favorites'));
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    /**
     * 添加收藏
     */
    const addFavorite = useCallback(async (productId: string) => {
        if (!productId || favoriteIds.includes(productId)) {
            return { success: true, message: 'Item already in favorites' };
        }

        try {
            setError(null);

            if (isAuthenticated) {
                // 调用服务器API
                const response = await favoritesApi.addFavorite(productId);

                if (response.data.code !== 200) {
                    throw new Error(response.data.message);
                }
            }
            // 无论是否登录，都添加到本地存储
            addLocalFavorite(productId);
            await refreshFavorites();

            return { success: true, message: 'Successfully added to favorites' };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add favorite';

            setError(err instanceof Error ? err : new Error(errorMessage));

            return { success: false, message: errorMessage };
        }
    }, [favoriteIds, isAuthenticated, refreshFavorites]);

    /**
     * 移除收藏
     */
    const removeFavorite = useCallback(async (productId: string) => {
        if (!productId || !favoriteIds.includes(productId)) {
            return { success: true, message: 'Item not in favorites' };
        }

        try {
            setError(null);

            if (isAuthenticated) {
                // 调用服务器API
                const response = await favoritesApi.removeFavorite(productId);

                if (response.data.code !== 200) {
                    throw new Error(response.data.message);
                }
            }
            // 无论是否登录，都从本地存储中移除
            removeLocalFavorite(productId);
            await refreshFavorites();

            return { success: true, message: 'Successfully removed from favorites' };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to remove favorite';

            setError(err instanceof Error ? err : new Error(errorMessage));

            return { success: false, message: errorMessage };
        }
    }, [favoriteIds, isAuthenticated, refreshFavorites]);

    /**
     * 判断商品是否已收藏
     */
    const isFavorite = useCallback((productId: string) => {
        return favoriteIds.includes(productId) || isLocalFavorite(productId);
    }, [favoriteIds]);

    /**
     * 清空收藏
     */
    const clearFavorites = useCallback(async () => {
        try {
            if (isAuthenticated) {
                // 调用服务器API同步空列表
                const response = await favoritesApi.syncFavorites([]);

                if (response.data.code !== 200) {
                    throw new Error(response.data.message);
                }
            }
            // 清空本地存储
            clearLocalFavorites();
            await refreshFavorites();
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to clear favorites'));
        }
    }, [isAuthenticated, refreshFavorites]);

    /**
     * 与服务器同步收藏列表
     */
    const syncWithServer = useCallback(async () => {
        if (!isAuthenticated) {
            return;
        }

        try {
            setIsLoading(true);
            const localIds = getLocalFavorites();
            const response = await favoritesApi.syncFavorites(localIds);

            if (response.data.code === 200) {
                await refreshFavorites();
            } else {
                throw new Error(response.data.message);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to sync favorites'));
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, refreshFavorites]);

    // 监听登录状态变化
    useEffect(() => {
        if (isAuthenticated) {
            // 登录后，同步本地收藏到服务器
            syncWithServer();
        } else {
            // 未登录时，从本地存储加载
            refreshFavorites();
        }
    }, [isAuthenticated, syncWithServer, refreshFavorites]);

    // 构建Context值
    const contextValue = useMemo(() => ({
        favorites,
        favoriteIds,
        isLoading,
        error,
        isAuthenticated,
        addFavorite,
        removeFavorite,
        isFavorite,
        refreshFavorites,
        clearFavorites,
        syncWithServer
    }), [
        favorites,
        favoriteIds,
        isLoading,
        error,
        isAuthenticated,
        addFavorite,
        removeFavorite,
        isFavorite,
        refreshFavorites,
        clearFavorites,
        syncWithServer
    ]);

    return (
        <FavoritesContext.Provider value={contextValue}>
            {children}
        </FavoritesContext.Provider>
    );
};

/**
 * 使用收藏Context的Hook
 */
export const useFavoritesContext = () => useContext(FavoritesContext);

export default FavoritesContext; 
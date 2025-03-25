/**
 * 收藏功能API模块（纯本地实现）
 * 这个模块提供了与API相同的接口，但所有操作都是在本地完成的
 */

import type { Product } from '@/types/api';

import {
    getLocalFavorites,
    addLocalFavorite,
    removeLocalFavorite
} from './storage';

// 模拟API响应类型
type ApiResponseWrapper<T> = {
    data: {
        code: number;
        message: string;
        data: T;
    }
};

/**
 * 收藏API封装 - 纯本地实现
 * 所有方法都返回Promise，模拟API调用
 */
export const favoritesApi = {
    /**
     * 获取收藏列表
     * @returns 收藏商品列表的Promise
     */
    getFavorites: () => {
        return new Promise<ApiResponseWrapper<Product[]>>((resolve) => {
            // 从本地存储获取收藏ID
            const favoriteIds = getLocalFavorites();

            // 将ID转换为简单的商品对象
            const products = favoriteIds.map(id => ({
                id,
                asin: id,
                title: `Product ${id}`
            })) as Product[];

            // 返回模拟的API响应
            resolve({
                data: {
                    code: 200,
                    message: '获取收藏列表成功',
                    data: products
                }
            });
        });
    },

    /**
     * 添加收藏
     * @param productId 商品ID
     * @returns 添加结果的Promise
     */
    addFavorite: (productId: string) => {
        return new Promise<ApiResponseWrapper<void>>((resolve) => {
            // 添加到本地存储
            addLocalFavorite(productId);

            // 返回模拟的API响应
            resolve({
                data: {
                    code: 200,
                    message: '添加收藏成功',
                    data: undefined
                }
            });
        });
    },

    /**
     * 移除收藏
     * @param productId 商品ID
     * @returns 移除结果的Promise
     */
    removeFavorite: (productId: string) => {
        return new Promise<ApiResponseWrapper<void>>((resolve) => {
            // 从本地存储中移除
            removeLocalFavorite(productId);

            // 返回模拟的API响应
            resolve({
                data: {
                    code: 200,
                    message: '移除收藏成功',
                    data: undefined
                }
            });
        });
    },

    /**
     * 批量同步收藏
     * @param productIds 商品ID数组
     * @returns 同步结果的Promise
     */
    syncFavorites: (productIds: string[]) => {
        return new Promise<ApiResponseWrapper<void>>((resolve) => {
            // 这里我们只需要确保本地收藏包含所有传入的ID
            productIds.forEach(id => {
                addLocalFavorite(id);
            });

            // 返回模拟的API响应
            resolve({
                data: {
                    code: 200,
                    message: '同步收藏列表成功',
                    data: undefined
                }
            });
        });
    }
}; 
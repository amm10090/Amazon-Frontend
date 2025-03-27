/**
 * 收藏功能API模块
 */

import type { Product } from '@/types/api';

// 收藏项接口
interface FavoriteItem {
    userId: string;
    productId: string;
    updatedAt?: Date;
}

// 模拟API响应类型
export type ApiResponseWrapper<T> = {
    data: {
        code: number;
        message: string;
        data: T;
    }
};

/**
 * 收藏API封装
 */
export const favoritesApi = {
    /**
     * 获取收藏列表
     * @returns 收藏商品列表的Promise
     */
    getFavorites: async (): Promise<ApiResponseWrapper<Product[]>> => {
        try {
            const response = await fetch('/api/favorites');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '获取收藏列表失败');
            }

            // 将收藏记录转换为商品对象
            const products = data.favorites.map((fav: FavoriteItem) => ({
                id: fav.productId,
                asin: fav.productId,
                title: `Product ${fav.productId}`
            })) as Product[];

            return {
                data: {
                    code: 200,
                    message: '获取收藏列表成功',
                    data: products
                }
            };
        } catch (error) {
            return {
                data: {
                    code: 500,
                    message: error instanceof Error ? error.message : '获取收藏列表失败',
                    data: []
                }
            };
        }
    },

    /**
     * 添加收藏
     * @param productId 商品ID
     * @returns 添加结果的Promise
     */
    addFavorite: async (productId: string): Promise<ApiResponseWrapper<undefined>> => {
        try {
            const response = await fetch('/api/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '添加收藏失败');
            }

            return {
                data: {
                    code: 200,
                    message: '添加收藏成功',
                    data: undefined
                }
            };
        } catch (error) {
            return {
                data: {
                    code: 500,
                    message: error instanceof Error ? error.message : '添加收藏失败',
                    data: undefined
                }
            };
        }
    },

    /**
     * 移除收藏
     * @param productId 商品ID
     * @returns 移除结果的Promise
     */
    removeFavorite: async (productId: string): Promise<ApiResponseWrapper<undefined>> => {
        try {
            const response = await fetch('/api/favorites', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '移除收藏失败');
            }

            return {
                data: {
                    code: 200,
                    message: '移除收藏成功',
                    data: undefined
                }
            };
        } catch (error) {
            return {
                data: {
                    code: 500,
                    message: error instanceof Error ? error.message : '移除收藏失败',
                    data: undefined
                }
            };
        }
    },

    /**
     * 批量同步收藏
     * @param productIds 商品ID数组
     * @returns 同步结果的Promise
     */
    syncFavorites: async (productIds: string[]): Promise<ApiResponseWrapper<undefined>> => {
        try {
            // 获取当前收藏列表
            const currentResponse = await fetch('/api/favorites');
            const currentData = await currentResponse.json();

            if (!currentResponse.ok) {
                throw new Error(currentData.error || '获取当前收藏列表失败');
            }

            // 获取当前收藏的商品ID
            const currentIds = currentData.favorites.map((fav: FavoriteItem) => fav.productId);

            // 需要添加的商品
            const idsToAdd = productIds.filter((id: string) => !currentIds.includes(id));
            // 需要移除的商品
            const idsToRemove = currentIds.filter((id: string) => !productIds.includes(id));

            // 批量添加新商品
            const addPromises = idsToAdd.map((id: string) =>
                fetch('/api/favorites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: id }),
                })
            );

            // 批量移除不需要的商品
            const removePromises = idsToRemove.map((id: string) =>
                fetch('/api/favorites', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: id }),
                })
            );

            // 等待所有操作完成
            await Promise.all([...addPromises, ...removePromises]);

            return {
                data: {
                    code: 200,
                    message: '同步收藏列表成功',
                    data: undefined
                }
            };
        } catch (error) {
            return {
                data: {
                    code: 500,
                    message: error instanceof Error ? error.message : '同步收藏列表失败',
                    data: undefined
                }
            };
        }
    }
}; 
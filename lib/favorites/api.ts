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
            if (!productIds.length) {
                return {
                    data: {
                        code: 200,
                        message: '无需同步',
                        data: undefined
                    }
                };
            }

            // 批量处理，每批最多20个
            const batchSize = 20;
            const batches = [];

            for (let i = 0; i < productIds.length; i += batchSize) {
                const batch = productIds.slice(i, i + batchSize);

                batches.push(batch);
            }

            // 使用Promise.allSettled处理每个批次
            const results = await Promise.allSettled(
                batches.map(async (batchIds) => {
                    const retryLimit = 3;
                    let attempt = 0;

                    while (attempt < retryLimit) {
                        try {
                            const response = await fetch('/api/favorites/batch', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ productIds: batchIds }),
                            });

                            const data = await response.json();

                            if (!response.ok) {
                                throw new Error(data.error || '批量同步失败');
                            }

                            return data;
                        } catch (error) {
                            attempt++;
                            if (attempt === retryLimit) {
                                throw error;
                            }
                            // 指数退避重试
                            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                        }
                    }
                })
            );

            // 检查是否所有批次都成功
            const failures = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected');

            if (failures.length > 0) {
                throw new Error(`部分批次同步失败: ${failures.map(f => f.reason.message).join(', ')}`);
            }

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
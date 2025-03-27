import type { ObjectId } from "mongodb";

/**
 * 用户收藏数据模型
 */
export interface UserFavorite {
    _id?: ObjectId;
    userId: string;           // 用户ID
    productId: string;        // 商品ID
    createdAt: Date;         // 创建时间
    updatedAt: Date;         // 更新时间
}

/**
 * 用户收藏列表响应类型
 */
export interface UserFavoritesResponse {
    favorites: UserFavorite[];
    total: number;
}

/**
 * 创建收藏的请求类型
 */
export interface CreateFavoriteRequest {
    userId: string;
    productId: string;
}

/**
 * 删除收藏的请求类型
 */
export interface DeleteFavoriteRequest {
    userId: string;
    productId: string;
} 
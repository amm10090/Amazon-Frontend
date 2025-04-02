import type { Collection } from "mongodb";

import type { UserFavorite, UserFavoritesResponse } from "@/lib/models/UserFavorite";
import clientPromise from "@/lib/mongodb";

/**
 * 获取收藏集合
 */
async function getFavoritesCollection(): Promise<Collection<UserFavorite>> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "test");

    return db.collection<UserFavorite>("favorites");
}

/**
 * 获取用户的收藏列表
 */
export async function getUserFavorites(userId: string): Promise<UserFavoritesResponse> {
    const collection = await getFavoritesCollection();
    const favorites = await collection
        .find({ userId })
        .sort({ createdAt: -1 })
        .toArray();

    return {
        favorites,
        total: favorites.length
    };
}

/**
 * 添加收藏
 */
export async function addFavorite(userId: string, productId: string): Promise<UserFavorite> {
    const collection = await getFavoritesCollection();

    const favorite: UserFavorite = {
        userId,
        productId,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    await collection.insertOne(favorite);

    return favorite;
}

/**
 * 删除收藏
 */
export async function removeFavorite(userId: string, productId: string): Promise<boolean> {
    const collection = await getFavoritesCollection();
    const result = await collection.deleteOne({ userId, productId });

    return result.deletedCount > 0;
}

/**
 * 检查商品是否已收藏
 */
export async function isFavorited(userId: string, productId: string): Promise<boolean> {
    const collection = await getFavoritesCollection();
    const favorite = await collection.findOne({ userId, productId });

    return !!favorite;
}

/**
 * 批量同步收藏
 */
export async function syncFavorites(userId: string, productIds: string[]): Promise<UserFavorite[]> {
    const collection = await getFavoritesCollection();

    // 删除所有现有收藏
    await collection.deleteMany({ userId });

    if (productIds.length === 0) {
        return [];
    }

    // 批量插入新收藏
    const favorites: UserFavorite[] = productIds.map(productId => ({
        userId,
        productId,
        createdAt: new Date(),
        updatedAt: new Date()
    }));

    await collection.insertMany(favorites);

    return favorites;
} 
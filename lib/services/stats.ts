import type { Collection } from "mongodb";

import type { User } from "@/lib/models/User";
import type { UserFavorite } from "@/lib/models/UserFavorite";
import clientPromise from "@/lib/mongodb";

/**
 * 获取用户集合
 */
async function getUsersCollection(): Promise<Collection<User>> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "test");

    return db.collection<User>("users");
}

/**
 * 获取收藏集合
 */
async function getFavoritesCollection(): Promise<Collection<UserFavorite>> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "test");

    return db.collection<UserFavorite>("favorites");
}

/**
 * 获取用户统计数据
 */
export async function getUserStats() {
    try {
        const collection = await getUsersCollection();

        // 获取用户总数
        const totalUsers = await collection.countDocuments();

        // 获取过去30天内活跃的用户数量
        const thirtyDaysAgo = new Date();

        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activeUsers = await collection.countDocuments({
            updatedAt: { $gte: thirtyDaysAgo }
        });

        // 获取过去30天内新增的用户数量
        const newUsersLastMonth = await collection.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        return {
            total_users: totalUsers,
            active_users: activeUsers,
            new_users_last_month: newUsersLastMonth,
            last_update: new Date().toISOString()
        };
    } catch {

        return {
            total_users: 0,
            active_users: 0,
            new_users_last_month: 0,
            last_update: new Date().toISOString()
        };
    }
}

/**
 * 获取收藏统计数据
 */
export async function getFavoriteStats() {
    try {
        const collection = await getFavoritesCollection();

        // 获取收藏总数
        const totalFavorites = await collection.countDocuments();

        // 获取有收藏的唯一用户数
        const uniqueUsers = (await collection.distinct("userId")).length;

        // 获取过去30天内的收藏数量
        const thirtyDaysAgo = new Date();

        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const lastMonthFavorites = await collection.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        return {
            total_favorites: totalFavorites,
            unique_users: uniqueUsers,
            last_month_favorites: lastMonthFavorites,
            last_update: new Date().toISOString()
        };
    } catch {
        return {
            total_favorites: 0,
            unique_users: 0,
            last_month_favorites: 0,
            last_update: new Date().toISOString()
        };
    }
}

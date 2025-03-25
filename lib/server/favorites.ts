/**
 * 服务端收藏功能工具
 * 处理与收藏相关的服务端逻辑
 */

import fs from 'fs';
import path from 'path';

import type { NextApiRequest } from 'next';


// 数据存储路径
const DATA_DIR = path.join(process.cwd(), '.data');
const FAVORITES_DIR = path.join(DATA_DIR, 'favorites');

// 初始化数据目录
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(FAVORITES_DIR)) {
    fs.mkdirSync(FAVORITES_DIR, { recursive: true });
}

/**
 * 从请求中获取客户端ID
 * @param req NextApiRequest对象
 * @returns 客户端ID或null
 */
export function getClientIdFromRequest(req: NextApiRequest): string | null {
    const clientId = req.headers['x-client-id'];

    if (!clientId || typeof clientId !== 'string' || clientId.trim() === '') {
        return null;
    }

    return clientId;
}

/**
 * 验证客户端ID是否有效
 * @param clientId 客户端ID
 * @returns 是否有效
 */
export function validateClientId(clientId: string): boolean {
    // 简单验证：确保clientId是以client_开头的字符串
    return Boolean(clientId && typeof clientId === 'string' && clientId.startsWith('client_'));
}

/**
 * 获取客户端的收藏列表文件路径
 * @param clientId 客户端ID
 * @returns 文件路径
 */
function getClientFavoritesPath(clientId: string): string {
    return path.join(FAVORITES_DIR, `${clientId}.json`);
}

/**
 * 获取客户端的收藏商品ID列表
 * @param clientId 客户端ID
 * @returns 收藏的商品ID数组
 */
export function getClientFavoriteIds(clientId: string): string[] {
    const filePath = getClientFavoritesPath(clientId);

    if (!fs.existsSync(filePath)) {
        return [];
    }

    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(data);

        if (Array.isArray(parsed)) {
            return parsed.filter(id => typeof id === 'string' && id.trim() !== '');
        }

        return [];
    } catch {
        return [];
    }
}

/**
 * 保存客户端的收藏商品ID列表
 * @param clientId 客户端ID
 * @param productIds 收藏的商品ID数组
 */
export function saveClientFavoriteIds(clientId: string, productIds: string[]): void {
    const filePath = getClientFavoritesPath(clientId);

    try {
        // 确保数据目录存在
        if (!fs.existsSync(FAVORITES_DIR)) {
            fs.mkdirSync(FAVORITES_DIR, { recursive: true });
        }

        // 保存数据
        fs.writeFileSync(filePath, JSON.stringify(productIds), 'utf-8');
    } catch {
        return;
    }
}

/**
 * 添加商品到客户端的收藏列表
 * @param clientId 客户端ID
 * @param productId 商品ID
 * @returns 更新后的收藏商品ID数组
 */
export function addToClientFavorites(clientId: string, productId: string): string[] {
    if (!productId || typeof productId !== 'string') {
        throw new Error('无效的商品ID');
    }

    const favoriteIds = getClientFavoriteIds(clientId);

    if (!favoriteIds.includes(productId)) {
        favoriteIds.push(productId);
        saveClientFavoriteIds(clientId, favoriteIds);
    }

    return favoriteIds;
}

/**
 * 从客户端的收藏列表中移除商品
 * @param clientId 客户端ID
 * @param productId 商品ID
 * @returns 更新后的收藏商品ID数组
 */
export function removeFromClientFavorites(clientId: string, productId: string): string[] {
    if (!productId || typeof productId !== 'string') {
        throw new Error('无效的商品ID');
    }

    let favoriteIds = getClientFavoriteIds(clientId);

    if (favoriteIds.includes(productId)) {
        favoriteIds = favoriteIds.filter(id => id !== productId);
        saveClientFavoriteIds(clientId, favoriteIds);
    }

    return favoriteIds;
}

/**
 * 同步客户端收藏列表
 * @param clientId 客户端ID
 * @param productIds 商品ID数组
 * @returns 更新后的收藏商品ID数组
 */
export function syncClientFavorites(clientId: string, productIds: string[]): string[] {
    if (!Array.isArray(productIds)) {
        throw new Error('无效的商品ID数组');
    }

    // 过滤无效的ID
    const validProductIds = productIds.filter(id => typeof id === 'string' && id.trim() !== '');

    // 保存数据
    saveClientFavoriteIds(clientId, validProductIds);

    return validProductIds;
} 
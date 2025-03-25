/**
 * 收藏功能本地存储模块
 * 处理与localStorage相关的操作，包括客户端ID和收藏列表
 */

// 本地存储的键名
const CLIENT_ID_KEY = 'amazon_frontend_client_id';
const FAVORITES_KEY = 'amazon_frontend_favorites';

/**
 * 生成随机客户端ID
 * @returns 随机生成的客户端ID
 */
function generateClientId(): string {
    return `client_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
}

/**
 * 获取或创建客户端ID
 * @returns 客户端ID
 */
export function getClientId(): string {
    if (typeof window === 'undefined') {
        return ''; // 服务端渲染时返回空字符串
    }

    // 尝试从localStorage获取客户端ID
    let clientId = localStorage.getItem(CLIENT_ID_KEY);

    // 如果不存在，则生成新的客户端ID并保存
    if (!clientId) {
        clientId = generateClientId();
        localStorage.setItem(CLIENT_ID_KEY, clientId);
    }

    return clientId;
}

/**
 * 获取本地存储的收藏列表
 * @returns 收藏的商品ID数组
 */
export function getLocalFavorites(): string[] {
    if (typeof window === 'undefined') {
        return []; // 服务端渲染时返回空数组
    }

    try {
        const favorites = localStorage.getItem(FAVORITES_KEY);

        return favorites ? JSON.parse(favorites) : [];
    } catch {
        return [];
    }
}

/**
 * 添加商品到本地收藏列表
 * @param productId 商品ID
 */
export function addLocalFavorite(productId: string): void {
    if (typeof window === 'undefined') {
        return; // 服务端渲染时直接返回
    }

    try {
        const favorites = getLocalFavorites();

        // 如果商品ID不在列表中，则添加
        if (!favorites.includes(productId)) {
            favorites.push(productId);
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        }
    } catch {
        // 错误处理
        return;
    }
}

/**
 * 从本地收藏列表中移除商品
 * @param productId 商品ID
 */
export function removeLocalFavorite(productId: string): void {
    if (typeof window === 'undefined') {
        return; // 服务端渲染时直接返回
    }

    try {
        let favorites = getLocalFavorites();

        // 过滤掉要移除的商品ID
        favorites = favorites.filter(id => id !== productId);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
        return;
    }
}

/**
 * 检查商品是否在本地收藏列表中
 * @param productId 商品ID
 * @returns 是否已收藏
 */
export function isLocalFavorite(productId: string): boolean {
    if (typeof window === 'undefined') {
        return false; // 服务端渲染时返回false
    }

    const favorites = getLocalFavorites();

    return favorites.includes(productId);
}

/**
 * 清空本地收藏列表
 */
export function clearLocalFavorites(): void {
    if (typeof window === 'undefined') {
        return; // 服务端渲染时直接返回
    }

    localStorage.removeItem(FAVORITES_KEY);
}

/**
 * 同步本地收藏和远程收藏
 * @param remoteIds 远程收藏的商品ID数组
 */
export function syncLocalFavorites(remoteIds: string[]): void {
    if (typeof window === 'undefined') {
        return; // 服务端渲染时直接返回
    }

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(remoteIds));
} 
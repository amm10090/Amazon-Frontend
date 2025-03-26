import { useEffect, useState, useCallback } from 'react';

/**
 * 用于生成缓存键的类型
 */
type CacheKeyParams = Record<string, string | number | boolean | undefined | null>;

/**
 * 本地缓存项接口
 */
interface CacheItem<T> {
    data: T;
    timestamp: number;
    expiry: number;
}

/**
 * 缓存命中结果接口
 */
export interface CacheResult<T> {
    hit: boolean;
    data?: T;
    age?: number;
}

/**
 * 基于参数生成缓存键
 */
export function generateCacheKey(prefix: string, params: CacheKeyParams): string {
    // 过滤掉undefined和null值
    const filteredParams = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .map(([key, value]) => `${key}:${value}`)
        .join('|');

    return `${prefix}|${filteredParams}`;
}

/**
 * 从本地存储中获取缓存数据
 */
export function getFromCache<T>(key: string, maxAge = 300000): CacheResult<T> {
    if (typeof window === 'undefined') {
        return { hit: false };
    }

    try {
        const cacheJson = localStorage.getItem(`cache_${key}`);

        if (!cacheJson) {
            return { hit: false };
        }

        const cache = JSON.parse(cacheJson) as CacheItem<T>;
        const now = Date.now();
        const age = now - cache.timestamp;

        // 检查缓存是否有效
        if (age < maxAge) {
            return {
                hit: true,
                data: cache.data,
                age
            };
        }

        // 缓存过期，清除它
        localStorage.removeItem(`cache_${key}`);

        return { hit: false };
    } catch {
        return { hit: false };
    }
}

/**
 * 将数据写入本地存储缓存
 */
export function writeToCache<T>(key: string, data: T, maxAge = 300000): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        const cache: CacheItem<T> = {
            data,
            timestamp: Date.now(),
            expiry: Date.now() + maxAge
        };

        localStorage.setItem(`cache_${key}`, JSON.stringify(cache));
    } catch {
        // 缓存写入失败时，尝试清理部分缓存
        cleanupCache();
    }
}

/**
 * 清理旧缓存以释放空间
 */
export function cleanupCache(keepNewest = 50): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        const cacheKeys = [];
        const now = Date.now();

        // 收集所有缓存项
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);

            if (key && key.startsWith('cache_')) {
                try {
                    const value = localStorage.getItem(key);

                    if (value) {
                        const item = JSON.parse(value) as CacheItem<unknown>;

                        cacheKeys.push({
                            key,
                            timestamp: item.timestamp,
                            expiry: item.expiry
                        });
                    }
                } catch {
                    // 移除无效的缓存项
                    localStorage.removeItem(key);
                }
            }
        }

        // 先删除过期的缓存
        const expiredKeys = cacheKeys.filter(item => item.expiry < now);

        for (const { key } of expiredKeys) {
            localStorage.removeItem(key);
        }

        // 如果还需要更多空间，根据时间戳排序，保留最新的项
        if (cacheKeys.length - expiredKeys.length > keepNewest) {
            const validKeys = cacheKeys
                .filter(item => item.expiry >= now)
                .sort((a, b) => b.timestamp - a.timestamp);

            // 删除旧的缓存项
            for (let i = keepNewest; i < validKeys.length; i++) {
                localStorage.removeItem(validKeys[i].key);
            }
        }
    } catch {
        // 如果清理失败，尝试清除所有缓存
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);

                if (key && key.startsWith('cache_')) {
                    localStorage.removeItem(key);
                }
            }
        } catch {
            // 忽略错误
        }
    }
}

/**
 * 使用缓存的请求状态钩子
 */
export function useCachedFetch<T>(
    url: string | null,
    params: CacheKeyParams,
    options?: {
        maxAge?: number;
        prefixKey?: string;
        requireUrl?: boolean;
    }
): {
    data: T | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    fromCache: boolean;
} {
    const { maxAge = 300000, prefixKey = 'fetch', requireUrl = true } = options || {};

    const [data, setData] = useState<T | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [fromCache, setFromCache] = useState<boolean>(false);

    // 生成缓存键
    const cacheKey = url ? generateCacheKey(`${prefixKey}_${url}`, params) : null;

    const fetchData = useCallback(async () => {
        if (!url && requireUrl) {
            return;
        }

        setIsLoading(true);
        setIsError(false);
        setError(null);
        setFromCache(false);

        try {
            // 尝试从缓存获取
            if (cacheKey) {
                const cached = getFromCache<T>(cacheKey, maxAge);

                if (cached.hit && cached.data) {
                    setData(cached.data);
                    setIsLoading(false);
                    setFromCache(true);

                    return;
                }
            }

            // 构建查询参数
            const queryParams = new URLSearchParams();

            // 添加所有查询参数
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, String(value));
                }
            });

            // 正确处理URL的查询字符串部分
            const queryString = queryParams.toString();
            const urlWithQuery = url
                ? url + (queryString ? (url.includes('?') ? '&' : '?') + queryString : '')
                : '';

            // 如果没有URL则退出
            if (!url) {
                throw new Error('URL is required for fetch');
            }

            // 发起网络请求
            const response = await fetch(urlWithQuery);

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const result = await response.json();
            const responseData = result.data as T;

            // 更新状态
            setData(responseData);

            // 缓存结果
            if (cacheKey) {
                writeToCache(cacheKey, responseData, maxAge);
            }
        } catch (err) {
            setIsError(true);
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setIsLoading(false);
        }
    }, [url, cacheKey, maxAge, params, requireUrl]);

    // 首次加载和依赖项变化时获取数据
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // 提供重新获取数据的方法
    const refetch = async () => {
        await fetchData();
    };

    return { data, isLoading, isError, error, refetch, fromCache };
}

/**
 * 初始化缓存系统，清理过期缓存
 * 应在应用启动时调用
 */
export function initCacheSystem(): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        // 使用 requestIdleCallback 在浏览器空闲时清理缓存
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(() => {
                cleanupCache();
            });
        } else {
            // 退回到 setTimeout
            setTimeout(() => {
                cleanupCache();
            }, 2000);
        }
    } catch {
        // 忽略错误
    }
} 
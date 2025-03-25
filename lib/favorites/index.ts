/**
 * 收藏功能模块入口文件
 * 导出所有收藏相关的功能
 */

// 导出上下文和Provider
export {
    default as FavoritesContext,
    FavoritesProvider,
    useFavoritesContext
} from './context';

// 导出自定义hooks
export {
    useFavorites,
    useProductFavorite,
    useFavoritesList,
    useMultipleProductsFavoriteStatus,
    useBatchFavorites
} from './hooks';

// 导出API
export { favoritesApi } from './api';

// 导出本地存储工具
export {
    getClientId,
    getLocalFavorites,
    addLocalFavorite,
    removeLocalFavorite,
    isLocalFavorite,
    clearLocalFavorites,
    syncLocalFavorites
} from './storage'; 
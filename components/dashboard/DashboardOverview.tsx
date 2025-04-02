'use client';

import { useEffect, useState } from 'react';

import { useHealthStatus, useUserStats, useFavoriteStats } from '@/lib/hooks';
import { formatDate } from '@/lib/utils';

interface StatsCardProps {
    title: string;
    value: number;
    change: number;
    icon: string;
    lastUpdate?: string;
    className?: string;
    loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    change,
    icon,
    lastUpdate,
    className,
    loading = false
}) => {
    if (loading) {
        return (
            <div className={`bg-white rounded-lg shadow-sm p-4 md:p-6 ${className || ''}`}>
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow ${className || ''}`}>
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
                    <p className="text-xl md:text-2xl font-semibold mt-2 truncate">{value.toLocaleString()}</p>
                </div>
                <div className="flex-shrink-0 ml-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                    {icon}
                </div>
            </div>
            <div className="mt-4 flex items-center">
                <span className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'} font-medium flex items-center`}>
                    <span className={`inline-block ${change >= 0 ? 'rotate-0' : 'rotate-180'} mr-1`}>➚</span>
                    {Math.abs(change)}%
                </span>
                <span className="text-sm text-gray-500 ml-2">vs Last Month</span>
            </div>
            {lastUpdate && (
                <div className="mt-2 text-xs text-gray-400 truncate">
                    Last Update: {formatDate(new Date(lastUpdate))}
                </div>
            )}
        </div>
    );
};

const DashboardOverview: React.FC = () => {
    const { data: healthData, isLoading: isLoadingHealth } = useHealthStatus();
    const { data: userData, isLoading: isLoadingUsers } = useUserStats();
    const { data: favoritesData, isLoading: isLoadingFavorites } = useFavoriteStats();

    const [stats, setStats] = useState({
        total_products: 0,
        discount_products: 0,
        coupon_products: 0,
        prime_products: 0,
        total_users: 0,
        total_favorites: 0,
        last_update: '',
        changes: {
            total: 0,
            discount: 0,
            coupon: 0,
            prime: 0,
            users: 0,
            favorites: 0
        }
    });

    useEffect(() => {
        if (healthData) {
            // 处理两种可能的数据结构
            const dbData = healthData.database || healthData;

            if (dbData.total_products !== undefined) {
                setStats(prev => ({
                    ...prev,
                    total_products: dbData.total_products,
                    discount_products: dbData.discount_products,
                    coupon_products: dbData.coupon_products,
                    prime_products: dbData.prime_products,
                    last_update: dbData.last_update,
                    // 更新商品相关的变化率，这里仅为示例，实际应从API获取
                    changes: {
                        ...prev.changes,
                        total: 5.2, // 示例值
                        discount: 3.8, // 示例值
                        coupon: 2.1, // 示例值
                        prime: 4.7 // 示例值
                    }
                }));
            }
        }
    }, [healthData]);

    useEffect(() => {
        if (userData && userData.total_users !== undefined) {
            setStats(prev => ({
                ...prev,
                total_users: userData.total_users,
                changes: {
                    ...prev.changes,
                    users: ((userData.new_users_last_month / userData.total_users) * 100) || 0
                }
            }));
        }
    }, [userData]);

    useEffect(() => {
        if (favoritesData && favoritesData.total_favorites !== undefined) {
            setStats(prev => ({
                ...prev,
                total_favorites: favoritesData.total_favorites,
                changes: {
                    ...prev.changes,
                    favorites: ((favoritesData.last_month_favorites / favoritesData.total_favorites) * 100) || 0
                }
            }));
        }
    }, [favoritesData]);

    // 配置卡片内容
    const productCards = [
        {
            title: "Total Products",
            value: stats.total_products,
            change: stats.changes.total,
            icon: "📦",
            loading: isLoadingHealth
        },
        {
            title: "Discount Products",
            value: stats.discount_products,
            change: stats.changes.discount,
            icon: "💰",
            loading: isLoadingHealth
        },
        {
            title: "Coupon Products",
            value: stats.coupon_products,
            change: stats.changes.coupon,
            icon: "🎫",
            loading: isLoadingHealth
        },
        {
            title: "Prime Products",
            value: stats.prime_products,
            change: stats.changes.prime,
            icon: "⭐",
            loading: isLoadingHealth
        }
    ];

    return (
        <div className="space-y-6 max-w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                <div className="text-sm text-gray-500 mt-2 sm:mt-0">
                    Last Updated: {stats.last_update ? formatDate(new Date(stats.last_update)) : 'Loading...'}
                </div>
            </div>

            {/* 商品统计卡片 */}
            <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Product Statistics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
                    {productCards.map((card) => (
                        <StatsCard
                            key={`product-card-${card.title.toLowerCase().replace(/\s+/g, '-')}`}
                            title={card.title}
                            value={card.value}
                            change={card.change}
                            icon={card.icon}
                            lastUpdate={stats.last_update}
                            loading={card.loading}
                        />
                    ))}
                </div>
            </div>

            {/* 用户与收藏统计 */}
            <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Users & Favorites</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                    <StatsCard
                        title="Total Users"
                        value={stats.total_users}
                        change={stats.changes.users}
                        icon="👥"
                        lastUpdate={userData?.last_update || stats.last_update}
                        loading={isLoadingUsers}
                    />
                    <StatsCard
                        title="Total Favorites"
                        value={stats.total_favorites}
                        change={stats.changes.favorites}
                        icon="❤️"
                        lastUpdate={favoritesData?.last_update || stats.last_update}
                        loading={isLoadingFavorites}
                    />
                </div>
            </div>

            {/* 数据摘要区域 */}
            <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Data Summary</h2>
                <div className="prose max-w-none">
                    <p>The system currently has <strong>{stats.total_products.toLocaleString()}</strong> products, including <strong>{stats.discount_products.toLocaleString()}</strong> discount products, <strong>{stats.coupon_products.toLocaleString()}</strong> coupon products, and <strong>{stats.prime_products.toLocaleString()}</strong> prime products.</p>
                    <p>There are <strong>{stats.total_users}</strong> users in the system with a total of <strong>{stats.total_favorites}</strong> favorited items.</p>
                    <p className="text-sm text-gray-500 mt-4">* All data is based on the last update time and statistics may have a delay.</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview; 
"use client";

/**
 * 收藏页面
 * 显示用户收藏的所有商品
 */

import Link from 'next/link';
import React, { useEffect } from 'react';

import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import ProductCard from '@/components/common/ProductCard';
import { useEnrichedFavorites } from '@/lib/favorites/hooks';
import { adaptProducts } from '@/lib/utils';

// 导入组件
// 注意: 根据你的项目结构，这些路径可能需要调整

/**
 * 收藏页面组件
 */
export default function FavoritesPage() {
    // 使用自定义Hook获取带完整信息的收藏列表
    const { favorites, isLoading, error, refreshFavorites } = useEnrichedFavorites();

    // 调试输出
    useEffect(() => {
    }, [favorites]);

    // 适配商品数据为前端组件格式
    const adaptedProducts = adaptProducts(favorites || []);

    // 调试输出
    useEffect(() => {
    }, [adaptedProducts]);

    // 页面标题
    const pageTitle = '我的收藏';

    // 渲染商品卡片
    const renderProductCards = () => {
        if (!Array.isArray(adaptedProducts) || adaptedProducts.length === 0) {
            return (
                <EmptyState
                    title="暂无收藏"
                    description="您还没有收藏任何商品，去浏览一些商品并添加到收藏吧！"
                    actionText="浏览商品"
                    actionLink="/"
                />
            );
        }

        return (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {adaptedProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        showFavoriteButton
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-2xl font-bold">{pageTitle}</h1>
                <button
                    onClick={() => refreshFavorites()}
                    className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                >
                    刷新列表
                </button>
            </div>

            {/* 收藏数量统计 */}
            {!isLoading && !error && Array.isArray(adaptedProducts) && (
                <p className="mb-6 text-gray-600">
                    共收藏了 <span className="font-medium">{adaptedProducts.length}</span> 件商品
                </p>
            )}

            {/* 内容区域 */}
            {isLoading ? (
                <LoadingState message="加载收藏列表中..." />
            ) : error ? (
                <ErrorState
                    message="加载收藏列表失败"
                    error={error as Error}
                    retry={refreshFavorites}
                />
            ) : (
                renderProductCards()
            )}

            {/* 返回首页 */}
            <div className="mt-8 text-center">
                <Link
                    href="/"
                    className="text-blue-500 hover:underline"
                >
                    返回首页
                </Link>
            </div>
        </div>
    );
} 
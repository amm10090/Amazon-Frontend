import type { Metadata } from 'next';
import type React from 'react';

// 定义页面元数据
export const metadata: Metadata = {
    title: '我的收藏 - Amazon Frontend',
    description: '我的收藏商品列表',
};

// 收藏页面的布局组件
export default function FavoritesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
} 
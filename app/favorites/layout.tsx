import type { Metadata } from 'next';
import type React from 'react';

// 定义页面元数据
export const metadata: Metadata = {
    title: 'My Favorites - Amazon Frontend',
    description: 'My Favorites Product List',
};

// 收藏页面的布局组件
export default function FavoritesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
} 
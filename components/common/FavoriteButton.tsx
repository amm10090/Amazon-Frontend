/**
 * 收藏按钮组件
 * 用于在商品卡片或详情页中显示收藏按钮
 */

import { Heart } from 'lucide-react';
import React, { memo } from 'react';

import { useProductFavorite } from '@/lib/favorites';

interface FavoriteButtonProps {
    productId: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    withText?: boolean;
    withAnimation?: boolean;
}

/**
 * 收藏按钮组件
 * @param productId 商品ID
 * @param className 自定义类名
 * @param size 按钮大小，可选值：sm, md, lg
 * @param withText 是否显示文本
 * @param withAnimation 是否启用动画效果
 */
const FavoriteButton: React.FC<FavoriteButtonProps> = ({
    productId,
    className = '',
    size = 'md',
    withText = false,
    withAnimation = true,
}) => {
    // 使用自定义Hook获取商品收藏状态和切换方法
    const { isFavorite, toggleFavorite } = useProductFavorite(productId);

    // 根据size确定图标尺寸
    const iconSize = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    }[size];

    // 根据size确定按钮样式
    const buttonSize = {
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-2.5',
    }[size];

    // 动画类名
    const animationClass = withAnimation
        ? 'transition-transform duration-200 hover:scale-110 active:scale-95'
        : '';

    // 点击处理函数
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite();
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`flex items-center justify-center rounded-full 
                ${buttonSize} 
                ${animationClass}
                ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}
                ${className}`}
            aria-label={isFavorite ? '取消收藏' : '添加收藏'}
            title={isFavorite ? '取消收藏' : '添加收藏'}
        >
            <Heart
                className={iconSize}
                fill={isFavorite ? "currentColor" : "none"}
            />

            {withText && (
                <span className={`ml-1 text-sm ${isFavorite ? 'font-medium' : ''}`}>
                    {isFavorite ? '已收藏' : '收藏'}
                </span>
            )}
        </button>
    );
};

export default memo(FavoriteButton); 
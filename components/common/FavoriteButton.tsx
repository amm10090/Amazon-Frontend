/**
 * 收藏按钮组件
 * 用于在商品卡片或详情页中显示收藏按钮
 */

import { Heart } from 'lucide-react';
import React, { memo, useState } from 'react';

import { useProductFavorite } from '@/lib/favorites';

import FavoriteToast from './FavoriteToast';

interface FavoriteButtonProps {
    productId: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    withText?: boolean;
    withAnimation?: boolean;
    withToast?: boolean;
    productTitle?: string;
}

/**
 * 收藏按钮组件
 * @param productId 商品ID
 * @param className 自定义类名
 * @param size 按钮大小，可选值：sm, md, lg
 * @param withText 是否显示文本
 * @param withAnimation 是否启用动画效果
 * @param withToast 是否显示操作提示，默认为true
 * @param productTitle 产品标题，用于在提示中显示
 */
const FavoriteButton: React.FC<FavoriteButtonProps> = ({
    productId,
    className = '',
    size = 'md',
    withText = false,
    withAnimation = true,
    withToast = true,
    productTitle = '',
}) => {
    // 使用自定义Hook获取商品收藏状态和切换方法
    const { isFavorite, toggleFavorite, isUpdating } = useProductFavorite(productId);
    const [animateHeartbeat, setAnimateHeartbeat] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [lastAction, setLastAction] = useState<'add' | 'remove'>('add');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

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
        ? 'transition-all duration-300 ease-in-out hover:scale-110 active:scale-95'
        : '';

    // 心跳动画类名
    const heartbeatClass = animateHeartbeat
        ? 'animate-heartbeat'
        : '';

    // 点击处理函数
    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // 避免重复点击
        if (isUpdating) return;

        // 设置操作类型
        const actionType = isFavorite ? 'remove' : 'add';

        setLastAction(actionType);

        // 如果正在添加到收藏，触发心跳动画
        if (!isFavorite) {
            setAnimateHeartbeat(true);
            setTimeout(() => setAnimateHeartbeat(false), 1000);
        }

        // 执行收藏操作
        const result = await toggleFavorite();

        // 显示提示
        if (withToast) {
            setToastType(result.success ? 'success' : 'error');
            setToastMessage(result.message);
            setShowToast(true);
        }
    };

    // 隐藏提示的回调函数
    const handleHideToast = () => {
        setShowToast(false);
    };

    return (
        <>
            <button
                type="button"
                onClick={handleClick}
                disabled={isUpdating}
                className={`flex items-center justify-center rounded-full 
                    ${buttonSize} 
                    ${animationClass}
                    ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}
                    ${isUpdating ? 'opacity-70 cursor-wait' : ''}
                    ${className}`}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
                <Heart
                    className={`${iconSize} ${heartbeatClass} transition-transform duration-300`}
                    fill={isFavorite ? "currentColor" : "none"}
                />

                {withText && (
                    <span className={`ml-1 text-sm transition-all duration-300 ${isFavorite ? 'font-medium' : ''}`}>
                        {isUpdating ? 'Processing...' : (isFavorite ? 'Favorited' : 'Favorite')}
                    </span>
                )}
            </button>

            {withToast && (
                <FavoriteToast
                    action={lastAction}
                    show={showToast}
                    onHide={handleHideToast}
                    type={toastType}
                    message={toastMessage}
                    productTitle={productTitle}
                />
            )}
        </>
    );
};

export default memo(FavoriteButton); 
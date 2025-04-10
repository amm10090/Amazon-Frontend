/**
 * 收藏操作结果提示组件
 * 用于在收藏/取消收藏操作后显示一个短暂的提示信息
 */

import { AlertTriangle, Heart } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface FavoriteToastProps {
    action: 'add' | 'remove';
    show: boolean;
    onHide: () => void;
    duration?: number;
    className?: string;
    type?: 'success' | 'error';
    message?: string;
    productTitle?: string;
}

/**
 * 收藏操作结果提示组件
 * @param action 操作类型：'add'表示添加收藏，'remove'表示移除收藏
 * @param show 是否显示提示
 * @param onHide 提示隐藏后的回调函数
 * @param duration 提示显示时长（毫秒），默认为3000ms
 * @param className 自定义类名
 * @param type 提示类型：'success'表示成功，'error'表示错误。默认为'success'
 * @param message 自定义提示消息，如果不提供则使用默认消息
 * @param productTitle 产品标题，用于在提示中显示
 */
const FavoriteToast: React.FC<FavoriteToastProps> = ({
    action,
    show,
    onHide,
    duration = 3000,
    className = '',
    type = 'success',
    message,
    productTitle = '',
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                onHide();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [show, duration, onHide]);

    if (!show && !isVisible) return null;

    const isError = type === 'error';
    const isAdding = action === 'add';

    // 创建包含产品名称的默认消息
    const getDefaultMessage = () => {
        if (isError) {
            return 'Operation failed, please try again later';
        }

        const productName = productTitle
            ? `"${productTitle.length > 30 ? productTitle.substring(0, 30) + '...' : productTitle}"`
            : 'Product';

        return isAdding
            ? `${productName} added to favorites`
            : `${productName} removed from favorites`;
    };

    // 使用自定义消息或默认消息
    const displayMessage = message || getDefaultMessage();

    // 样式设置 - 增强视觉效果
    const bgColor = isError
        ? 'bg-red-50 dark:bg-red-900/50'
        : (isAdding ? 'bg-red-50 dark:bg-red-900/30' : 'bg-gray-50 dark:bg-gray-700/50');

    const textColor = isError
        ? 'text-red-600 dark:text-red-400'
        : (isAdding ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300');

    const borderColor = isError
        ? 'border-red-300 dark:border-red-700'
        : (isAdding ? 'border-red-200 dark:border-red-700/50' : 'border-gray-200 dark:border-gray-600');

    return (
        <div
            className={`fixed bottom-6 right-6 z-50
                px-5 py-3 rounded-lg shadow-lg border-2
                flex items-center space-x-3
                animate-favorite-success
                min-w-[280px] max-w-[400px]
                ${bgColor} ${textColor} ${borderColor} ${className}`}
            role="alert"
        >
            {isError ? (
                <AlertTriangle className="w-6 h-6 flex-shrink-0 text-red-500" />
            ) : (
                <Heart
                    className={`w-6 h-6 flex-shrink-0 ${isAdding ? 'text-red-500 fill-current' : 'text-gray-500'}`}
                />
            )}
            <span className="text-base font-medium flex-grow">{displayMessage}</span>
        </div>
    );
};

export default FavoriteToast; 
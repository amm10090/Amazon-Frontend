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
}

/**
 * 收藏操作结果提示组件
 * @param action 操作类型：'add'表示添加收藏，'remove'表示移除收藏
 * @param show 是否显示提示
 * @param onHide 提示隐藏后的回调函数
 * @param duration 提示显示时长（毫秒），默认为2000ms
 * @param className 自定义类名
 * @param type 提示类型：'success'表示成功，'error'表示错误。默认为'success'
 * @param message 自定义提示消息，如果不提供则使用默认消息
 */
const FavoriteToast: React.FC<FavoriteToastProps> = ({
    action,
    show,
    onHide,
    duration = 2000,
    className = '',
    type = 'success',
    message,
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

    // 设置默认消息
    const defaultMessage = isError
        ? 'Operation failed, please try again later'
        : (isAdding ? 'Added to favorites' : 'Removed from favorites');

    // 使用自定义消息或默认消息
    const displayMessage = message || defaultMessage;

    // 样式设置
    const bgColor = isError
        ? 'bg-red-50 dark:bg-red-900/30'
        : (isAdding ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800/30');

    const textColor = isError
        ? 'text-red-600 dark:text-red-400'
        : (isAdding ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300');

    const borderColor = isError
        ? 'border-red-300 dark:border-red-800/50'
        : (isAdding ? 'border-red-200 dark:border-red-800/30' : 'border-gray-200 dark:border-gray-700');

    return (
        <div
            className={`fixed bottom-4 right-4 z-50
                px-4 py-2 rounded-full shadow-md border
                flex items-center space-x-2
                animate-favorite-success
                ${bgColor} ${textColor} ${borderColor} ${className}`}
            role="alert"
        >
            {isError ? (
                <AlertTriangle className="w-4 h-4 text-red-500" />
            ) : (
                <Heart
                    className={`w-4 h-4 ${isAdding ? 'text-red-500 fill-current' : 'text-gray-500'}`}
                />
            )}
            <span className="text-sm font-medium">{displayMessage}</span>
        </div>
    );
};

export default FavoriteToast; 
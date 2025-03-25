import React from 'react';

interface LoadingStateProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
}

/**
 * 加载状态组件
 * 显示一个加载动画和可选的加载消息
 */
const LoadingState: React.FC<LoadingStateProps> = ({
    message = 'Loading...',
    size = 'md',
}) => {
    // 根据尺寸确定样式
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-2',
        lg: 'h-12 w-12 border-3',
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            {/* 加载动画 */}
            <div className={`mb-4 animate-spin rounded-full border-t-transparent border-blue-500 ${sizeClasses[size]}`} />

            {/* 加载消息 */}
            {message && <p className="text-gray-600">{message}</p>}
        </div>
    );
};

export default LoadingState; 
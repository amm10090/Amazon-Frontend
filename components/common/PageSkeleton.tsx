import React from 'react';

import ProductCardSkeleton from './ProductCardSkeleton';

interface PageSkeletonProps {
    title?: boolean;
    action?: boolean;
    productCount?: number;
}

/**
 * 页面骨架屏组件
 * 用于显示整个页面的加载状态
 */
const PageSkeleton: React.FC<PageSkeletonProps> = ({
    title = true,
    action = true,
    productCount = 8,
}) => {
    return (
        <div className="animate-fade-in">
            {/* 标题和操作按钮区域 */}
            {title && (
                <div className="mb-8 flex items-center justify-between">
                    <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    {action && (
                        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    )}
                </div>
            )}

            {/* 统计信息区域 */}
            <div className="mb-6 h-5 w-60 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />

            {/* 产品卡片网格 */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                <ProductCardSkeleton count={productCount} />
            </div>
        </div>
    );
};

export default PageSkeleton; 
import React, { useMemo } from 'react';

interface ProductCardSkeletonProps {
    count?: number;
}

/**
 * 产品卡片骨架屏组件
 * 用于显示产品卡片的加载状态
 */
const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({
    count = 1,
}) => {
    // 生成一组稳定的唯一ID，只在组件初始渲染时创建一次
    const skeletonIds = useMemo(() =>
        Array.from({ length: count }, (_, i) => `product-skeleton-${i}-${Math.random().toString(36).substr(2, 9)}`),
        [count]);

    return (
        <>
            {skeletonIds.map((id) => (
                <div
                    key={id}
                    className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden h-full animate-pulse"
                >
                    {/* 图片区域骨架 */}
                    <div className="w-full h-48 bg-gray-200 dark:bg-gray-800" />

                    {/* 内容区域骨架 */}
                    <div className="p-4">
                        {/* 商店标识骨架 */}
                        <div className="flex justify-end mb-2">
                            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>

                        {/* 品牌标签骨架 */}
                        <div className="mb-2">
                            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded inline-block" />
                        </div>

                        {/* 标题骨架 */}
                        <div className="h-5 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                        <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-4" />

                        {/* 价格骨架 */}
                        <div className="flex items-center justify-between mt-auto mb-4">
                            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                            <div className="h-5 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>

                        {/* 按钮骨架 */}
                        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-full mt-4" />
                    </div>
                </div>
            ))}
        </>
    );
};

export default ProductCardSkeleton; 
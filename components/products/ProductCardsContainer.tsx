'use client';

import React from 'react';

interface ProductCardsContainerProps {
    children: React.ReactNode;
    gap?: number; // 卡片之间的间距
    wrap?: boolean; // 是否允许换行
}

/**
 * 商品卡片容器组件 - 用于在前端页面中横向显示多个商品卡片
 * 
 * 这个容器使用flex布局，确保商品卡片能够横向排列
 * 
 * @param {ProductCardsContainerProps} props - 组件属性
 * @returns {JSX.Element} 商品卡片容器
 */
const ProductCardsContainer: React.FC<ProductCardsContainerProps> = ({
    children,
    gap = 4, // 默认间距
    wrap = true // 默认允许换行
}) => {
    return (
        <div
            className={`
                flex 
                ${wrap ? 'flex-wrap' : 'flex-nowrap overflow-x-auto'} 
                items-start 
                gap-${gap}
                py-2
                w-full
            `}
            style={{
                // 确保子元素不会因为flex布局而被压缩
                minWidth: 0
            }}
        >
            {children}
        </div>
    );
};

export default ProductCardsContainer; 
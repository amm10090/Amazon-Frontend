'use client';

import NextImage, { type ImageProps } from 'next/image';
import React, { useState } from 'react';

// 定义 SafeImage 组件接收的 Props，扩展自 next/image 的 ImageProps
interface SafeImageProps extends ImageProps {
    // 可以添加自定义的 props，比如占位符样式或组件
    placeholderClassName?: string;
}

/**
 * SafeImage 组件
 * @description 一个封装了 next/image 的客户端组件，用于处理图片加载错误 (onError)。
 * 当图片加载失败时，会渲染一个占位符。
 * @param {SafeImageProps} props - 组件属性，继承自 next/image 的 ImageProps。
 */
export function SafeImage({ placeholderClassName = 'bg-gray-200 animate-pulse', ...props }: SafeImageProps) {
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        setHasError(true);
    };

    if (hasError) {
        // 渲染占位符
        // 尝试保留原始 Image 的布局相关 className
        const layoutClasses = props.className?.split(' ').filter(cls =>
            cls.includes('w-') ||
            cls.includes('h-') ||
            cls.includes('aspect-') ||
            cls === 'absolute' ||
            cls === 'relative' ||
            cls === 'fixed' ||
            cls === 'fill'
        ).join(' ') || '';

        // 使用传递的 props.width 和 props.height（如果提供了）来设置样式
        const style: React.CSSProperties = {};

        if (props.width) style.width = `${props.width}px`;
        if (props.height) style.height = `${props.height}px`;
        // 如果是 fill，占位符也需要绝对定位
        if (props.fill) {
            style.position = 'absolute';
            style.top = '0';
            style.left = '0';
            style.bottom = '0';
            style.right = '0';
            style.width = '100%';
            style.height = '100%';
        }

        return (
            <div
                className={`${placeholderClassName} ${layoutClasses} ${props.className?.replace(layoutClasses, '').trim()}`}
                style={style}
                role="img"
                aria-label={typeof props.alt === 'string' ? `加载失败: ${props.alt}` : '图片加载失败'}
            />
        );
    }

    // 正常渲染 NextImage
    return <NextImage {...props} onError={handleError} />;
} 
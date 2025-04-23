'use client';

import { motion } from 'framer-motion';
import parse, { Element, type HTMLReactParserOptions } from 'html-react-parser';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import FavoriteButton from '@/components/common/FavoriteButton';
import { StoreIdentifier } from '@/lib/store';
import { formatPrice, calculateDiscount } from '@/lib/utils';

// 产品元素的属性
interface ProductElementProps {
    id: string;
    title: string;
    price: string;
    image: string;
    asin: string;
    style?: string; // 添加样式类型
}

// 基础产品组件 - 简单行布局
const SimpleProductElement = ({ title, price, image, asin }: ProductElementProps) => {
    return (
        <div className="flex items-center my-4 p-3 border rounded-md bg-white">
            {image && (
                <div className="relative w-16 h-16 mr-3 border rounded-md overflow-hidden flex-shrink-0">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 10vw, 64px"
                        className="object-cover"
                        onError={(e) => { e.currentTarget.src = '/placeholder-product.jpg'; }}
                    />
                </div>
            )}
            <div className="flex-grow min-w-0">
                <div className="font-medium text-gray-900 truncate">{title}</div>
                <div className="flex gap-2 text-sm text-gray-500">
                    <span>{formatPrice(Number(price))}</span>
                    {asin && <span>ASIN: {asin}</span>}
                </div>
            </div>
            <div className="text-xs px-2 py-1 bg-gray-100 rounded-full">产品</div>
        </div>
    );
};

// 卡片样式的产品组件 - 模仿 FeaturedDeals
const CardProductElement = ({ id, title, price, image, }: ProductElementProps) => {
    // 计算折扣
    const originalPrice = Number(price) * 1.2; // 假设原价比当前价格高20%
    const savingsPercentage = calculateDiscount(originalPrice, Number(price));

    // 产品链接
    const productUrl = `/product/${id}`;

    return (
        <div className="my-4 w-full max-w-[280px] mx-auto">
            {/* 收藏按钮 */}

            <div
                className="absolute top-3 right-3 z-20"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                    }
                }}
                role="button"
                tabIndex={0}
            >
                <FavoriteButton
                    productId={id}
                    size="md"
                    withAnimation={true}
                    className="bg-white/80 shadow-sm hover:bg-white"
                />
            </div>

            <Link href={productUrl}>
                <motion.div
                    className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col"
                    whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.07), 0 10px 10px -5px rgba(0, 0, 0, 0.03)' }}
                    transition={{ duration: 0.3 }}
                >
                    {/* 产品图片 */}
                    <div className="relative w-full aspect-[1/1] bg-white pt-0.5">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="h-full w-full relative"
                        >
                            {image ? (
                                <Image
                                    src={image}
                                    alt={title}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                                    className="object-cover p-2"
                                    priority={false}
                                    loading="lazy"
                                    unoptimized={image.startsWith('data:')}
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-400 bg-white">
                                    无图片
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* 产品信息 */}
                    <div className="p-3 flex-grow flex flex-col">
                        {/* 品牌信息和商店标识 */}
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded inline-block">
                                品牌
                            </span>
                            <StoreIdentifier
                                url={productUrl}
                                align="right"
                            />
                        </div>

                        <h3 className="text-base font-medium line-clamp-2 mb-2 flex-grow text-primary-dark">
                            {title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                        </h3>

                        {/* 价格和折扣 */}
                        <div className="flex items-center justify-between mt-1 mb-2">
                            <div className="flex items-baseline min-w-0 overflow-hidden mr-2">
                                <span className="text-lg font-semibold text-primary whitespace-nowrap">
                                    {formatPrice(Number(price))}
                                </span>
                                {originalPrice > Number(price) && (
                                    <span className="text-xs text-secondary line-through whitespace-nowrap ml-1.5">
                                        {formatPrice(originalPrice)}
                                    </span>
                                )}
                            </div>
                            {savingsPercentage > 0 && (
                                <span className="text-xs font-bold text-white px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0 bg-primary-badge">
                                    -{Math.round(savingsPercentage)}%
                                </span>
                            )}
                        </div>
                    </div>

                    {/* 查看详情按钮 */}
                    <div className="px-3 pb-3">
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full py-2 bg-primary-button hover:bg-primary-button-hover text-white text-center rounded-full font-medium shadow-sm transition-colors"
                        >
                            查看详情
                        </motion.div>
                    </div>
                </motion.div>
            </Link>
        </div>
    );
};

// 水平列表风格产品组件
const HorizontalProductElement = ({ id, title, price, image, asin }: ProductElementProps) => {
    return (
        <motion.div
            className="flex items-center my-4 p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
        >
            {/* 产品图片 */}
            <div className="relative w-24 h-24 mr-4 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                    src={image || '/placeholder-product.jpg'}
                    alt={title}
                    fill
                    sizes="96px"
                    className="object-cover"
                    onError={(e) => { e.currentTarget.src = '/placeholder-product.jpg'; }}
                />
            </div>

            {/* 产品信息 */}
            <div className="flex-grow min-w-0">
                <div className="flex items-center">
                    <h3 className="font-medium text-lg text-gray-900 truncate mr-2">{title}</h3>
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">ASIN: {asin}</span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                    <div className="text-primary-button font-bold text-xl">{formatPrice(Number(price))}</div>
                    <Link href={`/product/${id}`}>
                        <button className="px-4 py-1.5 bg-primary-button hover:bg-primary-button-hover text-white rounded-full text-sm transition-colors">
                            查看详情
                        </button>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

// 迷你风格的产品组件
const MiniProductElement = ({ id, title, price, image, }: ProductElementProps) => {
    return (
        <Link href={`/product/${id}`} className="inline-block">
            <motion.div
                className="inline-flex items-center my-2 p-2 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
            >
                <div className="relative w-10 h-10 mr-2 rounded overflow-hidden flex-shrink-0">
                    <Image
                        src={image || '/placeholder-product.jpg'}
                        alt={title}
                        fill
                        sizes="40px"
                        className="object-cover"
                        onError={(e) => { e.currentTarget.src = '/placeholder-product.jpg'; }}
                    />
                </div>
                <div className="flex-grow min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{title}</div>
                    <div className="text-xs text-primary">{formatPrice(Number(price))}</div>
                </div>
            </motion.div>
        </Link>
    );
};

// 通用产品组件 - 根据样式选择不同的展示方式
const ProductElement = (props: ProductElementProps) => {
    const { style } = props;

    switch (style) {
        case 'card':
            return <CardProductElement {...props} />;
        case 'horizontal':
            return <HorizontalProductElement {...props} />;
        case 'mini':
            return <MiniProductElement {...props} />;
        default:
            return <SimpleProductElement {...props} />;
    }
};

// 内容渲染器的props接口
interface ContentRendererProps {
    content: string;
    className?: string;
}

// 内容渲染器组件
const ContentRenderer = ({ content, className = '' }: ContentRendererProps) => {
    // 添加客户端检测以避免SSR问题
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 解析选项
    const parseOptions: HTMLReactParserOptions = {
        replace: (domNode) => {
            // 只处理Element类型的节点
            if (!(domNode instanceof Element)) {
                return;
            }

            // 检测产品节点
            if (domNode.attribs && domNode.attribs['data-node-type'] === 'product') {
                // 打印调试信息，帮助排除问题

                const productStyle = domNode.attribs['data-style'] || 'simple';

                const productProps: ProductElementProps = {
                    id: domNode.attribs['data-product-id'] || '',
                    title: domNode.attribs['data-title'] || '未命名产品',
                    price: domNode.attribs['data-price'] || '0',
                    image: domNode.attribs['data-image'] || '/placeholder-product.jpg',
                    asin: domNode.attribs['data-asin'] || '',
                    style: productStyle, // 明确赋值样式
                };

                return <ProductElement {...productProps} />;
            }

            // 改进图片处理
            if (domNode.name === 'img') {
                const { src, alt, width, height, ...rest } = domNode.attribs;
                // 替换为Next.js的Image组件，但只对相对路径或本站域名使用
                const isLocalImage = src.startsWith('/') || src.startsWith(process.env.NEXT_PUBLIC_API_BASE_URL || '');

                if (isLocalImage) {
                    return (
                        <div className="relative my-4" style={{
                            width: width ? `${width}px` : '100%',
                            height: height ? `${height}px` : 'auto',
                            minHeight: (!width && !height) ? '300px' : undefined
                        }}>
                            <Image
                                src={src}
                                alt={alt || ''}
                                fill={!width || !height}
                                width={width ? parseInt(width) : undefined}
                                height={height ? parseInt(height) : undefined}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-contain"
                                {...rest}
                            />
                        </div>
                    );
                }
            }

            // 处理YouTube嵌入
            if (domNode.name === 'iframe' &&
                domNode.attribs.src &&
                (domNode.attribs.src.includes('youtube.com') || domNode.attribs.src.includes('youtu.be'))) {
                const { src, width = '640', height = '480', ...rest } = domNode.attribs;

                return (
                    <div className="relative my-4 mx-auto" style={{ maxWidth: '100%' }}>
                        <iframe
                            src={src}
                            width={width}
                            height={height}
                            allowFullScreen
                            frameBorder="0"
                            className="mx-auto"
                            {...rest}
                        />
                    </div>
                );
            }

            // 没有匹配的特殊元素，返回原样
            return undefined;
        },
    };

    if (!isMounted) {
        return <div className={className}>加载内容中...</div>;
    }

    return (
        <div className={`cms-content ${className}`}>
            {parse(content, parseOptions)}
        </div>
    );
};

export default ContentRenderer; 
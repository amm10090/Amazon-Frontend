'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

import { StoreIdentifier } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import type { ComponentProduct } from '@/types';

// 水平列表风格产品组件
const HorizontalProductElement = ({ product }: { product: ComponentProduct }) => {
    const { id, title, price, image, url, cj_url } = product;
    const effectiveUrl = cj_url || url || '';
    const productUrl = `/product/${id}`;

    return (
        <motion.span
            className="inline-flex items-center my-4 p-4 border rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow max-w-xl align-middle w-full"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
        >
            <span className="flex flex-col sm:flex-row w-full">
                {/* 图片容器 - 调整大小并固定宽高比 */}
                <span className="flex-shrink-0 flex justify-center sm:justify-start mb-3 sm:mb-0">
                    <Link href={productUrl} className="relative w-28 h-28 sm:w-24 sm:h-24 sm:mr-4 rounded-lg overflow-hidden no-underline">
                        <Image
                            src={image || '/placeholder-product.jpg'}
                            alt={title}
                            fill
                            sizes="(max-width: 640px) 112px, 96px"
                            className="object-cover"
                            onError={(e) => { e.currentTarget.src = '/placeholder-product.jpg'; }}
                        />
                    </Link>
                </span>

                {/* 内容容器 - 在所有布局中显示标题 */}
                <span className="flex flex-col flex-grow">
                    {/* 标题 - 在所有布局中显示，移动端和桌面端有不同样式 */}
                    <span className="text-sm sm:text-base font-medium line-clamp-2 sm:line-clamp-1 mb-2">
                        <Link href={productUrl} className="text-black dark:text-white no-underline">
                            {title}
                        </Link>
                    </span>

                    {/* 价格与操作区 - 移动端垂直排列，桌面端水平排列 */}
                    <span className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mt-auto">
                        <span className="text-primary-button dark:text-primary-light font-bold text-xl">{formatPrice(price)}</span>

                        <span className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 mt-2 sm:mt-0">
                            <StoreIdentifier url={effectiveUrl} align="left" showName={false} className="mb-0" />
                            <Link href={productUrl} className="no-underline">
                                <button className="px-3 py-1.5 sm:px-4 bg-primary-button hover:bg-primary-button-hover dark:bg-primary-dark dark:hover:bg-primary text-white rounded-full text-sm transition-colors whitespace-nowrap">
                                    View Details
                                </button>
                            </Link>
                        </span>
                    </span>
                </span>
            </span>
        </motion.span>
    );
};

export default HorizontalProductElement; 
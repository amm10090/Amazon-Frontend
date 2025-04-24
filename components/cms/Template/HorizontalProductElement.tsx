'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

import { StoreIdentifier } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import type { ComponentProduct } from '@/types';

// 水平列表风格产品组件
const HorizontalProductElement = ({ product }: { product: ComponentProduct }) => {
    const { id, title, price, image, url, cj_url, asin } = product;
    const effectiveUrl = cj_url || url || '';
    const productUrl = `/product/${id}`;

    return (
        <motion.div
            className="flex items-center my-4 p-4 border rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
        >
            <Link href={productUrl} className="relative w-24 h-24 mr-4 rounded-lg overflow-hidden flex-shrink-0 no-underline">
                <Image
                    src={image || '/placeholder-product.jpg'}
                    alt={title}
                    fill
                    sizes="96px"
                    className="object-cover"
                    onError={(e) => { e.currentTarget.src = '/placeholder-product.jpg'; }}
                />
            </Link>
            <div className="flex-grow min-w-0">
                <div className="flex items-center mb-1">
                    <Link href={productUrl} className="font-medium text-lg text-gray-900 dark:text-gray-100 truncate mr-2 hover:text-primary transition-colors no-underline">
                        {title}
                    </Link>
                    {asin && (
                        <span className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full whitespace-nowrap">
                            ASIN: {asin}
                        </span>
                    )}
                </div>
                <div className="mt-2 flex items-center justify-between">
                    <div className="text-primary-button dark:text-primary-light font-bold text-xl">{formatPrice(price)}</div>
                    <div className="flex items-center gap-3">
                        <StoreIdentifier url={effectiveUrl} align="right" showName={false} className="mb-0" />
                        <Link href={productUrl} className="no-underline">
                            <button className="px-4 py-1.5 bg-primary-button hover:bg-primary-button-hover dark:bg-primary-dark dark:hover:bg-primary text-white rounded-full text-sm transition-colors whitespace-nowrap">
                                查看详情
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default HorizontalProductElement; 
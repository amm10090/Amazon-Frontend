import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { StoreIdentifier } from '@/lib/store';
import type { ComponentProduct } from '@/types';

import FavoriteButton from './FavoriteButton';

interface ProductCardProps {
    product: ComponentProduct;
    showFavoriteButton?: boolean;
}

/**
 * Product Card Component
 * Displays product information including image, title, price, etc.
 */
const ProductCard: React.FC<ProductCardProps> = ({
    product,
    showFavoriteButton = true
}) => {

    const { id, title, price, image, discount, url, isPrime, brand } = product;

    // Calculate discount price
    const discountPrice = discount
        ? price - (price * discount / 100)
        : price;

    // Original price
    const originalPrice = price;

    return (
        <div className="relative">
            {/* Favorite button */}
            {showFavoriteButton && (
                <div
                    className="absolute top-3 right-3 z-20"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    role="button"
                    tabIndex={0}
                >
                    <FavoriteButton
                        productId={id}
                        size="md"
                        className="bg-white/80 dark:bg-gray-800/80 shadow-sm hover:bg-white dark:hover:bg-gray-800"
                        productTitle={title}
                    />
                </div>
            )}

            <Link href={`/product/${id}`} className="block">
                <motion.div
                    className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden h-full flex flex-col"
                    whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.07), 0 10px 10px -5px rgba(0, 0, 0, 0.03)' }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Prime badge */}
                    {isPrime && (
                        <div className="absolute top-3 left-3 z-10">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="bg-[#0574F7] text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm flex items-center"
                            >
                                PRIME
                            </motion.div>
                        </div>
                    )}


                    {/* Product image */}
                    <div className="relative w-full h-48 bg-white dark:bg-gray-800">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="h-full w-full relative"
                        >
                            {image ? (
                                <Image
                                    src={image || '/placeholder-product.jpg'}
                                    alt={title || 'Product Image'}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                    className="object-contain"
                                    quality={80}
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                    No image available
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Product information */}
                    <div className="p-4 flex-grow flex flex-col">
                        {/* Store identifier */}
                        {url && (
                            <StoreIdentifier
                                url={url}
                                align="right"
                            />
                        )}

                        {/* Brand information */}
                        {brand && (
                            <div className="mb-2">
                                <span className="text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded inline-block">
                                    {brand.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                                </span>
                            </div>
                        )}

                        <h3 className="text-lg font-medium line-clamp-2 mb-2 flex-grow text-primary-dark dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                            {(title || `Product ${id}`).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                        </h3>

                        {/* Price information */}
                        <div className="flex items-center justify-between mt-auto mb-2">
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-semibold text-primary dark:text-primary-light">
                                    ${(discountPrice || 0).toFixed(2)}
                                </span>
                                {discount > 0 && (
                                    <span className="text-sm text-secondary dark:text-gray-400 line-through">
                                        ${(originalPrice || 0).toFixed(2)}
                                    </span>
                                )}
                            </div>
                            {discount > 0 && (
                                <span className={`text-xs font-bold text-white px-2 py-0.5 rounded ${discount > 30 ? 'bg-primary-badge' :
                                    discount > 10 ? 'bg-accent' :
                                        'bg-secondary'
                                    }`}>
                                    -{Math.round(discount)}%
                                </span>
                            )}
                        </div>
                    </div>

                    {/* View details button */}
                    <div className="px-4 pb-4">
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full py-2 bg-primary-button hover:bg-primary-button-hover dark:bg-primary-button-light dark:hover:bg-primary-button text-white text-center rounded-full font-medium shadow-sm transition-colors"
                        >
                            View Details
                        </motion.div>
                    </div>
                </motion.div>
            </Link>
        </div>
    );
};

export default ProductCard; 
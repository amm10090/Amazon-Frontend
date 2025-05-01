'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

import { StoreIdentifier } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import type { ComponentProduct } from '@/types';

/**
 * Card-style product component for rich text editor
 */
const CardProductElement = ({ product }: { product: ComponentProduct }) => {
    const { id, title, price, image, url, cj_url, originalPrice, discount, couponType, couponValue, couponExpirationDate, isPrime, brand } = product;

    const effectiveUrl = cj_url || url || '';
    const productUrl = `/product/${id}`; // Link to the product detail page

    // Format expiry date for coupons
    const formatExpiryDate = (dateString: string | null | undefined): string => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);

            // Check if date is valid
            if (isNaN(date.getTime())) {
                return 'Invalid Date';
            }
            const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };

            return date.toLocaleDateString('en-US', options);
        } catch {
            return 'Invalid Date';
        }
    };

    // Check if product has a coupon
    const hasCoupon = couponType && couponValue && couponValue > 0;

    // Calculate discount percentage
    let discountPercentage = discount ?? 0;

    // If no discount is provided but we have original price and current price, calculate the percentage
    if (discountPercentage <= 0 && originalPrice && originalPrice > price) {
        discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100);
    }

    // Display original price if it's higher than current price
    const displayOriginalPrice = (typeof originalPrice === 'number' && originalPrice > price) ? originalPrice : null;

    // Prepare display labels
    let discountLabel = '';
    let couponLabel = '';

    // Always show discount label if there's a percentage to show
    if (discountPercentage > 0) {
        discountLabel = `-${Math.round(discountPercentage)}%`;
    }

    // Show coupon label if a valid coupon exists
    if (hasCoupon) {
        if (couponType === 'percentage') {
            couponLabel = `-${couponValue}% Coupon`;
        } else if (couponType === 'fixed') {
            // Ensure couponValue is treated as a number
            couponLabel = `$${Number(couponValue).toFixed(2)} Coupon`;
        }
    }

    // Determine badge color based on discount percentage
    let discountBadgeClass = 'bg-primary-badge'; // Default badge color

    if (discountPercentage >= 50) discountBadgeClass = 'bg-red-600'; // Higher discount
    else if (discountPercentage >= 25) discountBadgeClass = 'bg-orange-500'; // Medium discount

    // Format brand name
    const formattedBrand = brand
        ? brand.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
        : null;

    return (
        <span className="inline-block align-middle max-w-[280px] relative">
            {/* Prime badge */}
            {isPrime && (
                <span className="absolute top-3 left-3 z-10">
                    <span className="bg-[#0574F7] text-white px-2 py-0.5 rounded-full text-xs font-medium shadow-sm">
                        Prime
                    </span>
                </span>
            )}
            <Link href={productUrl} className="no-underline" target="_blank" rel="noopener noreferrer">
                <motion.span
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-full inline-flex flex-col"
                    whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.07), 0 10px 10px -5px rgba(0, 0, 0, 0.03)' }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Product image */}
                    <span className="relative w-full aspect-[1/1] bg-white dark:bg-gray-700 pt-0.5 block">
                        <motion.span whileHover={{ scale: 1.05 }} className="h-full w-full relative block">
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
                                    onError={(e) => { e.currentTarget.src = '/placeholder-product.jpg'; }}
                                />
                            ) : (
                                <span className="h-full w-full flex items-center justify-center text-gray-400 bg-gray-100 dark:bg-gray-700">
                                    No Image
                                </span>
                            )}
                        </motion.span>
                    </span>

                    {/* Product information */}
                    <span className="p-3 flex-grow flex flex-col">
                        {/* Brand info and store identifier */}
                        <span className="flex items-center justify-between mb-1.5 min-h-[20px]">
                            {formattedBrand ? (
                                <span className="text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded inline-block truncate max-w-[50%]">
                                    {formattedBrand}
                                </span>
                            ) : <span />}
                            <StoreIdentifier url={effectiveUrl} align="right" />
                        </span>

                        <strong className="text-base font-medium line-clamp-2 mb-2 flex-grow text-primary-dark dark:text-gray-100 min-h-[3.5rem]">
                            {title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                        </strong>

                        {/* Price and discount */}
                        <span className="flex items-center justify-between mt-1 mb-2 min-h-[28px]">
                            <span className="flex items-baseline min-w-0 overflow-hidden mr-2">
                                <span className="text-lg font-semibold text-primary dark:text-primary-light whitespace-nowrap">
                                    {formatPrice(price)}
                                </span>
                                {displayOriginalPrice && (
                                    <span className="text-xs text-secondary dark:text-gray-400 line-through whitespace-nowrap ml-1.5">
                                        {formatPrice(displayOriginalPrice)}
                                    </span>
                                )}
                            </span>
                            {couponLabel ? (
                                <span className="text-xs font-bold text-white px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0 bg-green-500">
                                    {couponLabel}
                                </span>
                            ) : discountLabel ? (
                                <span className={`text-xs font-bold text-white px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0 ${discountBadgeClass}`}>
                                    {discountLabel}
                                </span>
                            ) : null}
                        </span>
                        {couponExpirationDate && (
                            <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1 border-t border-gray-100 dark:border-gray-700 pt-1">
                                Coupon Expires: {formatExpiryDate(couponExpirationDate)}
                            </span>
                        )}
                    </span>

                    {/* View details button */}
                    <span className="block px-3 pb-3 mt-auto">
                        <motion.span
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="block w-full py-2 bg-primary-button hover:bg-primary-button-hover dark:bg-primary-dark dark:hover:bg-primary text-white text-center rounded-full font-medium shadow-sm transition-colors"
                        >
                            View Details
                        </motion.span>
                    </span>
                </motion.span>
            </Link>
        </span>
    );
};

export default CardProductElement; 
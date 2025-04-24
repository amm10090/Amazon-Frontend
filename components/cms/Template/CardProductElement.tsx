'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

import { StoreIdentifier } from '@/lib/store';
import { formatPrice, calculateDiscount } from '@/lib/utils'; // Assuming calculateDiscount is still needed based on ComponentProduct structure
import type { ComponentProduct } from '@/types';

// 卡片样式的产品组件
const CardProductElement = ({ product }: { product: ComponentProduct }) => {
    const { id, title, price, image, url, cj_url, originalPrice, discount, couponType, couponValue, couponExpirationDate, isPrime, brand } = product;

    const effectiveUrl = cj_url || url || '';
    const productUrl = `/product/${id}`; // Link to the product detail page

    // --- Reusable logic (similar to ProductInfo.tsx or Blot) ---
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

    const hasCoupon = couponType && couponValue && couponValue > 0;
    // Use the discount directly from ComponentProduct if available and > 0
    const _hasDiscount = typeof discount === 'number' && discount > 0;
    // Use the originalPrice directly from ComponentProduct if available and greater than current price
    const displayOriginalPrice = (typeof originalPrice === 'number' && originalPrice > price) ? originalPrice : null;
    // Calculate savings based on available data
    const savingsPercentage = displayOriginalPrice ? calculateDiscount(displayOriginalPrice, price) : (discount ?? 0);

    let discountLabel = '';
    let couponLabel = '';

    // Only show discount label if there's a discount AND no coupon
    if (savingsPercentage > 0 && !hasCoupon) {
        discountLabel = `-${Math.round(savingsPercentage)}%`;
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

    // Determine badge color based on savings percentage
    let discountBadgeClass = 'bg-primary-badge'; // Default badge color

    if (savingsPercentage >= 50) discountBadgeClass = 'bg-red-600'; // Higher discount
    else if (savingsPercentage >= 25) discountBadgeClass = 'bg-orange-500'; // Medium discount


    // Format brand name
    const formattedBrand = brand
        ? brand.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
        : null;

    // --- End reusable logic ---

    return (
        <div className="my-4 w-full max-w-[280px] mx-auto relative">
            {/* Prime badge */}
            {isPrime && (
                <div className="absolute top-3 left-3 z-10">
                    <div className="bg-[#0574F7] text-white px-2 py-0.5 rounded-full text-xs font-medium shadow-sm">
                        Prime
                    </div>
                </div>
            )}
            <Link href={productUrl} className="no-underline">
                <motion.div
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-full flex flex-col"
                    whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.07), 0 10px 10px -5px rgba(0, 0, 0, 0.03)' }}
                    transition={{ duration: 0.3 }}
                >
                    {/* 产品图片 */}
                    <div className="relative w-full aspect-[1/1] bg-white dark:bg-gray-700 pt-0.5">
                        <motion.div whileHover={{ scale: 1.05 }} className="h-full w-full relative">
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
                                <div className="h-full w-full flex items-center justify-center text-gray-400 bg-gray-100 dark:bg-gray-700">
                                    无图片
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* 产品信息 */}
                    <div className="p-3 flex-grow flex flex-col">
                        {/* 品牌信息和商店标识 */}
                        <div className="flex items-center justify-between mb-1.5 min-h-[20px]"> {/* Added min-height */}
                            {formattedBrand ? (
                                <span className="text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded inline-block truncate max-w-[50%]">
                                    {formattedBrand}
                                </span>
                            ) : <span />} {/* Placeholder span */}
                            <StoreIdentifier url={effectiveUrl} align="right" />
                        </div>

                        <h3 className="text-base font-medium line-clamp-2 mb-2 flex-grow text-primary-dark dark:text-gray-100">
                            {title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                        </h3>

                        {/* 价格和折扣 */}
                        <div className="flex items-center justify-between mt-1 mb-2 min-h-[28px]"> {/* Added min-height */}
                            <div className="flex items-baseline min-w-0 overflow-hidden mr-2">
                                <span className="text-lg font-semibold text-primary dark:text-primary-light whitespace-nowrap">
                                    {formatPrice(price)}
                                </span>
                                {displayOriginalPrice && (
                                    <span className="text-xs text-secondary dark:text-gray-400 line-through whitespace-nowrap ml-1.5">
                                        {formatPrice(displayOriginalPrice)}
                                    </span>
                                )}
                            </div>
                            {/* Badge: Coupon has priority */}
                            {couponLabel ? (
                                <span className="text-xs font-bold text-white px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0 bg-green-500">
                                    {couponLabel}
                                </span>
                            ) : discountLabel ? (
                                <span className={`text-xs font-bold text-white px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0 ${discountBadgeClass}`}>
                                    {discountLabel}
                                </span>
                            ) : null}
                        </div>
                        {couponExpirationDate && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 border-t border-gray-100 dark:border-gray-700 pt-1">
                                Coupon Expires: {formatExpiryDate(couponExpirationDate)}
                            </div>
                        )}
                    </div>

                    {/* 查看详情按钮 */}
                    <div className="px-3 pb-3 mt-auto"> {/* Ensure button is at the bottom */}
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full py-2 bg-primary-button hover:bg-primary-button-hover dark:bg-primary-dark dark:hover:bg-primary text-white text-center rounded-full font-medium shadow-sm transition-colors"
                        >
                            查看详情
                        </motion.div>
                    </div>
                </motion.div>
            </Link>
        </div>
    );
};

export default CardProductElement; 
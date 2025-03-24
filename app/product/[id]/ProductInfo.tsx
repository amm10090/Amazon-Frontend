"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

import { StoreIdentifier } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import type { ComponentProduct } from '@/types';

interface ProductInfoProps {
    product: ComponentProduct;
}

export default function ProductInfo({ product }: ProductInfoProps) {
    const [isWishlisted, setIsWishlisted] = useState(false);

    const handleWishlistToggle = () => {
        setIsWishlisted(!isWishlisted);
        // In actual project, API should be called to add/remove favorites
    };

    const handleViewDeal = () => {
        if (product.url) {
            window.open(product.url, '_blank');
        }
    };

    const handleShare = () => {
        // Implement sharing functionality
        if (navigator.share) {
            navigator.share({
                title: product.title,
                text: `Check out this deal: ${product.title}`,
                url: window.location.href,
            }).catch(() => {
                // If sharing fails, copy link to clipboard
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard');
            });
        } else {
            // If sharing API not supported, copy link directly
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard');
        }
    };

    return (
        <div className="product-info space-y-6">
            {/* Store badge */}
            <div className="store-badge flex items-center space-x-2">
                <StoreIdentifier
                    url={product.url || ''}
                    align="left"
                    showName={true}
                    className="flex items-center"
                />
            </div>

            {/* Product title */}
            <h1 className="product-title text-2xl md:text-3xl font-bold text-gray-800 dark:text-white leading-tight">
                {product.title}
            </h1>

            {/* Price information */}
            <div className="price-container flex items-center space-x-4">
                <div className="current-price text-3xl md:text-4xl font-bold text-primary">
                    {formatPrice(product.price)}
                </div>

                {product.discount > 0 && (
                    <>
                        <div className="original-price text-xl text-gray-500 line-through">
                            {formatPrice(product.originalPrice)}
                        </div>

                        <div className="discount-tag bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                            {Math.round(product.discount)}% OFF
                        </div>
                    </>
                )}
            </div>

            {/* Coupon information */}
            {product.couponValue && product.couponValue > 0 && (
                <div className="coupon-info bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 p-3 rounded-lg flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="font-medium">
                        {product.couponType === 'percentage'
                            ? `Extra ${product.couponValue}% Coupon`
                            : `Extra ${formatPrice(product.couponValue || 0)} Coupon`}
                    </span>
                </div>
            )}

            {/* Shipping information */}
            <div className="shipping-info flex flex-wrap gap-4">
                {product.isPrime && (
                    <div className="badge flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
                        <div className="w-6 h-6 relative">
                            <Image
                                src="/images/prime-logo.png"
                                alt="Prime"
                                width={24}
                                height={24}
                                unoptimized
                            />
                        </div>
                        <span>Prime</span>
                    </div>
                )}

                {product.isFreeShipping && (
                    <div className="badge flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        <span>Free Shipping</span>
                    </div>
                )}
            </div>

            {/* Action buttons */}
            <div className="cta-buttons flex items-center space-x-3 pt-4">
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="view-deal-btn flex-grow bg-primary-button hover:bg-primary-button-hover text-white py-3 px-6 rounded-full font-medium shadow-sm transition-colors flex items-center justify-center"
                    onClick={handleViewDeal}
                >
                    <span>View on {product.brand === 'amazon' ? 'Amazon' : 'Store'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`wishlist-btn w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${isWishlisted
                        ? 'bg-red-500 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                    onClick={handleWishlistToggle}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill={isWishlisted ? 'currentColor' : 'none'}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="share-btn w-12 h-12 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center shadow-sm"
                    onClick={handleShare}
                    aria-label="Share"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                </motion.button>
            </div>

            {/* Help information box */}
            <div className="help-box mt-8 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-800 dark:text-white mb-2">How OOHunt Works</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                    We verify all deals to ensure they&apos;re valid and offer real savings. When you click &ldquo;View on Store&rdquo;, you&apos;ll be directed to the retailer&apos;s website to complete your purchase. OOHunt may earn a commission at no additional cost to you.
                </p>
            </div>
        </div>
    );
} 
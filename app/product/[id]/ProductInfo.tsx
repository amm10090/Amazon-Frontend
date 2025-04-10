"use client";

import { motion } from 'framer-motion';
import { BellRing } from 'lucide-react';
import { useState } from 'react';

import FavoriteToast from '@/components/common/FavoriteToast';
import { NewsletterSubscribe } from '@/components/email/NewsletterSubscribe';
import { useProductFavorite } from '@/lib/favorites';
import { StoreIdentifier } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import type { ComponentProduct } from '@/types';

interface ProductInfoProps {
    product: ComponentProduct;
}

export default function ProductInfo({ product }: ProductInfoProps) {
    const { isFavorite, toggleFavorite, isUpdating } = useProductFavorite(product.id);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [lastAction, setLastAction] = useState<'add' | 'remove'>('add');

    const handleWishlistToggle = async () => {
        try {
            const actionType = isFavorite ? 'remove' : 'add';

            setLastAction(actionType);

            const result = await toggleFavorite();

            setToastType(result.success ? 'success' : 'error');
            setToastMessage(result.message);
            setShowToast(true);
        } catch {
            setToastType('error');
            setToastMessage('Operation failed, please try again later');
            setShowToast(true);
        }
    };

    const handleViewDeal = () => {
        const linkUrl = product.cj_url || product.url;

        if (linkUrl) {
            window.open(linkUrl, '_blank');
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: product.title,
                text: `Check out this deal: ${product.title}`,
                url: window.location.href,
            }).catch(() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard');
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard');
        }
    };

    const handleHideToast = () => {
        setShowToast(false);
    };

    return (
        <div className="product-info space-y-6 relative">
            <div className="store-badge flex items-center space-x-2">
                <StoreIdentifier
                    url={product.cj_url || product.url || ''}
                    align="left"
                    showName={true}
                    className="flex items-center"
                />
            </div>

            <h1 className="product-title text-xl sm:text-2xl md:text-3xl font-bold text-[#1A5276] dark:text-white leading-tight">
                {product.title}
            </h1>

            <div className="price-container flex flex-col space-y-2 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="current-price text-3xl md:text-4xl font-bold text-[#1A5276] dark:text-white">
                        {formatPrice(product.price)}
                    </div>

                    {product.discount > 0 && (
                        <>
                            <div className="original-price text-xl text-gray-500 line-through">
                                {formatPrice(product.originalPrice)}
                            </div>

                            <div className="discount-tag bg-[#F39C12] text-white text-sm font-bold px-3 py-1 rounded-md">
                                {Math.round(product.discount)}% OFF
                            </div>
                        </>
                    )}
                </div>
            </div>

            {product.title.includes('Size') && (
                <div className="size-info text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Size: </span> {product.title.match(/Size ([^,]+)/)?.[1] || 'Standard'}
                </div>
            )}

            <div className="shipping-info flex flex-wrap gap-4">
                {product.isFreeShipping && (
                    <div className="badge flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        <span>Free Shipping</span>
                    </div>
                )}
            </div>

            <div className="cta-buttons flex flex-row items-center gap-2 pt-4">
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="view-deal-btn w-[70%] bg-[#16A085] hover:bg-[#117A65] text-white py-2.5 sm:py-3 px-3 sm:px-6 rounded-md font-medium shadow-sm transition-colors flex items-center justify-center cursor-pointer"
                    onClick={handleViewDeal}
                >
                    <span className="text-sm sm:text-base">View Deal on {product.brand === 'amazon' ? 'Amazon' : 'Store'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </motion.button>

                <div className="flex items-center space-x-2 w-[30%]">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`wishlist-btn w-1/2 h-9 sm:h-11 md:h-12 rounded-md flex items-center justify-center shadow-sm border-2 cursor-pointer ${isFavorite
                            ? 'bg-red-500 border-red-500 text-white'
                            : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                            }`}
                        onClick={handleWishlistToggle}
                        disabled={isUpdating}
                        aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6"
                            fill={isFavorite ? 'currentColor' : 'none'}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="share-btn w-1/2 h-9 sm:h-11 md:h-12 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-md flex items-center justify-center shadow-sm cursor-pointer"
                        onClick={handleShare}
                        aria-label="Share"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </motion.button>
                </div>
            </div>

            <div className="lg:hidden mt-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="newsletter-section bg-gradient-to-br from-white to-gray-50 dark:from-gray-800/80 dark:to-gray-800/60 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                    <div className="flex flex-col space-y-3">
                        <div className="flex items-center space-x-3">
                            <div className="bg-[#16A085]/10 p-2 rounded-lg">
                                <BellRing className="w-5 h-5 text-[#16A085]" />
                            </div>
                            <h3 className="font-medium text-[#16A085] dark:text-white text-lg">Don&apos;t Miss More Deals</h3>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            Subscribe to our newsletter for exclusive deals and promotions.
                        </p>

                        <div className="mt-1">
                            <NewsletterSubscribe compact={true} />
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                We respect your privacy and will never share your email with third parties.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="help-box bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mt-6">
                <h3 className="font-bold text-[#1A5276] dark:text-white mb-2">How OOHunt Works</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                    We verify all deals to ensure they&apos;re valid and offer real savings. When you click &ldquo;View Deal,&rdquo; you&apos;ll be directed to the store&apos;s website where you can complete your purchase. OOHunt may earn a commission at no cost to you.
                </p>
            </div>

            <FavoriteToast
                action={lastAction}
                show={showToast}
                onHide={handleHideToast}
                type={toastType}
                message={toastMessage}
                productTitle={product.title}
            />
        </div>
    );
} 
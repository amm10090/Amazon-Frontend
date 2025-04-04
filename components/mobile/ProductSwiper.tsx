import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Pagination, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import FavoriteButton from '@/components/common/FavoriteButton';
import { StoreIdentifier } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types/api';

// 导入Swiper样式
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';

interface ProductSwiperProps {
    products: Product[];
}

export function ProductSwiper({ products }: ProductSwiperProps) {
    // 渲染单个商品卡片的函数
    const renderProductCard = (product: Product, index: number) => {
        try {
            // Get main offer information
            const mainOffer = product.offers && product.offers.length > 0 ? product.offers[0] : null;

            // Get price and discount information with enhanced error handling
            const price = mainOffer?.price || product.price || 0;
            const savingsPercentage = mainOffer?.savings_percentage ||
                product.discount_rate ||
                (product.original_price && price ? ((product.original_price - price) / product.original_price) * 100 : 0);

            const originalPrice = mainOffer && mainOffer.savings
                ? price + mainOffer.savings
                : product.original_price || price;

            const productId = product.asin || product.id || `product-${index}`;
            const productImage = product.main_image || product.image_url || '';
            const isPrime = mainOffer?.is_prime || false;
            const title = product.title || 'Product title not available';
            const productUrl = product.url || product.cj_url || '';

            return (
                <motion.div
                    key={productId}
                    className="relative w-full"
                >
                    {/* 收藏按钮 */}
                    <div
                        className="absolute top-3 right-3 z-20"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        role="button"
                        tabIndex={0}
                    >
                        <FavoriteButton
                            productId={productId}
                            size="md"
                            withAnimation={true}
                            className="bg-white/80 dark:bg-gray-800/80 shadow-sm hover:bg-white dark:hover:bg-gray-800"
                        />
                    </div>

                    <Link href={`/product/${productId}`} className="block">
                        <motion.div
                            className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden h-full flex flex-col max-w-[350px] mx-auto w-full"
                            transition={{ duration: 0.3 }}
                        >
                            {/* Prime badge */}
                            {isPrime && (
                                <div className="absolute top-3 left-3 z-10">
                                    <div className="bg-[#0574F7] text-white px-3 py-1 rounded-full text-sm font-medium">
                                        Prime
                                    </div>
                                </div>
                            )}

                            {/* Product image */}
                            <div className="relative w-full aspect-square bg-gray-50 dark:bg-gray-800">
                                <div className="h-full w-full relative">
                                    {productImage ? (
                                        <Image
                                            src={productImage}
                                            alt={title}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                            className="object-contain w-full h-full p-2"
                                            priority={index < 2}
                                            loading={index < 2 ? "eager" : "lazy"}
                                            quality={90}
                                            unoptimized={productImage.startsWith('data:')}
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                                            No image available
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Product information */}
                            <div className="p-2 sm:p-3 flex-grow flex flex-col">
                                {/* StoreIdentifier */}
                                <StoreIdentifier
                                    url={productUrl}
                                    align="right"
                                />

                                {/* Brand information */}
                                {product.brand && (
                                    <div className="mb-0.5">
                                        <span className="text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded inline-block">
                                            {product.brand}
                                        </span>
                                    </div>
                                )}

                                <h3 className="text-sm sm:text-base font-medium line-clamp-2 mb-1 flex-grow text-primary-dark dark:text-white">
                                    {title}
                                </h3>

                                {/* Price and discount */}
                                <div className="flex items-center justify-between mt-0.5 mb-1.5 flex-wrap gap-1">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-base sm:text-lg font-semibold text-primary dark:text-primary-light">
                                            {formatPrice(price)}
                                        </span>
                                        {originalPrice > price && (
                                            <span className="text-xs text-secondary dark:text-gray-400 line-through">
                                                {formatPrice(originalPrice)}
                                            </span>
                                        )}
                                    </div>
                                    {savingsPercentage > 0 && (
                                        <span className={`text-xs font-bold text-white px-1.5 py-0.5 rounded ${savingsPercentage > 30 ? 'bg-primary-badge' :
                                            savingsPercentage > 10 ? 'bg-accent' :
                                                'bg-secondary'
                                            }`}>
                                            -{Math.round(savingsPercentage)}%
                                        </span>
                                    )}
                                </div>

                                {/* Action button */}
                                <button className="w-full py-1.5 bg-primary-button hover:bg-primary-button-hover dark:bg-primary-button-light dark:hover:bg-primary-button text-white text-center rounded-full text-sm font-medium transition-colors">
                                    View Details
                                </button>
                            </div>
                        </motion.div>
                    </Link>
                </motion.div>
            );
        } catch {

            return null;
        }
    };

    // 移除 variant 相关的配置,使用统一的配置
    const swiperProps = {
        modules: [Navigation, Pagination],
        slidesPerView: 1,
        spaceBetween: 20,
        speed: 600,
        loop: true,
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        }
    };

    return (
        <div className="product-swiper-container">
            <Swiper
                {...swiperProps}
                centeredSlides={true}
                grabCursor={true}
                pagination={{
                    clickable: true,
                    renderBullet: function (index, className) {
                        return `<span class="${className}"></span>`;
                    },
                }}
                navigation={{
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                }}
                className="product-swiper"
            >
                {products.map((product, index) => (
                    <SwiperSlide key={product.asin || product.id || `product-${index}`} className="swiper-slide-product">
                        {renderProductCard(product, index)}
                    </SwiperSlide>
                ))}
                <div className="swiper-navigation">
                    <button className="swiper-button-prev" aria-label="Previous slide">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <button className="swiper-button-next" aria-label="Next slide">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M6 13L11 8L6 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </Swiper>

            <style jsx global>{`
                .product-swiper-container {
                    width: 100%;
                    position: relative;
                    padding: 0;
                    background: rgb(243 244 246);
                    border-radius: 0.75rem;
                }

                .product-swiper {
                    padding: 1rem 0 2.5rem;
                }

                .swiper-slide-product {
                    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                    opacity: 0;
                    transform: scale(0.9);
                    padding: 0 0.5rem;
                }

                .swiper-slide-product.swiper-slide-active {
                    opacity: 1;
                    transform: scale(1);
                }

                .swiper-slide-product.swiper-slide-prev,
                .swiper-slide-product.swiper-slide-next {
                    opacity: 0.5;
                    transform: scale(0.85);
                }

                /* Navigation Styles */
                .swiper-navigation {
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    transform: translateY(-50%);
                    z-index: 10;
                    display: flex;
                    justify-content: space-between;
                    padding: 0 1rem;
                    pointer-events: none;
                }

                .swiper-button-prev,
                .swiper-button-next {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #f5f5f7;
                    border: 1px solid #e5e5e5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #1d1d1f;
                    cursor: pointer;
                    pointer-events: auto;
                    transition: all 0.3s ease;
                    opacity: 0;
                }

                .product-swiper-container:hover .swiper-button-prev,
                .product-swiper-container:hover .swiper-button-next {
                    opacity: 1;
                }

                .swiper-button-prev:hover,
                .swiper-button-next:hover {
                    background: #ffffff;
                    transform: scale(1.1);
                }

                .swiper-button-prev:after,
                .swiper-button-next:after {
                    content: none;
                }

                /* Pagination Styles */
                .swiper-pagination {
                    bottom: 1rem !important;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 4px;
                    padding: 0;
                    position: absolute;
                    left: 0;
                    right: 0;
                    z-index: 10;
                }

                .swiper-pagination-bullet {
                    width: 6px !important;
                    height: 6px !important;
                    background: #D1D5DB !important;
                    opacity: 0.5 !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    margin: 0 !important;
                    border-radius: 50%;
                }

                .swiper-pagination-bullet-active {
                    background: #9CA3AF !important;
                    opacity: 1 !important;
                    transform: scale(1);
                }

                /* Dark Mode Styles */
                .dark .swiper-pagination-bullet {
                    background: rgba(209, 213, 219, 0.5) !important;
                }

                .dark .swiper-pagination-bullet-active {
                    background: #9CA3AF !important;
                }

                /* Responsive Styles */
                @media (max-width: 768px) {
                    .product-swiper-container {
                        margin: 0;
                    }

                    .product-swiper {
                        padding: 1rem 0 2.5rem;
                    }

                    .swiper-navigation {
                        display: none;
                    }

                    .swiper-slide-product {
                        width: auto;
                    }

                    .swiper-pagination {
                        bottom: 0.75rem !important;
                    }

                    .swiper-button-prev {
                        left: 5px !important;
                    }

                    .swiper-button-next {
                        right: 5px !important;
                    }
                }

                /* Dark mode container background */
                .dark .product-swiper-container {
                    background: rgb(31 41 55);
                }
            `}</style>
        </div>
    );
} 
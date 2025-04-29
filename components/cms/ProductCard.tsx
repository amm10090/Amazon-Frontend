'use client';

import Image from 'next/image';
import { memo } from 'react';

import { formatPrice } from '@/lib/utils';

interface Product {
    id?: string;
    title?: string;
    price?: number;
    main_image?: string;
    image_url?: string;
    image?: string;
    images?: string[];
    sku?: string;
    asin?: string;
    brand?: string | null;
    original_price?: number | null;
    discount?: number | null;
    discount_percentage?: number | null;
    coupon_type?: 'percentage' | 'fixed' | null;
    coupon_value?: number | null;
    offers?: Array<{
        coupon_type?: 'percentage' | 'fixed' | null;
        coupon_value?: number | null;
        price?: number;
        original_price?: number | null;
    }>;
    coupon_history?: {
        coupon_type?: 'percentage' | 'fixed' | null;
        coupon_value?: number;
    };
}

interface ProductCardProps {
    product: Product;
    onClick: (product: Product) => void;
    size?: 'small' | 'medium' | 'large';
}

/**
 * Product Card Component
 * Used to display products in the selector modal
 */
const ProductCard = memo(({ product, onClick, size = 'medium' }: ProductCardProps) => {
    // Get product image
    const imageUrl = product.main_image || product.image_url || product.images?.[0] || product.image || '/placeholder-product.jpg';

    // Set different styles based on size
    const cardClasses = {
        small: "h-[140px]",
        medium: "h-[180px]",
        large: "h-[220px]"
    };

    // Image aspect ratio
    const imageRatio = size === 'small' ? "aspect-[3/2]" : "aspect-[4/3]";

    // Handle price and discount
    const price = product.price || (product.offers?.[0]?.price ?? 0);
    const originalPrice = product.original_price || product.offers?.[0]?.original_price || null;

    // Calculate discount percentage if not already provided
    let discountPercentage = product.discount_percentage || product.discount || 0;

    // If no discount percentage is provided but we have original and current price, calculate it
    if (!discountPercentage && originalPrice && price && originalPrice > price) {
        discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100);
    }

    // Get coupon information
    const couponType = product.coupon_type || product.offers?.[0]?.coupon_type || product.coupon_history?.coupon_type || null;
    const couponValue = product.coupon_value || product.offers?.[0]?.coupon_value || product.coupon_history?.coupon_value || 0;

    // Calculate display information
    const _showDiscount = originalPrice && price && originalPrice > price;
    const discountText = discountPercentage > 0 ? `-${discountPercentage}%` : '';

    // Calculate coupon text
    const showCoupon = couponValue > 0;
    const couponText = couponType === 'percentage'
        ? `Coupon: ${couponValue}%`
        : `Coupon: ${formatPrice(couponValue)}`;

    return (
        <button
            className={`flex flex-col border rounded overflow-hidden hover:border-primary hover:shadow-sm transition-all ${cardClasses[size]}`}
            onClick={() => onClick(product)}
            type="button"
        >
            {/* Product image */}
            <div className={`relative ${imageRatio} bg-gray-100 overflow-hidden`}>
                <Image
                    src={imageUrl}
                    alt={product.title || 'Product image'}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 33vw"
                />

                {/* Discount label */}
                {discountPercentage > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded">
                        {discountText}
                    </span>
                )}

                {/* Coupon label */}
                {showCoupon && discountPercentage <= 0 && (
                    <span className="absolute top-1 right-1 bg-orange-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded">
                        Coupon
                    </span>
                )}
            </div>

            {/* Product information */}
            <div className="flex-1 flex flex-col p-2 text-left">
                {/* Product title */}
                <h3 className="text-sm font-medium line-clamp-1 mb-auto">
                    {product.title || 'Unnamed product'}
                </h3>

                {/* Price information */}
                <div className="mt-1">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-semibold text-red-600">
                            {formatPrice(price)}
                        </span>

                        {originalPrice && originalPrice > price && (
                            <span className="text-xs text-gray-500 line-through">
                                {formatPrice(originalPrice)}
                            </span>
                        )}
                    </div>

                    {/* Display coupon information */}
                    {showCoupon && (
                        <div className="text-xs text-orange-600 mt-0.5">
                            {couponText}
                        </div>
                    )}

                    {/* Brand and ID */}
                    <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                        <span className="truncate max-w-[100px]">
                            {product.brand || '-'}
                        </span>
                        <span className="text-xs">
                            {product.asin || product.sku || '-'}
                        </span>
                    </div>
                </div>
            </div>
        </button>
    );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard; 
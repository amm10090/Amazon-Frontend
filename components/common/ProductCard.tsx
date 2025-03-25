import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import type { ComponentProduct } from '@/types';

import FavoriteButton from './FavoriteButton';

interface ProductCardProps {
    product: ComponentProduct;
    showFavoriteButton?: boolean;
}

/**
 * 产品卡片组件
 * 显示产品信息，包括图片、标题、价格等
 */
const ProductCard: React.FC<ProductCardProps> = ({
    product,
    showFavoriteButton = true
}) => {
    // 调试输出商品数据
    // eslint-disable-next-line no-console
    console.log('ProductCard接收到的商品数据:', product);

    const { id, title, price, rating, image, discount } = product;

    // 计算折扣价格
    const discountPrice = discount
        ? price - (price * discount / 100)
        : price;

    return (
        <div className="relative flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-all hover:shadow-lg">
            {/* 产品图片 */}
            <Link href={`/product/${id}`} className="relative h-48 overflow-hidden">
                <Image
                    src={image || '/placeholder-product.jpg'}
                    alt={title || '商品图片'}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 hover:scale-105"
                />

                {/* 折扣标签 */}
                {discount > 0 && (
                    <div className="absolute left-0 top-0 bg-red-500 px-2 py-1 text-sm font-bold text-white">
                        -{discount.toFixed(0)}%
                    </div>
                )}
            </Link>

            {/* 产品信息 */}
            <div className="flex flex-1 flex-col p-4">
                <Link href={`/product/${id}`} className="mb-2 text-lg font-medium text-gray-900 hover:text-blue-600">
                    {title || `商品 ${id}`}
                </Link>

                {/* 价格信息 */}
                <div className="mb-2 flex items-center">
                    <span className="text-xl font-bold text-gray-900">
                        ¥{(discountPrice || 0).toFixed(2)}
                    </span>

                    {discount > 0 && (
                        <span className="ml-2 text-sm text-gray-500 line-through">
                            ¥{(price || 0).toFixed(2)}
                        </span>
                    )}
                </div>

                {/* 评分 */}
                {rating && (
                    <div className="mb-2 flex items-center">
                        <div className="flex items-center">
                            {["star1", "star2", "star3", "star4", "star5"].map((starId, i) => (
                                <svg
                                    key={`${id}-${starId}`}
                                    className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-500' : 'text-gray-300'
                                        }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                            <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* 收藏按钮 */}
            {showFavoriteButton && (
                <div className="absolute right-2 top-2">
                    <FavoriteButton productId={id} size="md" />
                </div>
            )}
        </div>
    );
};

export default ProductCard; 
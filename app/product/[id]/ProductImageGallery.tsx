"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

import type { ComponentProduct } from '@/types';

interface ProductImageGalleryProps {
    product: ComponentProduct;
}

export default function ProductImageGallery({ product }: ProductImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(product.image);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // 模拟多张图片的处理
    // 实际项目中应该从product的图片数组中获取
    const images = [
        product.image,
        product.image, // 暂时重复使用主图
        product.image,
        product.image,
    ];

    const handleThumbnailClick = (image: string, index: number) => {
        setSelectedImage(image);
        setSelectedIndex(index);
    };

    return (
        <div className="product-gallery">
            {/* 主图展示区域 */}
            <div className="main-image-container mb-4 relative rounded-lg overflow-hidden bg-white h-[400px] md:h-[500px]">
                <motion.div
                    key={selectedIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full relative"
                >
                    <Image
                        src={selectedImage}
                        alt={product.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-contain"
                        priority
                    />

                    {/* 折扣标签 */}
                    {product.discount > 0 && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                            -{Math.round(product.discount)}% OFF
                        </div>
                    )}

                    {/* Prime标签 */}
                    {product.isPrime && (
                        <div className="absolute top-4 left-4 bg-[#0574F7] text-white text-sm font-bold px-3 py-1 rounded-full">
                            Prime
                        </div>
                    )}
                </motion.div>
            </div>

            {/* 缩略图区域 */}
            <div className="thumbnails-container flex space-x-4 overflow-x-auto py-2">
                {images.map((image, index) => (
                    <div
                        key={`${product.id}-thumbnail-position-${index + 1}`}
                        className={`thumbnail-item cursor-pointer rounded-md overflow-hidden border-2 transition-all ${selectedIndex === index
                            ? 'border-primary'
                            : 'border-transparent hover:border-gray-300'
                            }`}
                        onClick={() => handleThumbnailClick(image, index)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleThumbnailClick(image, index);
                            }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`查看图片 ${index + 1}`}
                    >
                        <div className="relative w-16 h-16 md:w-20 md:h-20">
                            <Image
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                sizes="80px"
                                className="object-cover"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 
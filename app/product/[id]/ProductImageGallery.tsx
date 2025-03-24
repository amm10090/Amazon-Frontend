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

    // Simulating multiple images
    // In a real project, these would come from a product images array
    const images = [
        product.image,
        product.image, // temporarily duplicating main image
        product.image,
        product.image,
    ];

    const handleThumbnailClick = (image: string, index: number) => {
        setSelectedImage(image);
        setSelectedIndex(index);
    };

    return (
        <div className="product-gallery">
            {/* Main image display area */}
            <div className="main-image-container relative mb-5 bg-white rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 h-[350px] md:h-[400px]">
                {/* Hot Deal badge */}
                <div className="absolute top-4 left-4 z-10 bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-md">
                    HOT DEAL
                </div>

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
                </motion.div>
            </div>

            {/* Thumbnails area */}
            <div className="thumbnails-container flex space-x-3">
                {images.map((image, index) => (
                    <div
                        key={`${product.id}-thumbnail-position-${index + 1}`}
                        className={`thumbnail-item cursor-pointer w-20 h-20 flex-shrink-0 border ${selectedIndex === index
                            ? 'border-primary'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            } rounded-md overflow-hidden transition-all`}
                        onClick={() => handleThumbnailClick(image, index)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleThumbnailClick(image, index);
                            }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`View image ${index + 1}`}
                    >
                        <div className="relative w-full h-full">
                            <Image
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                sizes="80px"
                                className="object-contain p-1"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 
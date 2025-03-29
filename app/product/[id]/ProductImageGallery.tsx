"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';

import type { ComponentProduct } from '@/types';

interface ProductImageGalleryProps {
    product: ComponentProduct;
}

export default function ProductImageGallery({ product }: ProductImageGalleryProps) {
    return (
        <div className="product-gallery">
            {/* Main image display area */}
            <div className="main-image-container relative bg-white rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 h-[350px] sm:h-[280px] md:h-[300px] lg:h-[550px]">
                {/* Hot Deal badge */}
                <div className="absolute top-4 left-4 z-10 bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-md">
                    HOT DEAL
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full relative"
                >
                    <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain hover:scale-105 transition-transform duration-300"
                        priority
                    />
                </motion.div>
            </div>
        </div>
    );
} 
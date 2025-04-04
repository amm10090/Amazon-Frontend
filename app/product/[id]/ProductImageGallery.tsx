"use client";

import { motion } from 'framer-motion';
import { BellRing } from 'lucide-react';
import Image from 'next/image';

import { NewsletterSubscribe } from '@/components/ui/NewsletterSubscribe';
import type { ComponentProduct } from '@/types';

interface ProductImageGalleryProps {
    product: ComponentProduct;
}

export default function ProductImageGallery({ product }: ProductImageGalleryProps) {
    return (
        <div className="product-gallery flex flex-col space-y-4">
            {/* Main image display area */}
            <div className="main-image-container relative bg-white rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 h-[350px] sm:h-[280px] md:h-[300px] lg:h-[450px]">
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

            {/* Newsletter subscription - Only visible on desktop (lg screens) */}
            <div className="hidden lg:block">
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
        </div>
    );
} 
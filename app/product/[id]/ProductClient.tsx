"use client";

import { motion } from 'framer-motion';
import { BellRing } from 'lucide-react';
import { useMemo } from 'react';

import Breadcrumb, { type BreadcrumbItem } from '@/components/ui/Breadcrumb';
import { NewsletterSubscribe } from '@/components/ui/NewsletterSubscribe';
import type { ComponentProduct } from '@/types';

import ProductImageGallery from './ProductImageGallery';
import ProductInfo from './ProductInfo';

export default function ProductClient({ product }: { product: ComponentProduct }) {
    // Generate breadcrumb navigation based on product data
    const breadcrumbItems = useMemo(() => {
        const items: BreadcrumbItem[] = [
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
        ];

        // Parse product.category with fallback handling
        const category = product.category || '';
        const categoryName = category ||
            (product.title?.includes('Digital') ? 'Digital Devices & Accessories' : '');

        // Only add category if we have a valid name
        if (categoryName) {
            // 先将空格替换为+号，然后使用encodeURIComponent但保留+号
            const productGroup = encodeURIComponent(categoryName).replace(/%20/g, '+');

            items.push({
                label: categoryName,
                href: `/products?product_groups=${productGroup}`
            });
        }

        return items;
    }, [product]);

    // Ensure no extra rendering
    const cleanedProduct = useMemo(() => {
        // Create a new object to avoid directly modifying original data
        return {
            ...product,
            // Ensure any properties that might cause zero rendering are properly handled
        };
    }, [product]);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            {/* Breadcrumb navigation with all items clickable */}
            <div className="mb-6">
                <Breadcrumb items={breadcrumbItems} allItemsClickable={true} />
            </div>

            {/* Product detail card */}
            <div className="product-container bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md mb-8 relative">
                {/* Prime badge - 移至外部容器并设置为绝对定位 */}
                {product.isPrime && (
                    <div className="absolute top-4 right-4 z-20">
                        <div className="bg-[#0574F7] text-white text-sm font-bold px-3 py-1.5 rounded-md shadow-sm">
                            Prime
                        </div>
                    </div>
                )}

                {/* 调整为平板和移动设备使用上下布局 */}
                <div className="flex flex-col lg:flex-row">
                    {/* Product image gallery - 调整宽度比例 */}
                    <div className="w-full lg:w-1/2 p-4 sm:p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700">
                        <ProductImageGallery product={cleanedProduct} />
                    </div>

                    {/* Product information - 调整宽度比例 */}
                    <div className="w-full lg:w-1/2 p-4 sm:p-6 md:p-8">
                        <ProductInfo product={cleanedProduct} />
                    </div>
                </div>
            </div>

            {/* Newsletter subscription section */}
            <div className="newsletter-container mb-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/90 p-7 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                    <div className="flex flex-col md:flex-row md:items-start gap-8">
                        <div className="md:w-2/5 mb-5 md:mb-0 md:pr-8 md:border-r md:border-gray-200 dark:md:border-gray-700">
                            <div className="flex items-center mb-4">
                                <div className="bg-[#16A085]/10 p-2 rounded-lg mr-4">
                                    <BellRing className="w-6 h-6 text-[#16A085]" />
                                </div>
                                <h3 className="font-bold text-[#16A085] dark:text-white text-xl">Get More Deals</h3>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
                                Subscribe to our newsletter for exclusive deals and promotions. Be the first to know about new savings opportunities and never miss a great deal again!
                            </p>
                        </div>

                        <div className="newsletter-wrapper md:w-3/5 md:pl-4">
                            <div className="max-w-xl">
                                <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3">Join our community of smart shoppers</h4>
                                <NewsletterSubscribe compact={true} />
                                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                                    We respect your privacy and will never share your email with third parties. You can unsubscribe at any time.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
} 
'use client';

import { motion } from 'framer-motion';
import { Edit, Save, X } from 'lucide-react';
import React, { useEffect } from 'react';

import ProductForm from '@/components/dashboard/products/ProductForm';
import type { ProductInfo } from '@/types/api';

// Extended ProductOffer type to handle additional fields
type ExtendedProductOffer = {
    condition: string;
    price: number;
    currency: string;
    availability: string;
    merchant_name: string;
    is_prime: boolean;
    original_price?: number;
    savings?: number;
    savings_percentage?: number;
    coupon_type?: "percentage" | "fixed" | null;
    coupon_value?: number;
    commission?: string;
};

interface EditProductFormProps {
    asin: string;
    initialData: ProductInfo;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({
    asin,
    initialData,
    onSuccess,
    onCancel
}) => {
    // Add ESC key functionality
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && onCancel) {
                event.preventDefault();
                onCancel();
            }
        };

        // Add event listener
        document.addEventListener('keydown', handleKeyDown);

        // Cleanup
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onCancel]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Edit Mode Indicator */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
            >
                <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center"
                >
                    <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </motion.div>
                <div>
                    <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Edit Mode Enabled
                    </h3>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                        Editing product {asin}, changes will be saved automatically
                    </p>
                </div>
            </motion.div>

            {/* Operation Tips */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Save className="w-4 h-4" />
                    <span>Auto-save enabled</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <X className="w-4 h-4" />
                    <span>Press ESC to cancel</span>
                </div>
            </motion.div>

            {/* Product Form */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
            >
                <ProductForm
                    mode="edit"
                    asin={asin}
                    initialData={{
                        ...initialData,
                        source: (initialData.source === 'manual' ? 'coupon' : initialData.source as "coupon" | "discount") || "coupon",
                        api_provider: (initialData.api_provider === 'manual' ? 'amazon' : initialData.api_provider as "amazon" | "walmart" | "bestbuy" | "target" | "ebay" | "pa-api" | "cj-api") || "amazon",
                        offers: initialData.offers?.map((offer): ExtendedProductOffer => ({
                            condition: offer.condition || "New",
                            price: offer.price || 0,
                            currency: offer.currency || "USD",
                            availability: offer.availability || "In Stock",
                            merchant_name: offer.merchant_name || "Amazon.com",
                            is_prime: offer.is_prime || false,
                            original_price: (offer as ExtendedProductOffer).original_price || undefined,
                            savings: (offer as ExtendedProductOffer).savings || undefined,
                            savings_percentage: (offer as ExtendedProductOffer).savings_percentage || undefined,
                            coupon_type: (offer as ExtendedProductOffer).coupon_type || undefined,
                            coupon_value: (offer as ExtendedProductOffer).coupon_value || undefined,
                            commission: typeof (offer as ExtendedProductOffer).commission === 'string' ? (offer as ExtendedProductOffer).commission : undefined
                        })) || []
                    }}
                    onSuccess={onSuccess}
                    onCancel={onCancel}
                />
            </motion.div>
        </motion.div>
    );
};

export default EditProductForm; 
'use client';

import { motion } from 'framer-motion';
import React from 'react';

import ProductForm from '@/components/dashboard/products/ProductForm';

const ManualProductForm: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Product form */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
            >
                <ProductForm
                    mode="add"
                />
            </motion.div>
        </motion.div>
    );
};

export default ManualProductForm;
'use client';

import { Card, CardHeader, CardBody, Button, Progress, Chip } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Package, AlertCircle, CheckCircle, RefreshCw, Home, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import EditProductForm from '@/components/dashboard/products/EditProductForm';
import { showErrorToast, showSuccessToast } from '@/lib/toast';
import type { ProductInfo } from '@/types/api';

interface EditProductContentProps {
    asin: string;
}

// Loading skeleton component
const LoadingSkeleton = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
    >
        {/* Title skeleton */}
        <div className="space-y-3">
            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse" style={{ backgroundSize: '200% 100%' }} />
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/3 animate-pulse" style={{ backgroundSize: '200% 100%' }} />
        </div>

        {/* Form area skeleton */}
        <Card className="overflow-hidden">
            <CardHeader className="space-y-3">
                <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" style={{ backgroundSize: '200% 100%' }} />
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-2/3 animate-pulse" style={{ backgroundSize: '200% 100%' }} />
            </CardHeader>
            <CardBody className="space-y-4">
                {['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4', 'skeleton-5', 'skeleton-6'].map((key) => (
                    <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="h-14 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse" style={{ backgroundSize: '200% 100%' }} />
                        <div className="h-14 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse" style={{ backgroundSize: '200% 100%' }} />
                    </div>
                ))}
            </CardBody>
        </Card>
    </motion.div>
);

// Error state component
const ErrorState = ({ error, onRetry, onBack }: { error: string; onRetry: () => void; onBack: () => void }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[400px] space-y-6"
    >
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative"
        >
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
            >
                <span className="text-white text-xs font-bold">!</span>
            </motion.div>
        </motion.div>

        <div className="text-center space-y-2 max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Failed to Load Product
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
                {error}
            </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
            <Button
                color="primary"
                variant="solid"
                startContent={<RefreshCw className="w-4 h-4" />}
                onPress={onRetry}
                className="min-w-[120px]"
            >
                Retry Loading
            </Button>
            <Button
                color="default"
                variant="bordered"
                startContent={<ArrowLeft className="w-4 h-4" />}
                onPress={onBack}
                className="min-w-[120px]"
            >
                Back to List
            </Button>
        </div>
    </motion.div>
);

// Breadcrumb navigation component
const Breadcrumb = ({ asin }: { asin: string }) => (
    <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6"
    >
        <Home className="w-4 h-4" />
        <span>/</span>
        <span className="hover:text-primary cursor-pointer transition-colors">
            Dashboard
        </span>
        <span>/</span>
        <span className="hover:text-primary cursor-pointer transition-colors">
            Product Management
        </span>
        <span>/</span>
        <Chip size="sm" variant="flat" color="primary">
            Edit {asin}
        </Chip>
    </motion.nav>
);

// Success indicator
const SuccessIndicator = ({ show }: { show: boolean }) => (
    <AnimatePresence>
        {show && (
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                className="fixed bottom-6 right-6 z-50"
            >
                <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Product updated successfully!</span>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

export default function EditProductContent({ asin }: EditProductContentProps) {
    const router = useRouter();
    const [productData, setProductData] = useState<ProductInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);

    // Simulate loading progress
    useEffect(() => {
        if (isLoading) {
            const interval = setInterval(() => {
                setLoadingProgress(prev => {
                    if (prev >= 90) return prev;

                    return prev + Math.random() * 15;
                });
            }, 200);

            return () => clearInterval(interval);
        } else {
            setLoadingProgress(100);
        }
    }, [isLoading]);

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                setLoadingProgress(0);

                // Simulate network delay to show loading animation
                await new Promise(resolve => setTimeout(resolve, 500));

                const response = await fetch(`/api/products/${asin}`);

                if (!response.ok) {
                    throw new Error(`Loading failed: ${response.status}`);
                }

                const data = await response.json();
                let productInfo = null;

                if (data.asin === asin) {
                    productInfo = data;
                } else if (data.data && data.data.asin === asin) {
                    productInfo = data.data;
                }

                if (productInfo && productInfo.asin === asin) {
                    setProductData(productInfo);
                } else {
                    throw new Error(`Product with ASIN ${asin} not found`);
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to load product data';

                setError(errorMessage);
                showErrorToast({
                    title: 'Error',
                    description: errorMessage
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (asin) {
            fetchProductData();
        }
    }, [asin]);

    const handleSuccess = () => {
        setShowSuccess(true);
        showSuccessToast({
            title: 'Success!',
            description: 'Product information has been updated'
        });

        // Auto-hide success indicator after 3 seconds
        setTimeout(() => {
            setShowSuccess(false);
        }, 3000);

        // Delayed return to product list page
        setTimeout(() => {
            router.push('/dashboard/products');
        }, 1500);
    };

    const handleCancel = () => {
        router.push('/dashboard/products');
    };

    const handleRetry = () => {
        setError(null);
        setIsLoading(true);
        // Trigger reload
        const event = new Event('retry');

        window.dispatchEvent(event);
    };

    const handleBack = () => {
        router.push('/dashboard/products');
    };

    return (
        <div className="space-y-6">
            {/* Breadcrumb navigation */}
            <Breadcrumb asin={asin} />

            {/* Back button and title */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center space-x-4">
                    <Button
                        isIconOnly
                        variant="bordered"
                        onPress={handleBack}
                        className="shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                            <Package className="w-6 h-6 text-primary" />
                            <span>Edit Product</span>
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Modify product information and save changes
                        </p>
                    </div>
                </div>

                {/* Settings button */}
                <Button
                    variant="light"
                    isIconOnly
                    className="text-gray-500 hover:text-primary"
                >
                    <Settings className="w-5 h-5" />
                </Button>
            </motion.div>

            {/* Loading progress bar */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <Progress
                            value={loadingProgress}
                            className="w-full"
                            color="primary"
                            size="sm"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main content area */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                {isLoading ? (
                    <LoadingSkeleton />
                ) : error ? (
                    <ErrorState error={error} onRetry={handleRetry} onBack={handleBack} />
                ) : productData ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between w-full">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            Product Information Editor
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            ASIN: {asin}
                                        </p>
                                    </div>
                                    <Chip
                                        size="sm"
                                        color="success"
                                        variant="flat"
                                        startContent={<Package className="w-3 h-3" />}
                                    >
                                        Loaded
                                    </Chip>
                                </div>
                            </CardHeader>
                            <CardBody className="p-6">
                                <EditProductForm
                                    asin={asin}
                                    initialData={productData}
                                    onSuccess={handleSuccess}
                                    onCancel={handleCancel}
                                />
                            </CardBody>
                        </Card>
                    </motion.div>
                ) : null}
            </motion.div>

            {/* Success indicator */}
            <SuccessIndicator show={showSuccess} />
        </div>
    );
} 
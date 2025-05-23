'use client';

import { Card, CardHeader, CardBody, Button, Progress, Chip } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Package, Sparkles, CheckCircle, Settings, Layers, Target } from 'lucide-react';
import { useState } from 'react';

import ManualProductForm from '@/components/dashboard/products/ManualProductForm';

// Floating animation configuration
const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
    }
};

const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
    }
};

// Decorative background component
const DecorativeBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient background spheres */}
        <motion.div
            animate={{ ...floatingAnimation, x: [0, 20, 0] }}
            className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl"
        />
        <motion.div
            animate={{ ...floatingAnimation, x: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-20 -left-20 w-32 h-32 bg-gradient-to-tr from-success/20 to-warning/20 rounded-full blur-2xl"
        />

        {/* Decorative grid */}
        <div className="absolute inset-0 bg-grid-gray-100/50 dark:bg-grid-gray-800/50 bg-[size:20px_20px] opacity-30" />
    </div>
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
                    <span className="font-medium">Product added successfully!</span>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

// Status indicators component with anchor functionality
const StatusIndicators = () => {
    const indicators = [
        {
            icon: Package,
            label: 'Product Info',
            color: 'primary',
            delay: 0.1,
            anchor: 'basic-information'
        },
        {
            icon: Layers,
            label: 'Categories',
            color: 'secondary',
            delay: 0.2,
            anchor: 'additional-information'
        },
        {
            icon: Target,
            label: 'Pricing',
            color: 'success',
            delay: 0.3,
            anchor: 'offers-information'
        },
    ];

    const scrollToSection = (anchor: string) => {
        const element = document.getElementById(anchor);

        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    return (
        <div className="flex justify-center space-x-4 mb-8">
            {indicators.map((item) => (
                <motion.button
                    key={item.anchor}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: item.delay }}
                    className="flex flex-col items-center space-y-2 cursor-pointer group"
                    onClick={() => scrollToSection(item.anchor)}
                >
                    <motion.div
                        animate={pulseAnimation}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-12 h-12 rounded-full bg-${item.color}/10 group-hover:bg-${item.color}/20 flex items-center justify-center transition-colors duration-200`}
                    >
                        <item.icon className={`w-6 h-6 text-${item.color}`} />
                    </motion.div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors duration-200">
                        {item.label}
                    </span>
                </motion.button>
            ))}
        </div>
    );
};

// Hero section component
const HeroSection = () => (
    <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8 p-8 rounded-2xl bg-gradient-to-br from-primary/5 via-secondary/5 to-success/5 overflow-hidden"
    >
        <DecorativeBackground />

        <div className="relative z-10 text-center">
            {/* Main title */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex items-center justify-center space-x-3 mb-4"
            >
                <motion.div
                    animate={floatingAnimation}
                    className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg"
                >
                    <Plus className="w-8 h-8 text-white" />
                </motion.div>
                <motion.div
                    animate={{ ...floatingAnimation, y: [0, -5, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="w-8 h-8 bg-warning rounded-full flex items-center justify-center"
                >
                    <Sparkles className="w-4 h-4 text-white" />
                </motion.div>
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3"
            >
                Add Product Manually
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto"
            >
                Fill in detailed information to create a new product record
            </motion.p>

            {/* Decorative tags */}
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="flex justify-center space-x-2 mt-6"
            >
                <Chip size="sm" color="primary" variant="flat">
                    Quick Add
                </Chip>
                <Chip size="sm" color="secondary" variant="flat">
                    Professional
                </Chip>
                <Chip size="sm" color="success" variant="flat">
                    Efficient
                </Chip>
            </motion.div>
        </div>
    </motion.div>
);

// Simplified action bar component
const ActionBar = () => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between mb-6"
    >
        <div className="flex items-center space-x-3">
            <Button
                variant="light"
                isIconOnly
                className="text-gray-500 hover:text-primary"
            >
                <Settings className="w-5 h-5" />
            </Button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
                Product Management / Manual Add
            </span>
        </div>
    </motion.div>
);

export default function ManualProductContent() {
    const [showSuccess, setShowSuccess] = useState(false);
    const [formProgress, setFormProgress] = useState(0);

    const _handleSuccess = () => {
        setShowSuccess(true);
        setFormProgress(100);

        // Auto-hide success indicator after 3 seconds
        setTimeout(() => {
            setShowSuccess(false);
            setFormProgress(0);
        }, 3000);
    };

    return (
        <div className="space-y-6">
            {/* Hero section */}
            <HeroSection />

            {/* Action bar */}
            <ActionBar />

            {/* Status indicators with anchor functionality */}
            <StatusIndicators />

            {/* Progress bar */}
            <AnimatePresence>
                {formProgress > 0 && formProgress < 100 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <Progress
                            value={formProgress}
                            className="w-full"
                            color="primary"
                            size="sm"
                            label="Form Completion"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main form area */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
            >
                <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-3">
                                <motion.div
                                    animate={pulseAnimation}
                                    className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center"
                                >
                                    <Package className="w-5 h-5 text-primary" />
                                </motion.div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Product Information Form
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Please fill in complete product details
                                    </p>
                                </div>
                            </div>

                        </div>
                    </CardHeader>

                    <CardBody className="p-8">
                        <ManualProductForm />
                    </CardBody>
                </Card>
            </motion.div>

            {/* Success indicator */}
            <SuccessIndicator show={showSuccess} />
        </div>
    );
} 
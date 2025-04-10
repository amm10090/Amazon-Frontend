"use client";

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    message?: string;
}

export default function LoadingSpinner({
    size = 'md',
    className = '',
    message = 'Loading...'
}: LoadingSpinnerProps) {
    const sizeMap = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    };

    const textSizeMap = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-xl'
    };

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className={`border-4 border-primary/30 border-t-primary rounded-full ${sizeMap[size]}`}
            />
            {message && (
                <p className={`mt-3 text-gray-500 ${textSizeMap[size]}`}>
                    {message}
                </p>
            )}
        </div>
    );
} 
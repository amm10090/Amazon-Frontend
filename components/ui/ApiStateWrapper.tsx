"use client";

import { motion } from 'framer-motion';
import React from 'react';

import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';

interface ApiStateWrapperProps<T> {
    isLoading: boolean;
    isError: boolean;
    isEmpty?: boolean;
    data: T | undefined;
    error?: Error;
    loadingMessage?: string;
    emptyMessage?: string;
    onRetry?: (() => void) | undefined;
    children: (data: T) => React.ReactNode;
}

export default function ApiStateWrapper<T>({
    isLoading,
    isError,
    isEmpty = false,
    data,
    error,
    loadingMessage = "正在加载数据...",
    emptyMessage = "没有找到数据",
    onRetry,
    children
}: ApiStateWrapperProps<T>) {
    if (isLoading) {
        return (
            <div className="w-full py-12">
                <LoadingSpinner size="lg" message={loadingMessage} />
            </div>
        );
    }

    if (isError) {
        return (
            <ErrorMessage
                message="加载失败"
                details={error?.message || "请检查网络连接并重试"}
                onRetry={onRetry}
            />
        );
    }

    if (isEmpty || !data) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full py-16 flex flex-col items-center justify-center text-center"
            >
                <div className="w-20 h-20 mb-6 text-gray-300">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                    </svg>
                </div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-600">{emptyMessage}</h2>
                {onRetry && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onRetry}
                        className="mt-4 px-6 py-3 bg-primary text-white rounded-full shadow-md hover:shadow-lg transition-all"
                    >
                        刷新
                    </motion.button>
                )}
            </motion.div>
        );
    }

    return <>{children(data)}</>;
} 
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ApiDebuggerProps {
    data: any;
    title?: string;
    initialExpanded?: boolean;
}

export default function ApiDebugger({
    data,
    title = "API 数据",
    initialExpanded = false
}: ApiDebuggerProps) {
    const [isExpanded, setIsExpanded] = useState(initialExpanded);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="my-4 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div
                className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                onClick={toggleExpanded}
            >
                <h3 className="text-sm font-medium text-gray-700">{title}</h3>
                <button className="text-gray-500 focus:outline-none">
                    {isExpanded ? '收起' : '展开'}
                </button>
            </div>

            {isExpanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-100 p-4 overflow-auto"
                    style={{ maxHeight: '400px' }}
                >
                    <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </motion.div>
            )}
        </div>
    );
} 
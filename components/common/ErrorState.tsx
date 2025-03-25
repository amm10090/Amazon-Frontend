import React from 'react';

interface ErrorStateProps {
    message: string;
    error?: Error | string;
    retry?: () => void;
}

/**
 * 错误状态组件
 * 显示错误信息和重试按钮
 */
const ErrorState: React.FC<ErrorStateProps> = ({
    message,
    error,
    retry
}) => {
    // 格式化错误信息
    const errorMessage = error
        ? typeof error === 'string'
            ? error
            : error.message || 'Unknown error'
        : 'Unknown error';

    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-red-100 bg-red-50 p-8 text-center">
            {/* 错误图标 */}
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg
                    className="h-8 w-8 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            </div>

            {/* 错误标题 */}
            <h3 className="mb-2 text-lg font-medium text-red-800">{message}</h3>

            {/* 错误详情 */}
            <p className="mb-6 max-w-md text-red-600">{errorMessage}</p>

            {/* 重试按钮 */}
            {retry && (
                <button
                    onClick={retry}
                    className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                    Retry
                </button>
            )}
        </div>
    );
};

export default ErrorState; 
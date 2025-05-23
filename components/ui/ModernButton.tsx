'use client';

import { motion } from 'framer-motion';
import React from 'react';

import { buttonVariants } from '@/lib/animations';

interface ModernButtonProps {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

const ModernButton: React.FC<ModernButtonProps> = ({
    variant = 'primary',
    size = 'md',
    children,
    onClick,
    disabled = false,
    loading = false,
    className = '',
    icon,
    iconPosition = 'left',
    fullWidth = false,
    type = 'button',
}) => {
    // 基础样式类
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 relative overflow-hidden';

    // 尺寸样式
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm gap-1.5',
        md: 'px-4 py-2 text-sm gap-2',
        lg: 'px-6 py-3 text-base gap-2.5',
    };

    // 变体样式
    const variantClasses = {
        primary: 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500 shadow-sm hover:shadow-md',
        secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 border border-gray-300',
        ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm hover:shadow-md',
    };

    // 禁用状态样式
    const disabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none';

    // 全宽样式
    const widthClasses = fullWidth ? 'w-full' : '';

    // 组合所有样式类
    const combinedClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${disabled || loading ? disabledClasses : ''}
    ${widthClasses}
    ${className}
  `.trim();

    // 加载动画
    const LoadingSpinner = () => (
        <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
        </motion.div>
    );

    // 渲染图标
    const renderIcon = () => {
        if (!icon) return null;

        return (
            <motion.span
                className={`${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
                initial={false}
                animate={{ opacity: loading ? 0 : 1 }}
            >
                {icon}
            </motion.span>
        );
    };

    // 渲染内容
    const renderContent = () => (
        <motion.span
            className={`${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200 flex items-center gap-inherit`}
            initial={false}
            animate={{ opacity: loading ? 0 : 1 }}
        >
            {iconPosition === 'left' && renderIcon()}
            {children}
            {iconPosition === 'right' && renderIcon()}
        </motion.span>
    );

    return (
        <motion.button
            type={type}
            className={combinedClasses}
            onClick={onClick}
            disabled={disabled || loading}
            variants={buttonVariants}
            initial="initial"
            whileHover={!disabled && !loading ? "hover" : undefined}
            whileTap={!disabled && !loading ? "tap" : undefined}
        >
            {loading && <LoadingSpinner />}
            {renderContent()}
        </motion.button>
    );
};

// 预定义的按钮组件
export const ActionButton: React.FC<Omit<ModernButtonProps, 'variant'> & { variant?: 'view' | 'edit' | 'delete' }> = ({
    variant = 'view',
    ...props
}) => {
    const variantMap = {
        view: 'ghost' as const,
        edit: 'secondary' as const,
        delete: 'danger' as const,
    };

    return <ModernButton variant={variantMap[variant]} size="sm" {...props} />;
};

// 图标按钮
export const IconButton: React.FC<Omit<ModernButtonProps, 'children'> & {
    icon: React.ReactNode;
    'aria-label': string;
}> = ({ icon, ...props }) => {
    return (
        <ModernButton {...props} className={`!p-2 ${props.className || ''}`}>
            {icon}
        </ModernButton>
    );
};

// 链接样式按钮
export const LinkButton: React.FC<ModernButtonProps> = (props) => {
    return (
        <ModernButton
            {...props}
            variant="ghost"
            className={`!p-0 !bg-transparent hover:!bg-transparent text-blue-600 hover:text-blue-800 underline ${props.className || ''}`}
        />
    );
};

export default ModernButton; 
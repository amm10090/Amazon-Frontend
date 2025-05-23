'use client';

import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

import {
    fadeInVariants,
    itemVariants,
    cardVariants,
    containerVariants,
    slideInFromTopVariants,
    modalVariants,
    backdropVariants,
} from '@/lib/animations';

// 动画容器组件
interface AnimatedContainerProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    stagger?: boolean;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
    children,
    className = '',
    delay = 0,
    stagger = false,
}) => {
    return (
        <motion.div
            className={className}
            variants={stagger ? containerVariants : fadeInVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ delay }}
        >
            {children}
        </motion.div>
    );
};

// 动画列表项组件
interface AnimatedItemProps {
    children: React.ReactNode;
    className?: string;
    index?: number;
    hover?: boolean;
}

export const AnimatedItem: React.FC<AnimatedItemProps> = ({
    children,
    className = '',
    index = 0,
    hover = true,
}) => {
    return (
        <motion.div
            className={className}
            variants={itemVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            whileHover={hover ? "hover" : undefined}
            transition={{ delay: index * 0.05 }}
        >
            {children}
        </motion.div>
    );
};

// 动画卡片组件
interface AnimatedCardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    clickable?: boolean;
    onClick?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
    children,
    className = '',
    hover = true,
    clickable = false,
    onClick,
}) => {
    return (
        <motion.div
            className={`${className} ${clickable ? 'cursor-pointer' : ''}`}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover={hover ? "hover" : undefined}
            whileTap={clickable ? "tap" : undefined}
            onClick={onClick}
        >
            {children}
        </motion.div>
    );
};

// 淡入动画组件
interface FadeInProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
}

export const FadeIn: React.FC<FadeInProps> = ({
    children,
    className = '',
    delay = 0,
    duration = 0.3,
}) => {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration, delay }}
        >
            {children}
        </motion.div>
    );
};

// 滑入动画组件
interface SlideInProps {
    children: React.ReactNode;
    className?: string;
    direction?: 'up' | 'down' | 'left' | 'right';
    delay?: number;
    distance?: number;
}

export const SlideIn: React.FC<SlideInProps> = ({
    children,
    className = '',
    direction = 'up',
    delay = 0,
    distance = 20,
}) => {
    const getInitialPosition = () => {
        switch (direction) {
            case 'up':
                return { y: distance };
            case 'down':
                return { y: -distance };
            case 'left':
                return { x: distance };
            case 'right':
                return { x: -distance };
            default:
                return { y: distance };
        }
    };

    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, ...getInitialPosition() }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, ...getInitialPosition() }}
            transition={{ duration: 0.3, delay }}
        >
            {children}
        </motion.div>
    );
};

// 缩放动画组件
interface ScaleInProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    scale?: number;
}

export const ScaleIn: React.FC<ScaleInProps> = ({
    children,
    className = '',
    delay = 0,
    scale = 0.8,
}) => {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, scale }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale }}
            transition={{ duration: 0.3, delay }}
        >
            {children}
        </motion.div>
    );
};

// 动画模态框组件
interface AnimatedModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

export const AnimatedModal: React.FC<AnimatedModalProps> = ({
    isOpen,
    onClose,
    children,
    className = '',
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* 背景遮罩 */}
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-40"
                        variants={backdropVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        onClick={onClose}
                    />

                    {/* 模态框内容 */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            className={`bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto ${className}`}
                            variants={modalVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {children}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

// 弹出提示组件
interface PopoverProps {
    isOpen: boolean;
    children: React.ReactNode;
    className?: string;
}

export const AnimatedPopover: React.FC<PopoverProps> = ({
    isOpen,
    children,
    className = '',
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className={className}
                    variants={slideInFromTopVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// 加载状态包装器
interface AnimatedLoadingWrapperProps {
    isLoading: boolean;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    className?: string;
}

export const AnimatedLoadingWrapper: React.FC<AnimatedLoadingWrapperProps> = ({
    isLoading,
    children,
    fallback,
    className = '',
}) => {
    return (
        <div className={className}>
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {fallback}
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// 列表动画包装器
interface AnimatedListProps {
    children: React.ReactNode[];
    className?: string;
    itemClassName?: string;
    staggerDelay?: number;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
    children,
    className = '',
    itemClassName = '',
    staggerDelay = 0.05,
}) => {
    return (
        <motion.div
            className={className}
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            {React.Children.map(children, (child, index) => (
                <motion.div
                    key={React.isValidElement(child) && child.key ? child.key : `item-${Date.now()}-${Math.random()}`}
                    className={itemClassName}
                    variants={itemVariants}
                    transition={{ delay: index * staggerDelay }}
                >
                    {child}
                </motion.div>
            ))}
        </motion.div>
    );
};

// 悬停放大组件
interface HoverScaleProps {
    children: React.ReactNode;
    className?: string;
    scale?: number;
    duration?: number;
}

export const HoverScale: React.FC<HoverScaleProps> = ({
    children,
    className = '',
    scale = 1.05,
    duration = 0.2,
}) => {
    return (
        <motion.div
            className={className}
            whileHover={{ scale }}
            transition={{ duration }}
        >
            {children}
        </motion.div>
    );
};

// 点击波纹效果组件
interface ClickRippleProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const ClickRipple: React.FC<ClickRippleProps> = ({
    children,
    className = '',
    onClick,
}) => {
    return (
        <motion.div
            className={`relative overflow-hidden ${className}`}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
        >
            {children}
        </motion.div>
    );
};

const AnimatedElements = {
    AnimatedContainer,
    AnimatedItem,
    AnimatedCard,
    FadeIn,
    SlideIn,
    ScaleIn,
    AnimatedModal,
    AnimatedPopover,
    AnimatedLoadingWrapper,
    AnimatedList,
    HoverScale,
    ClickRipple,
};

export default AnimatedElements; 
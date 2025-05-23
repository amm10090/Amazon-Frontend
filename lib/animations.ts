/**
 * 统一动画配置文件
 * 定义项目中使用的所有动画变体和时间常量
 * 采用Notion/Linear风格的极简动画
 */

import type { Variants } from 'framer-motion';

// 动画时间常量
export const ANIMATION_DURATION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  page: 0.4,
} as const;

// 缓动函数
export const EASING = {
  ease: [0.4, 0.0, 0.2, 1],
  easeIn: [0.4, 0.0, 1, 1],
  easeOut: [0.0, 0.0, 0.2, 1],
  easeInOut: [0.4, 0.0, 0.2, 1],
} as const;

// 页面级动画
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.page,
      ease: EASING.easeOut,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeIn,
    },
  },
};

// 容器动画（用于列表项）
export const containerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
};

// 列表项动画
export const itemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.95,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeIn,
    },
  },
  hover: {
    y: -2,
    scale: 1.01,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeOut,
    },
  },
};

// 卡片动画
export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.easeOut,
    },
  },
  hover: {
    y: -4,
    scale: 1.02,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeOut,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: EASING.easeInOut,
    },
  },
};

// 按钮动画
export const buttonVariants: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeOut,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: EASING.easeInOut,
    },
  },
};

// 模态框动画
export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeIn,
    },
  },
};

// 背景遮罩动画
export const backdropVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeIn,
    },
  },
};

// 淡入动画
export const fadeInVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeIn,
    },
  },
};

// 滑入动画（从上方）
export const slideInFromTopVariants: Variants = {
  initial: {
    opacity: 0,
    y: -20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeIn,
    },
  },
};

// 加载动画
export const loadingVariants: Variants = {
  initial: {
    opacity: 0.3,
    scale: 0.8,
  },
  animate: {
    opacity: [0.3, 0.8, 0.3],
    scale: [0.8, 1, 0.8],
    transition: {
      duration: 1.5,
      ease: EASING.easeInOut,
      repeat: Infinity,
    },
  },
};

// 骨架屏动画
export const skeletonVariants: Variants = {
  initial: {
    opacity: 0.4,
  },
  animate: {
    opacity: [0.4, 0.8, 0.4],
    transition: {
      duration: 1.2,
      ease: EASING.easeInOut,
      repeat: Infinity,
    },
  },
};

// 表格行动画
export const tableRowVariants: Variants = {
  initial: {
    opacity: 0,
    x: -10,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.easeOut,
    },
  },
  hover: {
    backgroundColor: '#f8fafc',
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeOut,
    },
  },
}; 
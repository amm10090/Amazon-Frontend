import { addToast, type ToastProps } from "@heroui/react";
/**
 * 成功提示样式
 */
const successToastStyles = {
    base: 'bg-green-500 rounded-lg shadow-md',
    title: 'text-white font-semibold',
    description: 'text-white opacity-90',
    content: 'flex items-center gap-2 py-2',
    icon: 'text-white h-5 w-5',
};

/**
 * 错误提示样式
 */
const errorToastStyles = {
    base: 'bg-red-500 rounded-lg shadow-md',
    title: 'text-white font-semibold',
    description: 'text-white opacity-90',
    content: 'flex items-center gap-2 py-2',
    icon: 'text-white h-5 w-5',
};

/**
 * 警告提示样式
 */
const warningToastStyles = {
    base: 'bg-yellow-500 rounded-lg shadow-md',
    title: 'text-white font-semibold',
    description: 'text-white opacity-90',
    content: 'flex items-center gap-2 py-2',
    icon: 'text-white h-5 w-5',
};

/**
 * 信息提示样式
 */
const infoToastStyles = {
    base: 'bg-blue-500 rounded-lg shadow-md',
    title: 'text-white font-semibold',
    description: 'text-white opacity-90',
    content: 'flex items-center gap-2 py-2',
    icon: 'text-white h-5 w-5',
};

/**
 * 默认超时设置
 */
const DEFAULT_TIMEOUT = {
    success: 5000,
    error: 8000,
    warning: 6000,
    info: 5000,
};

/**
 * Toast配置类型
 */
type ToastConfig = {
    title: string;
    description: string;
    timeout?: number;
    classNames?: Partial<ToastProps['classNames']>;
    [key: string]: unknown;
};

/**
 * 显示成功提示
 * @param config Toast配置
 */
export const showSuccessToast = (config: ToastConfig) => {
    addToast({
        timeout: DEFAULT_TIMEOUT.success,
        ...config,
        classNames: {
            ...successToastStyles,
            ...config.classNames,
        },
    });
};

/**
 * 显示错误提示
 * @param config Toast配置
 */
export const showErrorToast = (config: ToastConfig) => {
    addToast({
        timeout: DEFAULT_TIMEOUT.error,
        ...config,
        classNames: {
            ...errorToastStyles,
            ...config.classNames,
        },
    });
};

/**
 * 显示警告提示
 * @param config Toast配置
 */
export const showWarningToast = (config: ToastConfig) => {
    addToast({
        timeout: DEFAULT_TIMEOUT.warning,
        ...config,
        classNames: {
            ...warningToastStyles,
            ...config.classNames,
        },
    });
};

/**
 * 显示信息提示
 * @param config Toast配置
 */
export const showInfoToast = (config: ToastConfig) => {
    addToast({
        timeout: DEFAULT_TIMEOUT.info,
        ...config,
        classNames: {
            ...infoToastStyles,
            ...config.classNames,
        },
    });
};

/**
 * 根据类型显示提示
 * @param config Toast配置
 * @param type 提示类型
 */
export const showToast = (
    config: ToastConfig,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
) => {
    switch (type) {
        case 'success':
            showSuccessToast(config);
            break;
        case 'error':
            showErrorToast(config);
            break;
        case 'warning':
            showWarningToast(config);
            break;
        case 'info':
        default:
            showInfoToast(config);
            break;
    }
}; 
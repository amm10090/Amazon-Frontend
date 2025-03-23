import React from 'react';

import { getStoreFromUrl } from './utils';

interface StoreIdentifierProps {
    url: string;
    showName?: boolean;
    className?: string;
    align?: 'left' | 'right';
}

/**
 * 商店标识组件，用于显示商店图标和名称
 */
export const StoreIdentifier: React.FC<StoreIdentifierProps> = ({
    url,
    showName = true,
    className = '',
    align = 'left'
}) => {
    const store = getStoreFromUrl(url);

    if (store.name === 'Amazon') {
        return (
            <div className={`flex items-center ${align === 'right' ? 'justify-end' : ''} ${className.includes('mb-') ? '' : 'mb-2'} ${className}`}>
                {store.icon}
            </div>
        );
    } else if (store.icon) {
        return (
            <div className={`flex items-center ${align === 'right' ? 'justify-end' : ''} ${className.includes('mb-') ? '' : 'mb-2'} ${className}`}>
                <div
                    className="w-5 h-5 rounded-full flex items-center justify-center mr-1.5 flex-shrink-0"
                    style={{ backgroundColor: store.color }}
                >
                    {store.icon}
                </div>
                {showName && (
                    <span className="text-xs font-medium text-secondary dark:text-gray-400">
                        {store.name}
                    </span>
                )}
            </div>
        );
    }

    return null;
}; 
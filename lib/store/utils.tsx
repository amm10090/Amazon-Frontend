import { ReactNode } from 'react';
import { AmazonLogo, WalmartIcon, BestBuyIcon, GenericStoreIcon } from './icons';

export interface StoreInfo {
    name: string;
    color: string;
    icon: ReactNode;
}

/**
 * 根据产品URL判断商店来源
 * @param url 产品URL
 * @returns 商店信息，包括名称、颜色和图标
 */
export const getStoreFromUrl = (url: string): StoreInfo => {
    if (!url) return { name: 'Online Store', color: '#6c757d', icon: <GenericStoreIcon /> };

    if (url.includes('amazon.com')) {
        return {
            name: 'Amazon',
            color: '#FF9900',
            icon: <AmazonLogo />
        };
    }

    if (url.includes('walmart.com')) {
        return {
            name: 'Walmart',
            color: '#0071DC',
            icon: <WalmartIcon />
        };
    }

    if (url.includes('bestbuy.com')) {
        return {
            name: 'Best Buy',
            color: '#0046BE',
            icon: <BestBuyIcon />
        };
    }

    // 从URL中提取域名作为商店名称
    try {
        const domain = new URL(url).hostname.replace('www.', '');
        return {
            name: domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1),
            color: '#6c757d',
            icon: <GenericStoreIcon />
        };
    } catch {
        return {
            name: 'Online Store',
            color: '#6c757d',
            icon: <GenericStoreIcon />
        };
    }
}; 
import {
    Modal,
    ModalContent,
    ModalHeader,
    Input,
    Button,
    ScrollShadow
} from '@heroui/react';
import { debounce } from 'lodash';
import { Search } from 'lucide-react';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import useSWR from 'swr';

import { showErrorToast } from '@/lib/toast';
import { formatPrice } from '@/lib/utils';
import type { ComponentProduct } from '@/types';
import type { Product as ApiProduct, ListResponse } from '@/types/api';

import type { ProductAttributes } from './ProductBlot';

/**
 * 产品数据接口 (显式定义所需字段，并使其可选)
 */
interface Product { // 不再继承 ApiProduct，显式定义
    id?: string;
    title?: string;
    price?: number;
    main_image?: string;
    image_url?: string;
    image?: string; // 保持以防万一
    images?: string[];
    sku?: string;
    asin?: string;
    url?: string;
    cj_url?: string | null; // 允许 null
    brand?: string | null;
    original_price?: number | null;
    discount?: number | null;
    coupon_type?: 'percentage' | 'fixed' | null;
    coupon_value?: number | null;
    coupon_expiration_date?: string | null;
    is_prime?: boolean | null;
    is_free_shipping?: boolean | null;
    category?: string;
}

/**
 * 产品选择器模态框属性
 */
interface ProductPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProductSelect: (product: ComponentProduct) => void;
}

/**
 * 产品选择器模态框组件
 * 用于在富文本编辑器中选择和插入产品
 */
const ProductPickerModal: React.FC<ProductPickerModalProps> = ({
    isOpen,
    onClose,
    onProductSelect
}) => {
    // 产品列表和搜索状态
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // 新增：使用 SWR 获取数据
    const fetcher = async (url: string) => {
        const res = await fetch(url);

        if (!res.ok) {
            const error = new Error('An error occurred while fetching the data.');

            // Attach extra info to the error object.
            error.message = await res.text();
            throw error;
        }

        return res.json();
    };

    // 构建请求 URL - 始终调用 /api/search/products
    const apiUrl = `/api/search/products?keyword=${encodeURIComponent(debouncedSearchTerm || '')}&limit=50`; // 始终构建 URL，无搜索词时 keyword 为空

    const { data, error, isLoading } = useSWR<ApiResponse<ListResponse<ApiProduct>>>(apiUrl, fetcher, {
        revalidateOnFocus: false, // 聚焦时不重新验证
        dedupingInterval: 2000, // 2秒内重复请求去重
    });

    // 处理 SWR 错误
    useEffect(() => {
        if (error) {
            showErrorToast({
                title: 'Failed to fetch products',
                description: error.message || 'Unable to fetch product data'
            });
        }
    }, [error]);

    // 从 SWR 数据中提取产品列表 - 确保类型匹配
    const products: Product[] = data?.data?.items || [];

    // 新增：防抖处理搜索输入
    useEffect(() => {
        const handler = debounce(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms 防抖

        handler();

        // 清理函数
        return () => {
            handler.cancel();
        };
    }, [searchTerm]);

    // 处理产品选择 (传递所有需要的属性，使用修正后的字段名)
    const handleProductSelect = (product: Product) => {
        // 提取所有需要的属性，提供默认值
        const attributes: ProductAttributes = {
            id: product.id || product.asin || '',
            title: product.title || 'Unnamed Product',
            price: product.price || 0,
            image: product.main_image || product.image_url || product.images?.[0] || '/placeholder-product.jpg',
            asin: product.asin || '',
            style: 'card',
            url: product.url || '',
            cj_url: product.cj_url || '',
            brand: product.brand ?? null,
            originalPrice: product.original_price ?? null,
            discount: product.discount ?? null,
            couponType: product.coupon_type ?? null,
            couponValue: product.coupon_value ?? null,
            couponExpirationDate: product.coupon_expiration_date ?? null,
            isPrime: product.is_prime ?? null,
            isFreeShipping: product.is_free_shipping ?? null,
            category: product.category || ''
        };

        onProductSelect(attributes as ComponentProduct);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent className="min-w-[500px] max-w-[800px]">
                <ModalHeader>
                    <h3 className="text-lg font-medium">Select Product</h3>
                </ModalHeader>

                {/* 搜索框 */}
                <div className="relative mb-4">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by product name or SKU..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* 产品列表 */}
                <ScrollShadow className="h-[400px] pr-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <p>Loading...</p>
                        </div>
                    ) : products.length === 0 && debouncedSearchTerm ? (
                        <div className="flex justify-center items-center h-full">
                            <p>No products found</p>
                        </div>
                    ) : products.length === 0 && !debouncedSearchTerm ? (
                        <div className="flex justify-center items-center h-full">
                            <p>Please enter keywords to search products</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {products.map((product) => (
                                <button
                                    key={product.id || product.asin || product.sku || product.title || Math.random().toString()}
                                    className="border rounded-md p-3 cursor-pointer hover:border-primary transition-colors text-left"
                                    onClick={() => handleProductSelect(product)}
                                >
                                    <div className="aspect-square relative mb-2 bg-muted rounded-md overflow-hidden">
                                        <Image
                                            src={product.main_image || product.image_url || product.images?.[0] || '/placeholder-product.jpg'}
                                            alt={product.title || 'Product'}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <h3 className="font-medium text-sm line-clamp-1">{product.title || 'No Title'}</h3>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-sm font-semibold text-primary">
                                            {formatPrice(product.price || 0)}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {product.asin || product.sku}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollShadow>

                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="light" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </ModalContent>
        </Modal>
    );
};

export default ProductPickerModal;

interface ApiResponse<T> {
    status: boolean;
    message?: string;
    data: T;
    error?: string;
} 
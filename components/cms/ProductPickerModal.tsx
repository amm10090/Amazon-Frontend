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
import type { Product as ApiProduct, ListResponse } from '@/types/api';

import type { ProductAttributes } from './ProductBlot';

/**
 * 产品数据接口 (与 API 响应对齐)
 */
interface Product {
    id?: string; // 通常是 asin，使其可选以匹配 API 类型
    title: string;
    price?: number;
    main_image?: string; // 可能的图片字段
    image_url?: string; // 可能的图片字段
    image?: string; // 可能的图片字段
    sku?: string;
    asin?: string;
}

/**
 * 产品选择器模态框属性
 */
interface ProductPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProductSelect: (product: ProductAttributes) => void;
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

    // 构建请求 URL
    const apiUrl = debouncedSearchTerm
        ? `/api/search/products?keyword=${encodeURIComponent(debouncedSearchTerm)}&limit=50`
        : null; // 如果没有搜索词，则不请求

    const { data, error, isLoading } = useSWR<ApiResponse<ListResponse<ApiProduct>>>(apiUrl, fetcher, {
        revalidateOnFocus: false, // 聚焦时不重新验证
        dedupingInterval: 2000, // 2秒内重复请求去重
    });

    // 处理 SWR 错误
    useEffect(() => {
        if (error) {
            showErrorToast({
                title: '获取产品失败',
                description: error.message || '无法获取产品数据'
            });
        }
    }, [error]);

    // 从 SWR 数据中提取产品列表
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

    // 处理产品选择 (更新 image 和 asin 的获取方式)
    const handleProductSelect = (product: Product) => {
        // 优先使用 asin，其次是 sku，最后是 id，并提供后备空字符串
        const identifier = product.asin || product.sku || product.id || '';
        // 获取图片，考虑多种可能的字段名
        const productImage = product.main_image || product.image_url || product.image || '/placeholder-product.jpg';

        onProductSelect({
            id: identifier, // 使用确保为 string 的标识符
            title: product.title,
            price: product.price || 0, // 处理可能的 undefined
            image: productImage,
            asin: identifier // 使用确保为 string 的标识符
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent className="min-w-[500px] max-w-[800px]">
                <ModalHeader>
                    <h3 className="text-lg font-medium">选择产品</h3>
                </ModalHeader>

                {/* 搜索框 */}
                <div className="relative mb-4">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="搜索产品名称或SKU..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* 产品列表 */}
                <ScrollShadow className="h-[400px] pr-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <p>加载中...</p>
                        </div>
                    ) : products.length === 0 && debouncedSearchTerm ? (
                        <div className="flex justify-center items-center h-full">
                            <p>未找到产品</p>
                        </div>
                    ) : products.length === 0 && !debouncedSearchTerm ? (
                        <div className="flex justify-center items-center h-full">
                            <p>请输入关键词搜索产品</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {products.map((product) => (
                                <button
                                    key={product.id || product.asin || product.sku || product.title}
                                    className="border rounded-md p-3 cursor-pointer hover:border-primary transition-colors text-left"
                                    onClick={() => handleProductSelect(product)}
                                >
                                    <div className="aspect-square relative mb-2 bg-muted rounded-md overflow-hidden">
                                        <Image
                                            src={product.main_image || product.image_url || product.image || '/placeholder-product.jpg'}
                                            alt={product.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <h3 className="font-medium text-sm line-clamp-1">{product.title}</h3>
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
                        取消
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
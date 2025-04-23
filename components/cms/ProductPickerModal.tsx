import {
    Modal,
    ModalContent,
    ModalHeader,
    Input,
    Button,
    ScrollShadow
} from '@heroui/react';
import { Search } from 'lucide-react';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';

import { showErrorToast } from '@/lib/toast';
import { formatPrice } from '@/lib/utils';

import type { ProductAttributes } from './ProductBlot';

/**
 * 产品数据接口 
 */
interface Product {
    id: string;
    title: string;
    price: number;
    image: string;
    sku: string;
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
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 模拟从API获取产品数据
    useEffect(() => {
        if (isOpen) {
            fetchProducts();
        }
    }, [isOpen]);

    // 模拟获取产品数据的函数
    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            // 实际项目中，这里应该从API获取真实数据
            // 模拟API调用延迟
            await new Promise(resolve => setTimeout(resolve, 500));

            // 模拟产品数据
            const mockProducts: Product[] = [
                {
                    id: '1',
                    title: '高级机械键盘',
                    price: 799.99,
                    image: '/images/products/keyboard.jpg',
                    sku: 'KB-001'
                },
                {
                    id: '2',
                    title: '无线蓝牙耳机',
                    price: 299.99,
                    image: '/images/products/headphones.jpg',
                    sku: 'HP-002'
                },
                {
                    id: '3',
                    title: '超薄笔记本电脑',
                    price: 5999.99,
                    image: '/images/products/laptop.jpg',
                    sku: 'LP-003'
                },
                {
                    id: '4',
                    title: '智能手表',
                    price: 1299.99,
                    image: '/images/products/smartwatch.jpg',
                    sku: 'SW-004'
                },
                {
                    id: '5',
                    title: '无线充电器',
                    price: 159.99,
                    image: '/images/products/charger.jpg',
                    sku: 'CH-005'
                }
            ];

            setProducts(mockProducts);
        } catch {
            showErrorToast({
                title: '获取产品失败',
                description: '无法获取产品数据'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // 过滤产品基于搜索词
    const filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 处理产品选择
    const handleProductSelect = (product: Product) => {
        onProductSelect({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            sku: product.sku
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
                    ) : filteredProducts.length === 0 ? (
                        <div className="flex justify-center items-center h-full">
                            <p>未找到产品</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {filteredProducts.map((product) => (
                                <button
                                    key={product.id}
                                    className="border rounded-md p-3 cursor-pointer hover:border-primary transition-colors text-left"
                                    onClick={() => handleProductSelect(product)}
                                >
                                    <div className="aspect-square relative mb-2 bg-muted rounded-md overflow-hidden">
                                        <Image
                                            src={product.image}
                                            alt={product.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <h3 className="font-medium text-sm line-clamp-1">{product.title}</h3>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-sm font-semibold text-primary">
                                            {formatPrice(product.price)}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {product.sku}
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
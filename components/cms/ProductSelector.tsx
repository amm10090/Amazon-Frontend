'use client';

import {
    Modal,
    ModalContent,
    ModalHeader,
    Button,
    Input,
    Skeleton
} from '@heroui/react';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';

import { showErrorToast } from '@/lib/toast';

// 产品数据接口
export interface Product {
    id: string;
    title: string;
    description?: string;
    price: number;
    image?: string;
    sku?: string;
    createdAt?: string;
    updatedAt?: string;
}

// 组件属性接口
interface ProductSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (product: Product) => void;
}

// 产品选择器组件
export function ProductSelector({ isOpen, onClose, onSelect }: ProductSelectorProps) {
    // 状态管理
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // 加载产品数据
    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            // 这里应该从API获取产品数据
            // 示例：const response = await fetch('/api/products');
            // const data = await response.json();

            // 使用模拟数据进行开发
            const mockProducts: Product[] = [
                {
                    id: 'prod_1',
                    title: '智能手表 Pro',
                    description: '高级智能手表，支持心率监测、运动追踪等功能',
                    price: 1299,
                    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
                    sku: 'SW-PRO-01'
                },
                {
                    id: 'prod_2',
                    title: '无线蓝牙耳机',
                    description: '高清音质，降噪功能，长续航',
                    price: 499,
                    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
                    sku: 'BT-HP-02'
                },
                {
                    id: 'prod_3',
                    title: '超薄笔记本电脑',
                    description: '轻薄设计，高性能处理器，长续航',
                    price: 5999,
                    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853',
                    sku: 'NB-SL-03'
                },
                {
                    id: 'prod_4',
                    title: '智能家居套装',
                    description: '包含智能音箱、灯光控制、温度传感器等',
                    price: 1899,
                    image: 'https://images.unsplash.com/photo-1558403194-611308249627',
                    sku: 'SH-KT-04'
                },
                {
                    id: 'prod_5',
                    title: '专业相机三脚架',
                    description: '稳定性好，便携可折叠，适合专业摄影',
                    price: 349,
                    image: 'https://images.unsplash.com/photo-1516724562728-afc824a36e84',
                    sku: 'CM-TP-05'
                },
            ];

            setProducts(mockProducts);
            setFilteredProducts(mockProducts);
        } catch {
            showErrorToast({
                title: '获取产品失败',
                description: '无法获取产品数据'
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 初始加载
    useEffect(() => {
        if (isOpen) {
            fetchProducts();
        }
    }, [isOpen, fetchProducts]);

    // 搜索过滤
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredProducts(products);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = products.filter(product =>
                product.title.toLowerCase().includes(query) ||
                (product.sku && product.sku.toLowerCase().includes(query)) ||
                (product.description && product.description.toLowerCase().includes(query))
            );

            setFilteredProducts(filtered);
        }
    }, [searchQuery, products]);

    // 处理选择产品
    const handleSelectProduct = (product: Product) => {
        onSelect(product);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent className="sm:max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                <ModalHeader>
                    <h3 className="text-lg font-medium">选择产品</h3>
                </ModalHeader>

                {/* 搜索栏 */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="搜索产品名称或SKU..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* 产品列表 */}
                <div className="flex-1 overflow-y-auto pr-2">
                    {isLoading ? (
                        // 加载中状态
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4'].map((id) => (
                                <div key={id} className="flex border rounded-md p-3">
                                    <Skeleton className="w-16 h-16 rounded-md mr-3" />
                                    <div className="flex-1">
                                        <Skeleton className="h-4 w-3/4 mb-2" />
                                        <Skeleton className="h-3 w-1/4 mb-2" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        // 无结果状态
                        <div className="text-center py-8 text-gray-500">
                            没有找到匹配的产品
                        </div>
                    ) : (
                        // 产品列表
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredProducts.map((product) => (
                                <button
                                    key={product.id}
                                    className="flex items-center border rounded-md p-3 hover:bg-gray-50 text-left transition-colors"
                                    onClick={() => handleSelectProduct(product)}
                                >
                                    <div className="w-16 h-16 bg-gray-100 rounded-md mr-3 overflow-hidden relative flex-shrink-0">
                                        {product.image ? (
                                            <Image
                                                src={product.image}
                                                alt={product.title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                无图片
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-sm">{product.title}</h4>
                                        <div className="text-sm text-green-600">¥{product.price.toFixed(2)}</div>
                                        {product.sku && (
                                            <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 底部操作 */}
                <div className="mt-4 flex justify-end">
                    <Button variant="light" onClick={onClose} className="mr-2">
                        取消
                    </Button>
                    <Button color="primary" onClick={() => window.open('/dashboard/products/create', '_blank')}>
                        创建新产品
                    </Button>
                </div>
            </ModalContent>
        </Modal>
    );
} 
"use client";

import { useMemo } from 'react';

import Breadcrumb, { type BreadcrumbItem } from '@/components/ui/Breadcrumb';
import type { ComponentProduct } from '@/types';

import ProductImageGallery from './ProductImageGallery';
import ProductInfo from './ProductInfo';

export default function ProductClient({ product }: { product: ComponentProduct }) {
    // 根据产品类别生成面包屑导航
    const breadcrumbItems = useMemo(() => {
        const items: BreadcrumbItem[] = [
            { label: 'Home', href: '/' },
        ];

        if (product.category) {
            // 添加主要类别
            items.push({
                label: product.category,
                href: `/products?product_groups=${encodeURIComponent(product.category.toLowerCase())}`
            });

            // 如果是服装/舞蹈相关类别，添加子类别
            if (product.category.toLowerCase() === 'apparel' ||
                product.title.toLowerCase().includes('dance') ||
                product.title.toLowerCase().includes('舞蹈')) {
                items.push({
                    label: 'Dance Supplies',
                    href: `/products?product_groups=apparel&subcategory=dance`
                });
            }

            // 如果是电子产品类别，添加对应子类别
            if (product.category.toLowerCase() === 'electronics' ||
                product.category.toLowerCase() === '电子产品') {
                items.push({
                    label: 'Headphones',
                    href: `/products?product_groups=electronics&subcategory=headphones`
                });

                // 如果是无线耳机，添加子类别
                if (product.title.toLowerCase().includes('wireless') ||
                    product.title.toLowerCase().includes('无线')) {
                    items.push({
                        label: 'Wireless Headphones',
                        href: `/products?product_groups=electronics&subcategory=headphones&type=wireless`
                    });
                }
            }
        }

        return items;
    }, [product]);

    // 确保没有额外的渲染
    const cleanedProduct = useMemo(() => {
        // 创建一个新对象，避免直接修改原始数据
        return {
            ...product,
            // 确保任何可能导致零渲染的属性被正确处理
        };
    }, [product]);

    return (
        <div className="container mx-auto px-4">
            {/* 面包屑导航 */}
            <Breadcrumb items={breadcrumbItems} />

            {/* 产品详情卡片 */}
            <div className="product-container bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md mb-8 relative">
                {/* Prime徽章 - 移到整个商品卡片的右上角 */}
                {product.isPrime && (
                    <div className="absolute top-2 right-2 z-10">
                        <div className="bg-[#0574F7] text-white text-sm font-bold px-3 py-1 rounded-md">
                            Prime
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    {/* 产品图片画廊 */}
                    <div className="product-gallery p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
                        <ProductImageGallery product={cleanedProduct} />
                    </div>

                    {/* 产品信息 */}
                    <div className="product-info p-6 md:p-8">
                        <ProductInfo product={cleanedProduct} />
                    </div>
                </div>
            </div>
        </div >
    );
} 
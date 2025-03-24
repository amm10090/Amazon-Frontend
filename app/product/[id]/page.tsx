import Link from 'next/link';
import { Suspense } from 'react';

import { FeaturedDeals } from '@/components/ui/FeaturedDeals';
import { productsApi } from '@/lib/api';
import { adaptProducts } from '@/lib/utils';

import ProductClient from './ProductClient';

// 定义getProduct函数用于服务器端获取商品数据
async function getProduct(id: string) {
    try {
        const response = await productsApi.getProductById(id);

        return response.data?.data;
    } catch {
        return null;
    }
}

// 生成页面元数据
export async function generateMetadata({ params }: { params: { id: string } }) {
    const product = await getProduct(params.id);

    if (!product) {
        return {
            title: 'Product Not Found | OOHunt',
            description: 'The requested product could not be found.'
        };
    }

    return {
        title: `${product.title} | OOHunt`,
        description: product.description || `View details and pricing for ${product.title}`,
    };
}

// 主页面组件，使用async表示这是一个服务器组件
export default async function ProductPage({ params }: { params: { id: string } }) {
    const product = await getProduct(params.id);

    // 将API产品数据转换为组件使用的格式
    const adaptedProduct = product ? adaptProducts([product])[0] : null;

    if (!adaptedProduct) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                        Product Not Found
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Sorry, we couldn&apos;t find the product you were looking for. Please return to the homepage to continue browsing.
                    </p>
                    <Link
                        href="/"
                        className="inline-block bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary-dark transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* 商品详情主体 - 使用客户端组件包装器处理交互部分 */}
            <ProductClient product={adaptedProduct} />

            {/* 相似商品推荐 */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    You May Also Like
                </h2>
                <Suspense fallback={<div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
                    <FeaturedDeals limit={4} />
                </Suspense>
            </div>
        </div>
    );
} 
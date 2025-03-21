"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import { useProducts } from '@/lib/hooks';
import { ProductFilter } from '@/components/ui/ProductFilter';
import { Product } from '@/types/api';
import ApiStateWrapper from '@/components/ui/ApiStateWrapper';
import { adaptProductData } from '@/lib/utils';

// 排序方式映射
const sortMappings: Record<string, { sort: 'price' | 'discount' | 'created', order: 'asc' | 'desc' }> = {
    price_asc: { sort: 'price', order: 'asc' },
    price_desc: { sort: 'price', order: 'desc' },
    created_desc: { sort: 'created', order: 'desc' },
    discount_desc: { sort: 'discount', order: 'desc' }
};

export default function ProductsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [category, setCategory] = useState<string | undefined>(undefined);
    const [sortBy, setSortBy] = useState<string>("price_asc");
    const [page, setPage] = useState(1);
    const pageSize = 12;

    // 从sortBy获取sort和order参数
    const { sort, order } = sortMappings[sortBy] || sortMappings.price_asc;

    const {
        data: products,
        isLoading,
        isError,
        mutate
    } = useProducts({
        category,
        sort,
        order,
        page,
        limit: pageSize,
        product_type: 'all'
    });

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleFilter = (category: string | null, sort: string) => {
        setCategory(category || undefined);
        setSortBy(sort);
        setPage(1); // Reset to first page when filters change
    };

    // 产品列表渲染逻辑
    const renderProductList = (productData: Product[]) => {
        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {productData.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={adaptProductData(product)}
                            isNew={
                                new Date(product.created_at).getTime() >
                                Date.now() - 7 * 24 * 60 * 60 * 1000
                            }
                            showActions
                        />
                    ))}
                </div>

                {/* 分页控制 */}
                {Math.ceil((products?.length || 0) / pageSize) > 1 && (
                    <div className="mt-12 flex justify-center">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page <= 1}
                                className={`px-4 py-2 rounded-lg ${page <= 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-200 hover:bg-gray-300'
                                    }`}
                            >
                                上一页
                            </button>

                            <span className="px-4 py-2 bg-primary text-white rounded-lg">
                                {page}
                            </span>

                            <button
                                onClick={() => handlePageChange(page + 1)}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                            >
                                下一页
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">商品列表</h1>

            <ProductFilter
                onFilter={handleFilter}
                selectedCategory={category || null}
                selectedSort={sortBy}
            />

            <div className="mt-8">
                <ApiStateWrapper
                    isLoading={isLoading}
                    isError={!!isError}
                    isEmpty={products?.length === 0}
                    data={products}
                    error={isError as Error}
                    loadingMessage="正在加载商品数据..."
                    emptyMessage="没有找到符合条件的商品"
                    onRetry={mutate}
                >
                    {renderProductList}
                </ApiStateWrapper>
            </div>
        </div>
    );
}
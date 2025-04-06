import { type Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import { FeaturedDeals } from '@/components/ui/FeaturedDeals';
import { productsApi } from '@/lib/api';
import { adaptProducts } from '@/lib/utils';
import type { Product } from '@/types/api';

import ProductClient from './ProductClient';

type ProductPageProps = {
    params: Promise<{ id: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Function to fetch product data on the server
async function getProduct(id: string): Promise<Product | null> {
    if (!id) {
        return null;
    }

    try {
        // Check if ID is in ASIN format (10-13 alphanumeric chars)
        const upperCaseId = id.toUpperCase();
        const isAsin = /^[A-Z0-9]{10,13}$/.test(upperCaseId);

        if (isAsin) {
            // Use query API to get product by ASIN
            const response = await productsApi.queryProduct({
                asins: [upperCaseId],
                include_metadata: false,
                include_browse_nodes: ["false"]
            });

            if (response && response.data) {
                // 处理返回的可能是数组的情况
                const productData = Array.isArray(response.data)
                    ? response.data[0]
                    : response.data;

                return productData as unknown as Product;
            }
        } else {
            // Get product by ID
            const response = await productsApi.getProductById(id);

            if (response && response.data) {
                return response.data as unknown as Product;
            }
        }

        return null;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching product:', error);

        return null;
    }
}

// Generate page metadata
export async function generateMetadata(
    props: ProductPageProps
): Promise<Metadata> {
    const params = await props.params;
    const id = params.id;

    const product = await getProduct(id);

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

// Main page component
export default async function ProductPage(props: ProductPageProps) {
    const params = await props.params;
    const id = params.id;

    const product = await getProduct(id);
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
        <div className="w-full">
            {/* Product details main content */}
            <div className="bg-gray-50 dark:bg-gray-900 py-8">
                <ProductClient product={adaptedProduct} />
            </div>

            {/* Similar products and Today's Best Deals sections */}
            <div className="container mx-auto px-4 space-y-12 py-12">
                {/* Similar products section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                            Similar Products
                        </h2>
                        <Link
                            href={`/products?product_groups=${encodeURIComponent(adaptedProduct.category)}`}
                            className="flex items-center text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 font-medium transition-colors"
                        >
                            <span>See All</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 ml-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                            </svg>
                        </Link>
                    </div>
                    <Suspense fallback={<div className="h-64 animate-pulse" />}>
                        <FeaturedDeals
                            limit={4}
                            className="bg-transparent"
                            hideTitle={true}
                        />
                    </Suspense>
                </section>

                {/* Today's Best Deals section */}
                <section>
                    <Suspense fallback={<div className="h-64 animate-pulse" />}>
                        <FeaturedDeals
                            limit={4}
                            className="bg-transparent"
                        />
                    </Suspense>
                </section>
            </div>
        </div>
    );
} 
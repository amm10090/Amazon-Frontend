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
                asin: upperCaseId,
                include_metadata: false
            });

            if (response && response.data) {
                return response.data as unknown as Product;
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
export default async function ProductPage(
    props: ProductPageProps
) {
    const params = await props.params;
    const id = params.id;

    const product = await getProduct(id);

    // Convert API product data to component format
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
        <div className="bg-gray-50 dark:bg-gray-900 py-8">
            {/* Product details main content */}
            <ProductClient product={adaptedProduct} />

            {/* Similar products section */}
            <div className="container mx-auto px-4 mt-12">
                <div className="section-header flex justify-between items-center mb-6">
                    <h2 className="section-title text-2xl font-bold text-gray-800 dark:text-white">
                        Similar Products
                    </h2>
                    <Link href="/products" className="see-all text-primary hover:text-primary-dark dark:hover:text-primary-light transition-colors">
                        See All →
                    </Link>
                </div>

                <Suspense fallback={<div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
                    <FeaturedDeals limit={4} />
                </Suspense>
            </div>
        </div>
    );
} 
"use client";

/**
 * Favorites Page
 * Displays all products favorited by the user
 */

import Link from 'next/link';
import React, { useEffect } from 'react';

import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import ProductCard from '@/components/common/ProductCard';
import { useEnrichedFavorites } from '@/lib/favorites/hooks';
import { adaptProducts } from '@/lib/utils';

// Import components
// Note: Depending on your project structure, these paths may need to be adjusted

/**
 * Favorites Page Component
 */
export default function FavoritesPage() {
    // Use custom hook to get favorites with complete information
    const { favorites, isLoading, error, refreshFavorites } = useEnrichedFavorites();

    // Debug output
    useEffect(() => {
    }, [favorites]);

    // Adapt product data to frontend component format
    const adaptedProducts = adaptProducts(favorites || []);

    // Debug output
    useEffect(() => {
    }, [adaptedProducts]);

    // Page title
    const pageTitle = 'My Favorites';

    // Render product cards
    const renderProductCards = () => {
        if (!Array.isArray(adaptedProducts) || adaptedProducts.length === 0) {
            return (
                <EmptyState
                    title="No Favorites"
                    description="You haven't added any products to your favorites yet. Browse some products and add them to your favorites!"
                    actionText="Browse Products"
                    actionLink="/"
                />
            );
        }

        return (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {adaptedProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        showFavoriteButton
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-2xl font-bold">{pageTitle}</h1>
                <button
                    onClick={() => refreshFavorites()}
                    className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                >
                    Refresh List
                </button>
            </div>

            {/* Favorites count */}
            {!isLoading && !error && Array.isArray(adaptedProducts) && (
                <p className="mb-6 text-gray-600">
                    You have favorited <span className="font-medium">{adaptedProducts.length}</span> products
                </p>
            )}

            {/* Content area */}
            {isLoading ? (
                <LoadingState message="Loading favorites..." />
            ) : error ? (
                <ErrorState
                    message="Failed to load favorites"
                    error={error as Error}
                    retry={refreshFavorites}
                />
            ) : (
                renderProductCards()
            )}

            {/* Return to homepage */}
            <div className="mt-8 text-center">
                <Link
                    href="/"
                    className="text-blue-500 hover:underline"
                >
                    Return to Home
                </Link>
            </div>
        </div>
    );
} 
"use client";

import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

import { useProductSearch } from "@/lib/hooks";
import { StoreIdentifier } from "@/lib/store";
import { adaptProducts, formatPrice } from "@/lib/utils";

// Loading fallback component
function SearchSkeleton() {
    // Pre-generate unique IDs for skeleton items
    const skeletonIds = Array.from({ length: 8 }, () =>
        Math.random().toString(36).substring(2, 15)
    );

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <div className="h-8 w-64 bg-gray-200 rounded-md animate-pulse mb-2" />
                <div className="h-5 w-40 bg-gray-200 rounded-md animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {skeletonIds.map((id) => (
                    <div key={`skeleton-${id}`} className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        <div className="bg-gray-200 aspect-square w-full animate-pulse" />
                        <div className="p-4">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SearchPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchKeyword = searchParams.get("keyword") || "";

    // Search states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, _setPageSize] = useState(20);
    const [sortBy, setSortBy] = useState<"relevance" | "price" | "discount" | "created">("relevance");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [minPrice, _setMinPrice] = useState<number | undefined>(undefined);
    const [maxPrice, _setMaxPrice] = useState<number | undefined>(undefined);
    const [minDiscount, _setMinDiscount] = useState<number | undefined>(undefined);
    const [isPrimeOnly, _setIsPrimeOnly] = useState(false);
    const [productGroups, _setProductGroups] = useState<string | undefined>(undefined);
    const [brands, _setBrands] = useState<string | undefined>(undefined);

    // Reset page when search parameters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchKeyword, sortBy, sortOrder, minPrice, maxPrice, minDiscount, isPrimeOnly, productGroups, brands]);

    // Use hook to get search results
    const { data: searchResults, isLoading, isError } = useProductSearch({
        keyword: searchKeyword,
        page: currentPage,
        page_size: pageSize,
        sort_by: sortBy,
        sort_order: sortOrder,
        min_price: minPrice,
        max_price: maxPrice,
        min_discount: minDiscount,
        is_prime_only: isPrimeOnly,
        product_groups: productGroups,
        brands: brands,
    });

    // Adapt product data
    const adaptedProducts = searchResults?.items ? adaptProducts(searchResults.items) : [];

    // Total pages
    const totalPages = searchResults ? Math.ceil(searchResults.total / searchResults.page_size) : 0;

    // Handle page change
    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Handle sort change
    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value as "relevance" | "price" | "discount" | "created");
    };

    // Handle sort order change
    const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortOrder(e.target.value as "asc" | "desc");
    };

    // Handle product click
    const handleProductClick = (productId: string) => {
        router.push(`/product/${productId}`);
    };

    // Add a keydown handler function
    const handleKeyDown = (e: React.KeyboardEvent, productId: string) => {
        // If Enter or Space key is pressed
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleProductClick(productId);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Search title and result count */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">
                    Search Results: {searchKeyword}
                </h1>
                {!isLoading && searchResults && (
                    <p className="text-gray-600">
                        Found {searchResults.total} matching products
                    </p>
                )}
            </div>

            {/* Filter and sort toolbar */}
            <div className="mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex-shrink-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <select
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        value={sortBy}
                        onChange={handleSortChange}
                    >
                        <option value="relevance">Relevance</option>
                        <option value="price">Price</option>
                        <option value="discount">Discount</option>
                        <option value="created">Newest</option>
                    </select>
                </div>

                <div className="flex-shrink-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                    <select
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        value={sortOrder}
                        onChange={handleOrderChange}
                    >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </div>

                {/* More filters can be added here */}
            </div>

            {/* Product grid */}
            {isLoading ? (
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
                </div>
            ) : isError ? (
                <div className="text-center py-12">
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Search Error</h3>
                    <p className="text-gray-500">Try using different search terms or refresh the page</p>
                </div>
            ) : adaptedProducts.length === 0 ? (
                <div className="text-center py-12">
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No Products Found</h3>
                    <p className="text-gray-500">Try using different search terms or filters</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {adaptedProducts.map((product, index) => (
                        <div
                            key={product.id}
                            className="group rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                            onClick={() => handleProductClick(product.id)}
                            onKeyDown={(e) => handleKeyDown(e, product.id)}
                            tabIndex={0}
                            role="button"
                            aria-label={`View details for ${product.title}`}
                        >
                            <div className="relative p-4 bg-gray-100 aspect-square w-full overflow-hidden">
                                {product.image && (
                                    <Image
                                        src={product.image}
                                        alt={product.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                        className="object-contain p-2"
                                        priority={index < 4}
                                    />
                                )}

                                {/* Prime标签 - 左上角 */}
                                {product.isPrime && (
                                    <div
                                        className="absolute top-2 left-2 z-10 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleProductClick(product.id);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                handleProductClick(product.id);
                                            }
                                        }}
                                        tabIndex={0}
                                        role="button"
                                        aria-label="View Prime product details"
                                    >
                                        <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
                                            Prime
                                        </span>
                                    </div>
                                )}

                                {/* 折扣标识 - 右下角 */}
                                {product.discount > 0 && (
                                    <div
                                        className="absolute bottom-2 right-2 z-10 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleProductClick(product.id);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                handleProductClick(product.id);
                                            }
                                        }}
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`View ${product.discount}% discount product details`}
                                    >
                                        <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
                                            {product.discount}% OFF
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                                    {product.title}
                                </h3>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-baseline">
                                        <span className="text-lg font-bold text-green-600">
                                            {formatPrice(product.price)}
                                        </span>
                                        {product.originalPrice > product.price && (
                                            <span className="ml-2 text-xs text-gray-500 line-through">
                                                {formatPrice(product.originalPrice)}
                                            </span>
                                        )}
                                    </div>

                                    {/* 商品来源标识 - 价格行右侧 */}
                                    <div className="flex-shrink-0">
                                        <StoreIdentifier
                                            url={product.url || ''}
                                            className="mb-0"
                                            showName={false}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Simple pagination */}
            {!isLoading && totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-md ${currentPage === 1
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            Previous
                        </button>

                        <span className="text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 rounded-md ${currentPage === totalPages
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Export the wrapped component with Suspense
export default function SearchPage() {
    return (
        <Suspense fallback={<SearchSkeleton />}>
            <SearchPageContent />
        </Suspense>
    );
} 
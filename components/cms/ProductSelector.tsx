'use client';

import {
    Modal,
    ModalContent,
    ModalHeader,
    Button,
    Input,
    Skeleton
} from '@heroui/react';
import { debounce } from 'lodash'; // Use lodash's debounce
import { Search } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useCallback, useMemo } from 'react';

import { productsApi } from '@/lib/api'; // Update import
import { showErrorToast } from '@/lib/toast';
import { adaptProducts } from '@/lib/utils';
import type { ComponentProduct } from '@/types';
import type { Product as ApiProduct } from '@/types/api';

// Add product style options
const PRODUCT_STYLES = [
    { id: 'simple', name: 'Simple Layout' },
    { id: 'card', name: 'Card Layout' },
    { id: 'horizontal', name: 'Horizontal Layout' },
    { id: 'mini', name: 'Mini Layout' }
];

// Local product interface for internal component handling
export interface Product {
    id?: string;
    title: string;
    price?: number;
    main_image?: string; // Consistent with API type
    image_url?: string;  // Consistent with API type
    image?: string;      // Add possible image field
    asin?: string;
    style?: string;      // Add style property
}

// Component props interface
interface ProductSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (product: ComponentProduct) => void;
}

// Product selector component
export function ProductSelector({ isOpen, onClose, onSelect }: ProductSelectorProps) {
    // State management
    const [products, setProducts] = useState<ComponentProduct[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedStyle, setSelectedStyle] = useState('card'); // Add style selection state
    const limit = 10; // Number of products per page

    // Load product data
    const fetchProducts = useCallback(async (query: string, page: number) => {
        setIsLoading(true);
        try {
            let response;
            let apiProducts: ApiProduct[] = [];
            let totalItems = 0;
            let pageSize = limit;

            if (!query) {
                response = await productsApi.getProducts({
                    page: page,
                    limit: limit,
                    sort_by: 'created',
                    sort_order: 'desc'
                });
                if (response.data?.data?.items) {
                    apiProducts = response.data.data.items;
                    totalItems = response.data.data.total || 0;
                    pageSize = response.data.data.page_size || limit;
                }
            } else {
                response = await productsApi.searchProducts({
                    keyword: query,
                    page: page,
                    page_size: limit,
                    sort_by: 'relevance'
                });
                if (response.data?.data?.items) {
                    apiProducts = response.data.data.items;
                    totalItems = response.data.data.total || 0;
                    pageSize = response.data.data.page_size || limit;
                }
            }

            // Use adaptProducts to transform API response
            const adaptedProducts = adaptProducts(apiProducts);

            setProducts(prev => page === 1 ? adaptedProducts : [...prev, ...adaptedProducts]);
            setTotalPages(Math.ceil(totalItems / pageSize) || 1);
            setCurrentPage(page);

        } catch (error) {
            showErrorToast({
                title: 'Failed to get products',
                description: error instanceof Error ? error.message : 'Unable to connect to server or an error occurred'
            });
            setProducts(prev => page === 1 ? [] : prev);
            setTotalPages(prev => page === 1 ? 1 : prev);
            setCurrentPage(prev => page === 1 ? 1 : prev);
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    // Create debounced function, directly use lodash's debounce
    const debouncedFetchProducts = useMemo(() =>
        debounce((query: string, page: number) => fetchProducts(query, page), 300)
        , [fetchProducts]); // Dependencies should be fetchProducts itself

    // Initial load and search handling
    useEffect(() => {
        if (isOpen) {
            // When modal opens, get first page data, clear search term
            setSearchQuery(''); // Clear search
            setCurrentPage(1);  // Reset page number
        }
    }, [isOpen, fetchProducts]); // Remove debouncedFetchProducts - fetchProducts reference is now stable

    // Handle search query changes
    useEffect(() => {
        // When search term changes, reset page number and get first page of search results
        setCurrentPage(1);
        setProducts([]); // Clear existing products to show new search results
        debouncedFetchProducts(searchQuery, 1);
    }, [searchQuery, debouncedFetchProducts]); // Depend on search term and debounced function

    // Handle product selection
    const handleSelectProduct = useCallback((product: ComponentProduct) => {
        onSelect({
            ...product,
            style: selectedStyle // Add style property
        } as ComponentProduct);
        onClose();
    }, [selectedStyle, onClose, onSelect]);

    // Load more products
    const loadMoreProducts = useCallback(() => {
        if (currentPage < totalPages && !isLoading) {
            fetchProducts(searchQuery, currentPage + 1);
        }
    }, [currentPage, totalPages, isLoading, fetchProducts, searchQuery]);

    // Monitor scroll to bottom to load more
    const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
        const target = event.currentTarget;

        if (target.scrollHeight - target.scrollTop <= target.clientHeight + 50) {
            loadMoreProducts();
        }
    }, [loadMoreProducts]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            disableAnimation={false}
            classNames={{
                backdrop: "z-[9998]",
                base: "z-[9999]",
                wrapper: "z-[9999]"
            }}
        >
            <ModalContent className="sm:max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                <ModalHeader>
                    <h3 className="text-lg font-medium">Select Product</h3>
                </ModalHeader>

                {/* Search bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search product name or SKU..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)} // Directly update searchQuery, useEffect will handle debounced call
                    />
                </div>

                {/* Product list - add scroll event listener */}
                <div className="flex-1 overflow-y-auto pr-2" onScroll={handleScroll}>
                    {isLoading && products.length === 0 ? ( // Show skeleton screen during initial loading
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4'].map((id) => (
                                <div key={id} className="flex border rounded-md p-3">
                                    <Skeleton className="w-16 h-16 rounded-md mr-3 flex-shrink-0" />
                                    <div className="flex-1">
                                        <Skeleton className="h-4 w-3/4 mb-2" />
                                        <Skeleton className="h-3 w-1/4 mb-2" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        // No results state
                        <div className="text-center py-8 text-gray-500">
                            No matching products found
                        </div>
                    ) : (
                        // Product list
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {products.map((product) => (
                                <button
                                    key={product.id}
                                    className="flex items-center border rounded-md p-3 hover:bg-gray-50 text-left transition-colors"
                                    onClick={() => handleSelectProduct(product)}
                                >
                                    <div className="w-16 h-16 bg-gray-100 rounded-md mr-3 overflow-hidden relative flex-shrink-0">
                                        {product.image && product.image !== '/placeholder-product.jpg' ? (
                                            <Image
                                                src={product.image}
                                                alt={product.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                className="object-cover"
                                                onError={(e) => { e.currentTarget.src = '/placeholder-product.jpg'; }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs bg-gray-200">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0"> {/* Prevent text overflow affecting layout */}
                                        <h4 className="font-medium text-sm truncate">{product.title}</h4> {/* Use truncate */}
                                        <div className="text-sm text-green-600">${(product.price || 0).toFixed(2)}</div>
                                        {product.asin && (
                                            <div className="text-xs text-gray-500 truncate">SKU: {product.asin}</div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                    {/* Loading indicator when loading more */}
                    {isLoading && products.length > 0 && (
                        <div className="text-center py-4 text-gray-500">
                            Loading...
                        </div>
                    )}
                </div>

                {/* Bottom actions - fix syntax */}
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                        Page {currentPage} / {totalPages}
                    </span>
                    <div>
                        <Button variant="light" onClick={onClose} className="mr-2">
                            Cancel
                        </Button>
                        {/* Replace manage products button with style selection dropdown */}
                        <div className="inline-flex">
                            <span className="text-sm mr-2 self-center">Display Style:</span>
                            <select
                                value={selectedStyle}
                                onChange={(e) => setSelectedStyle(e.target.value)}
                                className="form-select text-sm border rounded py-1 px-2 bg-white"
                            >
                                {PRODUCT_STYLES.map(style => (
                                    <option key={style.id} value={style.id}>
                                        {style.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </ModalContent>
        </Modal>
    );
} 
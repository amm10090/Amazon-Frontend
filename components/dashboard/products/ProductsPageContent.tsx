'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { FaTrash, FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

import { useProducts } from '@/lib/hooks';
import { UserRole } from '@/lib/models/UserRole';

const SKELETON_KEYS = ['sk1', 'sk2', 'sk3', 'sk4', 'sk5'];

const ProductsPageContent = () => {
    const { data: session } = useSession();
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [error, setError] = useState<string | null>(null);
    const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('xl');
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const tableRef = useRef<HTMLDivElement>(null);

    // Use hooks to fetch product list
    const { data: productsData, isLoading: loading, mutate } = useProducts({
        page: currentPage,
        limit: itemsPerPage
    });

    const products = productsData?.items || [];
    const totalPages = Math.ceil((productsData?.total || 0) / itemsPerPage);
    const totalProducts = productsData?.total || 0;

    // Handle screen size detection for responsive design
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;

            if (width < 320) setScreenSize('xs');
            else if (width < 425) setScreenSize('sm');
            else if (width < 768) setScreenSize('md');
            else if (width < 1024) setScreenSize('lg');
            else setScreenSize('xl');
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Update the CSS for the loading animation
    useEffect(() => {
        // Add shimmer animation to global styles
        const style = document.createElement('style');

        style.textContent = `
            @keyframes shimmer {
                0% { background-position: 100% 0; }
                100% { background-position: 0 0; }
            }
            .animate-shimmer {
                animation: shimmer 1.5s infinite linear;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // Animation variants for Framer Motion
    const listAnimation = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.05
            }
        }
    };

    const itemAnimation = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 }
        }
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }

        // Scroll to top of table when sorting changes
        if (tableRef.current) {
            tableRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Sort products based on sort field and direction
    const sortedProducts = [...products].sort((a, b) => {
        if (!sortField) return 0;

        let valueA, valueB;

        switch (sortField) {
            case 'title':
                valueA = a.title || '';
                valueB = b.title || '';
                break;
            case 'asin':
                valueA = a.asin || '';
                valueB = b.asin || '';
                break;
            case 'price':
                valueA = a.offers?.[0]?.price || 0;
                valueB = b.offers?.[0]?.price || 0;
                break;
            case 'discount':
                valueA = a.offers?.[0]?.savings_percentage || 0;
                valueB = b.offers?.[0]?.savings_percentage || 0;
                break;
            default:
                return 0;
        }

        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;

        return 0;
    });

    // Get sort icon based on field and current sort state
    const getSortIcon = (field: string) => {
        if (sortField !== field) return <FaSort className="ml-1 text-gray-400" size={12} />;

        return sortDirection === 'asc' ?
            <FaSortUp className="ml-1 text-blue-500" size={12} /> :
            <FaSortDown className="ml-1 text-blue-500" size={12} />;
    };

    // Render animated loading skeleton
    const renderSkeleton = () => (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={listAnimation}
            className="p-6 space-y-4"
        >
            {SKELETON_KEYS.map((key) => (
                <motion.div
                    key={key}
                    variants={itemAnimation}
                    className="h-16 bg-gray-200 rounded w-full overflow-hidden"
                >
                    <div className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"
                        style={{ backgroundSize: '400% 100%' }} />
                </motion.div>
            ))}
        </motion.div>
    );

    const handleDeleteProduct = async (asin: string) => {
        try {
            const response = await fetch(`/api/products/batch-delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    asins: [asin]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                let errorMsg = `Failed to delete product: ${response.status} ${response.statusText}`;

                if (errorData && errorData.detail) {
                    errorMsg = errorData.detail;
                }

                throw new Error(errorMsg);
            }

            // Refresh product list after successful deletion
            setShowDeleteConfirm(null);
            if (mutate) {
                await mutate();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error deleting product');
        }
    };

    const filteredProducts = products.filter(product =>
        product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.asin?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Check user permissions
    if (!session?.user?.role || (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.SUPER_ADMIN)) {
        return <div className="p-4 bg-red-50 text-red-600 rounded-lg">You don&apos;t have permission to access this page</div>;
    }

    // Render a responsive pagination display based on screen size
    const renderPagination = () => {
        // For extra small screens (xs), show minimal pagination
        if (screenSize === 'xs') {
            return (
                <div className="flex justify-between w-full">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-2 py-1 text-xs border rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700'}`}
                    >
                        Prev
                    </button>
                    <span className="px-2 py-1 text-xs">{currentPage} / {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`px-2 py-1 text-xs border rounded ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700'}`}
                    >
                        Next
                    </button>
                </div>
            );
        }

        // For small screens (sm), show compact pagination
        if (screenSize === 'sm') {
            return (
                <div className="flex flex-col items-center space-y-2">
                    <div className="text-xs text-gray-500">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className={`px-2 py-1 text-xs border rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700'}`}
                        >
                            Prev
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`px-2 py-1 text-xs border rounded ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700'}`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            );
        }

        // For medium screens (md) and above
        const pageNumbers = [];
        const maxVisiblePages = screenSize === 'md' ? 5 : 10;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{totalProducts === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalProducts)}</span> of{' '}
                    <span className="font-medium">{totalProducts}</span> results
                </div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        Prev
                    </button>
                    {pageNumbers.map(pageNumber => (
                        <button
                            key={`page-${pageNumber}`}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${currentPage === pageNumber
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {pageNumber}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        Next
                    </button>
                </nav>
            </div>
        );
    };

    // Stats cards at the top
    const renderStatsCards = () => {
        // For extra small and small screens, use 2-column grid with smaller text and padding
        if (screenSize === 'xs' || screenSize === 'sm') {
            return (
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-xs text-gray-500">Total</div>
                        <div className="text-lg font-bold text-gray-800">{totalProducts}</div>
                    </div>
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-xs text-gray-500">Pages</div>
                        <div className="text-lg font-bold text-gray-800">{totalPages}</div>
                    </div>
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-xs text-gray-500">Page</div>
                        <div className="text-lg font-bold text-gray-800">{currentPage}</div>
                    </div>
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-xs text-gray-500">Per Page</div>
                        <div className="text-lg font-bold text-gray-800">{itemsPerPage}</div>
                    </div>
                </div>
            );
        }

        // For medium screens and above, use the original layout
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="text-sm text-gray-500">Total Products</div>
                    <div className="text-2xl font-bold text-gray-800">{totalProducts}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="text-sm text-gray-500">Pages</div>
                    <div className="text-2xl font-bold text-gray-800">{totalPages}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="text-sm text-gray-500">Current Page</div>
                    <div className="text-2xl font-bold text-gray-800">{currentPage}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="text-sm text-gray-500">Items Per Page</div>
                    <div className="text-2xl font-bold text-gray-800">{itemsPerPage}</div>
                </div>
            </div>
        );
    };

    // Handle different view layouts based on screen size
    const renderProductsList = () => {
        if (loading) {
            return (
                <div className="animate-pulse p-6 space-y-4">
                    {SKELETON_KEYS.map((key) => (
                        <div key={key} className="h-16 bg-gray-200 rounded w-full" />
                    ))}
                </div>
            );
        }

        if (filteredProducts.length === 0) {
            return (
                <div className="p-6 text-center text-gray-500">
                    {searchTerm ? 'No matching products found' : 'No product data available'}
                </div>
            );
        }

        // Card view for XS and SM screens with animations
        if (screenSize === 'xs' || screenSize === 'sm') {
            return (
                <AnimatePresence mode="wait">
                    {loading ? (
                        renderSkeleton()
                    ) : filteredProducts.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-6 text-center text-gray-500"
                        >
                            {searchTerm ? 'No matching products found' : 'No product data available'}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={listAnimation}
                            className="grid grid-cols-1 gap-4 p-4"
                        >
                            {sortedProducts.map((product) => (
                                <motion.div
                                    layout
                                    key={product.asin}
                                    variants={itemAnimation}
                                    className="bg-white rounded-lg shadow-sm p-3 border border-gray-200 hover:shadow-md transition-shadow duration-300"
                                >
                                    <div className="flex items-start space-x-2">
                                        <div className="flex-shrink-0">
                                            {product.main_image ? (
                                                <div className="overflow-hidden rounded-md">
                                                    <Image
                                                        src={product.main_image}
                                                        alt={product.title || 'Product Image'}
                                                        width={50}
                                                        height={50}
                                                        className="object-cover transition-transform duration-300 hover:scale-110"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-[50px] w-[50px] bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-xs">
                                                    No img
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">{product.title}</h3>
                                            <div className="flex flex-col text-xs">
                                                <span className="text-gray-500">ASIN: {product.asin || '-'}</span>
                                                <div className="flex justify-between items-center mt-1">
                                                    <div className="flex items-center">
                                                        <span className="font-medium text-gray-900">
                                                            ${product.offers?.[0]?.price?.toFixed(2) || '0.00'}
                                                        </span>
                                                        {product.offers?.[0]?.savings_percentage && (
                                                            <span className="ml-2 text-xs font-medium text-green-600">
                                                                -{product.offers[0].savings_percentage}%
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => product.asin ? setShowDeleteConfirm(product.asin) : null}
                                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                                                        aria-label="Delete product"
                                                    >
                                                        <FaTrash size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            );
        }

        // Table view for MD screens with animations
        if (screenSize === 'md') {
            return (
                <AnimatePresence mode="wait">
                    {loading ? (
                        renderSkeleton()
                    ) : filteredProducts.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-6 text-center text-gray-500"
                        >
                            {searchTerm ? 'No matching products found' : 'No product data available'}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                            ref={tableRef}
                        >
                            <div className="border border-gray-200 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr className="divide-x divide-gray-200">
                                            <th
                                                scope="col"
                                                className="py-3 pl-4 pr-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                                                onClick={() => handleSort('title')}
                                            >
                                                <div className="flex items-center">
                                                    Product
                                                    {getSortIcon('title')}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="py-3 px-2 text-right text-xs font-medium text-gray-500 uppercase w-20 cursor-pointer hover:bg-gray-100 transition-colors"
                                                onClick={() => handleSort('price')}
                                            >
                                                <div className="flex items-center justify-end">
                                                    Price
                                                    {getSortIcon('price')}
                                                </div>
                                            </th>
                                            <th scope="col" className="py-3 pl-2 pr-4 text-right text-xs font-medium text-gray-500 uppercase w-20">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {sortedProducts.map((product, index) => (
                                            <motion.tr
                                                key={product.asin}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    duration: 0.3,
                                                    delay: index * 0.03,
                                                }}
                                                className="hover:bg-gray-50 divide-x divide-gray-200 transition-colors"
                                            >
                                                <td className="py-3 pl-4 pr-2 text-sm">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-md">
                                                            {product.main_image ? (
                                                                <Image
                                                                    src={product.main_image}
                                                                    alt={product.title || 'Product Image'}
                                                                    width={32}
                                                                    height={32}
                                                                    className="h-8 w-8 object-cover transition-transform duration-300 hover:scale-110"
                                                                />
                                                            ) : (
                                                                <div className="h-8 w-8 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-xs">
                                                                    No
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 max-w-[120px]">
                                                            <div className="font-medium text-xs text-gray-900 line-clamp-1">{product.title}</div>
                                                            <div className="text-xs text-gray-500 truncate">{product.asin}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-2 text-xs text-right">
                                                    <div className="font-medium text-gray-900">
                                                        ${product.offers?.[0]?.price?.toFixed(2) || '0.00'}
                                                    </div>
                                                    {product.offers?.[0]?.savings_percentage && (
                                                        <div className="text-xs text-green-600">-{product.offers[0].savings_percentage}%</div>
                                                    )}
                                                </td>
                                                <td className="py-3 pl-2 pr-4 text-right">
                                                    <button
                                                        onClick={() => product.asin ? setShowDeleteConfirm(product.asin) : null}
                                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                                                        aria-label="Delete product"
                                                    >
                                                        <FaTrash size={12} />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            );
        }

        // Optimized table view for LG screens
        if (screenSize === 'lg') {
            return (
                <div className="overflow-hidden">
                    <div className="shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="sticky top-0 z-10 py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-900 bg-gray-50">
                                            Product
                                        </th>
                                        <th scope="col" className="sticky top-0 z-10 px-3 py-3.5 text-left text-xs font-semibold text-gray-900 bg-gray-50">
                                            ASIN
                                        </th>
                                        <th scope="col" className="sticky top-0 z-10 px-3 py-3.5 text-right text-xs font-semibold text-gray-900 bg-gray-50">
                                            Price
                                        </th>
                                        <th scope="col" className="sticky top-0 z-10 px-3 py-3.5 text-right text-xs font-semibold text-gray-900 bg-gray-50">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredProducts.map((product) => (
                                        <tr key={product.asin} className="hover:bg-gray-50">
                                            <td className="py-4 pl-4 pr-3 text-sm">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        {product.main_image ? (
                                                            <Image
                                                                src={product.main_image}
                                                                alt={product.title || 'Product Image'}
                                                                width={40}
                                                                height={40}
                                                                className="h-10 w-10 object-cover rounded-md"
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-xs">
                                                                No img
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-3 max-w-[300px]">
                                                        <div className="font-medium text-gray-900 line-clamp-1">{product.title}</div>
                                                        {product.brand && (
                                                            <div className="text-xs text-gray-500 truncate">
                                                                {product.brand}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 text-sm text-gray-500">
                                                {product.asin || '-'}
                                            </td>
                                            <td className="px-3 py-4 text-sm text-right">
                                                <div className="font-medium text-gray-900">
                                                    ${product.offers?.[0]?.price?.toFixed(2) || '0.00'}
                                                </div>
                                                {product.offers?.[0]?.savings_percentage && (
                                                    <div className="text-xs text-green-600">-{product.offers[0].savings_percentage}%</div>
                                                )}
                                            </td>
                                            <td className="px-3 py-4 text-sm text-right">
                                                <button
                                                    onClick={() => product.asin ? setShowDeleteConfirm(product.asin) : null}
                                                    className="inline-flex items-center text-red-600 hover:text-red-900"
                                                >
                                                    <FaTrash className="mr-1" /> Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            );
        }

        // Full table view for XL screens with animations
        return (
            <AnimatePresence mode="wait">
                {loading ? (
                    renderSkeleton()
                ) : filteredProducts.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-6 text-center text-gray-500"
                    >
                        {searchTerm ? 'No matching products found' : 'No product data available'}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                        ref={tableRef}
                    >
                        <div className="shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="sticky top-0 z-10 py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-900 bg-gray-50 w-[40%] cursor-pointer hover:bg-gray-100 transition-colors"
                                                onClick={() => handleSort('title')}
                                            >
                                                <div className="flex items-center">
                                                    Product Name
                                                    {getSortIcon('title')}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="sticky top-0 z-10 px-3 py-3.5 text-left text-xs font-semibold text-gray-900 bg-gray-50 w-[15%] cursor-pointer hover:bg-gray-100 transition-colors"
                                                onClick={() => handleSort('asin')}
                                            >
                                                <div className="flex items-center">
                                                    ASIN
                                                    {getSortIcon('asin')}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="sticky top-0 z-10 px-3 py-3.5 text-left text-xs font-semibold text-gray-900 bg-gray-50 w-[15%] cursor-pointer hover:bg-gray-100 transition-colors"
                                                onClick={() => handleSort('price')}
                                            >
                                                <div className="flex items-center">
                                                    Price
                                                    {getSortIcon('price')}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="sticky top-0 z-10 px-3 py-3.5 text-left text-xs font-semibold text-gray-900 bg-gray-50 w-[15%] cursor-pointer hover:bg-gray-100 transition-colors"
                                                onClick={() => handleSort('discount')}
                                            >
                                                <div className="flex items-center">
                                                    Discount
                                                    {getSortIcon('discount')}
                                                </div>
                                            </th>
                                            <th scope="col" className="sticky top-0 z-10 px-3 py-3.5 text-right text-xs font-semibold text-gray-900 bg-gray-50 w-[15%]">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {sortedProducts.map((product, index) => (
                                            <motion.tr
                                                key={product.asin}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    duration: 0.3,
                                                    delay: index * 0.02,
                                                }}
                                                className="hover:bg-gray-50 transition-colors duration-150"
                                            >
                                                <td className="py-4 pl-4 pr-3 text-sm">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md">
                                                            {product.main_image ? (
                                                                <Image
                                                                    src={product.main_image}
                                                                    alt={product.title || 'Product Image'}
                                                                    width={40}
                                                                    height={40}
                                                                    className="h-10 w-10 object-cover transition-transform duration-300 hover:scale-110"
                                                                />
                                                            ) : (
                                                                <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-xs">
                                                                    No img
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-3 min-w-0 max-w-[400px]">
                                                            <div className="font-medium text-gray-900 line-clamp-1 hover:text-blue-600 transition-colors duration-200">{product.title}</div>
                                                            {product.brand && (
                                                                <div className="text-sm text-gray-500 truncate">
                                                                    {product.brand}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-4 text-sm text-gray-500">
                                                    {product.asin || '-'}
                                                </td>
                                                <td className="px-3 py-4 text-sm text-gray-500">
                                                    ${product.offers?.[0]?.price?.toFixed(2) || '0.00'}
                                                </td>
                                                <td className="px-3 py-4 text-sm text-gray-500">
                                                    {product.offers?.[0]?.savings_percentage ? (
                                                        <span className="text-green-600">-{product.offers[0].savings_percentage}%</span>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-3 py-4 text-sm text-right">
                                                    <button
                                                        onClick={() => product.asin ? setShowDeleteConfirm(product.asin) : null}
                                                        className="inline-flex items-center text-gray-400 hover:text-red-600 transition-colors duration-200"
                                                    >
                                                        <FaTrash className="mr-1" /> Delete
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">Product Management</h1>
            </motion.div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4"
                    >
                        <p>{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search bar */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="relative"
            >
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaSearch className="text-gray-400" />
                </div>
                <input
                    type="text"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 transition-shadow duration-200 hover:shadow-sm"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </motion.div>

            {/* Stats summary */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                {renderStatsCards()}
            </motion.div>

            {/* Products list */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
            >
                <div className={screenSize === 'xs' || screenSize === 'sm' || screenSize === 'md' ? '' : 'overflow-x-auto'}>
                    {renderProductsList()}
                </div>

                {/* Pagination controls */}
                {!loading && products.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                        className="bg-white px-2 sm:px-4 py-3 border-t border-gray-200"
                    >
                        {renderPagination()}
                    </motion.div>
                )}
            </motion.div>

            {/* Delete confirmation modal with animation */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="bg-white rounded-lg shadow-xl p-5 w-full max-w-sm"
                        >
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Confirm Delete</h3>
                            <p className="text-gray-600 mb-5">
                                Are you sure you want to delete this product? This action cannot be undone.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <motion.button
                                    whileHover={{ y: -2 }}
                                    whileTap={{ y: 0 }}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors duration-200"
                                    onClick={() => setShowDeleteConfirm(null)}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ y: -2 }}
                                    whileTap={{ y: 0 }}
                                    className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 transition-colors duration-200"
                                    onClick={() => handleDeleteProduct(showDeleteConfirm)}
                                >
                                    Delete
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductsPageContent; 
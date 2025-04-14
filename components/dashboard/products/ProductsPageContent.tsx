'use client';

import { AnimatePresence, motion } from 'framer-motion';
import debounce from 'lodash/debounce';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { FaTrash, FaSearch, FaSort, FaSortUp, FaSortDown, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';

import { productsApi } from '@/lib/api';
import { useProducts, useProductSearch } from '@/lib/hooks';
import { UserRole } from '@/lib/models/UserRole';
import type { Product } from '@/types/api';

const SKELETON_KEYS = ['sk1', 'sk2', 'sk3', 'sk4', 'sk5'];

const ProductsPageContent = () => {
    const { data: session } = useSession();
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [renderedRowCount, setRenderedRowCount] = useState(100); // 将初始渲染行数改为100
    const [error, setError] = useState<string | null>(null);
    const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('xl');
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const tableRef = useRef<HTMLDivElement>(null);
    const rowObserverRef = useRef<IntersectionObserver | null>(null);
    const lastRowRef = useRef<HTMLTableRowElement | null>(null);

    // 新增变量用于处理分批加载
    const [batchLoading, setBatchLoading] = useState(false); // 是否正在加载下一批数据
    const [_loadedBatches, setLoadedBatches] = useState(1); // 已加载的批次
    const [allBatchesLoaded, setAllBatchesLoaded] = useState(false); // 是否已加载所有批次
    const [batchedProducts, setBatchedProducts] = useState<Product[]>([]); // 所有批次合并的产品列表

    // 新增状态变量
    const [searchMode, setSearchMode] = useState<'browse' | 'search'>('browse');
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
    const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
    const [minDiscount, setMinDiscount] = useState<number | undefined>(undefined);
    const [isPrimeOnly, setIsPrimeOnly] = useState<boolean | undefined>(undefined);
    const [apiProvider, setApiProvider] = useState<string | undefined>(undefined);
    const [searchParams, setSearchParams] = useState({
        keyword: '',
        page: 1,
        page_size: 100, // 固定为100
        sort_by: sortField as 'relevance' | 'price' | 'discount' | 'created' | undefined,
        sort_order: 'desc' as 'asc' | 'desc',
        min_price: undefined as number | undefined,
        max_price: undefined as number | undefined,
        min_discount: undefined as number | undefined,
        is_prime_only: undefined as boolean | undefined,
        product_groups: undefined as string | undefined,
        brands: undefined as string | undefined,
        api_provider: apiProvider,
    });

    // 创建一个防抖搜索函数
    const debouncedSearchRef = useRef(
        debounce((term: string, currentKeyword: string, setParams: React.Dispatch<React.SetStateAction<typeof searchParams>>, setPage: React.Dispatch<React.SetStateAction<number>>, setMode: React.Dispatch<React.SetStateAction<'browse' | 'search'>>) => {
            if (term.trim() && term.trim() !== currentKeyword) {
                setParams(prev => ({ ...prev, keyword: term.trim(), page: 1 }));
                setPage(1); // 重置页码
                setMode('search');
            } else if (!term.trim()) {
                setMode('browse');
            }
        }, 500)
    );

    // 包装函数以正确传递当前参数
    const handleSearch = useCallback((term: string) => {
        debouncedSearchRef.current(term, searchParams.keyword, setSearchParams, setCurrentPage, setSearchMode);
    }, [searchParams.keyword]);

    // 使用hooks加载数据
    // 浏览模式 - 使用原有的useProducts hook，但始终限制每次请求最多100条
    const { data: productsData, isLoading: browseLoading, mutate: mutateBrowseData } = useProducts({
        page: currentPage,
        limit: 100, // 一律设置为100，无论itemsPerPage是多少
        api_provider: apiProvider,
        sort_by: sortField as 'price' | 'discount' | 'created' | 'all' | undefined,
        sort_order: sortDirection
    });

    // 搜索模式 - 使用新的useProductSearch hook，同样限制每次最多100条
    const { data: searchData, isLoading: searchLoading, mutate: mutateSearchData } = useProductSearch(
        searchMode === 'search' ? { ...searchParams, page_size: 100 } : { keyword: '' }
    );

    // 确定使用哪种数据源
    const loading = searchMode === 'search' ? searchLoading : browseLoading;
    const initialProducts = searchMode === 'search'
        ? (searchData?.items || [])
        : (productsData?.items || []);
    const products = batchedProducts.length > 0
        ? batchedProducts
        : initialProducts;
    const totalPages = Math.ceil((searchMode === 'search'
        ? (searchData?.total || 0)
        : (productsData?.total || 0)) / itemsPerPage);
    const totalProducts = searchMode === 'search'
        ? (searchData?.total || 0)
        : (productsData?.total || 0);
    const mutate = searchMode === 'search' ? mutateSearchData : mutateBrowseData;

    // 完全重写loadNextBatch函数，确保在用户选择大量每页项目时正确分批加载
    const loadNextBatch = useCallback(async () => {
        // 如果当前正在加载，或者已经加载完所有批次，或者不需要分批加载，则直接返回
        if (batchLoading || allBatchesLoaded || itemsPerPage <= 100) return;

        // 如果已经加载的数量达到或超过了每页要显示的数量，也不需要再加载
        if (batchedProducts.length >= itemsPerPage) {
            setAllBatchesLoaded(true);

            return;
        }

        setBatchLoading(true);

        try {
            // 计算下一个要加载的批次页码
            const nextBatchPage = Math.floor(batchedProducts.length / 100) + 1;
            const maxBatches = Math.ceil(itemsPerPage / 100);

            // 如果已经加载了所有批次，则停止
            if (nextBatchPage > maxBatches) {
                setAllBatchesLoaded(true);
                setBatchLoading(false);

                return;
            }


            let newItems: Product[] = [];

            // 根据当前模式选择正确的API调用
            if (searchMode === 'search') {
                // 搜索模式下使用searchProducts API
                const searchBatchParams = {
                    ...searchParams,
                    page: nextBatchPage,
                    page_size: 100 // 每页固定为100条
                };

                try {
                    const response = await productsApi.searchProducts(searchBatchParams);

                    // 处理响应数据，确保按正确的类型结构访问数据
                    if (response?.data?.data) {
                        if (Array.isArray(response.data.data.items)) {
                            newItems = response.data.data.items;
                        } else if (Array.isArray(response.data.data)) {
                            newItems = response.data.data;
                        }
                    }
                } catch (err) {
                    console.error('Error loading search batch:', err);
                }
            } else {
                // 浏览模式下使用getProducts API
                const browseBatchParams = {
                    page: nextBatchPage,
                    limit: 100, // 每页固定为100条
                    api_provider: apiProvider,
                    sort_by: sortField as 'price' | 'discount' | 'created' | 'all' | undefined,
                    sort_order: sortDirection
                };

                try {
                    const response = await productsApi.getProducts(browseBatchParams);

                    // 处理响应数据，确保按正确的类型结构访问数据
                    if (response?.data?.data) {
                        if (Array.isArray(response.data.data.items)) {
                            newItems = response.data.data.items;
                        } else if (Array.isArray(response.data.data)) {
                            newItems = response.data.data;
                        }
                    }
                } catch (err) {
                    console.error('Error loading browse batch:', err);
                }
            }

            // 合并新数据到已加载的产品列表中
            if (newItems.length > 0) {
                console.log(`成功加载 ${newItems.length} 条新商品数据`);

                // 更新已加载的商品列表
                setBatchedProducts(prev => {
                    // 确保不会超过用户设置的每页显示数量
                    const combinedItems = [...prev, ...newItems];

                    return combinedItems.slice(0, itemsPerPage);
                });

                // 检查是否已经加载了足够的数据
                if (batchedProducts.length + newItems.length >= itemsPerPage) {
                    console.log('已加载足够的商品数据，设置allBatchesLoaded为true');
                    setAllBatchesLoaded(true);
                }
            } else {
                // 如果没有获取到新数据，表示已经没有更多数据可加载
                console.log('没有更多商品数据可加载，设置allBatchesLoaded为true');
                setAllBatchesLoaded(true);
            }
        } catch (err) {
            console.error('Error in loadNextBatch:', err);
            setError('Failed to load more products. Please try again later.');
        } finally {
            setBatchLoading(false);
        }
    }, [batchLoading, allBatchesLoaded, itemsPerPage, searchMode, searchParams, apiProvider, sortField, sortDirection, batchedProducts.length]);

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

    // 使用 useEffect 从 localStorage 加载数据
    useEffect(() => {
        // 只在客户端执行
        if (typeof window !== 'undefined') {
            const savedValue = localStorage.getItem('itemsPerPage');

            if (savedValue) {
                setItemsPerPage(parseInt(savedValue, 10));
            }
        }
    }, []);

    // 当 itemsPerPage 变化时保存到 localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('itemsPerPage', itemsPerPage.toString());

            // 更新搜索参数
            setSearchParams(prev => ({
                ...prev,
                page_size: 100 // 确保API请求始终使用100作为页大小
            }));

            // 重置批次加载状态
            setBatchedProducts([]);
            setLoadedBatches(1);
            setAllBatchesLoaded(itemsPerPage <= 100);
        }
    }, [itemsPerPage]);

    // 重写初始化和数据加载的useEffect
    // 当首次加载完成后，如果需要分批加载，则开始加载第二批数据
    useEffect(() => {
        // 如果是分批加载模式(itemsPerPage > 100)，且初始数据已加载完成(不在加载状态)
        if (itemsPerPage > 100 && !loading && !batchLoading && batchedProducts.length === 0 && initialProducts.length > 0) {
            console.log(`初始化batchedProducts，加载了 ${initialProducts.length} 条商品`);
            setBatchedProducts(initialProducts);

            // 如果初始加载的数据量已经达到了要显示的数量，设置allBatchesLoaded为true
            if (initialProducts.length >= itemsPerPage) {
                setAllBatchesLoaded(true);
            } else {
                // 否则需要继续加载更多数据
                setAllBatchesLoaded(false);

                // 使用setTimeout避免在渲染周期中触发状态更新
                const timer = setTimeout(() => {
                    loadNextBatch();
                }, 500);

                return () => clearTimeout(timer);
            }
        }
    }, [loading, batchLoading, itemsPerPage, initialProducts, batchedProducts.length, loadNextBatch]);

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

    // 应用高级搜索
    const applyAdvancedSearch = () => {
        // 如果有搜索词或API来源筛选，则应用筛选
        if (searchTerm.trim() || apiProvider !== undefined) {
            setSearchParams(prev => ({
                ...prev,
                min_price: minPrice,
                max_price: maxPrice,
                min_discount: minDiscount,
                is_prime_only: isPrimeOnly,
                api_provider: apiProvider
            }));

            // 有搜索词，切换到搜索模式
            if (searchTerm.trim()) {
                setSearchMode('search');
            } else if (searchMode === 'browse') {
                // 如果没有搜索词但有筛选条件，在浏览模式下刷新数据
                if (mutateBrowseData && (minPrice !== undefined || maxPrice !== undefined ||
                    minDiscount !== undefined || isPrimeOnly !== undefined || apiProvider !== undefined)) {
                    mutateBrowseData();
                }
            } else {
                // 在搜索模式下刷新数据
                if (mutateSearchData) {
                    mutateSearchData();
                }
            }
        }
    };

    // 清除搜索，返回浏览模式
    const clearSearch = () => {
        setSearchTerm('');
        setSearchMode('browse');
        setMinPrice(undefined);
        setMaxPrice(undefined);
        setMinDiscount(undefined);
        setIsPrimeOnly(undefined);
        setApiProvider(undefined);
    };

    // 处理搜索输入变化
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;

        setSearchTerm(term);
        handleSearch(term);
    };

    // 处理API来源变更
    const handleApiProviderChange = (provider: string | undefined) => {
        setApiProvider(provider);

        // 更新搜索参数
        setSearchParams(prev => ({
            ...prev,
            api_provider: provider
        }));

        // 如果当前在搜索模式，立即应用筛选；如果在浏览模式，直接刷新数据
        if (searchMode === 'browse') {
            if (provider !== undefined) {
                // 选择了特定的API提供商，但保持在浏览模式
                // 使用useProducts的mutate函数强制刷新数据
                if (mutateBrowseData) {
                    mutateBrowseData();
                }
            }
        } else {
            // 已经在搜索模式下，刷新搜索结果
            if (mutateSearchData) {
                mutateSearchData();
            }
        }
    };

    // 更新产品过滤逻辑，仅在浏览模式下使用
    const filteredProducts = searchMode === 'search'
        ? products
        : products.filter(product =>
            product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.asin?.toLowerCase().includes(searchTerm.toLowerCase())
        );

    // 更新排序逻辑，仅在浏览模式下使用本地排序
    const sortedProducts = searchMode === 'search'
        ? products // 搜索模式下直接使用API返回的排序结果
        : [...filteredProducts].sort((a, b) => {
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

    // 修改页码处理函数
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);

        // 重置批次加载状态
        setBatchedProducts([]);
        setLoadedBatches(1);
        setAllBatchesLoaded(itemsPerPage <= 100); // 如果页面大小小于等于100，则不需要分批加载

        // 在搜索模式下，更新搜索参数以触发API请求
        if (searchMode === 'search') {
            setSearchParams(prev => ({
                ...prev,
                page: newPage
            }));
        }

        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 处理每页显示数量变化
    const handleItemsPerPageChange = (newValue: number) => {
        // 计算当前页在新的分页大小下的位置
        const firstItemIndex = (currentPage - 1) * itemsPerPage;
        const newPage = Math.floor(firstItemIndex / newValue) + 1;

        setItemsPerPage(newValue);
        setCurrentPage(newPage);
        setRenderedRowCount(Math.min(100, sortedProducts.length)); // 将重置的渲染行数改为100

        // 在搜索模式下，更新搜索参数
        if (searchMode === 'search') {
            setSearchParams(prev => ({
                ...prev,
                page: newPage,
                page_size: 100 // 确保API请求始终使用100作为页大小
            }));
        }

        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 修改排序处理函数
    const handleSort = (field: string) => {
        const newDirection = sortField === field && sortDirection === 'desc' ? 'asc' : 'desc';

        setSortField(field);
        setSortDirection(newDirection);

        // 重置批次加载状态
        setBatchedProducts([]);
        setLoadedBatches(1);
        setAllBatchesLoaded(itemsPerPage <= 100);

        // 在搜索模式下，更新搜索参数以触发API请求
        if (searchMode === 'search') {
            setSearchParams(prev => ({
                ...prev,
                sort_by: field as 'relevance' | 'price' | 'discount' | 'created',
                sort_order: newDirection
            }));
        }

        // Scroll to top of table when sorting changes
        if (tableRef.current) {
            tableRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // 修改渲染行数的设置逻辑
    useEffect(() => {
        if (sortedProducts.length > 0) {
            // 增加初始渲染行数，确保显示更多行
            if (renderedRowCount === 0 || renderedRowCount < Math.min(100, sortedProducts.length)) {
                console.log(`设置渲染行数: 从${renderedRowCount}增加到${Math.min(100, sortedProducts.length)}`);
                setRenderedRowCount(Math.min(100, sortedProducts.length));
            }

            // 创建 Intersection Observer 实例
            const observer = new IntersectionObserver(
                (entries) => {
                    if (entries[0]?.isIntersecting) {
                        console.log(`检测到底部可见，当前渲染行数:${renderedRowCount}，总行数:${sortedProducts.length}`);

                        if (renderedRowCount < sortedProducts.length) {
                            // 当最后一行可见时，增加渲染行数
                            const newRowCount = Math.min(renderedRowCount + 20, sortedProducts.length);

                            console.log(`增加渲染行数到 ${newRowCount}`);
                            setRenderedRowCount(newRowCount);
                        } else if (!allBatchesLoaded && itemsPerPage > 100 && batchedProducts.length < itemsPerPage) {
                            // 如果已经渲染了所有当前加载的产品，但还有更多批次要加载
                            console.log(`所有当前数据已渲染，尝试加载下一批，当前已加载:${batchedProducts.length}/${itemsPerPage}`);
                            loadNextBatch();
                        } else {
                            console.log(`所有数据已渲染完毕，无需加载更多`);
                        }
                    }
                },
                {
                    threshold: 0.1,
                    rootMargin: '100px'  // 提前100px开始观察，提高用户体验
                }
            );

            rowObserverRef.current = observer;

            // 确保观察最后一行，触发加载
            if (lastRowRef.current) {
                console.log('设置观察最后一行');
                rowObserverRef.current.observe(lastRowRef.current);
            }

            // 当列表或观察器变化时清理和重新设置
            return () => {
                if (rowObserverRef.current) {
                    rowObserverRef.current.disconnect();
                }
            };
        }
    }, [sortedProducts.length, renderedRowCount, loadNextBatch, allBatchesLoaded, itemsPerPage, batchedProducts.length]);

    // Get sort icon based on field and current sort state
    const getSortIcon = (field: string) => {
        if (sortField !== field) return <FaSort className="ml-1 text-gray-400" size={12} />;

        return sortDirection === 'desc' ?
            <FaSortDown className="ml-1 text-blue-500" size={12} /> :
            <FaSortUp className="ml-1 text-blue-500" size={12} />;
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

    // Render a responsive pagination display based on screen size
    const renderPagination = () => {
        // For extra small screens (xs), show minimal pagination
        if (screenSize === 'xs') {
            return (
                <div className="flex justify-between w-full">
                    <button
                        onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-2 py-1 text-xs border rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700'}`}
                    >
                        Prev
                    </button>
                    <span className="px-2 py-1 text-xs">{currentPage} / {totalPages}</span>
                    <button
                        onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
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
                            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                            disabled={currentPage === 1}
                            className={`px-2 py-1 text-xs border rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700'}`}
                        >
                            Prev
                        </button>
                        <button
                            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
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
                        onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        Prev
                    </button>
                    {pageNumbers.map(pageNumber => (
                        <button
                            key={`page-${pageNumber}`}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${currentPage === pageNumber
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {pageNumber}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
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

    // 渲染"每页显示"下拉选择组件
    const renderItemsPerPageSelect = () => {
        const options = [10, 50, 100, 500, 1000];

        // 为不同屏幕尺寸设计不同样式
        if (screenSize === 'xs' || screenSize === 'sm') {
            return (
                <div className="flex items-center space-x-1 text-xs">
                    <span>Show:</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        className="border border-gray-300 rounded py-1 px-1 bg-white text-xs"
                    >
                        {options.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
            );
        }

        return (
            <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-500">Show:</span>
                <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="border border-gray-300 rounded py-1 px-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                    {options.map(option => (
                        <option key={option} value={option}>
                            {option} per page
                        </option>
                    ))}
                </select>
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

    // Check user permissions
    if (!session?.user?.role || (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.SUPER_ADMIN)) {
        return <div className="p-4 bg-red-50 text-red-600 rounded-lg">You don&apos;t have permission to access this page</div>;
    }

    // 渲染搜索状态信息
    const renderSearchStatus = () => {
        if (searchMode !== 'search' || !searchParams.keyword) return null;

        return (
            <div className="bg-blue-50 border border-blue-100 text-blue-800 rounded-lg p-2 mb-4 flex justify-between items-center">
                <div>
                    Search results for <span className="font-medium">&quot;{searchParams.keyword}&quot;</span>:
                    {totalProducts} products
                </div>
                <button
                    onClick={clearSearch}
                    className="text-sm bg-white border border-blue-200 rounded px-2 py-1 hover:bg-blue-100"
                >
                    View All Products
                </button>
            </div>
        );
    };

    // 渲染高级搜索面板
    const renderAdvancedSearch = () => (
        <div className="mb-4">
            <button
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center cursor-pointer"
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            >
                {showAdvancedSearch ? <FaChevronUp className="mr-1" /> : <FaChevronDown className="mr-1" />}
                Advanced Search Options
            </button>

            {showAdvancedSearch && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                >
                    {/* 价格范围 */}
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Price Range</label>
                        <div className="flex space-x-2">
                            <input
                                type="number"
                                placeholder="Min"
                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                                value={minPrice || ''}
                                onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                            />
                            <span className="text-gray-500 flex items-center">-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                                value={maxPrice || ''}
                                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                            />
                        </div>
                    </div>

                    {/* 最低折扣率 */}
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Minimum Discount (%)</label>
                        <input
                            type="number"
                            placeholder="e.g. 20"
                            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                            value={minDiscount || ''}
                            onChange={(e) => setMinDiscount(e.target.value ? Number(e.target.value) : undefined)}
                        />
                    </div>

                    {/* 是否只显示Prime商品 */}
                    <div className="flex items-center">
                        <input
                            id="prime-only"
                            type="checkbox"
                            className="h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                            checked={isPrimeOnly || false}
                            onChange={(e) => setIsPrimeOnly(e.target.checked)}
                        />
                        <label htmlFor="prime-only" className="ml-2 block text-sm text-gray-600">
                            Prime Products Only
                        </label>
                    </div>

                    {/* API来源选择 */}
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">API Source</label>
                        <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio h-4 w-4 text-blue-600"
                                    checked={apiProvider === undefined}
                                    onChange={() => setApiProvider(undefined)}
                                />
                                <span className="ml-2 text-sm text-gray-700">All Sources</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio h-4 w-4 text-blue-600"
                                    checked={apiProvider === 'pa-api'}
                                    onChange={() => setApiProvider('pa-api')}
                                />
                                <span className="ml-2 text-sm text-gray-700">Amazon API</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio h-4 w-4 text-blue-600"
                                    checked={apiProvider === 'cj-api'}
                                    onChange={() => setApiProvider('cj-api')}
                                />
                                <span className="ml-2 text-sm text-gray-700">CJ API</span>
                            </label>
                        </div>
                    </div>

                    {/* 应用按钮 */}
                    <div className="col-span-full flex justify-end mt-2">
                        <button
                            onClick={applyAdvancedSearch}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1 text-sm"
                        >
                            Apply Filters
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );

    // 渲染API来源快速筛选按钮
    const renderApiProviderFilters = () => (
        <div className="flex flex-wrap gap-2 mb-4">
            <button
                onClick={() => handleApiProviderChange(undefined)}
                className={`px-3 py-1 text-sm rounded-full ${apiProvider === undefined
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
                All Sources
            </button>
            <button
                onClick={() => handleApiProviderChange('pa-api')}
                className={`px-3 py-1 text-sm rounded-full ${apiProvider === 'pa-api'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
                Amazon API
            </button>
            <button
                onClick={() => handleApiProviderChange('cj-api')}
                className={`px-3 py-1 text-sm rounded-full ${apiProvider === 'cj-api'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
                CJ API
            </button>
        </div>
    );

    // 渲染API来源筛选状态指示器
    const renderApiProviderStatus = () => {
        if (!apiProvider) return null;

        return (
            <div className="bg-blue-50 border border-blue-100 text-blue-800 rounded-lg p-2 mb-4 flex justify-between items-center">
                <div>
                    {searchMode === 'browse' ? 'Browsing' : 'Searching'} products from: <span className="font-medium">{apiProvider === 'pa-api' ? 'Amazon API' : 'CJ API'}</span>
                </div>
                <button
                    onClick={() => handleApiProviderChange(undefined)}
                    className="text-sm bg-white border border-blue-200 rounded px-2 py-1 hover:bg-blue-100"
                >
                    Clear Filter
                </button>
            </div>
        );
    };

    // 渲染空状态
    const renderEmptyState = () => (
        <div className="p-6 text-center text-gray-500">
            {searchMode === 'search' ? (
                <>
                    <div className="text-lg mb-2">No matching products found</div>
                    <p>Try using different search terms or filters</p>
                    <button
                        onClick={clearSearch}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm"
                    >
                        View All Products
                    </button>
                </>
            ) : (
                'No product data available'
            )}
        </div>
    );

    // Handle different view layouts based on screen size
    const renderProductsList = () => {
        console.log(`渲染产品列表: 总产品数:${sortedProducts.length}, 当前渲染数:${renderedRowCount}, 批次加载状态:${batchLoading}`);

        if (loading && !batchLoading) {
            return (
                <div className="animate-pulse p-6 space-y-4">
                    {SKELETON_KEYS.map((key) => (
                        <div key={key} className="h-16 bg-gray-200 rounded w-full" />
                    ))}
                </div>
            );
        }

        if (filteredProducts.length === 0 && !batchLoading) {
            return renderEmptyState();
        }

        return renderScreenSizeTable();
    };

    // 根据屏幕尺寸渲染对应的表格
    const renderScreenSizeTable = () => {
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
                            className="p-6"
                        >
                            {renderEmptyState()}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={listAnimation}
                            className="grid grid-cols-1 gap-4 p-4"
                        >
                            {sortedProducts.slice(0, renderedRowCount).map((product, index) => (
                                <motion.div
                                    layout
                                    key={product.asin}
                                    variants={itemAnimation}
                                    className="bg-white rounded-lg shadow-sm p-3 border border-gray-200 hover:shadow-md transition-shadow duration-300 relative cursor-pointer"
                                    ref={index === renderedRowCount - 1 ? lastRowRef : null}
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
                                        {product.api_provider && (
                                            <div className="absolute top-1 right-1">
                                                {product.api_provider === 'pa-api' ? (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-xs font-medium bg-blue-100 text-blue-800">
                                                        Amazon
                                                    </span>
                                                ) : product.api_provider === 'cj-api' ? (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-xs font-medium bg-green-100 text-green-800">
                                                        CJ
                                                    </span>
                                                ) : null}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {renderedRowCount < sortedProducts.length && (
                                <div className="flex justify-center items-center space-x-2 text-xs text-gray-500 py-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="w-4 h-4 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin" />
                                    <span>Loading more products...</span>
                                </div>
                            )}
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
                            className="p-6"
                        >
                            {renderEmptyState()}
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
                                            <th
                                                scope="col"
                                                className="py-3 px-2 text-center text-xs font-medium text-gray-500 uppercase w-16"
                                            >
                                                Source
                                            </th>
                                            <th scope="col" className="py-3 pl-2 pr-4 text-right text-xs font-medium text-gray-500 uppercase w-20">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {sortedProducts.slice(0, renderedRowCount).map((product, index) => (
                                            <motion.tr
                                                key={product.asin}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    duration: 0.3,
                                                    delay: index * 0.03,
                                                }}
                                                className="hover:bg-gray-50 divide-x divide-gray-200 transition-colors"
                                                ref={index === renderedRowCount - 1 ? lastRowRef : null}
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
                                                            <div className="font-medium text-xs text-gray-900 line-clamp-1 cursor-pointer">{product.title}</div>
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
                                                <td className="py-3 px-2 text-center">
                                                    {product.api_provider === 'pa-api' ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                            Amazon
                                                        </span>
                                                    ) : product.api_provider === 'cj-api' ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                            CJ
                                                        </span>
                                                    ) : (
                                                        '-'
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
                                        {renderedRowCount < sortedProducts.length && (
                                            <tr>
                                                <td colSpan={4} className="px-3 py-4 text-center">
                                                    <div className="flex justify-center items-center space-x-2 text-xs text-gray-500 py-2 bg-gray-50">
                                                        <div className="w-4 h-4 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin" />
                                                        <span>Loading more products...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
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
                                        <th scope="col" className="sticky top-0 z-10 py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-900 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => handleSort('title')}>
                                            Product
                                        </th>
                                        <th scope="col" className="sticky top-0 z-10 px-3 py-3.5 text-left text-xs font-semibold text-gray-900 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => handleSort('asin')}>
                                            ASIN
                                        </th>
                                        <th scope="col" className="sticky top-0 z-10 px-3 py-3.5 text-right text-xs font-semibold text-gray-900 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => handleSort('price')}>
                                            Price
                                        </th>
                                        <th scope="col" className="sticky top-0 z-10 px-3 py-3.5 text-center text-xs font-semibold text-gray-900 bg-gray-50">
                                            Source
                                        </th>
                                        <th scope="col" className="sticky top-0 z-10 px-3 py-3.5 text-right text-xs font-semibold text-gray-900 bg-gray-50">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {sortedProducts.slice(0, renderedRowCount).map((product, index) => (
                                        <tr
                                            key={product.asin}
                                            className="hover:bg-gray-50"
                                            ref={index === renderedRowCount - 1 ? lastRowRef : null}
                                        >
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
                                                        <div className="font-medium text-gray-900 line-clamp-1 cursor-pointer">{product.title}</div>
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
                                            <td className="px-3 py-4 text-sm text-center">
                                                {product.api_provider === 'pa-api' ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                        Amazon
                                                    </span>
                                                ) : product.api_provider === 'cj-api' ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                        CJ
                                                    </span>
                                                ) : (
                                                    '-'
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
                                    {renderedRowCount < sortedProducts.length && (
                                        <tr>
                                            <td colSpan={5} className="px-3 py-4 text-center">
                                                <div className="flex justify-center items-center space-x-2 text-sm text-gray-500 py-2 bg-gray-50">
                                                    <div className="w-5 h-5 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin" />
                                                    <span>Loading more products...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
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
                        className="p-6"
                    >
                        {renderEmptyState()}
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
                                                className="sticky top-0 z-10 px-3 py-3.5 text-left text-xs font-semibold text-gray-900 bg-gray-50 w-[10%] cursor-pointer hover:bg-gray-100 transition-colors"
                                                onClick={() => handleSort('price')}
                                            >
                                                <div className="flex items-center">
                                                    Price
                                                    {getSortIcon('price')}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="sticky top-0 z-10 px-3 py-3.5 text-left text-xs font-semibold text-gray-900 bg-gray-50 w-[10%] cursor-pointer hover:bg-gray-100 transition-colors"
                                                onClick={() => handleSort('discount')}
                                            >
                                                <div className="flex items-center">
                                                    Discount
                                                    {getSortIcon('discount')}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="sticky top-0 z-10 px-3 py-3.5 text-left text-xs font-semibold text-gray-900 bg-gray-50 w-[10%]"
                                            >
                                                Source
                                            </th>
                                            <th scope="col" className="sticky top-0 z-10 px-3 py-3.5 text-right text-xs font-semibold text-gray-900 bg-gray-50 w-[15%]">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {sortedProducts.slice(0, renderedRowCount).map((product, index) => (
                                            <motion.tr
                                                key={product.asin}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    duration: 0.3,
                                                    delay: index * 0.02,
                                                }}
                                                className="hover:bg-gray-50 transition-colors duration-150"
                                                ref={index === renderedRowCount - 1 ? lastRowRef : null}
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
                                                            <div className="font-medium text-gray-900 line-clamp-1 hover:text-blue-600 transition-colors duration-200 cursor-pointer">{product.title}</div>
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
                                                <td className="px-3 py-4 text-sm text-gray-500">
                                                    {product.api_provider === 'pa-api' ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                            Amazon
                                                        </span>
                                                    ) : product.api_provider === 'cj-api' ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                            CJ
                                                        </span>
                                                    ) : (
                                                        '-'
                                                    )}
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
                                        {renderedRowCount < sortedProducts.length && (
                                            <tr>
                                                <td colSpan={6} className="px-3 py-4 text-center">
                                                    <div className="flex justify-center items-center space-x-2 text-sm text-gray-500 py-2 bg-gray-50">
                                                        <div className="w-5 h-5 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin" />
                                                        <span>Loading more products...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
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
                <div className="flex items-center">
                    {renderItemsPerPageSelect()}
                </div>
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

            {/* 搜索栏 */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="relative"
            >
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaSearch className={searchMode === 'search' ? "text-blue-500" : "text-gray-400"} />
                </div>
                <input
                    type="text"
                    className={`bg-gray-50 border ${searchMode === 'search' ? 'border-blue-300 ring-1 ring-blue-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 transition-shadow duration-200 hover:shadow-sm`}
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                {searchTerm && (
                    <button
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        onClick={clearSearch}
                    >
                        <span className="sr-only">Clear search</span>
                        <FaTimes />
                    </button>
                )}
            </motion.div>

            {/* 高级搜索选项 */}
            {renderAdvancedSearch()}

            {/* API来源快速筛选按钮 */}
            {renderApiProviderFilters()}

            {/* 搜索结果状态 */}
            <AnimatePresence>
                {searchMode === 'search' && searchParams.keyword && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        {renderSearchStatus()}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* API来源筛选状态指示器 */}
            <AnimatePresence>
                {apiProvider && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        {renderApiProviderStatus()}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 统计卡片 */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                {renderStatsCards()}
            </motion.div>

            {/* 产品列表 */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
            >
                <div className={screenSize === 'xs' || screenSize === 'sm' || screenSize === 'md' ? '' : 'overflow-x-auto'}>
                    {renderProductsList()}
                </div>

                {/* 分页控件 */}
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

            {/* 删除确认弹窗 */}
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
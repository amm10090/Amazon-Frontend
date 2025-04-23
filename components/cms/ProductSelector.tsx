'use client';

import {
    Modal,
    ModalContent,
    ModalHeader,
    Button,
    Input,
    Skeleton
} from '@heroui/react';
import { debounce } from 'lodash'; // 使用lodash的debounce
import { Search } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useCallback, useMemo } from 'react';

import { productsApi } from '@/lib/api'; // 更新导入
import { showErrorToast } from '@/lib/toast';
import type { Product as ApiProduct, } from '@/types/api'; // 导入API产品类型

// 添加产品样式选项
const PRODUCT_STYLES = [
    { id: 'simple', name: '简单布局' },
    { id: 'card', name: '卡片布局' },
    { id: 'horizontal', name: '水平布局' },
    { id: 'mini', name: '迷你布局' }
];

// 本地产品接口，用于组件内部处理
export interface Product {
    id?: string;
    title: string;
    price?: number;
    main_image?: string; // 与API类型一致
    image_url?: string;  // 与API类型一致
    image?: string;      // 添加可能的 image 字段
    asin?: string;
    style?: string;      // 添加样式属性
}

// 组件属性接口
interface ProductSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    // 确保 onSelect 的参数类型与 ProductBlot 期望的 ProductAttributes 兼容
    // ProductBlot 需要: id, title, price, image, sku
    // 这里 Product 接口包含这些，类型上兼容
    onSelect: (product: Product) => void;
}

// 产品选择器组件
export function ProductSelector({ isOpen, onClose, onSelect }: ProductSelectorProps) {
    // 状态管理
    const [products, setProducts] = useState<Product[]>([]); // 存储适配后的产品数据
    // 移除 filteredProducts 状态，因为过滤将通过 API 完成
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedStyle, setSelectedStyle] = useState('card'); // 添加样式选择状态
    const limit = 10; // 每页显示的产品数量

    // 加载产品数据
    const fetchProducts = useCallback(async (query: string, page: number) => {
        setIsLoading(true);
        try {
            let response;
            let apiProducts: ApiProduct[] = [];
            let totalItems = 0;
            let pageSize = limit;

            if (!query) {
                // 没有搜索词，调用 getProducts
                response = await productsApi.getProducts({
                    page: page,
                    limit: limit,
                    sort_by: 'created', // 默认按创建时间排序或选择其他合适的默认排序
                    sort_order: 'desc'
                });
                // 注意：getProducts 的响应结构被 api.ts 中的函数包装了一层 data
                if (response.data?.data?.items) {
                    apiProducts = response.data.data.items as ApiProduct[];
                    totalItems = response.data.data.total || 0;
                    pageSize = response.data.data.page_size || limit;
                }
            } else {
                // 有搜索词，调用 searchProducts
                response = await productsApi.searchProducts({
                    keyword: query,
                    page: page,
                    page_size: limit,
                    sort_by: 'relevance' // 搜索时使用相关性排序
                });
                // searchProducts 的响应嵌套在 data.data 中
                if (response.data?.data?.items) {
                    apiProducts = response.data.data.items as ApiProduct[];
                    totalItems = response.data.data.total || 0;
                    pageSize = response.data.data.page_size || limit;
                }
            }


            // 统一适配API返回的数据到组件内部的Product接口
            const adaptedProducts: Product[] = apiProducts.map(p => {
                // 尝试从 offers 获取价格
                const priceFromOffers = p.offers && p.offers.length > 0 ? p.offers[0].price : undefined;

                // 使用解构，明确添加style属性
                return {
                    id: p.id || p.asin || '', // 优先使用 id，然后是 asin
                    title: p.title || '',
                    // 优先使用 offers 中的价格，然后是顶层 price，最后是 0
                    price: priceFromOffers !== undefined ? priceFromOffers : (p.price || 0),
                    // 确保优先使用 main_image，其次 image_url
                    main_image: p.main_image || p.image_url || '/placeholder-product.jpg',
                    image_url: p.image_url, // 保留原始字段（如果需要）
                    asin: p.asin || '',
                    style: 'card' // 直接设置默认样式值
                }
            });


            // 如果是第一页，则替换现有产品；否则追加
            setProducts(prev => page === 1 ? adaptedProducts : [...prev, ...adaptedProducts]);

            // 分页信息
            const calculatedTotalPages = Math.ceil(totalItems / pageSize);

            setTotalPages(calculatedTotalPages || 1);
            setCurrentPage(page);

        } catch (err) { // 捕获更具体的错误信息
            showErrorToast({
                title: '获取产品失败',
                description: err instanceof Error ? err.message : '无法连接到服务器或发生错误'
            });
            // 出错时重置状态，使用函数式更新避免依赖
            setProducts(prevProducts => page === 1 ? [] : prevProducts);
            setTotalPages(prevTotalPages => page === 1 ? 1 : prevTotalPages);
            setCurrentPage(prevCurrentPage => page === 1 ? 1 : prevCurrentPage);
        } finally {
            setIsLoading(false);
        }
    }, [limit]); // 更新依赖项，移除 products, totalPages, currentPage

    // 创建防抖函数，直接使用lodash的debounce
    const debouncedFetchProducts = useMemo(() =>
        debounce((query: string, page: number) => fetchProducts(query, page), 300)
        , [fetchProducts]); // 依赖项应为 fetchProducts 本身

    // 初始加载和搜索处理
    useEffect(() => {
        if (isOpen) {
            // 模态框打开时，获取第一页数据，清空搜索词
            setSearchQuery(''); // 清空搜索
            setCurrentPage(1);  // 重置页码
            // setProducts([]);    // 移除：让 fetchProducts 处理第一页替换
            // fetchProducts('', 1); // 移除：让 searchQuery 的 effect 处理初始加载
        }
    }, [isOpen, fetchProducts]); // 移除 debouncedFetchProducts - fetchProducts 引用现在稳定

    // 处理搜索查询变化
    useEffect(() => {
        // 搜索词变化时，重置页码并获取第一页的搜索结果
        setCurrentPage(1);
        setProducts([]); // 清空现有产品以显示新的搜索结果
        debouncedFetchProducts(searchQuery, 1);
    }, [searchQuery, debouncedFetchProducts]); // 依赖搜索词和防抖函数

    // 处理选择产品
    const handleSelectProduct = (product: Product) => {
        // 这里的 product 类型已经是 ProductSelector 内部定义的 Product 接口
        // 它与 ProductAttributes 在所需字段上兼容
        onSelect({
            ...product,
            style: selectedStyle // 使用当前选择的样式
        });
        onClose();
    };

    // 加载更多产品
    const loadMoreProducts = () => {
        if (currentPage < totalPages && !isLoading) {
            fetchProducts(searchQuery, currentPage + 1);
        }
    };

    // 监听滚动到底部加载更多
    const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
        const target = event.currentTarget;

        if (target.scrollHeight - target.scrollTop <= target.clientHeight + 50) { // 接近底部时加载
            loadMoreProducts();
        }
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent className="sm:max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                <ModalHeader>
                    <h3 className="text-lg font-medium">选择产品</h3>
                </ModalHeader>

                {/* 搜索栏 */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="搜索产品名称或SKU..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)} // 直接更新 searchQuery，useEffect 会处理防抖调用
                    />
                </div>

                {/* 产品列表 - 添加滚动事件监听 */}
                <div className="flex-1 overflow-y-auto pr-2" onScroll={handleScroll}>
                    {isLoading && products.length === 0 ? ( // 初始加载时显示骨架屏
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
                        // 无结果状态
                        <div className="text-center py-8 text-gray-500">
                            没有找到匹配的产品
                        </div>
                    ) : (
                        // 产品列表
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {products.map((product) => (
                                <button
                                    key={product.id}
                                    className="flex items-center border rounded-md p-3 hover:bg-gray-50 text-left transition-colors"
                                    onClick={() => handleSelectProduct(product)}
                                >
                                    <div className="w-16 h-16 bg-gray-100 rounded-md mr-3 overflow-hidden relative flex-shrink-0">
                                        {product.main_image && product.main_image !== '/placeholder-product.jpg' ? (
                                            <Image
                                                src={product.main_image}
                                                alt={product.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // 添加 sizes 属性
                                                className="object-cover"
                                                onError={(e) => { e.currentTarget.src = '/placeholder-product.jpg'; }} // 添加错误处理
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs bg-gray-200">
                                                无图片
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0"> {/* 防止文本溢出影响布局 */}
                                        <h4 className="font-medium text-sm truncate">{product.title}</h4> {/* 使用 truncate */}
                                        <div className="text-sm text-green-600">¥{(product.price || 0).toFixed(2)}</div>
                                        {product.asin && (
                                            <div className="text-xs text-gray-500 truncate">SKU: {product.asin}</div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                    {/* 加载更多时的加载指示器 */}
                    {isLoading && products.length > 0 && (
                        <div className="text-center py-4 text-gray-500">
                            加载中...
                        </div>
                    )}
                </div>

                {/* 底部操作 - 修正语法 */}
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                        第 {currentPage} 页 / 共 {totalPages} 页
                    </span>
                    <div>
                        <Button variant="light" onClick={onClose} className="mr-2">
                            取消
                        </Button>
                        {/* 替换管理产品按钮为样式选择下拉菜单 */}
                        <div className="inline-flex">
                            <span className="text-sm mr-2 self-center">显示样式:</span>
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
'use client';

import { Edit, Trash2, Search, Plus, Eye, FileCog, FileText, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

import { cmsApi } from '@/lib/api';
import { showErrorToast, showSuccessToast } from '@/lib/toast';
import { formatDate } from '@/lib/utils';
import type { ContentPage } from '@/types/cms';


/**
 * 内容页面管理组件
 */
const CmsPagesContent = () => {
    const _router = useRouter();
    const { data: _session } = useSession();

    const [pages, setPages] = useState<ContentPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState('updatedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [refreshKey, setRefreshKey] = useState(0);

    // 加载页面数据
    useEffect(() => {
        const fetchPages = async () => {
            setLoading(true);
            try {
                // 构建查询参数
                const params: Record<string, string | number> = {
                    page: currentPage,
                    limit: 10,
                        sortBy: sortBy,
                        sortOrder: sortOrder
                };      

                // 添加搜索条件
                if (search) {
                    params.search = search;
                }

                // 添加状态过滤
                if (statusFilter !== 'all') {
                    params.status = statusFilter;
                }

                const response = await cmsApi.getPages(params);

                if (response.data?.status && response.data?.data) {
                    setPages(response.data.data.pages);
                    setTotalPages(response.data.data.totalPages);
                } else {
                    showErrorToast({
                        title: "加载失败",
                        description: "获取页面列表失败",
                    });
                }
            } catch {
                showErrorToast({
                    title: "加载失败",
                    description: "获取页面列表时出错",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchPages();
    }, [currentPage, search, statusFilter, sortBy, sortOrder, refreshKey]);

    // 处理搜索
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1); // 重置到第一页
    };

    // 处理排序变更
    const handleSortChange = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    // 删除页面
    const handleDeletePage = async (id: string) => {
        if (!confirm('确定要删除此页面吗？此操作不可恢复。')) {
            return;
        }

        try {
            const response = await cmsApi.deletePage(id);

            if (response.data?.status) {
                showSuccessToast({
                    title: "删除成功",
                    description: "页面已成功删除",
                });
                // 刷新列表
                setRefreshKey(prev => prev + 1);
            } else {
                showErrorToast({
                    title: "删除失败",
                    description: "删除页面时出错",
                });
            }
        } catch {
            showErrorToast({
                title: "删除失败",
                description: "删除页面时出错",
            });
        }
    };

    // 渲染状态标签
    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">已发布</span>;
            case 'draft':
                return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">草稿</span>;
            case 'archived':
                return <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700">已归档</span>;
            default:
                return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{status}</span>;
        }
    };

    // 渲染排序图标
    const renderSortIcon = (field: string) => {
        if (sortBy !== field) return null;

        return sortOrder === 'asc'
            ? <span className="ml-1">↑</span>
            : <span className="ml-1">↓</span>;
    };

    // 渲染分页
    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // 如果页数不足，调整开始页
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // 添加首页按钮
        if (startPage > 1) {
            pages.push(
                <button
                    key="first"
                    onClick={() => setCurrentPage(1)}
                    className="px-3 py-1 rounded text-blue-600 hover:bg-blue-50"
                >
                    1
                </button>
            );

            if (startPage > 2) {
                pages.push(<span key="ellipsis1" className="px-2">...</span>);
            }
        }

        // 添加页码按钮
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`px-3 py-1 rounded ${i === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'text-blue-600 hover:bg-blue-50'
                        }`}
                >
                    {i}
                </button>
            );
        }

        // 添加末页按钮
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(<span key="ellipsis2" className="px-2">...</span>);
            }

            pages.push(
                <button
                    key="last"
                    onClick={() => setCurrentPage(totalPages)}
                    className="px-3 py-1 rounded text-blue-600 hover:bg-blue-50"
                >
                    {totalPages}
                </button>
            );
        }

        return (
            <div className="flex justify-center items-center space-x-1 mt-6">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-blue-600 hover:bg-blue-50'
                        }`}
                >
                    上一页
                </button>

                {pages}

                <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-blue-600 hover:bg-blue-50'
                        }`}
                >
                    下一页
                </button>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">内容页面管理</h1>
                <div className="mt-4 md:mt-0">
                    <Link
                        href="/dashboard/cms/pages/create"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={16} className="mr-2" />
                        创建新页面
                    </Link>
                </div>
            </div>

            {/* 过滤和搜索 */}
            <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    <div className="flex-grow">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="搜索页面..."
                                className="pl-10 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={18} className="text-gray-400" />
                            </div>
                            <button type="submit" className="hidden">搜索</button>
                        </form>
                    </div>

                    <div className="flex space-x-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">所有状态</option>
                            <option value="published">已发布</option>
                            <option value="draft">草稿</option>
                            <option value="archived">已归档</option>
                        </select>

                        <button
                            onClick={() => setRefreshKey(prev => prev + 1)}
                            className="px-3 py-2 border rounded-md hover:bg-gray-50"
                            title="刷新列表"
                        >
                            <RefreshCcw size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* 页面列表 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
                        <p className="mt-2 text-gray-500">加载中...</p>
                    </div>
                ) : pages.length === 0 ? (
                    <div className="p-8 text-center">
                        <FileText size={48} className="mx-auto text-gray-300" />
                        <p className="mt-2 text-gray-500">没有找到页面</p>
                        {(search || statusFilter !== 'all') && (
                            <p className="mt-1 text-sm text-gray-400">
                                尝试清除筛选条件或创建新页面
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button
                                            onClick={() => handleSortChange('title')}
                                            className="font-medium flex items-center"
                                        >
                                            标题 {renderSortIcon('title')}
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button
                                            onClick={() => handleSortChange('slug')}
                                            className="font-medium flex items-center"
                                        >
                                            路径 {renderSortIcon('slug')}
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        状态
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button
                                            onClick={() => handleSortChange('updatedAt')}
                                            className="font-medium flex items-center"
                                        >
                                            更新时间 {renderSortIcon('updatedAt')}
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {pages.map((page) => (
                                    <tr key={page._id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{page.title}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-700 truncate max-w-[200px]">/{page.slug}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {renderStatusBadge(page.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{formatDate(new Date(page.updatedAt))}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <Link
                                                    href={`/dashboard/cms/pages/edit/${page._id}`}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="编辑页面"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDeletePage(page._id as string)}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="删除页面"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                                <Link
                                                    href={`/${page.slug}`}
                                                    target="_blank"
                                                    className="text-green-600 hover:text-green-800"
                                                    title="查看页面"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                                <Link
                                                    href={`/dashboard/cms/pages/settings/${page._id}`}
                                                    className="text-gray-600 hover:text-gray-800"
                                                    title="页面设置"
                                                >
                                                    <FileCog size={18} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 分页 */}
                {!loading && pages.length > 0 && renderPagination()}
            </div>
        </div>
    );
};

export default CmsPagesContent; 
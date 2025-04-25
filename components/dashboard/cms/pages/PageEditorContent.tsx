'use client';

import type { Editor } from '@tiptap/react';
import { Save, FileQuestion, ArrowLeft, AlertTriangle, Eye, Edit3 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';

import ContentRenderer from '@/components/cms/ContentRenderer';
import { RichTextEditor } from '@/components/cms/RichTextEditor';
import { cmsApi } from '@/lib/api';
import { generateSlug } from '@/lib/utils';
import type { ContentPage, ContentPageCreateRequest, ContentPageUpdateRequest } from '@/types/cms';

/**
 * 内容页面编辑组件
 * 用于创建和编辑内容页面
 */
const PageEditorContent = () => {
    const router = useRouter();
    const params = useParams();
    const { data: session } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mode, setMode] = useState<'create' | 'edit'>('create');
    const [loadingPage, setLoadingPage] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [showSlugWarning, setShowSlugWarning] = useState(false);
    const [isPreviewActive, setIsPreviewActive] = useState(false);
    const editorInstance = useRef<Editor | null>(null);

    // 页面表单状态
    const [formData, setFormData] = useState<{
        title: string;
        slug: string;
        content: string;
        excerpt: string;
        status: 'draft' | 'published' | 'archived';
        metaTitle?: string;
        metaDescription?: string;
        metaKeywords?: string;
    }>({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        status: 'draft',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: ''
    });

    // 根据路由参数确定模式
    useEffect(() => {
        if (params?.id) {
            setMode('edit');
            loadPage(params.id as string);
        }
    }, [params]);

    // 加载页面数据
    const loadPage = async (id: string) => {
        setLoadingPage(true);
        setLoadError(null);
        try {
            const response = await cmsApi.getPageById(id);

            // 检查 API 响应状态和预期的数据结构（考虑嵌套）
            // 使用具体的类型断言来反映嵌套结构
            const pageContainer = response.data?.data as { data?: ContentPage };

            if (response.data?.status && pageContainer?.data) {
                // 从嵌套结构中提取实际页面数据
                const pageData = pageContainer.data;

                if (pageData) {
                    const newFormData = {
                        title: pageData.title,
                        slug: pageData.slug,
                        content: pageData.content,
                        excerpt: pageData.excerpt || '',
                        status: pageData.status as 'draft' | 'published' | 'archived',
                        metaTitle: pageData.metaTitle || pageData.title,
                        metaDescription: pageData.metaDescription || pageData.excerpt || '',
                        metaKeywords: pageData.metaKeywords || ''
                    };

                    setFormData(newFormData);

                } else {
                    setLoadError('无法加载页面数据 - 未找到页面对象');
                }
            } else {
                setLoadError('无法加载页面数据 - API 状态或数据无效');
            }
        } catch {
            setLoadError('加载页面时出错');
        } finally {
            setLoadingPage(false);
        }
    };

    // 处理表单提交
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title) {
            alert('请输入页面标题');

            return;
        }

        if (!formData.slug) {
            alert('请输入页面URL路径');

            return;
        }

        setIsSubmitting(true);

        try {
            // 对内容进行处理
            const processedContent = formData.content;

            if (mode === 'create') {
                // 创建新页面
                const pageData: ContentPageCreateRequest = {
                    title: formData.title,
                    slug: formData.slug,
                    content: processedContent,
                    excerpt: formData.excerpt,
                    status: formData.status,
                    author: session?.user?.name || session?.user?.email || 'Unknown',
                    categories: [],
                    tags: [],
                    metaTitle: formData.metaTitle || formData.title,
                    metaDescription: formData.metaDescription || formData.excerpt,
                    metaKeywords: formData.metaKeywords
                };

                if (formData.status === 'published') {
                    pageData.publishedAt = new Date();
                }

                const response = await cmsApi.createPage(pageData);

                if (response.data?.status && response.data?.data) {
                    // 创建成功，重定向到页面列表
                    router.push('/dashboard/cms/pages');
                } else {
                    alert('创建页面失败');
                }
            } else {
                // 更新页面
                const pageData: ContentPageUpdateRequest = {
                    title: formData.title,
                    slug: formData.slug,
                    content: processedContent,
                    excerpt: formData.excerpt,
                    status: formData.status,
                    metaTitle: formData.metaTitle || formData.title,
                    metaDescription: formData.metaDescription || formData.excerpt,
                    metaKeywords: formData.metaKeywords
                };

                if (formData.status === 'published') {
                    pageData.publishedAt = new Date();
                }

                const response = await cmsApi.updatePage(params.id as string, pageData);

                if (response.data?.status && response.data?.data) {
                    // 更新成功，重定向到页面列表
                    router.push('/dashboard/cms/pages');
                } else {
                    alert('更新页面失败');
                }
            }
        } catch {
            alert('保存页面时出错');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 阻止Enter键提交表单
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
            // 如果是在输入框中按Enter，阻止默认行为（表单提交）
            // 但允许在textarea和富文本编辑器中使用Enter
            if (e.target.type !== 'textarea') {
                e.preventDefault();
            }
        }
    };

    // 处理标题变更并自动生成slug
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;

        setFormData(prev => ({ ...prev, title: newTitle }));

        // 只有在创建模式且用户尚未手动编辑过slug时才自动更新slug
        if (mode === 'create' && !showSlugWarning) {
            const newSlug = generateSlug(newTitle);

            setFormData(prev => ({ ...prev, slug: newSlug }));
        }

        // 如果元标题为空，自动更新
        if (!formData.metaTitle) {
            setFormData(prev => ({ ...prev, metaTitle: newTitle }));
        }
    };

    // 处理slug变更
    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSlug = e.target.value;

        // 第一次手动编辑slug时显示警告
        if (!showSlugWarning && mode === 'create') {
            setShowSlugWarning(true);
        }

        // 确保slug只包含有效字符
        const sanitizedSlug = newSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

        setFormData(prev => ({ ...prev, slug: sanitizedSlug }));
    };

    // 处理摘要变更并自动更新元描述
    const handleExcerptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newExcerpt = e.target.value;

        setFormData(prev => ({ ...prev, excerpt: newExcerpt }));

        // 如果元描述为空，自动更新
        if (!formData.metaDescription) {
            setFormData(prev => ({ ...prev, metaDescription: newExcerpt }));
        }
    };

    // 获取编辑器实例
    const handleEditorReady = (editor: Editor) => {
        editorInstance.current = editor;
    };

    // 渲染加载状态
    if (mode === 'edit' && loadingPage) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
                <p className="ml-2">加载页面数据...</p>
            </div>
        );
    }

    // 渲染加载错误
    if (mode === 'edit' && loadError) {
        return (
            <div className="text-center py-12">
                <FileQuestion size={48} className="mx-auto text-red-500" />
                <h2 className="text-xl font-semibold mt-4 mb-2">加载错误</h2>
                <p className="text-gray-600">{loadError}</p>
                <button
                    onClick={() => router.push('/dashboard/cms/pages')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    返回页面列表
                </button>
            </div>
        );
    }

    // 切换预览模式
    const togglePreview = () => {
        setIsPreviewActive(!isPreviewActive);
    };

    // 渲染页面预览
    const renderPreview = () => {
        const currentDate = new Date().toLocaleDateString();

        return (
            <main className="container mx-auto px-4 py-8">
                <article className="prose lg:prose-xl max-w-none bg-white p-6 rounded shadow">
                    <h1 className="mb-4">{formData.title}</h1>

                    {formData.excerpt && (
                        <p className="text-gray-600 mb-6 italic">{formData.excerpt}</p>
                    )}

                    <ContentRenderer content={formData.content} className="prose max-w-none" />

                    <div className="mt-8 text-sm text-gray-500 pt-4 border-t">
                        <span>Author: {session?.user?.name || session?.user?.email || 'Unknown'}</span> |
                        <span> Last Updated: {currentDate}</span>
                    </div>
                </article>
            </main>
        );
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <button
                        onClick={() => router.push('/dashboard/cms/pages')}
                        className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
                        aria-label="返回"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold">
                        {mode === 'create' ? 'Create New Blog Post' : 'Edit Blog Post'}
                    </h1>
                </div>
                <button
                    type="button"
                    onClick={togglePreview}
                    className="flex items-center px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
                >
                    {isPreviewActive ? (
                        <>
                            <Edit3 size={18} className="mr-2" />
                            Back to Edit
                        </>
                    ) : (
                        <>
                            <Eye size={18} className="mr-2" />
                            Preview Post
                        </>
                    )}
                </button>
            </div>

            {isPreviewActive ? (
                renderPreview()
            ) : (
                <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
                    {/* 标题输入 */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={formData.title}
                            onChange={handleTitleChange}
                            placeholder="Enter page title..."
                            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    {/* URL路径输入 */}
                    <div>
                        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                            URL Path
                        </label>
                        <div className="flex items-center">
                            <span className="bg-gray-100 px-3 py-2 border border-r-0 rounded-l-md text-gray-500">
                                /
                            </span>
                            <input
                                type="text"
                                id="slug"
                                value={formData.slug}
                                onChange={handleSlugChange}
                                placeholder="url-path"
                                className="flex-1 px-4 py-2 border rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        {showSlugWarning && (
                            <div className="mt-1 flex items-center text-amber-600 text-sm">
                                <AlertTriangle size={16} className="mr-1" />
                                Modifying URL path may affect SEO and existing links
                            </div>
                        )}
                    </div>

                    {/* 摘要输入 */}
                    <div>
                        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                            Excerpt (for SEO description)
                        </label>
                        <textarea
                            id="excerpt"
                            value={formData.excerpt}
                            onChange={handleExcerptChange}
                            placeholder="Enter a brief description of the page..."
                            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={3}
                        />
                    </div>

                    {/* 状态选择 */}
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                            Page Status
                        </label>
                        <select
                            id="status"
                            value={formData.status}
                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' | 'archived' }))}
                            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    {/* 内容编辑器 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Content
                        </label>
                        <RichTextEditor
                            value={formData.content}
                            onChange={(content: string) => setFormData(prev => ({ ...prev, content }))}
                            onEditorReady={handleEditorReady}
                            placeholder="Start editing page content..."
                            className="mb-6"
                        />
                    </div>

                    {/* SEO 元数据部分 */}
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                        <h3 className="text-md font-medium mb-3">SEO Metadata Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
                                    Meta Title (for search engines)
                                </label>
                                <input
                                    type="text"
                                    id="metaTitle"
                                    value={formData.metaTitle || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                                    placeholder="Enter meta title..."
                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Recommended: Within 60 characters, leave blank to use page title
                                </p>
                            </div>
                            <div>
                                <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                    Meta Description
                                </label>
                                <textarea
                                    id="metaDescription"
                                    value={formData.metaDescription || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                                    placeholder="Enter meta description..."
                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows={2}
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Recommended: Within 160 characters, leave blank to use excerpt
                                </p>
                            </div>
                            <div>
                                <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700 mb-1">
                                    Meta Keywords (comma separated)
                                </label>
                                <input
                                    type="text"
                                    id="metaKeywords"
                                    value={formData.metaKeywords || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, metaKeywords: e.target.value }))}
                                    placeholder="keyword1, keyword2, keyword3..."
                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 提交按钮 */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                        >
                            <Save size={18} className="mr-2" />
                            {isSubmitting ? 'Saving...' : 'Save Page'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default PageEditorContent; 
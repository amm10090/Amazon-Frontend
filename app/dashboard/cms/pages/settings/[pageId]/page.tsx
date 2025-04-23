'use client';

import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import {
    Button,
    Input,
    Select,
    SelectItem,
    Textarea,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Checkbox,
    Spinner
} from "@heroui/react";
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { cmsApi } from '@/lib/api';
import { showErrorToast, showSuccessToast } from '@/lib/toast';
import { formatDate } from '@/lib/utils';
import type { ContentPage, ContentCategory, ContentTag } from '@/types/cms';

import { updatePageSettingsAction } from './actions';

// 页面设置组件
export default function PageSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const pageId = params.pageId as string;
    const { pending } = useFormStatus();

    const [pageData, setPageData] = useState<ContentPage | null>(null);
    const [categories, setCategories] = useState<ContentCategory[]>([]);
    const [tags, setTags] = useState<ContentTag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 表单状态
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
    const [excerpt, setExcerpt] = useState('');
    const [featuredImage, setFeaturedImage] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [canonicalUrl, setCanonicalUrl] = useState('');
    const [ogImage, setOgImage] = useState('');

    const [actionState, formAction] = useActionState(updatePageSettingsAction.bind(null, pageId, pageData?.slug), null);

    // 获取初始数据
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [pageRes, catRes, tagRes] = await Promise.all([
                    cmsApi.getPageById(pageId),
                    cmsApi.getCategories({ limit: 1000 }), // 获取所有分类
                    cmsApi.getTags({ limit: 1000 }) // 获取所有标签
                ]);

                if (pageRes.data?.status && pageRes.data.data) {
                    setPageData(pageRes.data.data);
                } else {
                    throw new Error(pageRes.data?.message || '获取页面数据失败');
                }

                if (catRes.data?.status && catRes.data.data?.categories) {
                    setCategories(catRes.data.data.categories);
                } else {
                    throw new Error(catRes.data?.message || '获取分类列表失败');
                }

                if (tagRes.data?.status && tagRes.data.data?.tags) {
                    setTags(tagRes.data.data.tags);
                } else {
                    throw new Error(tagRes.data?.message || '获取标签列表失败');
                }

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : '加载数据时发生未知错误';

                setError(errorMessage);
                showErrorToast({ title: "加载失败", description: errorMessage });
            } finally {
                setIsLoading(false);
            }
        };

        if (pageId) {
            fetchData();
        }
    }, [pageId]);

    // 使用获取到的数据初始化表单状态
    useEffect(() => {
        if (pageData) {
            setTitle(pageData.title || '');
            setSlug(pageData.slug || '');
            setStatus(pageData.status || 'draft');
            setExcerpt(pageData.excerpt || '');
            setFeaturedImage(pageData.featuredImage || '');
            setSelectedCategories(pageData.categories || []);
            setSelectedTags(pageData.tags || []);
            setMetaTitle(pageData.seoData?.metaTitle || '');
            setMetaDescription(pageData.seoData?.metaDescription || '');
            setCanonicalUrl(pageData.seoData?.canonicalUrl || '');
            setOgImage(pageData.seoData?.ogImage || '');
        }
    }, [pageData]);

    // 处理 Action 结果
    useEffect(() => {
        if (actionState?.success) {
            showSuccessToast({ title: '保存成功', description: '页面设置已更新' });
        } else if (actionState?.error) {
            showErrorToast({ title: '保存失败', description: actionState.error });
        }
    }, [actionState]);

    // 处理分类/标签 Checkbox 变化
    const handleCheckboxChange = (
        id: string,
        type: 'category' | 'tag',
        isSelected: boolean
    ) => {
        if (type === 'category') {
            setSelectedCategories(prev =>
                isSelected ? [...prev, id] : prev.filter(catId => catId !== id)
            );
        } else {
            setSelectedTags(prev =>
                isSelected ? [...prev, id] : prev.filter(tagId => tagId !== id)
            );
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" color="primary" />
                <p className="ml-2 text-gray-600">加载中...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center text-red-600 bg-red-50 rounded-md">
                <p>加载页面设置失败: {error}</p>
                <Button variant="bordered" onClick={() => router.back()} className="mt-4" startContent={<ArrowLeftIcon className="h-4 w-4" />}>
                    返回
                </Button>
            </div>
        );
    }

    if (!pageData) {
        return <div className="p-4 text-center text-gray-500">未找到页面数据。</div>;
    }

    return (
        <form action={formAction} className="space-y-6">
            {/* 页面头部和返回按钮 */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">页面设置: {pageData.title}</h1>
                <Button variant="bordered" onClick={() => router.back()} startContent={<ArrowLeftIcon className="h-4 w-4" />}>
                    返回列表
                </Button>
            </div>

            {/* 基本信息卡片 */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">基本信息</h3>
                    <p className="text-sm text-gray-500">修改页面的基础属性。</p>
                </CardHeader>
                <CardBody className="space-y-4">
                    <Input
                        id="title"
                        name="title"
                        label="标题"
                        value={title}
                        onValueChange={setTitle}
                        isRequired
                        fullWidth
                    />
                    <Input
                        id="slug"
                        name="slug"
                        label="URL 路径"
                        value={slug}
                        onValueChange={setSlug}
                        description={`公开访问路径: /${slug}`}
                        isRequired
                        fullWidth
                    />
                    <Select
                        id="status"
                        name="status"
                        label="状态"
                        selectedKeys={[status]}
                        onSelectionChange={(keys) => setStatus(Array.from(keys)[0] as 'draft' | 'published' | 'archived')}
                        isRequired
                    >
                        <SelectItem key="draft">草稿</SelectItem>
                        <SelectItem key="published">已发布</SelectItem>
                        <SelectItem key="archived">已归档</SelectItem>
                    </Select>
                    <Textarea
                        id="excerpt"
                        name="excerpt"
                        label="摘要"
                        value={excerpt}
                        onValueChange={setExcerpt}
                        placeholder="页面的简短描述..."
                        fullWidth
                    />
                    <Input
                        id="featuredImage"
                        name="featuredImage"
                        label="特色图片 URL"
                        value={featuredImage}
                        onValueChange={setFeaturedImage}
                        placeholder="https://example.com/image.jpg"
                        fullWidth
                    />
                </CardBody>
            </Card>

            {/* 分类与标签卡片 */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">分类与标签</h3>
                    <p className="text-sm text-gray-500">管理页面的分类和标签。</p>
                </CardHeader>
                <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 分类选择 */}
                    <div className="space-y-2">
                        <h4 className="font-medium">分类</h4>
                        <div className="space-y-1 max-h-48 overflow-y-auto border rounded p-2">
                            {categories.length > 0 ? categories.map((cat, index) => (
                                <Checkbox
                                    key={cat._id ?? `cat-index-${index}`}
                                    isDisabled={!cat._id}
                                    name="categories[]"
                                    value={cat._id ?? ''}
                                    isSelected={!!cat._id && selectedCategories.includes(cat._id)}
                                    onValueChange={(isSelected) => {
                                        if (cat._id) {
                                            handleCheckboxChange(cat._id, 'category', isSelected);
                                        }
                                    }}
                                >
                                    {cat.name}
                                </Checkbox>
                            )) : <p className="text-sm text-gray-500">没有可用的分类。</p>}
                        </div>
                    </div>

                    {/* 标签选择 */}
                    <div className="space-y-2">
                        <h4 className="font-medium">标签</h4>
                        <div className="space-y-1 max-h-48 overflow-y-auto border rounded p-2">
                            {tags.length > 0 ? tags.map((tag, index) => (
                                <Checkbox
                                    key={tag._id ?? `tag-index-${index}`}
                                    isDisabled={!tag._id}
                                    name="tags[]"
                                    value={tag._id ?? ''}
                                    isSelected={!!tag._id && selectedTags.includes(tag._id)}
                                    onValueChange={(isSelected) => {
                                        if (tag._id) {
                                            handleCheckboxChange(tag._id, 'tag', isSelected);
                                        }
                                    }}
                                >
                                    {tag.name}
                                </Checkbox>
                            )) : <p className="text-sm text-gray-500">没有可用的标签。</p>}
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* SEO 设置卡片 */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">SEO 设置</h3>
                    <p className="text-sm text-gray-500">优化页面在搜索引擎中的表现。</p>
                </CardHeader>
                <CardBody className="space-y-4">
                    <Input
                        id="metaTitle"
                        name="metaTitle"
                        label="Meta 标题"
                        value={metaTitle}
                        onValueChange={setMetaTitle}
                        placeholder="搜索引擎结果中显示的标题"
                        fullWidth
                    />
                    <Textarea
                        id="metaDescription"
                        name="metaDescription"
                        label="Meta 描述"
                        value={metaDescription}
                        onValueChange={setMetaDescription}
                        placeholder="页面的简短 SEO 描述"
                        fullWidth
                    />
                    <Input
                        id="canonicalUrl"
                        name="canonicalUrl"
                        label="规范 URL"
                        type="url"
                        value={canonicalUrl}
                        onValueChange={setCanonicalUrl}
                        placeholder="https://example.com/preferred-url"
                        fullWidth
                    />
                    <Input
                        id="ogImage"
                        name="ogImage"
                        label="SEO 图片 URL"
                        type="url"
                        value={ogImage}
                        onValueChange={setOgImage}
                        placeholder="社交媒体分享时显示的图片 URL"
                        fullWidth
                    />
                </CardBody>
            </Card>

            {/* 日期信息和保存按钮 */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">页面信息</h3>
                </CardHeader>
                <CardBody>
                    <p className="text-sm text-gray-600">创建时间: {pageData.createdAt ? formatDate(new Date(pageData.createdAt)) : 'N/A'}</p>
                    <p className="text-sm text-gray-600">最后更新: {pageData.updatedAt ? formatDate(new Date(pageData.updatedAt)) : 'N/A'}</p>
                </CardBody>
                <CardFooter className="flex justify-end">
                    <Button type="submit" color="primary" isLoading={pending} isDisabled={pending}>
                        {pending ? '保存中...' : '保存更改'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
} 
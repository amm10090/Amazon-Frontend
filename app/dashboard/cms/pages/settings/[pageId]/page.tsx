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

// Page settings component
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

    // Form state
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

    // Get initial data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [pageRes, catRes, tagRes] = await Promise.all([
                    cmsApi.getPageById(pageId),
                    cmsApi.getCategories({ limit: 1000 }), // Get all categories
                    cmsApi.getTags({ limit: 1000 }) // Get all tags
                ]);

                if (pageRes.data?.status && pageRes.data.data) {
                    setPageData(pageRes.data.data);
                } else {
                    throw new Error(pageRes.data?.message || 'Failed to get page data');
                }

                if (catRes.data?.status && catRes.data.data?.categories) {
                    setCategories(catRes.data.data.categories);
                } else {
                    throw new Error(catRes.data?.message || 'Failed to get category list');
                }

                if (tagRes.data?.status && tagRes.data.data?.tags) {
                    setTags(tagRes.data.data.tags);
                } else {
                    throw new Error(tagRes.data?.message || 'Failed to get tag list');
                }

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while loading data';

                setError(errorMessage);
                showErrorToast({ title: "Loading Failed", description: errorMessage });
            } finally {
                setIsLoading(false);
            }
        };

        if (pageId) {
            fetchData();
        }
    }, [pageId]);

    // Initialize form state with fetched data
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

    // Handle Action result
    useEffect(() => {
        if (actionState?.success) {
            showSuccessToast({ title: 'Save Successful', description: 'Page settings have been updated' });
        } else if (actionState?.error) {
            showErrorToast({ title: 'Save Failed', description: actionState.error });
        }
    }, [actionState]);

    // Handle category/tag Checkbox changes
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
                <p className="ml-2 text-gray-600">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center text-red-600 bg-red-50 rounded-md">
                <p>Failed to load page settings: {error}</p>
                <Button variant="bordered" onClick={() => router.push('/dashboard/blog')} className="mt-4" startContent={<ArrowLeftIcon className="h-4 w-4" />}>
                    Back
                </Button>
            </div>
        );
    }

    if (!pageData) {
        return <div className="p-4 text-center text-gray-500">No page data found.</div>;
    }

    return (
        <form action={formAction} className="space-y-6">
            {/* Page header and back button */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Page Settings: {pageData.title}</h1>
                <Button variant="bordered" onClick={() => router.push('/dashboard/blog')} startContent={<ArrowLeftIcon className="h-4 w-4" />}>
                    Back to List
                </Button>
            </div>

            {/* Basic information card */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <p className="text-sm text-gray-500">Modify basic page properties.</p>
                </CardHeader>
                <CardBody className="space-y-4">
                    <Input
                        id="title"
                        name="title"
                        label="Title"
                        value={title}
                        onValueChange={setTitle}
                        isRequired
                        fullWidth
                    />
                    <Input
                        id="slug"
                        name="slug"
                        label="URL Path"
                        value={slug}
                        onValueChange={setSlug}
                        description={`Public access path: /${slug}`}
                        isRequired
                        fullWidth
                    />
                    <Select
                        id="status"
                        name="status"
                        label="Status"
                        selectedKeys={[status]}
                        onSelectionChange={(keys) => setStatus(Array.from(keys)[0] as 'draft' | 'published' | 'archived')}
                        isRequired
                    >
                        <SelectItem key="draft">Draft</SelectItem>
                        <SelectItem key="published">Published</SelectItem>
                        <SelectItem key="archived">Archived</SelectItem>
                    </Select>
                    <Textarea
                        id="excerpt"
                        name="excerpt"
                        label="Excerpt"
                        value={excerpt}
                        onValueChange={setExcerpt}
                        placeholder="Short description of the page..."
                        fullWidth
                    />
                    <Input
                        id="featuredImage"
                        name="featuredImage"
                        label="Featured Image URL"
                        value={featuredImage}
                        onValueChange={setFeaturedImage}
                        placeholder="https://example.com/image.jpg"
                        fullWidth
                    />
                </CardBody>
            </Card>

            {/* Categories and Tags card */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Categories and Tags</h3>
                    <p className="text-sm text-gray-500">Manage page categories and tags.</p>
                </CardHeader>
                <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category selection */}
                    <div className="space-y-2">
                        <h4 className="font-medium">Categories</h4>
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
                            )) : <p className="text-sm text-gray-500">No categories available.</p>}
                        </div>
                    </div>

                    {/* Tag selection */}
                    <div className="space-y-2">
                        <h4 className="font-medium">Tags</h4>
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
                            )) : <p className="text-sm text-gray-500">No tags available.</p>}
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* SEO Settings card */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">SEO Settings</h3>
                    <p className="text-sm text-gray-500">Optimize page performance in search engines.</p>
                </CardHeader>
                <CardBody className="space-y-4">
                    <Input
                        id="metaTitle"
                        name="metaTitle"
                        label="Meta Title"
                        value={metaTitle}
                        onValueChange={setMetaTitle}
                        placeholder="Title displayed in search engine results"
                        fullWidth
                    />
                    <Textarea
                        id="metaDescription"
                        name="metaDescription"
                        label="Meta Description"
                        value={metaDescription}
                        onValueChange={setMetaDescription}
                        placeholder="Short SEO description of the page"
                        fullWidth
                    />
                    <Input
                        id="canonicalUrl"
                        name="canonicalUrl"
                        label="Canonical URL"
                        type="url"
                        value={canonicalUrl}
                        onValueChange={setCanonicalUrl}
                        placeholder="https://example.com/preferred-url"
                        fullWidth
                    />
                    <Input
                        id="ogImage"
                        name="ogImage"
                        label="SEO Image URL"
                        type="url"
                        value={ogImage}
                        onValueChange={setOgImage}
                        placeholder="Image URL displayed when sharing on social media"
                        fullWidth
                    />
                </CardBody>
            </Card>

            {/* Date information and save button */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Page Information</h3>
                </CardHeader>
                <CardBody>
                    <p className="text-sm text-gray-600">Created: {pageData.createdAt ? formatDate(new Date(pageData.createdAt)) : 'N/A'}</p>
                    <p className="text-sm text-gray-600">Last Updated: {pageData.updatedAt ? formatDate(new Date(pageData.updatedAt)) : 'N/A'}</p>
                </CardBody>
                <CardFooter className="flex justify-end">
                    <Button type="submit" color="primary" isLoading={pending} isDisabled={pending}>
                        {pending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
} 
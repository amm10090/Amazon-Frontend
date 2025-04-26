'use server';

import { revalidatePath } from 'next/cache';

import { cmsApi } from '@/lib/api';
import type { ContentPageUpdateRequest } from '@/types/cms';

// MongoDB ObjectId验证函数
function isValidObjectId(id: string): boolean {
    // 检查是否为24位16进制字符串
    return /^[0-9a-fA-F]{24}$/.test(id);
}

export async function updatePageSettingsAction(
    pageId: string,
    originalSlug: string | undefined,
    _previousState: unknown, // Parameter required by useActionState
    formData: FormData
): Promise<{ success: boolean; error?: string; newSlug?: string; debug?: string }> {

    // 添加调试信息

    // 检查pageId的有效性
    if (!pageId || pageId === 'undefined') {
        return { success: false, error: '无效的页面ID', debug: `无效ID: ${pageId}` };
    }

    // 验证MongoDB ObjectId格式
    if (!isValidObjectId(pageId)) {

        return {
            success: false,
            error: '页面ID格式无效，请确认URL中的ID是否正确',
            debug: `无效的ObjectId格式: ${pageId}`
        };
    }

    try {
        // 首先获取现有页面数据，确保保留内容
        const existingPage = await cmsApi.getPageById(pageId);


        const data: ContentPageUpdateRequest = {
            title: formData.get('title') as string,
            slug: formData.get('slug') as string,
            status: formData.get('status') as 'draft' | 'published' | 'archived',
            excerpt: formData.get('excerpt') as string,
            featuredImage: formData.get('featuredImage') as string,
            categories: formData.getAll('categories') as string[],
            tags: formData.getAll('tags') as string[],
            // 保留原有内容
            content: existingPage.data?.data?.content || '',
            seoData: {
                metaTitle: formData.get('metaTitle') as string,
                metaDescription: formData.get('metaDescription') as string,
                canonicalUrl: formData.get('canonicalUrl') as string,
                ogImage: formData.get('ogImage') as string,
            },
        };

        // 记录即将提交的数据

        // Simple validation (can add more complex validation logic here)
        if (!data.title || !data.slug || !data.status) {
            return { success: false, error: 'Title, path and status cannot be empty', debug: '表单验证失败' };
        }

        // Call API to update page
        const response = await cmsApi.updatePage(pageId, data);


        if (!response.data?.status) {
            const errMsg = response.data?.message || 'Failed to update page';

            throw new Error(errMsg);
        }

        // Clear related caches
        // Note: revalidatePath can only be called in Server Action or Route Handler, which is correct here
        revalidatePath('/dashboard/cms/pages'); // List page
        revalidatePath(`/dashboard/cms/pages/settings/${pageId}`); // Current settings page
        revalidatePath(`/dashboard/blog/settings/${pageId}`); // Blog settings page
        if (originalSlug && originalSlug !== data.slug) {
            revalidatePath(`/${originalSlug}`); // Old public page path
        }
        revalidatePath(`/${data.slug}`); // New public page path

        return {
            success: true,
            newSlug: data.slug,
            debug: `页面更新成功: ID=${pageId}, 新slug=${data.slug}`
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

        // 检查是否为网络错误或服务器错误
        let debugInfo = `错误详情: ${errorMessage}`;

        if (error instanceof Error && 'cause' in error) {
            debugInfo += `, 原因: ${JSON.stringify(error.cause)}`;
        }

        // Check if it's a slug conflict error (requires backend API to support specific error messages)
        if (errorMessage.includes('slug') && (errorMessage.includes('unique') || errorMessage.includes('duplicate'))) {
            return {
                success: false,
                error: 'URL path is already taken, please choose another path',
                debug: debugInfo
            };
        }

        // 检查是否为404错误
        if (errorMessage.includes('404') || errorMessage.includes('未找到')) {
            return {
                success: false,
                error: `找不到指定的页面 (ID: ${pageId})，可能已被删除或ID无效`,
                debug: debugInfo
            };
        }

        return {
            success: false,
            error: `Update failed: ${errorMessage}`,
            debug: debugInfo
        };
    }
} 
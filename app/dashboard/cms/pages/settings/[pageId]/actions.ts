'use server';

import { revalidatePath } from 'next/cache';

import { cmsApi } from '@/lib/api';
import type { ContentPageUpdateRequest } from '@/types/cms';

export async function updatePageSettingsAction(
    pageId: string,
    originalSlug: string | undefined,
    _previousState: unknown, // useActionState 需要的参数
    formData: FormData
): Promise<{ success: boolean; error?: string; newSlug?: string }> {

    const data: ContentPageUpdateRequest = {
        title: formData.get('title') as string,
        slug: formData.get('slug') as string,
        status: formData.get('status') as 'draft' | 'published' | 'archived',
        excerpt: formData.get('excerpt') as string,
        featuredImage: formData.get('featuredImage') as string,
        categories: formData.getAll('categories[]') as string[],
        tags: formData.getAll('tags[]') as string[],
        seoData: {
            metaTitle: formData.get('metaTitle') as string,
            metaDescription: formData.get('metaDescription') as string,
            canonicalUrl: formData.get('canonicalUrl') as string,
            ogImage: formData.get('ogImage') as string,
        },
    };

    // 简单的验证 (可以在这里添加更复杂的验证逻辑)
    if (!data.title || !data.slug || !data.status) {
        return { success: false, error: '标题、路径和状态不能为空' };
    }

    try {
        // 调用 API 更新页面
        const response = await cmsApi.updatePage(pageId, data);

        if (!response.data?.status) {
            throw new Error(response.data?.message || '更新页面失败');
        }

        // 清除相关缓存
        // 注意：revalidatePath 只能在 Server Action 或 Route Handler 中调用，这里是正确的
        revalidatePath('/dashboard/cms/pages'); // 列表页
        revalidatePath(`/dashboard/cms/pages/settings/${pageId}`); // 当前设置页
        if (originalSlug && originalSlug !== data.slug) {
            revalidatePath(`/${originalSlug}`); // 旧的公开页面路径
        }
        revalidatePath(`/${data.slug}`); // 新的公开页面路径

        return { success: true, newSlug: data.slug };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '发生未知错误';

        // 检查是否是 slug 冲突错误 (需要后端 API 支持特定的错误信息)
        if (errorMessage.includes('slug') && (errorMessage.includes('unique') || errorMessage.includes('duplicate'))) {
            return { success: false, error: 'URL 路径已被占用，请选择其他路径' };
        }

        return { success: false, error: `更新失败: ${errorMessage}` };
    }
} 
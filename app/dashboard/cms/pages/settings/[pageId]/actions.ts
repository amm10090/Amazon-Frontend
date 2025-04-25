'use server';

import { revalidatePath } from 'next/cache';

import { cmsApi } from '@/lib/api';
import type { ContentPageUpdateRequest } from '@/types/cms';

export async function updatePageSettingsAction(
    pageId: string,
    originalSlug: string | undefined,
    _previousState: unknown, // Parameter required by useActionState
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

    // Simple validation (can add more complex validation logic here)
    if (!data.title || !data.slug || !data.status) {
        return { success: false, error: 'Title, path and status cannot be empty' };
    }

    try {
        // Call API to update page
        const response = await cmsApi.updatePage(pageId, data);

        if (!response.data?.status) {
            throw new Error(response.data?.message || 'Failed to update page');
        }

        // Clear related caches
        // Note: revalidatePath can only be called in Server Action or Route Handler, which is correct here
        revalidatePath('/dashboard/cms/pages'); // List page
        revalidatePath(`/dashboard/cms/pages/settings/${pageId}`); // Current settings page
        if (originalSlug && originalSlug !== data.slug) {
            revalidatePath(`/${originalSlug}`); // Old public page path
        }
        revalidatePath(`/${data.slug}`); // New public page path

        return { success: true, newSlug: data.slug };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

        // Check if it's a slug conflict error (requires backend API to support specific error messages)
        if (errorMessage.includes('slug') && (errorMessage.includes('unique') || errorMessage.includes('duplicate'))) {
            return { success: false, error: 'URL path is already taken, please choose another path' };
        }

        return { success: false, error: `Update failed: ${errorMessage}` };
    }
} 
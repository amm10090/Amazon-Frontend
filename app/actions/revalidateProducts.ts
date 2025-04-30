'use server';

import { revalidateTag } from 'next/cache';

/**
 * Server Action to revalidate the cache for the product list.
 * This is typically called after a product is added, updated, or deleted.
 */
export async function revalidateProductsList() {
    try {
        revalidateTag('products');
        // 返回成功响应（对于Server Action不是必需的，但可以提供反馈）
        // return NextResponse.json({ revalidated: true, now: Date.now() });
    } catch {
        // 抛出错误或返回错误响应
        // throw new Error('Failed to revalidate product cache');
        // return NextResponse.json({ revalidated: false, error: 'Failed to revalidate' }, { status: 500 });
    }
} 
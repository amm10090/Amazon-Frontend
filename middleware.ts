import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname, searchParams } = new URL(request.url);

    // 检查是否使用旧的分类URL格式
    if (pathname === '/product' && (searchParams.has('product_groups') || searchParams.has('category'))) {
        const category = searchParams.get('product_groups') || searchParams.get('category');

        if (category) {
            // 构建新的URL路径 - 使用categoryId作为参数名
            const newPath = `/product/category/${encodeURIComponent(category)}`;

            // 保留其他查询参数
            const newSearchParams = new URLSearchParams();

            searchParams.forEach((value, key) => {
                if (key !== 'product_groups' && key !== 'category') {
                    newSearchParams.append(key, value);
                }
            });

            // 构建完整URL
            const queryString = newSearchParams.toString();
            const redirectUrl = queryString
                ? `${newPath}?${queryString}`
                : newPath;

            // 返回301永久重定向
            return NextResponse.redirect(new URL(redirectUrl, request.url), {
                status: 301
            });
        }
    }

    // 对于其他请求，继续处理
    return NextResponse.next();
}

// 只对特定路径应用middleware
export const config = {
    matcher: ['/product'],
}; 
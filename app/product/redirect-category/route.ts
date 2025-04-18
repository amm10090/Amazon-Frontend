import { NextResponse, type NextRequest } from 'next/server';

// 处理旧URL格式的重定向
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('product_groups') || searchParams.get('category');

    // 如果没有分类参数，重定向到产品主页
    if (!category) {
        return NextResponse.redirect(new URL('/product', request.url));
    }

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
        status: 301,
        headers: {
            'Cache-Control': 'public, max-age=31536000, immutable'
        }
    });
} 
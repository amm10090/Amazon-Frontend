import { NextResponse } from 'next/server';

/**
 * 商品搜索API端点
 * GET /api/search/products
 */
export async function GET(request: Request) {
    try {
        // 获取URL和查询参数
        const url = new URL(request.url);
        const searchParams = url.searchParams;

        // 构建转发到远程服务器的URL
        const remoteUrl = new URL('/api/search/products', 'http://89.116.212.208:5001');

        // 复制所有查询参数
        searchParams.forEach((value, key) => {
            remoteUrl.searchParams.append(key, value);
        });

        // 发送请求到远程服务器
        const response = await fetch(remoteUrl.toString(), {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(process.env.NEXT_PUBLIC_API_KEY && {
                    'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
                })
            }
        });

        if (!response.ok) {
            throw new Error(`远程服务器返回错误：${response.status}`);
        }

        // 解析JSON响应
        const responseData = await response.json();

        // 确保数据结构符合前端预期
        // 前端期望有items属性的数据对象
        return NextResponse.json({
            success: true,
            data: {
                // 如果远程数据已经有data.data结构，则使用它
                // 否则假设远程数据直接是所需的结构
                items: responseData.data?.items || responseData.items || [],
                total: responseData.data?.total || responseData.total || 0,
                page: responseData.data?.page || responseData.page || 1,
                page_size: responseData.data?.page_size || responseData.page_size || 10
            }
        });
    } catch {

        // 返回错误响应
        return NextResponse.json({
            success: false,
            error: '无法搜索商品',
            data: {
                items: [],
                total: 0,
                page: 1,
                page_size: 10
            }
        }, { status: 500 });
    }
} 
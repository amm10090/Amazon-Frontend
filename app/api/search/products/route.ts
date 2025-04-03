import { NextResponse } from 'next/server';

/**
 * 尝试解码URL编码的字符串，处理可能的双重编码问题
 */
function safeDecodeURIComponent(str: string): string {
    try {
        // 首先尝试直接解码
        const decoded = decodeURIComponent(str);

        // 检查结果是否仍包含编码字符(%)，可能是双重编码
        if (decoded.includes('%')) {
            try {
                // 尝试二次解码
                return decodeURIComponent(decoded);
            } catch {
                // 如果二次解码失败，返回第一次解码的结果
                return decoded;
            }
        }

        // 如果没有%符号，表示已完全解码
        return decoded;
    } catch {
        // 如果解码完全失败，返回原字符串
        return str;
    }
}

/**
 * 商品搜索API端点
 * GET /api/search/products
 */
export async function GET(request: Request) {
    try {
        // 获取URL和查询参数
        const url = new URL(request.url);
        const searchParams = new URLSearchParams();


        // 使用Array.from来正确处理URLSearchParams迭代
        Array.from(url.searchParams.entries()).forEach(([key, value]) => {
            // 对于keyword参数，确保它已被正确解码
            if (key === 'keyword') {
                // 安全解码关键词，处理可能的双重编码
                const decodedKeyword = safeDecodeURIComponent(value);

                searchParams.append(key, decodedKeyword);
            } else {
                // 其他参数直接传递
                searchParams.append(key, value);
            }
        });

        // 确保设置默认排序为desc
        if (!searchParams.has('sort_order')) {
            searchParams.append('sort_order', 'desc');
        }

        // 构建转发到远程服务器的URL
        const remoteUrl = new URL('/api/search/products', 'http://89.116.212.208:5001');

        // 将处理后的参数添加到远程URL
        remoteUrl.search = searchParams.toString();


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
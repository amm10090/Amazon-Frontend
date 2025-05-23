import { NextResponse, type NextRequest } from 'next/server';

// 使用SERVER_API_URL环境变量作为基础URL，确保访问实际API服务器
const API_BASE_URL = process.env.SERVER_API_URL;

/**
 * 处理获取单个商品的GET请求
 * 
 * @param request - 请求对象
 * @param params - 路由参数，包含ASIN
 * @returns 包含API响应的NextResponse对象
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { asin: string } }
) {
    try {
        const { asin } = params;

        // 验证ASIN格式（10个字符的字母数字组合）
        if (!asin || asin.length !== 10 || !/^[A-Z0-9]{10}$/.test(asin.toUpperCase())) {
            return NextResponse.json(
                { success: false, error: 'Invalid ASIN format. ASIN must be 10 alphanumeric characters.' },
                { status: 400 }
            );
        }

        // 构建API URL
        const apiUrl = `${API_BASE_URL}/products/${asin.toUpperCase()}`;

        // 发送请求到实际的API服务器
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(process.env.NEXT_PUBLIC_API_KEY && {
                    'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
                })
            }
        });

        // 解析API响应体为JSON
        const data = await response.json();

        // 检查响应状态
        if (!response.ok) {
            // 从响应数据中提取详细错误信息
            const errorMessage = data?.detail || data?.message || data?.error || '获取商品失败';

            return NextResponse.json(
                { success: false, error: errorMessage, details: data },
                { status: response.status }
            );
        }

        // 返回成功响应
        return NextResponse.json(data, { status: response.status });
    } catch {
        // 返回通用的服务器错误响应
        return NextResponse.json(
            { success: false, error: '服务器处理请求时出错' },
            { status: 500 }
        );
    }
}

/**
 * 处理商品更新的PUT请求
 * 
 * @param request - 包含商品数据的请求对象
 * @param params - 路由参数，包含ASIN
 * @returns 包含API响应的NextResponse对象
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { asin: string } }
) {
    try {
        const { asin } = params;

        // 验证ASIN格式（10个字符的字母数字组合）
        if (!asin || asin.length !== 10 || !/^[A-Z0-9]{10}$/.test(asin.toUpperCase())) {
            return NextResponse.json(
                { success: false, error: 'Invalid ASIN format. ASIN must be 10 alphanumeric characters.' },
                { status: 400 }
            );
        }

        // 解析请求体获取商品数据
        const productData = await request.json();

        // 验证请求体中的ASIN与URL中的ASIN是否一致
        if (productData.asin && productData.asin.toUpperCase() !== asin.toUpperCase()) {
            return NextResponse.json(
                { success: false, error: 'ASIN in request body must match ASIN in URL path.' },
                { status: 400 }
            );
        }

        // 确保请求体中包含ASIN
        productData.asin = asin.toUpperCase();

        // 构建API URL
        const apiUrl = `${API_BASE_URL}/products/${asin.toUpperCase()}`;

        // 发送请求到实际的API服务器
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(process.env.NEXT_PUBLIC_API_KEY && {
                    'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
                })
            },
            body: JSON.stringify(productData)
        });

        // 解析API响应体为JSON
        // 即使响应状态码不是 2xx，也要尝试解析响应体以获取错误详情
        const data = await response.json();

        // 检查响应状态
        if (!response.ok) {
            // 记录后端API返回的错误

            // 从响应数据中提取详细错误信息，如果没有则提供通用错误
            const errorMessage = data?.detail || data?.message || data?.error || '更新商品失败';

            // 返回更详细的API错误响应给客户端
            return NextResponse.json(
                { success: false, error: errorMessage, details: data },
                { status: response.status }
            );
        }

        // 返回成功响应
        return NextResponse.json(data, { status: response.status });
    } catch {
        // 记录捕获到的任何其他错误（例如，请求解析错误、fetch本身失败等）

        // 返回通用的服务器错误响应
        return NextResponse.json(
            { success: false, error: '服务器处理请求时出错' },
            { status: 500 }
        );
    }
} 
import { NextResponse } from 'next/server';

/**
 * 健康检查API端点
 * GET /api/health
 */
export async function GET() {
    try {
        // 从远程服务器获取健康状态
        const response = await fetch('http://89.116.212.208:5001/api/health');

        if (!response.ok) {
            throw new Error(`远程服务器返回错误：${response.status}`);
        }

        const data = await response.json();

        return NextResponse.json({
            success: true,
            data
        });
    } catch {

        return NextResponse.json({
            success: false,
            error: '无法获取健康状态'
        }, { status: 500 });
    }
} 
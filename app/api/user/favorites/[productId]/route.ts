/**
 * 单个收藏操作API
 * POST: 添加商品到收藏
 * DELETE: 从收藏中移除商品
 */

import { type NextRequest, NextResponse } from 'next/server';

import {
    validateClientId,
    addToClientFavorites,
    removeFromClientFavorites
} from '@/lib/server/favorites';

/**
 * 处理POST请求，添加商品到收藏
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
): Promise<NextResponse> {
    try {
        // 获取并验证客户端ID
        const clientId = request.headers.get('x-client-id');

        if (!clientId || !validateClientId(clientId)) {
            return NextResponse.json(
                {
                    code: 401,
                    message: '未提供有效的客户端ID',
                    data: null
                },
                { status: 401 }
            );
        }

        // 获取商品ID
        const { productId } = await params;

        if (!productId || typeof productId !== 'string') {
            return NextResponse.json(
                {
                    code: 400,
                    message: '无效的商品ID',
                    data: null
                },
                { status: 400 }
            );
        }

        // 添加收藏
        const _updatedIds = addToClientFavorites(clientId, productId);

        return NextResponse.json(
            {
                code: 200,
                message: '添加收藏成功',
                data: null
            },
            { status: 200 }
        );
    } catch {

        return NextResponse.json(
            {
                code: 500,
                message: '服务器内部错误',
                data: null
            },
            { status: 500 }
        );
    }
}

/**
 * 处理DELETE请求，从收藏中移除商品
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
): Promise<NextResponse> {
    try {
        // 获取并验证客户端ID
        const clientId = request.headers.get('x-client-id');

        if (!clientId || !validateClientId(clientId)) {
            return NextResponse.json(
                {
                    code: 401,
                    message: '未提供有效的客户端ID',
                    data: null
                },
                { status: 401 }
            );
        }

        // 获取商品ID
        const { productId } = await params;

        if (!productId || typeof productId !== 'string') {
            return NextResponse.json(
                {
                    code: 400,
                    message: '无效的商品ID',
                    data: null
                },
                { status: 400 }
            );
        }

        // 移除收藏
        const _updatedIds = removeFromClientFavorites(clientId, productId);

        return NextResponse.json(
            {
                code: 200,
                message: '移除收藏成功',
                data: null
            },
            { status: 200 }
        );
    } catch {

        return NextResponse.json(
            {
                code: 500,
                message: '服务器内部错误',
                data: null
            },
            { status: 500 }
        );
    }
} 
/**
 * 同步收藏列表API
 * POST: 同步本地收藏到服务器
 */

import { type NextRequest, NextResponse } from 'next/server';

import {
    validateClientId,
    syncClientFavorites
} from '@/lib/server/favorites';

/**
 * 处理POST请求，同步本地收藏到服务器
 */
export async function POST(request: NextRequest) {
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

        // 获取请求体中的商品ID数组
        const body = await request.json();
        const { productIds } = body;

        if (!Array.isArray(productIds)) {
            return NextResponse.json(
                {
                    code: 400,
                    message: '无效的商品ID数组',
                    data: null
                },
                { status: 400 }
            );
        }

        // 同步收藏列表
        const _updatedIds = syncClientFavorites(clientId, productIds);

        return NextResponse.json(
            {
                code: 200,
                message: '同步收藏列表成功',
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
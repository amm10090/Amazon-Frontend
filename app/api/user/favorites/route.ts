/**
 * 收藏列表API
 * GET: 获取用户收藏列表
 */

import { type NextRequest, NextResponse } from 'next/server';

import {
    validateClientId,
    getClientFavoriteIds
} from '@/lib/server/favorites';

/**
 * 处理GET请求，获取用户收藏列表
 */
export async function GET(request: NextRequest) {
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

        // 获取收藏商品ID列表
        const favoriteIds = getClientFavoriteIds(clientId);

        // 这里通常需要根据ID列表获取完整的商品信息
        // 为简化实现，这里直接返回ID列表作为商品对象
        // 在实际应用中，你应该查询数据库或调用API获取完整商品信息
        const favoriteProducts = favoriteIds.map(id => ({
            id,
            asin: id,
            title: `商品 ${id}`,
            // 其他商品字段...
        }));

        // 返回收藏列表
        return NextResponse.json(
            {
                code: 200,
                message: '获取收藏列表成功',
                data: favoriteProducts
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
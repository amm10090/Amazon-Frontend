import { NextResponse } from 'next/server';

import { getFavoriteStats } from '@/lib/services/stats';

/**
 * GET /api/stats/favorites - 获取收藏统计数据
 */
export async function GET() {
    try {
        const stats = await getFavoriteStats();

        return NextResponse.json({ data: stats }, { status: 200 });
    } catch {

        return NextResponse.json(
            { error: '获取收藏统计数据失败' },
            { status: 500 }
        );
    }
} 
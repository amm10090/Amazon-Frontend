import { NextResponse } from 'next/server';

import { getUserStats } from '@/lib/services/stats';

/**
 * GET /api/stats/users - 获取用户统计数据
 */
export async function GET() {
    try {
        const stats = await getUserStats();

        return NextResponse.json({ data: stats }, { status: 200 });
    } catch {

        return NextResponse.json(
            { error: '获取用户统计数据失败' },
            { status: 500 }
        );
    }
} 
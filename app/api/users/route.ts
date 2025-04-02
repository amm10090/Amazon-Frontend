import { NextResponse, type NextRequest } from 'next/server';

import { auth } from '@/auth';
import { UserRole } from '@/lib/models/UserRole';
import clientPromise from '@/lib/mongodb';

// 确保API路由正确注册
export const dynamic = 'force-dynamic';

// 获取用户列表
export async function GET(_request: NextRequest) {
    try {
        // 验证当前用户是否为管理员
        const session = await auth();

        if (!session?.user || (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.SUPER_ADMIN)) {
            return NextResponse.json(
                { error: '无权访问用户列表' },
                { status: 403 }
            );
        }

        // 连接数据库
        const client = await clientPromise;
        const db = client.db();

        // 获取用户列表（不包含密码字段）
        const users = await db.collection('users')
            .find({})
            .project({ password: 0 })
            .sort({ createdAt: -1 })
            .toArray();

        // 处理返回数据格式
        const formattedUsers = users.map(user => ({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || UserRole.USER,
            createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
            lastLogin: user.lastLogin ? user.lastLogin.toISOString() : undefined,
            image: user.image || undefined,
            status: user.status || 'active',
            provider: user.provider || 'credentials'
        }));

        return NextResponse.json({
            message: '获取用户列表成功',
            data: formattedUsers
        });
    } catch {

        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
} 
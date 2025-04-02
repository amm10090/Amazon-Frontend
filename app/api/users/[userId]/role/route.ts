import { ObjectId } from 'mongodb';
import { NextResponse, type NextRequest } from 'next/server';

import { auth } from '@/auth';
import { UserRole, isSuperAdmin } from '@/lib/models/UserRole';
import clientPromise from '@/lib/mongodb';

// 配置路由选项
export const dynamic = 'force-dynamic';

// 更新用户角色
export async function PUT(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        // 验证权限
        const session = await auth();

        if (!session?.user || !isSuperAdmin(session.user.role as UserRole)) {
            return NextResponse.json(
                { error: '仅超级管理员可以更改用户角色' },
                { status: 403 }
            );
        }

        // 验证参数
        const userId = params.userId;

        if (!userId || !ObjectId.isValid(userId)) {
            return NextResponse.json(
                { error: '无效的用户ID' },
                { status: 400 }
            );
        }

        // 获取请求数据
        const { role } = await request.json();

        if (!role || !Object.values(UserRole).includes(role as UserRole)) {
            return NextResponse.json(
                { error: '无效的用户角色' },
                { status: 400 }
            );
        }

        // 防止修改自己的角色
        if (session.user.id === userId) {
            return NextResponse.json(
                { error: '不能修改自己的角色' },
                { status: 400 }
            );
        }

        // 数据库操作
        const client = await clientPromise;
        const db = client.db();
        const objectId = new ObjectId(userId);

        const result = await db.collection('users').updateOne(
            { _id: objectId },
            {
                $set: {
                    role: role as UserRole,
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: '用户不存在' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: '用户角色更新成功',
            id: userId,
            role
        });
    } catch {
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
} 
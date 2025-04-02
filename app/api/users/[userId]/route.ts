import { ObjectId } from 'mongodb';
import { NextResponse, type NextRequest } from 'next/server';

import { auth } from '@/auth';
import { UserRole, isSuperAdmin } from '@/lib/models/UserRole';
import clientPromise from '@/lib/mongodb';

// 配置路由选项
export const dynamic = 'force-dynamic';

// 调试用的全局路由处理器
export async function OPTIONS(_request: NextRequest) {

    return new NextResponse(null, {
        status: 200,
        headers: {
            'Allow': 'GET, DELETE, PATCH, OPTIONS'
        }
    });
}

// 获取用户详情
export async function GET(
    request: NextRequest,
    context: { params: { userId: string } }
) {


    try {
        const { userId } = context.params;


        // 验证权限
        const session = await auth();

        if (!session?.user ||
            (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.SUPER_ADMIN)) {
            return NextResponse.json(
                { error: '无权访问' },
                { status: 403 }
            );
        }

        // 验证参数
        if (!userId || !ObjectId.isValid(userId)) {
            return NextResponse.json(
                { error: '无效的用户ID' },
                { status: 400 }
            );
        }

        // 数据库操作
        const client = await clientPromise;
        const db = client.db();

        const user = await db.collection('users').findOne(
            { _id: new ObjectId(userId) },
            { projection: { password: 0 } }
        );

        if (!user) {
            return NextResponse.json(
                { error: '用户不存在' },
                { status: 404 }
            );
        }

        // 格式化响应数据
        const userData = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || UserRole.USER,
            createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
            lastLogin: user.lastLogin ? user.lastLogin.toISOString() : undefined,
            image: user.image || undefined,
            status: user.status || 'active'
        };

        return NextResponse.json(userData);
    } catch {

        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}

// 删除用户
export async function DELETE(
    request: NextRequest,
    context: { params: { userId: string } }
) {
    try {
        const { userId } = context.params;


        // 验证权限
        const session = await auth();

        if (!session?.user ||
            (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.SUPER_ADMIN)) {
            return NextResponse.json(
                { error: '无权删除用户' },
                { status: 403 }
            );
        }

        // 验证参数
        if (!userId || !ObjectId.isValid(userId)) {
            return NextResponse.json(
                { error: '无效的用户ID' },
                { status: 400 }
            );
        }

        // 防止删除自己
        if (session.user.id === userId) {
            return NextResponse.json(
                { error: '不能删除自己的账户' },
                { status: 400 }
            );
        }

        // 数据库操作
        const client = await clientPromise;
        const db = client.db();
        const objectId = new ObjectId(userId);

        // 查找用户
        const user = await db.collection('users').findOne({ _id: objectId });

        if (!user) {
            return NextResponse.json(
                { error: '用户不存在' },
                { status: 404 }
            );
        }

        // 检查权限（只有超级管理员可以删除管理员）
        if ((user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) &&
            !isSuperAdmin(session.user.role as UserRole)) {
            return NextResponse.json(
                { error: '普通管理员不能删除管理员账户' },
                { status: 403 }
            );
        }

        // 删除用户
        const result = await db.collection('users').deleteOne({ _id: objectId });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { error: '删除用户失败' },
                { status: 500 }
            );
        }

        // 删除关联数据
        await db.collection('favorites').deleteMany({ userId });

        return NextResponse.json({
            message: '用户删除成功',
            id: userId
        });
    } catch {

        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}

// 更新用户基本信息
export async function PATCH(
    request: NextRequest,
    context: { params: { userId: string } }
) {
    try {
        const { userId } = context.params;


        // 验证权限
        const session = await auth();

        if (!session?.user ||
            (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.SUPER_ADMIN)) {
            return NextResponse.json(
                { error: '无权更新用户信息' },
                { status: 403 }
            );
        }

        // 验证参数
        if (!userId || !ObjectId.isValid(userId)) {
            return NextResponse.json(
                { error: '无效的用户ID' },
                { status: 400 }
            );
        }

        // 获取更新数据
        const updateData = await request.json();

        if (!updateData || Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: '未提供更新数据' },
                { status: 400 }
            );
        }

        // 移除不允许更新的字段
        delete updateData.password;
        delete updateData.role;
        delete updateData._id;
        delete updateData.id;

        // 数据库操作
        const client = await clientPromise;
        const db = client.db();
        const objectId = new ObjectId(userId);

        const result = await db.collection('users').updateOne(
            { _id: objectId },
            {
                $set: {
                    ...updateData,
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
            message: '用户信息更新成功',
            id: userId
        });
    } catch {

        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
} 
import { ObjectId } from 'mongodb';
import { type NextRequest, NextResponse } from 'next/server';

import clientPromise from '@/lib/mongodb';

// 定义更新数据的接口
interface UpdateData {
    isProcessed: boolean;
    processedAt?: Date; // 可选属性
    notes?: string; // 可选属性
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // 从params获取ID
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Message ID is required' },
                { status: 400 }
            );
        }

        const { isProcessed, notes } = await request.json();

        // 使用环境变量配置的数据库名
        const dbName = process.env.MONGODB_DB || 'oohunt';

        // 验证ID格式
        if (!ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: 'Invalid message ID' },
                { status: 400 }
            );
        }

        // 验证isProcessed是否为布尔值
        if (typeof isProcessed !== 'boolean') {
            return NextResponse.json(
                { success: false, message: 'Status must be a boolean value' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db(dbName);
        const collection = db.collection('contact_messages');

        // 准备更新数据
        const updateData: UpdateData = {
            isProcessed,
            ...(isProcessed ? { processedAt: new Date() } : {})
        };

        // 如果提供了备注，更新备注
        if (notes !== undefined) {
            updateData.notes = notes;
        }

        // 更新留言状态
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { success: false, message: 'Message not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Message has been ${isProcessed ? 'processed' : 'marked as pending'}`
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to update message status, please try again later',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 
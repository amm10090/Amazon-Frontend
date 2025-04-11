import { ObjectId } from 'mongodb';
import { type NextRequest, NextResponse } from 'next/server';

import clientPromise from '@/lib/mongodb';

// 查看留言详情
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // 从params获取ID
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Message ID is required' },
                { status: 400 }
            );
        }

        // 使用环境变量配置的数据库名
        const dbName = process.env.MONGODB_DB || 'oohunt';

        // 验证ID格式
        if (!ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: 'Invalid message ID' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db(dbName);
        const collection = db.collection('contact_messages');

        // 查询留言
        const message = await collection.findOne({ _id: new ObjectId(id) });

        if (!message) {
            return NextResponse.json(
                { success: false, message: 'Message not found' },
                { status: 404 }
            );
        }

        // 格式化留言数据
        const formattedMessage = {
            id: message._id.toString(),
            name: message.name,
            email: message.email,
            message: message.message,
            subject: message.subject,
            phone: message.phone,
            createdAt: message.createdAt instanceof Date ? message.createdAt.toISOString() : message.createdAt,
            isProcessed: message.isProcessed,
            processedAt: message.processedAt instanceof Date ? message.processedAt.toISOString() : message.processedAt,
            notes: message.notes
        };

        return NextResponse.json({
            success: true,
            data: formattedMessage
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to retrieve message details, please try again later',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// 删除留言
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // 从params获取ID
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Message ID is required' },
                { status: 400 }
            );
        }

        // 使用环境变量配置的数据库名
        const dbName = process.env.MONGODB_DB || 'oohunt';

        // 验证ID格式
        if (!ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: 'Invalid message ID' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db(dbName);
        const collection = db.collection('contact_messages');

        // 删除留言
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { success: false, message: 'Message not found or already deleted' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Message has been deleted successfully'
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to delete message, please try again later',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
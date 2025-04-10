import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

import clientPromise from '@/lib/mongodb';

// 获取单个模板
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 处理按templateId查询的情况
        const isObjectId = ObjectId.isValid(id);

        // 连接到MongoDB
        const client = await clientPromise;
        const dbName = process.env.MONGODB_DB || 'oohunt';
        const db = client.db(dbName);
        const collection = db.collection('email_templates');

        // 查询条件：可以是_id或templateId
        const query = isObjectId
            ? { _id: new ObjectId(id) }
            : { templateId: id };

        const template = await collection.findOne(query);

        if (!template) {
            return NextResponse.json(
                { success: false, message: '未找到邮件模板' },
                { status: 404 }
            );
        }

        // 返回完整模板，包括HTML内容
        return NextResponse.json({
            success: true,
            data: {
                id: template._id.toString(),
                templateId: template.templateId,
                name: template.name,
                subject: template.subject,
                fromName: template.fromName,
                fromEmail: template.fromEmail,
                htmlContent: template.htmlContent,
                type: template.type,
                isActive: template.isActive !== undefined ? template.isActive : true,
                updatedAt: template.updatedAt,
                createdAt: template.createdAt
            }
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: '获取邮件模板失败，请稍后重试',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// 更新模板
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 验证ID格式
        if (!ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: '无效的模板ID格式' },
                { status: 400 }
            );
        }

        // 获取请求体数据
        const data = await request.json();
        const { name, subject, fromName, fromEmail, htmlContent, templateId, type, isActive } = data;

        // 数据验证 - 改进为提供更详细的错误信息
        const missingFields = [];

        if (!name) missingFields.push('name');
        if (!subject) missingFields.push('subject');
        if (!fromName) missingFields.push('fromName');
        if (!fromEmail) missingFields.push('fromEmail');
        if (!htmlContent) missingFields.push('htmlContent');
        if (!templateId) missingFields.push('templateId');
        if (!type) missingFields.push('type');

        if (missingFields.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: `this field is required: ${missingFields.join(', ')}`,
                    missingFields
                },
                { status: 400 }
            );
        }

        // 连接到MongoDB
        const client = await clientPromise;
        const dbName = process.env.MONGODB_DB || 'oohunt';
        const db = client.db(dbName);
        const collection = db.collection('email_templates');

        // 检查templateId唯一性（排除当前更新的文档）
        const existingTemplate = await collection.findOne({
            templateId: templateId,
            _id: { $ne: new ObjectId(id) }
        });

        if (existingTemplate) {
            return NextResponse.json(
                { success: false, message: 'A template with the same type and activation already exists' },
                { status: 400 }
            );
        }

        // 更新模板
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    name,
                    subject,
                    fromName,
                    fromEmail,
                    htmlContent,
                    templateId,
                    type,
                    isActive: isActive !== undefined ? isActive : true,
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { success: false, message: 'Email template not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Email template updated successfully'
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to update email template, please try again later',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 
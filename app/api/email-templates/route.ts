import { NextResponse } from 'next/server';

import clientPromise from '@/lib/mongodb';

export async function GET(_request: Request) {
    try {
        // 连接到MongoDB
        const client = await clientPromise;
        const dbName = process.env.MONGODB_DB || 'oohunt';
        const db = client.db(dbName);

        // 获取email_templates集合
        const collection = db.collection('email_templates');

        // 查询所有模板
        const templates = await collection.find({}).toArray();

        // 格式化返回结果
        const formattedTemplates = templates.map(template => ({
            id: template._id.toString(),
            templateId: template.templateId,
            name: template.name,
            subject: template.subject,
            fromName: template.fromName,
            fromEmail: template.fromEmail,
            updatedAt: template.updatedAt,
            createdAt: template.createdAt
        }));

        return NextResponse.json({
            success: true,
            data: formattedTemplates
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

// 创建新模板
export async function POST(request: Request) {
    try {
        // 获取请求体数据
        const data = await request.json();
        const { name, subject, fromName, fromEmail, htmlContent, templateId, type, isActive } = data;

        // 数据验证 - 提供详细的错误信息
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

        // 检查templateId唯一性
        const existingTemplate = await collection.findOne({ templateId });

        if (existingTemplate) {
            return NextResponse.json(
                { success: false, message: '模板ID已存在，请使用不同的ID' },
                { status: 400 }
            );
        }

        // 添加创建时间和更新时间
        const now = new Date();
        const templateData = {
            name,
            subject,
            fromName,
            fromEmail,
            htmlContent,
            templateId,
            type,
            isActive: isActive !== undefined ? isActive : true,
            createdAt: now,
            updatedAt: now
        };

        // 插入新模板
        const result = await collection.insertOne(templateData);

        if (!result.acknowledged) {
            return NextResponse.json(
                { success: false, message: '创建模板失败，请稍后重试' },
                { status: 500 }
            );
        }

        // 返回新创建的模板ID
        return NextResponse.json({
            success: true,
            message: '邮件模板创建成功',
            data: {
                id: result.insertedId.toString()
            }
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: '创建邮件模板失败，请稍后重试',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 
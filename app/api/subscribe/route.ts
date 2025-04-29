import { NextResponse } from 'next/server';

import clientPromise from '@/lib/mongodb';

// 初始化Resend - 暂未使用，计划用于发送欢迎邮件
// const resend = new Resend(process.env.RESEND_API_KEY);

// 默认邮件模板 - 仅在数据库模板不可用时使用
const _DEFAULT_EMAIL_TEMPLATE = `
<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 30px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #16A085; margin: 0 0 10px;">Welcome to OOHUNT!</h1>
            <p style="font-size: 16px; color: #666;">Thank you for subscribing.</p>
        </div>
        
        <div style="margin-bottom: 30px; line-height: 1.6;">
            <p>Hello <strong>{{email}}</strong>,</p>
            <p>Thank you for subscribing to our newsletter. You will now receive the latest deals and offers directly to your inbox.</p>
            <p>We&apos;re excited to share amazing deals with you soon!</p>
        </div>
        
        <div style="background-color: #16A085; padding: 15px; border-radius: 4px; text-align: center;">
            <a 
                href="https://example.com/deals" 
                style="color: white; text-decoration: none; font-weight: bold; font-size: 16px;"
            >
                Check Out Today&apos;s Deals
            </a>
        </div>
        
        <div style="margin-top: 30px; font-size: 12px; color: #3999; text-align: center;">
            <p>If you didn&apos;t subscribe to our newsletter, you can ignore this email.</p>
            <p>
                © 2025 OOHUNT. All rights reserved.<br />
                Our company address, City, Country
            </p>
        </div>
    </div>
</div>
`;

// 数据验证
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);
}

// 验证来源类型
function isValidSourceType(sourceType: string): boolean {
    return ['general', 'blog'].includes(sourceType);
}

// 处理订阅请求
export async function POST(request: Request) {
    try {
        // 解析请求体
        const body = await request.json();
        const { email, sourceType = 'general', formId } = body;

        // 验证邮箱
        if (!email || !isValidEmail(email)) {
            return NextResponse.json({
                success: false,
                message: '请提供有效的电子邮件地址'
            }, { status: 400 });
        }

        // 验证来源类型
        if (!isValidSourceType(sourceType)) {
            return NextResponse.json({
                success: false,
                message: '无效的来源类型'
            }, { status: 400 });
        }

        // 连接数据库
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB || 'oohunt');
        const collection = db.collection('subscriptions');

        // 检查是否已存在相同邮箱
        const existingSubscription = await collection.findOne({ email });

        if (existingSubscription) {
            // 更新已有订阅
            await collection.updateOne(
                { email },
                {
                    $set: {
                        updatedAt: new Date(),
                        lastFormId: formId || null,
                    },
                    $addToSet: {
                        sourceTypes: sourceType
                    }
                }
            );

            return NextResponse.json({
                success: true,
                message: '您已成功更新订阅！',
                isUpdate: true
            });
        }

        // 创建新订阅
        await collection.insertOne({
            email,
            sourceTypes: [sourceType],
            formId: formId || null,
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true
        });

        // 返回成功响应
        return NextResponse.json({
            success: true,
            message: '感谢订阅！我们将发送最新资讯到您的邮箱。'
        });

    } catch {

        return NextResponse.json({
            success: false,
            message: '处理您的请求时出错，请稍后再试'
        }, { status: 500 });
    }
} 
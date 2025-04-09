import { NextResponse } from 'next/server';
import { Resend } from 'resend';

import { ensureTemplateExists } from '@/lib/email/email-template-init';
import { EMAIL_TEMPLATE_TYPES } from '@/lib/email/email-template-types';
import { getCompiledEmailTemplate } from '@/lib/email/email-templates';
import clientPromise from '@/lib/mongodb';

// 初始化Resend - 确保API密钥已设置在环境变量中
const resend = new Resend(process.env.RESEND_API_KEY);

// 默认邮件模板 - 仅在数据库模板不可用时使用
const DEFAULT_EMAIL_TEMPLATE = `
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

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { success: false, message: 'Please provide an email address' },
                { status: 400 }
            );
        }

        // 连接到MongoDB - 使用环境变量配置的数据库名
        const client = await clientPromise;
        const dbName = process.env.MONGODB_DB || 'oohunt';
        const db = client.db(dbName);

        // 使用email_subscription作为集合名，与其他API保持一致
        const collection = db.collection('email_subscription');

        // 检查邮箱是否已存在,允许测试邮箱重复发送
        const existingSubscriber = await collection.findOne({ email });
        const devEmail = process.env.DEV_EMAIL;

        if (existingSubscriber && email !== devEmail) {
            return NextResponse.json(
                { success: false, message: 'This email is already subscribed' },
                { status: 400 }
            );
        }

        // 将新订阅者添加到数据库
        await collection.insertOne({
            email,
            subscribedAt: new Date(),
            isActive: true,
        });

        try {
            // 尝试从数据库获取并编译邮件模板，使用模板类型查询
            const templateResult = await getCompiledEmailTemplate(
                EMAIL_TEMPLATE_TYPES.SUBSCRIPTION_CONFIRMATION,
                {
                    email,
                    date: new Date()
                },
                true // 标记为按类型查询
            );

            // 准备发送邮件的配置
            const emailConfig = {
                from: 'onboarding@resend.dev', // 默认发件人
                to: [email],
                subject: 'Welcome to OOHUNT!',
                html: DEFAULT_EMAIL_TEMPLATE.replace('{{email}}', email)
            };

            // 如果成功获取到模板，则使用模板内容
            if (templateResult.success) {
                emailConfig.subject = templateResult.subject || emailConfig.subject;
                emailConfig.html = templateResult.html || emailConfig.html;

                // 如果模板指定了发件人且环境不是开发环境，则使用模板中的发件人
                if (templateResult.from && process.env.NODE_ENV !== 'development') {
                    emailConfig.from = templateResult.from;
                }
            } else {
                // 如果模板不存在或未激活，尝试创建默认模板
                // 这只会在订阅确认模板完全不存在时创建一个新模板
                // 如果模板已存在但被禁用，此操作不会改变其状态
                await ensureTemplateExists(EMAIL_TEMPLATE_TYPES.SUBSCRIPTION_CONFIRMATION);
            }

            // 使用Resend发送确认邮件
            const { error } = await resend.emails.send(emailConfig);

            if (error) {

                return NextResponse.json(
                    { success: false, message: 'Subscription failed, please try again later' },
                    { status: 500 }
                );
            } else {
                return NextResponse.json(
                    { success: true, message: 'Subscription successful!' },
                    { status: 200 }
                );
            }
        } catch {

            return NextResponse.json(
                { success: false, message: 'Subscription failed, please try again later' },
                { status: 500 }
            );
        }
    } catch {

        return NextResponse.json(
            { success: false, message: 'Subscription failed, please try again later' },
            { status: 500 }
        );
    }
} 
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

import clientPromise from '@/lib/mongodb';

// 初始化Resend - 确保API密钥已设置在环境变量中
const resend = new Resend(process.env.RESEND_API_KEY);

// 判断是否启用邮件通知功能（默认启用）
const enableEmailNotification = process.env.ENABLE_CONTACT_EMAIL_NOTIFICATION !== 'false';

// 联系表单提交API
export async function POST(request: Request) {
    try {
        const { name, email, subject, message } = await request.json();

        // 验证必填字段
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { success: false, message: 'All fields are required' },
                { status: 400 }
            );
        }

        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, message: 'Please provide a valid email address' },
                { status: 400 }
            );
        }

        // 连接到MongoDB
        const client = await clientPromise;
        const dbName = process.env.MONGODB_DB || 'oohunt';
        const db = client.db(dbName);
        const collection = db.collection('contact_messages');

        // 将联系信息保存到数据库
        await collection.insertOne({
            name,
            email,
            subject,
            message,
            createdAt: new Date(),
            read: false,
            isProcessed: false,
        });

        // 发送通知邮件给管理员（如果启用了该功能）
        if (enableEmailNotification && process.env.RESEND_API_KEY) {
            const adminEmail = process.env.ADMIN_EMAIL || 'admin@oohunt.com';

            try {
                await resend.emails.send({
                    from: 'noreply@oohunt.com',
                    to: adminEmail,
                    subject: `New contact form message: ${subject}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h1 style="color: #16A085;">New contact form message</h1>
                            <p><strong>Name:</strong> ${name}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Subject:</strong> ${subject}</p>
                            <p><strong>Message:</strong></p>
                            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px;">
                                ${message.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                    `,
                });
            } catch {
                return NextResponse.json(
                    { success: false, message: 'Failed to send email' },
                    { status: 500 }
                );
                // 仅记录邮件发送失败的错误，不影响表单提交成功
            }
        } else

            return NextResponse.json(
                { success: true, message: 'Your message has been sent successfully, we will reply to you as soon as possible!' },
                { status: 200 }
            );
    } catch {
        return NextResponse.json(
            { success: false, message: 'Failed to submit the form' },
            { status: 500 }
        );
    }
} 
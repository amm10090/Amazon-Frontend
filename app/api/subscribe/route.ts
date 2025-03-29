import { NextResponse } from 'next/server';
import { Resend } from 'resend';

import clientPromise from '@/lib/mongodb';

// 初始化Resend - 确保API密钥已设置在环境变量中
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { success: false, message: 'Please provide an email address' },
                { status: 400 }
            );
        }

        // 连接到MongoDB
        const client = await clientPromise;
        const db = client.db('email_subscription');
        const collection = db.collection('email_list');

        // 检查邮箱是否已存在
        const existingSubscriber = await collection.findOne({ email });

        if (existingSubscriber) {
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
            // 使用Resend发送确认邮件
            // 注意：使用Resend的默认域名，或者确保您在Resend上验证了自己的域名
            const { error } = await resend.emails.send({
                from: 'onboarding@resend.dev', // 使用Resend提供的默认发件人
                to: [email],
                subject: 'Welcome to OOHUNT!',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 30px; border-radius: 8px;">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <h1 style="color: #16A085; margin: 0 0 10px;">Welcome to OOHUNT!</h1>
                                <p style="font-size: 16px; color: #666;">Thank you for subscribing.</p>
                            </div>
                            
                            <div style="margin-bottom: 30px; line-height: 1.6;">
                                <p>Hello <strong>${email}</strong>,</p>
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
                            
                            <div style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">
                                <p>If you didn&apos;t subscribe to our newsletter, you can ignore this email.</p>
                                <p>
                                    © 2024 OOHUNT. All rights reserved.<br />
                                    Our company address, City, Country
                                </p>
                            </div>
                        </div>
                    </div>
                `,
            });

            if (error) {
                NextResponse.json(
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

        return NextResponse.json(
            { success: true, message: 'Subscription successful!' },
            { status: 200 }
        );
    } catch {

        return NextResponse.json(
            { success: false, message: 'Subscription failed, please try again later' },
            { status: 500 }
        );
    }
} 
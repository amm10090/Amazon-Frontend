import bcryptjs from 'bcryptjs';
import type { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

// 使用纯JavaScript实现的bcryptjs代替bcrypt，避免原生模块加载问题

import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
    try {
        // 解析请求体获取注册信息
        const { name, email, password } = await request.json();

        // 基本验证
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters long' },
                { status: 400 }
            );
        }

        // 电子邮件格式验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Please provide a valid email address' },
                { status: 400 }
            );
        }

        // 获取数据库连接
        const clientPromiseWithTimeout = Promise.race([
            clientPromise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Database connection timeout')), 30000)
            )
        ]) as Promise<MongoClient>;

        const client = await clientPromiseWithTimeout;
        const db = client.db();

        // 检查电子邮件是否已在使用中
        const existingUser = await db.collection('users').findOne({ email });

        if (existingUser) {
            return NextResponse.json(
                { error: 'This email is already registered' },
                { status: 409 }
            );
        }

        // 使用bcryptjs对密码进行哈希处理
        const saltRounds = 10;
        const hashedPassword = await bcryptjs.hash(password, saltRounds);

        // 创建用户
        const result = await db.collection('users').insertOne({
            name,
            email,
            password: hashedPassword,
            createdAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            message: 'User registered successfully',
            userId: result.insertedId
        });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Registration error:', error);

        // 处理特定错误类型
        if (error instanceof Error) {
            if (error.message === 'Database connection timeout') {
                return NextResponse.json(
                    { error: 'Unable to connect to the database. Please try again later.' },
                    { status: 503 }
                );
            }

            if (error.message.includes('timed out after') || error.message.includes('ETIMEDOUT')) {
                return NextResponse.json(
                    { error: 'Database connection timed out. Please try again later.' },
                    { status: 503 }
                );
            }
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
} 
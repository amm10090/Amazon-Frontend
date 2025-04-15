import { NextResponse } from 'next/server';

import clientPromise from '@/lib/mongodb';
import type { SocialLinks } from '@/types/api';

// 配置路由段缓存 - 缓存10分钟
export const revalidate = 600;

/**
 * GET /api/settings/social-links - 获取社交媒体链接设置
 */
export async function GET() {
    try {
        // 连接数据库
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB || 'oohunt');
        const collection = db.collection('settings');

        // 获取社交媒体链接设置
        const settings = await collection.findOne(
            { id: 'social_links' }
        );

        // 如果找不到设置，返回默认空设置
        if (!settings) {
            return NextResponse.json({
                twitter: '',
                facebook: '',
                instagram: '',
                youtube: '',
                linkedin: '',
                pinterest: '',
            }, {
                headers: {
                    'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=60'
                }
            });
        }

        // 确保返回的数据格式正确
        const socialLinks: SocialLinks = {
            twitter: settings.twitter || '',
            facebook: settings.facebook || '',
            instagram: settings.instagram || '',
            youtube: settings.youtube || '',
            linkedin: settings.linkedin || '',
            pinterest: settings.pinterest || '',
        };

        return NextResponse.json(socialLinks, {
            headers: {
                'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=60'
            }
        });
    } catch {
        return NextResponse.json(
            { error: 'Get social links failed' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/settings/social-links - 更新社交媒体链接设置
 */
export async function PUT(request: Request) {
    try {
        // 解析请求体
        const data = await request.json() as SocialLinks;

        // 验证数据
        const socialLinks: SocialLinks = {
            twitter: data.twitter || '',
            facebook: data.facebook || '',
            instagram: data.instagram || '',
            youtube: data.youtube || '',
            linkedin: data.linkedin || '',
            pinterest: data.pinterest || '',
        };

        // 连接数据库
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB || 'oohunt');
        const collection = db.collection('settings');

        // 更新或创建设置
        await collection.updateOne(
            { id: 'social_links' },
            {
                $set: {
                    ...socialLinks,
                    id: 'social_links', // 确保id字段存在
                    updatedAt: new Date()
                }
            },
            { upsert: true }
        );

        // 返回更新后的数据 - 不缓存PUT响应
        return NextResponse.json(socialLinks, {
            headers: {
                'Cache-Control': 'no-store, must-revalidate'
            }
        });
    } catch {

        return NextResponse.json(
            { error: 'Update social links failed' },
            { status: 500 }
        );
    }
}

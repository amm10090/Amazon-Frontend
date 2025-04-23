import { type NextRequest, NextResponse } from 'next/server';

import clientPromise from '@/lib/mongodb';
import type { ContentPageCreateRequest } from '@/types/cms';

// 获取内容页面列表
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const sortBy = searchParams.get('sortBy') || 'updatedAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status');

        // 获取数据库连接
        const dbName = process.env.MONGODB_DB || 'oohunt';
        const client = await clientPromise;
        const db = client.db(dbName);
        const collection = db.collection('cms_pages');

        // 构建查询条件
        const query: Record<string, unknown> = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        if (status && status !== 'all') {
            query.status = status;
        }

        // 计算总数
        const total = await collection.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        // 获取数据
        const pages = await collection.find(query)
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();

        // 转换数据格式
        const formattedPages = pages.map(page => ({
            ...page,
            _id: page._id.toString(),
            createdAt: page.createdAt instanceof Date ? page.createdAt.toISOString() : page.createdAt,
            updatedAt: page.updatedAt instanceof Date ? page.updatedAt.toISOString() : page.updatedAt,
            publishedAt: page.publishedAt instanceof Date ? page.publishedAt.toISOString() : page.publishedAt
        }));

        return NextResponse.json({
            status: true,
            data: {
                pages: formattedPages,
                totalPages,
                currentPage: page,
                totalItems: total
            }
        });
    } catch (error) {

        return NextResponse.json(
            {
                status: false,
                message: '获取页面列表失败，请稍后再试',
                error: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        );
    }
}

// 创建新的内容页面
export async function POST(request: NextRequest) {
    try {
        const body: ContentPageCreateRequest = await request.json();

        // 验证必填字段
        if (!body.title || !body.slug || !body.content) {
            return NextResponse.json(
                {
                    status: false,
                    message: '标题、URL路径和内容为必填项'
                },
                { status: 400 }
            );
        }

        // 获取数据库连接
        const dbName = process.env.MONGODB_DB || 'oohunt';
        const client = await clientPromise;
        const db = client.db(dbName);
        const collection = db.collection('cms_pages');

        // 检查slug是否已存在
        const existingPage = await collection.findOne({ slug: body.slug });

        if (existingPage) {
            return NextResponse.json(
                {
                    status: false,
                    message: '该URL路径已被使用，请选择其他路径'
                },
                { status: 400 }
            );
        }

        // 构建页面数据
        const now = new Date();
        const pageData = {
            title: body.title,
            slug: body.slug,
            content: body.content,
            excerpt: body.excerpt || '',
            featuredImage: body.featuredImage || '',
            categories: body.categories || [],
            tags: body.tags || [],
            author: body.author || 'Unknown',
            status: body.status || 'draft',
            publishedAt: body.publishedAt || null,
            createdAt: now,
            updatedAt: now,
            seoData: body.seoData || {},
            productIds: body.productIds || []
        };

        // 插入数据
        const result = await collection.insertOne(pageData);

        if (!result.acknowledged) {
            throw new Error('数据库插入失败');
        }

        // 返回创建的页面数据
        return NextResponse.json({
            status: true,
            message: '页面创建成功',
            data: {
                ...pageData,
                _id: result.insertedId.toString()
            }
        });
    } catch (error) {

        return NextResponse.json(
            {
                status: false,
                message: '创建页面失败，请稍后再试',
                error: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        );
    }
} 
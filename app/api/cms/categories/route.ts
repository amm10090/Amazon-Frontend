import { type NextRequest, NextResponse } from 'next/server';

import clientPromise from '@/lib/mongodb';
import type { ContentCategoryCreateRequest } from '@/types/cms';

// 获取分类列表
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const search = searchParams.get('search') || '';
        const parentId = searchParams.get('parentId') || null;

        // 获取数据库连接
        const dbName = process.env.MONGODB_DB || 'oohunt';
        const client = await clientPromise;
        const db = client.db(dbName);
        const collection = db.collection('cms_categories');

        // 构建查询条件
        const query: Record<string, unknown> = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (parentId) {
            query.parentId = parentId;
        } else if (parentId === 'null') {
            query.parentId = { $exists: false };
        }

        // 计算总数
        const total = await collection.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        // 获取数据
        const categories = await collection.find(query)
            .sort({ name: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();

        // 转换数据格式
        const formattedCategories = categories.map(category => ({
            ...category,
            _id: category._id.toString(),
            createdAt: category.createdAt instanceof Date ? category.createdAt.toISOString() : category.createdAt,
            updatedAt: category.updatedAt instanceof Date ? category.updatedAt.toISOString() : category.updatedAt
        }));

        return NextResponse.json({
            status: true,
            data: {
                categories: formattedCategories,
                totalPages,
                currentPage: page,
                totalItems: total
            }
        });
    } catch (error) {

        return NextResponse.json(
            {
                status: false,
                message: '获取分类列表失败，请稍后再试',
                error: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        );
    }
}

// 创建新分类
export async function POST(request: NextRequest) {
    try {
        const body: ContentCategoryCreateRequest = await request.json();

        // 验证必填字段
        if (!body.name || !body.slug) {
            return NextResponse.json(
                {
                    status: false,
                    message: '分类名称和URL路径为必填项'
                },
                { status: 400 }
            );
        }

        // 获取数据库连接
        const dbName = process.env.MONGODB_DB || 'oohunt';
        const client = await clientPromise;
        const db = client.db(dbName);
        const collection = db.collection('cms_categories');

        // 检查slug是否已存在
        const existingCategory = await collection.findOne({ slug: body.slug });

        if (existingCategory) {
            return NextResponse.json(
                {
                    status: false,
                    message: '该URL路径已被使用，请选择其他路径'
                },
                { status: 400 }
            );
        }

        // 构建分类数据
        const now = new Date();
        const categoryData = {
            name: body.name,
            slug: body.slug,
            description: body.description || '',
            parentId: body.parentId || null,
            createdAt: now,
            updatedAt: now
        };

        // 插入数据
        const result = await collection.insertOne(categoryData);

        if (!result.acknowledged) {
            throw new Error('数据库插入失败');
        }

        // 返回创建的分类数据
        return NextResponse.json({
            status: true,
            message: '分类创建成功',
            data: {
                ...categoryData,
                _id: result.insertedId.toString()
            }
        });
    } catch (error) {

        return NextResponse.json(
            {
                status: false,
                message: '创建分类失败，请稍后再试',
                error: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        );
    }
} 
// import { ObjectId } from 'mongodb'; // 恢复导入
// 正确的导入语句
import { type NextRequest, NextResponse } from 'next/server';

import clientPromise from '@/lib/mongodb';
import type { ContentCategoryCreateRequest } from '@/types/cms';

// 获取分类列表
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const _page = parseInt(searchParams.get('page') || '1');
        // 注意：为了计算 postCount，我们暂时移除分页限制，获取所有分类
        const limit = parseInt(searchParams.get('limit') || '500'); // 获取所有分类
        const search = searchParams.get('search') || '';
        const parentId = searchParams.get('parentId') || null;

        // 获取数据库连接
        const dbName = process.env.MONGODB_DB || 'oohunt';
        const client = await clientPromise;
        const db = client.db(dbName);
        const categoriesCollection = db.collection('cms_categories');
        const _pagesCollection = db.collection('cms_pages');

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

        // 使用聚合查询获取分类及其关联的文章数
        const aggregationPipeline = [
            { $match: query },
            { $sort: { name: 1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'cms_pages',
                    let: { categoryId: { $toString: '$_id' } },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ['$$categoryId', '$categories'] },
                                status: 'published'
                            }
                        },
                        { $count: 'count' }
                    ],
                    as: 'relatedPages'
                }
            },
            {
                $addFields: {
                    postCount: { $ifNull: [{ $first: '$relatedPages.count' }, 0] }
                }
            },
            {
                $project: {
                    relatedPages: 0
                }
            }
        ];

        // 获取数据
        const categories = await categoriesCollection.aggregate(aggregationPipeline).toArray();

        // 计算总数
        const total = categories.length;
        // const originalLimit = parseInt(searchParams.get('limit') || '50');
        // const totalPages = Math.ceil(total / originalLimit);

        // 转换数据格式
        const formattedCategories = categories.map(category => ({
            ...category,
            _id: category._id.toString(),
            postCount: category.postCount,
            createdAt: category.createdAt instanceof Date ? category.createdAt.toISOString() : category.createdAt,
            updatedAt: category.updatedAt instanceof Date ? category.updatedAt.toISOString() : category.updatedAt
        }));

        // const startIndex = (page - 1) * originalLimit;
        // const paginatedCategories = formattedCategories.slice(startIndex, startIndex + originalLimit);

        return NextResponse.json({
            status: true,
            data: {
                categories: formattedCategories, // 返回所有带计数的分类
                // totalPages, // 如果恢复分页，则取消注释
                // currentPage: page, // 如果恢复分页，则取消注释
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
// import { ObjectId } from 'mongodb'; // 恢复导入
// 正确的导入语句
import { type NextRequest, NextResponse } from 'next/server';

import clientPromise from '@/lib/mongodb';
import type { ContentTagCreateRequest } from '@/types/cms';

// 获取标签列表
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const _page = parseInt(searchParams.get('page') || '1');
        // 注意：为了计算 postCount，我们暂时移除分页限制，获取所有标签
        // 如果标签数量非常多，后续可能需要优化为更复杂的聚合分页
        const limit = parseInt(searchParams.get('limit') || '500'); // 获取所有标签
        const search = searchParams.get('search') || '';

        // 获取数据库连接
        const dbName = process.env.MONGODB_DB || 'oohunt';
        const client = await clientPromise;
        const db = client.db(dbName);
        const tagsCollection = db.collection('cms_tags');
        const _pagesCollection = db.collection('cms_pages');

        // 构建查询条件
        const query: Record<string, unknown> = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } }
            ];
        }

        // 使用聚合查询获取标签及其关联的文章数
        const aggregationPipeline = [
            // 匹配查询条件
            { $match: query },
            // 按名称排序
            { $sort: { name: 1 } },
            // 限制数量 (暂时获取全部)
            { $limit: limit },
            // 关联 cms_pages 集合
            {
                $lookup: {
                    from: 'cms_pages',
                    // 注意：cms_pages 中的 tags 存储的是 ObjectId 字符串，所以需要转换
                    // 这里假设 tags 字段存储的是 tag._id 的字符串形式
                    let: { tagId: { $toString: '$_id' } },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ['$$tagId', '$tags'] },
                                status: 'published' // 只计算已发布的文章
                            }
                        },
                        { $count: 'count' } // 计算匹配的文章数量
                    ],
                    as: 'relatedPages'
                }
            },
            // 添加 postCount 字段
            {
                $addFields: {
                    postCount: { $ifNull: [{ $first: '$relatedPages.count' }, 0] }
                }
            },
            // 移除不再需要的 relatedPages 字段
            {
                $project: {
                    relatedPages: 0
                }
            }
        ];

        // 获取数据
        const tags = await tagsCollection.aggregate(aggregationPipeline).toArray();

        // 计算总数 (聚合结果的总数)
        // 注意：这里的 total 反映的是聚合查询匹配到的标签总数，而不是所有标签总数
        const total = tags.length;
        // 基于原始的 limit 参数计算分页 (如果需要恢复分页)
        // const originalLimit = parseInt(searchParams.get('limit') || '50');
        // const totalPages = Math.ceil(total / originalLimit);

        // 转换数据格式 (聚合结果已包含 _id)
        const formattedTags = tags.map(tag => ({
            ...tag,
            _id: tag._id.toString(), // 确保 _id 是字符串
            postCount: tag.postCount, // 确保 postCount 存在
            createdAt: tag.createdAt instanceof Date ? tag.createdAt.toISOString() : tag.createdAt,
            updatedAt: tag.updatedAt instanceof Date ? tag.updatedAt.toISOString() : tag.updatedAt
        }));

        // 如果需要恢复分页逻辑，可以在这里对 formattedTags 进行 slice 操作
        // const startIndex = (page - 1) * originalLimit;
        // const paginatedTags = formattedTags.slice(startIndex, startIndex + originalLimit);

        return NextResponse.json({
            status: true,
            data: {
                tags: formattedTags, // 返回所有带计数的标签
                // totalPages, // 如果恢复分页，则取消注释
                // currentPage: page, // 如果恢复分页，则取消注释
                totalItems: total
            }
        });
    } catch (error) {

        return NextResponse.json(
            {
                status: false,
                message: '获取标签列表失败，请稍后再试',
                error: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        );
    }
}

// 创建新标签
export async function POST(request: NextRequest) {
    try {
        const body: ContentTagCreateRequest = await request.json();

        // 验证必填字段
        if (!body.name || !body.slug) {
            return NextResponse.json(
                {
                    status: false,
                    message: '标签名称和URL路径为必填项'
                },
                { status: 400 }
            );
        }

        // 获取数据库连接
        const dbName = process.env.MONGODB_DB || 'oohunt';
        const client = await clientPromise;
        const db = client.db(dbName);
        const collection = db.collection('cms_tags');

        // 检查slug是否已存在
        const existingTag = await collection.findOne({ slug: body.slug });

        if (existingTag) {
            return NextResponse.json(
                {
                    status: false,
                    message: '该URL路径已被使用，请选择其他路径'
                },
                { status: 400 }
            );
        }

        // 构建标签数据
        const now = new Date();
        const tagData = {
            name: body.name,
            slug: body.slug,
            createdAt: now,
            updatedAt: now
        };

        // 插入数据
        const result = await collection.insertOne(tagData);

        if (!result.acknowledged) {
            throw new Error('数据库插入失败');
        }

        // 返回创建的标签数据
        return NextResponse.json({
            status: true,
            message: '标签创建成功',
            data: {
                ...tagData,
                _id: result.insertedId.toString()
            }
        });
    } catch (error) {

        return NextResponse.json(
            {
                status: false,
                message: '创建标签失败，请稍后再试',
                error: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        );
    }
} 
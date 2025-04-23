import { type NextRequest, NextResponse } from 'next/server';

import clientPromise from '@/lib/mongodb';

// 获取产品列表，用于CMS内容页面中嵌入
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || '';
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        // 获取数据库连接
        const dbName = process.env.MONGODB_DB || 'oohunt';
        const client = await clientPromise;
        const db = client.db(dbName);
        const collection = db.collection('products');

        // 构建查询条件
        const query: Record<string, unknown> = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { asin: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            query.categoryId = category;
        }

        // 确保只获取已发布的产品
        query.status = 'published';

        // 计算总数
        const total = await collection.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        // 获取数据
        const products = await collection.find(query)
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();

        // 转换数据格式，只返回CMS嵌入所需的字段
        const formattedProducts = products.map(product => ({
            id: product._id.toString(),
            asin: product.asin || null,
            title: product.title,
            image: product.image || product.primaryImage || product.featuredImage || product.images?.[0] || null,
            price: product.price || product.salePrice || 0,
            rating: product.rating || 0,
            sku: product.sku || ''
        }));

        return NextResponse.json({
            status: true,
            data: {
                products: formattedProducts,
                totalPages,
                currentPage: page,
                totalItems: total
            }
        });
    } catch (error) {

        return NextResponse.json(
            {
                status: false,
                message: '获取产品列表失败，请稍后再试',
                error: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        );
    }
} 
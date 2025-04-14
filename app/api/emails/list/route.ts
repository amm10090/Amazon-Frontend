import { type NextRequest, NextResponse } from 'next/server';

import clientPromise from '@/lib/mongodb';

// MongoDB查询值可能的类型
type MongoQueryValue = string | number | boolean | { $regex: string, $options: string } | Date | RegExp;

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const sort_by = searchParams.get('sort_by') || 'subscribedAt';
        const sort_order = searchParams.get('sort_order') || 'desc';
        const search = searchParams.get('search') || '';
        const is_active = searchParams.get('is_active');
        const collection = searchParams.get('collection') || 'users';

        // 记录使用的数据库名称
        const dbName = process.env.MONGODB_DB || 'oohunt';
        const client = await clientPromise;
        const db = client.db(dbName);
        // 根据collection参数选择不同的集合
        const dbCollection = db.collection(collection === 'email_subscription' ? 'email_subscription' : 'users');

        // 构建查询条件
        const query: Record<string, MongoQueryValue> = {};

        if (search) {
            query.email = { $regex: search, $options: 'i' };
        }

        if (is_active !== null) {
            query.isActive = is_active === 'true';
        }

        // 计算总数
        const total = await dbCollection.countDocuments(query);

        // 获取数据
        const items = await dbCollection.find(query)
            .sort({ [sort_by]: sort_order === 'asc' ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();

        // 转换为前端需要的格式
        const formattedItems = items.map(item => ({
            id: item._id.toString(),
            email: item.email,
            subscribedAt: item.subscribedAt instanceof Date ? item.subscribedAt.toISOString() : item.subscribedAt,
            isActive: item.isActive
        }));

        // 设置响应头以允许跨域和避免缓存
        const headers = new Headers();

        headers.append('Content-Type', 'application/json');
        headers.append('Cache-Control', 'no-cache, no-store, must-revalidate');
        headers.append('Pragma', 'no-cache');
        headers.append('Expires', '0');

        // 允许所有来源，这在生产环境不推荐
        if (process.env.NODE_ENV === 'development') {
            headers.append('Access-Control-Allow-Origin', '*');
            headers.append('Access-Control-Allow-Methods', 'GET, OPTIONS');
            headers.append('Access-Control-Allow-Headers', 'Content-Type');
        }

        return NextResponse.json({
            data: {
                items: formattedItems,
                total,
                page,
                page_size: limit
            },
            success: true
        }, {
            headers: headers
        });
    } catch (error) {
        // 设置响应头以允许跨域和避免缓存
        const headers = new Headers();

        headers.append('Content-Type', 'application/json');
        headers.append('Cache-Control', 'no-cache, no-store, must-revalidate');

        if (process.env.NODE_ENV === 'development') {
            headers.append('Access-Control-Allow-Origin', '*');
            headers.append('Access-Control-Allow-Methods', 'GET, OPTIONS');
            headers.append('Access-Control-Allow-Headers', 'Content-Type');
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to load email list, please try again later',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            {
                status: 500,
                headers: headers
            }
        );
    }
} 
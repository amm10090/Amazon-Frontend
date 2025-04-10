import { type NextRequest, NextResponse } from 'next/server';

import clientPromise from '@/lib/mongodb';

// MongoDB查询值可能的类型
type _MongoQueryValue = string | number | boolean | { $regex: string, $options: string } | Date | RegExp | Record<string, unknown>;

// 定义查询条件的接口
interface Query {
    $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
    isProcessed?: boolean; // 可选属性
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const sort_by = searchParams.get('sort_by') || 'createdAt';
        const sort_order = searchParams.get('sort_order') || 'desc';
        const search = searchParams.get('search') || '';
        const is_processed = searchParams.get('is_processed');

        // Use database name from environment variables
        const dbName = process.env.MONGODB_DB || 'oohunt';
        const client = await clientPromise;
        const db = client.db(dbName);
        // Use contact_messages as collection name
        const collection = db.collection('contact_messages');

        // Build query conditions
        const query: Query = {};

        // If there's a search term, search multiple fields
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } }
            ];
        }

        // If filtering by processing status
        if (is_processed !== null) {
            query.isProcessed = is_processed === 'true';
        }

        // Calculate total
        const total = await collection.countDocuments(query);

        // Get data
        const items = await collection.find(query)
            .sort({ [sort_by]: sort_order === 'asc' ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();

        // Convert to format needed by frontend
        const formattedItems = items.map(item => ({
            id: item._id.toString(),
            name: item.name,
            email: item.email,
            message: item.message,
            subject: item.subject,
            phone: item.phone,
            createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
            isProcessed: item.isProcessed,
            processedAt: item.processedAt instanceof Date ? item.processedAt.toISOString() : item.processedAt,
            notes: item.notes
        }));

        // Set response headers to allow cross-domain and avoid caching
        const headers = new Headers();

        headers.append('Content-Type', 'application/json');
        headers.append('Cache-Control', 'no-cache, no-store, must-revalidate');
        headers.append('Pragma', 'no-cache');
        headers.append('Expires', '0');

        // Allow all sources, which is not recommended in production
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
        // Set response headers to allow cross-domain and avoid caching
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
                message: 'Failed to load contact messages, please try again later',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            {
                status: 500,
                headers: headers
            }
        );
    }
} 
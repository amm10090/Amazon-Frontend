import { type NextRequest, NextResponse } from 'next/server';

import clientPromise from '@/lib/mongodb';

// 定义查询条件的接口
interface Query {
    $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
    isProcessed?: boolean; // 可选属性
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search') || '';
        const is_processed = searchParams.get('is_processed');

        // 使用环境变量配置的数据库名
        const dbName = process.env.MONGODB_DB || 'oohunt';
        const client = await clientPromise;
        const db = client.db(dbName);
        // 使用contact_messages集合
        const collection = db.collection('contact_messages');

        // 构建查询条件
        const query: Query = {};

        // 如果有搜索词，则在多个字段中搜索
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } }
            ];
        }

        // 如果筛选处理状态
        if (is_processed !== null) {
            query.isProcessed = is_processed === 'true';
        }

        // 获取数据
        const items = await collection.find(query).toArray();

        // 转换为CSV格式
        const csvHeader = 'Name,Email,Subject,Message,Date,Status,Phone,Notes\n';
        const csvRows = items.map(item => {
            const name = item.name || '';
            const email = item.email || '';
            const subject = item.subject || '';
            // 净化消息文本，移除引号和换行
            const message = (item.message || '').replace(/"/g, '""').replace(/\n/g, ' ');
            const createdAt = item.createdAt instanceof Date ?
                new Date(item.createdAt).toISOString().split('T')[0] :
                (typeof item.createdAt === 'string' ? item.createdAt.split('T')[0] : 'N/A');
            const status = item.isProcessed ? 'Processed' : 'Pending';
            const phone = item.phone || '';
            const notes = (item.notes || '').replace(/"/g, '""').replace(/\n/g, ' ');

            return `"${name}","${email}","${subject}","${message}","${createdAt}","${status}","${phone}","${notes}"`;
        });

        const csvContent = csvHeader + csvRows.join('\n');

        // 设置响应头为CSV下载
        const headers = new Headers();

        headers.set('Content-Type', 'text/csv; charset=utf-8');
        headers.set('Content-Disposition', `attachment; filename=contact_messages_${new Date().toISOString().split('T')[0]}.csv`);

        return new NextResponse(csvContent, {
            status: 200,
            headers
        });
    } catch (error) {
        // 设置响应头
        const headers = new Headers();

        headers.append('Content-Type', 'application/json');
        headers.append('Cache-Control', 'no-cache, no-store, must-revalidate');

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to export contact messages, please try again later',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            {
                status: 500,
                headers
            }
        );
    }
} 
import { NextResponse, type NextRequest } from 'next/server';

import clientPromise from '@/lib/mongodb';
import type { ContentPageUpdateRequest } from '@/types/cms';

// Get all published content pages
export async function GET() {
    try {
        // Get database connection
        const dbName = process.env.MONGODB_DB || 'oohunt';
        const client = await clientPromise;
        const db = client.db(dbName);
        const collection = db.collection('cms_pages');

        // Query all published pages, sorted by publish date
        const pages = await collection.find(
            { status: 'published' },
            {
                // Limit returned fields for performance
                projection: {
                    title: 1,
                    slug: 1,
                    excerpt: 1,
                    author: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    publishedAt: 1,
                    categories: 1,
                    tags: 1,
                    'seoData.ogImage': 1,
                    'seoData.metaTitle': 1,
                    featuredImage: 1,
                }
            }
        )
            .sort({ publishedAt: -1 }) // Sort by publish date descending
            .limit(20) // Limit return count
            .toArray();

        if (!pages || pages.length === 0) {
            return NextResponse.json({
                status: true,
                data: []
            });
        }

        // Format data
        const formattedPages = pages.map(page => ({
            ...page,
            _id: page._id.toString(),
            createdAt: page.createdAt instanceof Date ? page.createdAt.toISOString() : page.createdAt,
            updatedAt: page.updatedAt instanceof Date ? page.updatedAt.toISOString() : page.updatedAt,
            publishedAt: page.publishedAt instanceof Date ? page.publishedAt.toISOString() : page.publishedAt
        }));

        return NextResponse.json({
            status: true,
            data: formattedPages
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: false,
                message: '获取博客文章失败，请稍后再试',
                error: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        );
    }
}

// Update content page
export async function POST(request: NextRequest) {
    try {
        const body: ContentPageUpdateRequest = await request.json();

        // Validate required fields
        if (!body.slug) {
            return NextResponse.json(
                {
                    status: false,
                    message: 'URL路径为必填项'
                },
                { status: 400 }
            );
        }

        // Get database connection
        const dbName = process.env.MONGODB_DB || 'oohunt';
        const client = await clientPromise;
        const db = client.db(dbName);
        const collection = db.collection('cms_pages');

        // Find the page to update
        const existingPage = await collection.findOne({ slug: body.slug });

        if (!existingPage) {
            return NextResponse.json(
                {
                    status: false,
                    message: '未找到指定的页面'
                },
                { status: 404 }
            );
        }

        // Build update data
        const now = new Date();
        const updateData = {
            ...body,
            updatedAt: now
        };

        // If status changes to published and no publish date is specified, add current time as publish date
        if (body.status === 'published' && !existingPage.publishedAt) {
            updateData.publishedAt = now;
        }

        // Update data
        const result = await collection.updateOne(
            { _id: existingPage._id },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            throw new Error('更新失败，未找到匹配的文档');
        }

        // Get updated page
        const updatedPage = await collection.findOne({ _id: existingPage._id });

        // Format return data
        const formattedPage = {
            ...updatedPage,
            _id: updatedPage?._id.toString(),
            createdAt: updatedPage?.createdAt instanceof Date ? updatedPage.createdAt.toISOString() : updatedPage?.createdAt,
            updatedAt: updatedPage?.updatedAt instanceof Date ? updatedPage.updatedAt.toISOString() : updatedPage?.updatedAt,
            publishedAt: updatedPage?.publishedAt instanceof Date ? updatedPage.publishedAt.toISOString() : updatedPage?.publishedAt
        };

        return NextResponse.json({
            status: true,
            data: formattedPage
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: false,
                message: '更新页面失败，请稍后再试',
                error: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        );
    }
} 
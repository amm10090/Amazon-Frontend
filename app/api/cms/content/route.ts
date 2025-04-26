import { NextResponse } from 'next/server';

import clientPromise from '@/lib/mongodb';

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
                message: 'Failed to fetch blog posts, please try again later',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 
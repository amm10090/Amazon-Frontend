import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const client = await clientPromise;
        const db = client.db();
        const favorites = await db.collection('favorites')
            .find({ userId: session.user.id })
            .toArray();

        return NextResponse.json({ favorites });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error in GET /api/favorites:', error);

        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { productId } = await request.json();

        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db();

        await db.collection('favorites').updateOne(
            { userId: session.user.id, productId },
            { $set: { userId: session.user.id, productId, updatedAt: new Date() } },
            { upsert: true }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error in POST /api/favorites:', error);

        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { productId } = await request.json();

        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db();

        await db.collection('favorites').deleteOne({
            userId: session.user.id,
            productId
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error in DELETE /api/favorites:', error);

        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
} 
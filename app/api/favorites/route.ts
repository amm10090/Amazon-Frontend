import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized - No user in session' },
                { status: 401 }
            );
        }

        if (!session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized - No user ID in session' },
                { status: 401 }
            );
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB || "oohunt");
        const favorites = await db.collection('favorites')
            .find({ userId: session.user.id })
            .toArray();

        return NextResponse.json({ favorites });
    } catch {

        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized - No user in session' },
                { status: 401 }
            );
        }

        if (!session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized - No user ID in session' },
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
        const db = client.db(process.env.MONGODB_DB || "oohunt");

        await db.collection('favorites').updateOne(
            { userId: session.user.id, productId },
            { $set: { userId: session.user.id, productId, updatedAt: new Date() } },
            { upsert: true }
        );

        return NextResponse.json({ success: true });
    } catch {

        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized - No user in session' },
                { status: 401 }
            );
        }

        if (!session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized - No user ID in session' },
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
        const db = client.db(process.env.MONGODB_DB || "oohunt");

        await db.collection('favorites').deleteOne({
            userId: session.user.id,
            productId
        });

        return NextResponse.json({ success: true });
    } catch {

        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
} 
import bcryptjs from 'bcryptjs';
import { NextResponse } from 'next/server';

// Using pure JavaScript implementation bcryptjs instead of bcrypt to avoid native module loading issues

import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
    try {
        // No longer need dynamic import
        const { name, email, password } = await request.json();

        // Basic validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters long' },
                { status: 400 }
            );
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Please provide a valid email address' },
                { status: 400 }
            );
        }

        // Get database connection
        const client = await clientPromise;
        const db = client.db();

        // Check if email is already in use
        const existingUser = await db.collection('users').findOne({ email });

        if (existingUser) {
            return NextResponse.json(
                { error: 'This email is already registered' },
                { status: 409 }
            );
        }

        // Hash the password - using bcryptjs
        const saltRounds = 10;
        const hashedPassword = await bcryptjs.hash(password, saltRounds);

        // Create user
        const result = await db.collection('users').insertOne({
            name,
            email,
            password: hashedPassword,
            createdAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            message: 'User registered successfully',
            userId: result.insertedId
        });
    } catch {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 
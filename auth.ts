import { ObjectId } from "mongodb";
import NextAuth, { type NextAuthConfig } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { UserRole, isAdminAccount } from "@/lib/models/UserRole";

// Strategy: Execute database and authentication related code only on the server side
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let adapter: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let bcryptCompare: any = null;

// Use static configuration to avoid client-side imports of server-side dependencies
export const config = {
    providers: [
        GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID || "",
            clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // Check if credentials are provided
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                try {
                    // Only run on server-side
                    if (typeof window === 'undefined') {
                        // Dynamic import to avoid client-side import errors
                        const clientPromise = (await import('@/lib/mongodb')).default;
                        const bcryptjs = await import('bcryptjs');

                        bcryptCompare = bcryptjs.compare;

                        // 开发环境默认管理员账户
                        if (process.env.NODE_ENV === "development" &&
                            ((credentials.username === "root@amazon-frontend.com" && credentials.password === "admin123") ||
                                (credentials.username === "admin@amazon-frontend.com" && credentials.password === "admin123"))) {
                            return {
                                id: credentials.username === "root@amazon-frontend.com" ? "root" : "admin",
                                name: credentials.username === "root@amazon-frontend.com" ? "Root Admin" : "Admin",
                                email: credentials.username,
                                role: credentials.username === "root@amazon-frontend.com" ? UserRole.SUPER_ADMIN : UserRole.ADMIN
                            };
                        }

                        const client = await clientPromise;
                        const db = client.db();

                        // Find user by email or username
                        const user = await db.collection("users").findOne({
                            $or: [
                                { email: credentials.username },
                                { name: credentials.username }
                            ]
                        });

                        // Check if user exists
                        if (!user) {
                            // In development, allow default account
                            if (process.env.NODE_ENV === "development" &&
                                credentials.username === "admin" &&
                                credentials.password === "password") {
                                return {
                                    id: "1",
                                    name: "Admin",
                                    email: "admin@example.com",
                                    role: UserRole.ADMIN
                                };
                            }

                            return null;
                        }

                        // Compare passwords using bcryptjs
                        const isValid = await bcryptCompare(credentials.password, user.password);

                        if (!isValid) {
                            return null;
                        }

                        // 更新provider字段，如果尚未设置
                        if (!user.provider) {
                            await db.collection("users").updateOne(
                                { _id: user._id },
                                { $set: { provider: 'credentials' } }
                            );
                        }

                        return {
                            id: user._id.toString(),
                            name: user.name || user.username,
                            email: user.email,
                            image: user.image,
                            role: user.role || UserRole.USER,
                            provider: user.provider || 'credentials'
                        };
                    } else {
                        // On client-side, only check development default account
                        if (process.env.NODE_ENV === "development" &&
                            credentials.username === "admin" &&
                            credentials.password === "password") {
                            return {
                                id: "1",
                                name: "Admin",
                                email: "admin@example.com",
                                role: UserRole.ADMIN
                            };
                        }

                        return null;
                    }
                } catch {
                    return null;
                }
            },
        }),
    ],
    basePath: "/auth",
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
    callbacks: {
        authorized({ auth, request }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = request.nextUrl.pathname.startsWith("/dashboard");

            if (isOnDashboard) {
                if (isLoggedIn && auth.user.role && (auth.user.role === UserRole.ADMIN || auth.user.role === UserRole.SUPER_ADMIN)) {
                    return true;
                }

                return false;
            }

            return true;
        },
        async signIn({ user, account }) {
            try {
                // 只在服务器端处理
                if (typeof window === 'undefined' && user?.email) {
                    const clientPromise = (await import('@/lib/mongodb')).default;
                    const client = await clientPromise;
                    const db = client.db();

                    // 检查用户是否已存在
                    const dbUser = await db.collection('users').findOne({ email: user.email });

                    if (!dbUser && account?.provider === 'google') {
                        // 如果是新的 Google 用户，创建用户记录
                        const newUser = {
                            name: user.name || user.email.split('@')[0],
                            email: user.email,
                            image: user.image || undefined,
                            role: isAdminAccount(user.email)
                                ? (user.email.toLowerCase().startsWith('root@') ? UserRole.SUPER_ADMIN : UserRole.ADMIN)
                                : UserRole.USER,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            lastLogin: new Date(),
                            provider: 'google'
                        };

                        const result = await db.collection('users').insertOne(newUser);

                        user.id = result.insertedId.toString();
                    } else if (dbUser) {
                        // 检查是否需要更新provider字段
                        const updates: {
                            lastLogin: Date;
                            updatedAt: Date;
                            provider?: string;
                        } = {
                            lastLogin: new Date(),
                            updatedAt: new Date()
                        };

                        if (account?.provider === 'google' && (!dbUser.provider || dbUser.provider !== 'google')) {
                            updates.provider = 'google';
                        } else if (!dbUser.provider) {
                            updates.provider = 'credentials';
                        }

                        // 更新现有用户的最后登录时间和provider
                        await db.collection('users').updateOne(
                            { _id: new ObjectId(dbUser._id) },
                            { $set: updates }
                        );
                        user.id = dbUser._id.toString();
                    }
                }

                return true;
            } catch {
                return true; // 即使更新失败也允许用户登录
            }
        },
        jwt({ token, user, account }) {
            // 初次登录时，将用户信息添加到token中
            if (user) {
                token.id = user.id;
                token.role = user.role || UserRole.USER;
            }

            // 对于Google登录，检查是否为预定义的管理员账户
            if (account && account.provider === "google" && user?.email && isAdminAccount(user.email)) {
                // 根据邮箱区分超级管理员和普通管理员
                token.role = user.email.toLowerCase().startsWith('root@') ? UserRole.SUPER_ADMIN : UserRole.ADMIN;
            }

            return token;
        },
        session({ session, token }) {
            if (token.id) {
                session.user.id = token.id as string;
            }

            if (token.role) {
                session.user.role = token.role as UserRole;
            }

            return session;
        },
    },
    session: { strategy: "jwt" },
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "YOUR_FALLBACK_SECRET_KEY",
    debug: process.env.NODE_ENV === "development",
    logger: {},
} satisfies NextAuthConfig;

// 仅在服务器端初始化 Auth.js 的 MongoDB 适配器
if (typeof window === 'undefined') {
    const initializeAdapter = async () => {
        try {
            const { MongoDBAdapter } = await import("@auth/mongodb-adapter");
            const clientPromise = (await import('@/lib/mongodb')).default;

            adapter = MongoDBAdapter(clientPromise) as Adapter;
        } catch {
            return;
        }
    };

    // Set up adapter during initialization
    initializeAdapter().catch((error: Error) => {
        // eslint-disable-next-line no-console
        console.error("MongoDB 适配器初始化失败:", error);
    });
}

// Dynamically add adapter
const authOptions = {
    ...config,
    adapter: adapter as Adapter | undefined,
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions); 
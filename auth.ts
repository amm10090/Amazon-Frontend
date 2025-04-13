import { ObjectId } from "mongodb";
import { NextResponse } from 'next/server';
import NextAuth, { type NextAuthConfig } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { UserRole, isAdminAccount, isSuperAdminAccount } from "@/lib/models/UserRole";

// 添加环境变量检查
const checkEnvVariables = () => {
    const requiredVars = [
        'AUTH_GOOGLE_ID',
        'AUTH_GOOGLE_SECRET',
        'AUTH_SECRET',
        'NEXTAUTH_SECRET',
        'MONGODB_URI',
        'MONGODB_DB'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        NextResponse.json({ warning: `缺少以下环境变量: ${missingVars.join(', ')}` }, { status: 200 });

        // 检查特别重要的变量
        if (missingVars.includes('AUTH_SECRET') && missingVars.includes('NEXTAUTH_SECRET')) {
            NextResponse.json({ error: 'AUTH_SECRET 和 NEXTAUTH_SECRET 环境变量均未设置，这可能导致身份验证问题' }, { status: 200 });
            // 在开发环境中自动设置一个开发密钥
            if (process.env.NODE_ENV === 'development') {
                process.env.NEXTAUTH_SECRET = 'development-secret-do-not-use-in-production';
                NextResponse.json({ warning: '在开发环境中设置了临时的 NEXTAUTH_SECRET，请勿在生产环境中使用' }, { status: 200 });
            }
        }

        if (missingVars.includes('AUTH_GOOGLE_ID') || missingVars.includes('AUTH_GOOGLE_SECRET')) {
            NextResponse.json({ error: 'Google OAuth 配置不完整，Google登录功能可能不可用' }, { status: 200 });
        }

        if (missingVars.includes('MONGODB_URI') || missingVars.includes('MONGODB_DB')) {
            NextResponse.json({ error: 'MongoDB 配置不完整，用户数据可能无法正确存储' }, { status: 200 });
        }
    }

    // 检查NEXTAUTH_URL是否设置正确
    if (!process.env.NEXTAUTH_URL && typeof window === 'undefined') {
        NextResponse.json({ warning: 'NEXTAUTH_URL 环境变量未设置，这可能导致回调URL问题' }, { status: 200 });

        // 在开发环境中尝试设置默认值
        if (process.env.NODE_ENV === 'development') {
            process.env.NEXTAUTH_URL = 'http://localhost:3000';
            NextResponse.json({ warning: '在开发环境中设置了默认的 NEXTAUTH_URL=http://localhost:3000' }, { status: 200 });
        }
    }
};

// 在服务器端检查环境变量
if (typeof window === 'undefined') {
    checkEnvVariables();
}

// 添加详细的日志工具
const logAuth = (message: string, error?: unknown) => {
    if (process.env.NODE_ENV === "development" || process.env.DEBUG_AUTH === "true") {
        NextResponse.json({ message: `[Auth] ${message}` }, { status: 200 });
        if (error) {
            // 安全处理不同类型的错误参数
            try {
                if (Array.isArray(error)) {
                    // 处理数组类型的错误参数
                    NextResponse.json({
                        error: `[Auth Error] ` + error.map(item =>
                            typeof item === 'object' && item !== null
                                ? JSON.stringify(item, Object.getOwnPropertyNames(item))
                                : item
                        ).join(', ')
                    }, { status: 200 });
                } else if (error instanceof Error) {
                    // 处理标准Error对象
                    NextResponse.json({ error: `[Auth Error] ${error.name}: ${error.message}` }, { status: 200 });
                    if (error.stack) {
                        NextResponse.json({ error: `[Auth Stack] ${error.stack}` }, { status: 200 });
                    }
                } else if (typeof error === 'object' && error !== null) {
                    // 处理一般对象
                    NextResponse.json({ error: `[Auth Error] ` + JSON.stringify(error, Object.getOwnPropertyNames(error)) }, { status: 200 });
                } else {
                    // 处理基本类型
                    NextResponse.json({ error: `[Auth Error] ` + error }, { status: 200 });
                }
            } catch (logError) {
                // 避免日志记录本身导致的错误
                NextResponse.json({ error: `[Auth Error] Failed to log error: ${logError instanceof Error ? logError.message : 'Unknown error'}` }, { status: 200 });
            }
        }
    }
};

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
            },
            // 添加检查Google ID令牌的有效性
            async profile(profile) {
                logAuth(`处理Google用户资料: ${profile.email}`);

                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                };
            },
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
                        logAuth(`尝试验证用户凭据: ${credentials.username}`);

                        // Dynamic import to avoid client-side import errors
                        let clientPromise;

                        try {
                            clientPromise = (await import('@/lib/mongodb')).default;
                            const bcryptjs = await import('bcryptjs');

                            bcryptCompare = bcryptjs.compare;
                        } catch (error) {
                            logAuth("MongoDB客户端或bcrypt导入失败", error);

                            return null;
                        }

                        // 开发环境默认管理员账户
                        if (process.env.NODE_ENV === "development" &&
                            ((credentials.username === "root@amazon-frontend.com" && credentials.password === "admin123") ||
                                (credentials.username === "admin@amazon-frontend.com" && credentials.password === "admin123"))) {
                            logAuth("使用开发环境默认管理员账户登录");

                            return {
                                id: credentials.username === "root@amazon-frontend.com" ? "root" : "admin",
                                name: credentials.username === "root@amazon-frontend.com" ? "Root Admin" : "Admin",
                                email: credentials.username,
                                role: credentials.username === "root@amazon-frontend.com" ? UserRole.SUPER_ADMIN : UserRole.ADMIN
                            };
                        }

                        let client;

                        try {
                            client = await clientPromise;
                        } catch (error) {
                            logAuth("MongoDB连接失败", error);

                            return null;

                        }

                        const db = client.db(process.env.MONGODB_DB || "oohunt");

                        try {
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
                                    logAuth("使用开发环境测试账户登录");

                                    return {
                                        id: "1",
                                        name: "Admin",
                                        email: "admin@example.com",
                                        role: UserRole.ADMIN
                                    };
                                }

                                logAuth(`用户不存在: ${credentials.username}`);

                                return null;
                            }

                            // Compare passwords using bcryptjs
                            const isValid = await bcryptCompare(credentials.password, user.password);

                            if (!isValid) {
                                logAuth(`密码验证失败: ${credentials.username}`);

                                return null;
                            }

                            // 更新provider字段，如果尚未设置
                            try {
                                if (!user.provider) {
                                    await db.collection("users").updateOne(
                                        { _id: user._id },
                                        { $set: { provider: 'credentials', lastLogin: new Date() } }
                                    );
                                    logAuth(`更新用户provider为credentials: ${user._id}`);
                                } else {
                                    // 仅更新最后登录时间
                                    await db.collection("users").updateOne(
                                        { _id: user._id },
                                        { $set: { lastLogin: new Date() } }
                                    );
                                }
                            } catch (error) {
                                logAuth("更新用户provider信息失败", error);
                                // 继续登录流程，不阻止
                            }

                            logAuth(`用户凭据验证成功: ${user._id}`);

                            return {

                                id: user._id.toString(),
                                name: user.name || user.username,
                                email: user.email,
                                image: user.image,
                                role: user.role || UserRole.USER,
                                provider: user.provider || 'credentials'
                            };
                        } catch (error) {
                            logAuth("数据库操作失败", error);

                            return null;
                        }
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
                } catch (error) {
                    logAuth("用户授权过程中发生未捕获异常", error);

                    return null;
                }
            },
        }),
    ],
    basePath: "/auth",
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
        newUser: "/auth/signup",
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
                    logAuth(`开始处理用户登录: ${user.email}, 提供商: ${account?.provider}`);

                    let clientPromise;

                    try {

                        clientPromise = (await import('@/lib/mongodb')).default;
                    } catch (error) {
                        logAuth("MongoDB客户端导入失败", error);
                        // 在开发环境中，允许没有数据库的情况下登录
                        if (process.env.NODE_ENV === "development") {
                            logAuth("允许用户在开发环境中无数据库登录");

                            // 用临时ID创建用户
                            if (!user.id) {
                                user.id = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
                            }

                            // 根据用户邮箱设置角色
                            if (isSuperAdminAccount(user.email)) {
                                user.role = UserRole.SUPER_ADMIN;
                            } else if (isAdminAccount(user.email)) {
                                user.role = UserRole.ADMIN;
                            } else {
                                user.role = UserRole.USER;
                            }

                            return true;
                        }

                        return false; // 阻止登录流程继续
                    }

                    let client;

                    try {
                        // 设置10秒超时
                        const timeoutPromise = new Promise<never>((_, reject) => {
                            setTimeout(() => reject(new Error("MongoDB连接超时")), 10000);
                        });

                        client = await Promise.race([
                            clientPromise,
                            timeoutPromise
                        ]);
                    } catch (error) {
                        logAuth("MongoDB连接失败", error);

                        // 在开发环境中，允许没有数据库的情况下登录
                        if (process.env.NODE_ENV === "development") {
                            logAuth("允许用户在开发环境中无数据库登录");

                            // 用临时ID创建用户
                            if (!user.id) {
                                user.id = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
                            }

                            // 根据用户邮箱设置角色
                            if (isSuperAdminAccount(user.email)) {
                                user.role = UserRole.SUPER_ADMIN;
                            } else if (isAdminAccount(user.email)) {
                                user.role = UserRole.ADMIN;
                            } else {
                                user.role = UserRole.USER;
                            }

                            return true;
                        }

                        return false; // 阻止登录流程继续
                    }

                    // 其余与数据库通信的代码保持不变...
                    try {
                        const db = client.db(process.env.MONGODB_DB || "oohunt");
                        // 检查用户是否已存在
                        const dbUser = await db.collection('users').findOne({ email: user.email });

                        if (!dbUser && account?.provider === 'google') {
                            // 如果是新的 Google 用户，创建用户记录
                            logAuth(`创建新Google用户: ${user.email}`);

                            let role = UserRole.USER;

                            // 首先检查是否为超级管理员账户
                            if (isSuperAdminAccount(user.email)) {
                                role = UserRole.SUPER_ADMIN;
                            }
                            // 然后检查是否为普通管理员账户
                            else if (isAdminAccount(user.email)) {
                                role = UserRole.ADMIN;
                            }

                            const newUser = {
                                name: user.name || user.email.split('@')[0],
                                email: user.email,
                                image: user.image || undefined,
                                role,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                                lastLogin: new Date(),
                                provider: 'google'
                            };

                            const result = await db.collection('users').insertOne(newUser);

                            logAuth(`新用户创建成功: ${result.insertedId.toString()}`);
                            user.id = result.insertedId.toString();
                        } else if (dbUser) {
                            // 检查是否需要更新provider字段
                            logAuth(`更新现有用户: ${dbUser._id.toString()}`);

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
                            logAuth(`用户更新成功: ${dbUser._id.toString()}`);
                        }
                    } catch (error) {
                        logAuth("数据库操作失败", error);

                        // 在开发环境中，允许没有数据库的情况下登录
                        if (process.env.NODE_ENV === "development") {
                            logAuth("允许用户在开发环境中无数据库登录");

                            // 用临时ID创建用户
                            if (!user.id) {
                                user.id = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
                            }

                            // 根据用户邮箱设置角色
                            if (isSuperAdminAccount(user.email)) {
                                user.role = UserRole.SUPER_ADMIN;
                            } else if (isAdminAccount(user.email)) {
                                user.role = UserRole.ADMIN;
                            } else {
                                user.role = UserRole.USER;
                            }

                            return true;
                        }

                        return false; // 阻止登录流程继续
                    }
                }

                return true;
            } catch (error) {
                logAuth("登录处理异常", error);

                return false; // 出现任何未捕获的错误，都阻止登录流程
            }
        },
        jwt({ token, user, account }) {
            // 初次登录时，将用户信息添加到token中
            if (user) {
                logAuth(`生成JWT: ${user.id}`);
                token.id = user.id;
                token.role = user.role || UserRole.USER;
            }

            // 对于Google登录，检查是否为预定义的管理员账户
            if (account && account.provider === "google" && user?.email) {
                // 首先检查是否为超级管理员账户
                if (isSuperAdminAccount(user.email)) {
                    token.role = UserRole.SUPER_ADMIN;
                    logAuth(`Google登录用户升级为超级管理员: ${user.email}`);
                }
                // 然后检查是否为普通管理员账户
                else if (isAdminAccount(user.email)) {
                    token.role = UserRole.ADMIN;
                    logAuth(`Google登录用户升级为管理员: ${user.email}`);
                }
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

            // 执行会话有效性检查
            if (typeof window === 'undefined' && token.id && session.user.id) {
                logAuth(`处理会话: ${token.id}`);

                // 这里不进行数据库检查以提高性能，JWT已经包含了必要信息
                // 会话恢复检查将在需要高安全性的路由中单独执行
            }

            return session;
        },
        async redirect({ url, baseUrl }) {
            logAuth(`处理重定向: ${url}, baseUrl: ${baseUrl}`);

            // 检测错误页面重定向循环
            if (url.includes("/auth/error")) {
                // 我们在URL中添加一个计数器来跟踪重定向次数
                const urlObj = new URL(url, baseUrl);
                const redirectCount = parseInt(urlObj.searchParams.get("redirectCount") || "0", 10);

                // 如果已经重定向了5次以上，强制返回首页
                if (redirectCount >= 5) {
                    logAuth(`检测到过多的重定向 (${redirectCount}次)，强制重定向到首页`);

                    return baseUrl;
                }

                // 如果是重定向到错误页面，在URL中添加计数器
                urlObj.searchParams.set("redirectCount", (redirectCount + 1).toString());

                return urlObj.toString();
            }

            // 检测登录页面重定向循环
            if (url.includes("/auth/signin")) {
                // 如果已经在错误页面或登录页面，且正在重定向到相同页面
                // 则中断可能的循环，直接返回首页

                const urlObj = new URL(url, baseUrl);

                if (urlObj.searchParams.has("callbackUrl") &&
                    (urlObj.searchParams.get("callbackUrl")?.includes("/auth/error") ||
                        urlObj.searchParams.get("callbackUrl")?.includes("/auth/signin"))) {
                    logAuth(`检测到潜在的重定向循环，强制重定向到首页`);

                    return baseUrl;
                }
            }

            // 验证重定向URL
            if (url.startsWith(baseUrl)) {
                // 允许内部重定向
                return url;
            } else if (url.startsWith("/")) {
                // 允许相对路径重定向
                return new URL(url, baseUrl).toString();
            }

            // 默认重定向到首页
            logAuth(`不安全的重定向URL: ${url}，重定向到首页`);

            return baseUrl;
        },
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30天
    },
    // 改进JWT secret配置
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV === "development" ? "development-secret-do-not-use-in-production" : undefined),
    // 移除不安全的fallback secret
    jwt: {
        // 确保JWT有合理的过期时间
        maxAge: 30 * 24 * 60 * 60, // 30天
    },
    // 改进cookie配置
    cookies: {
        sessionToken: {
            name: process.env.NODE_ENV === "production" ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
    },
    debug: process.env.NODE_ENV === "development",
    logger: {
        error(code, ...message) {
            // 简化处理，避免复杂的参数结构
            const errorMessage = `错误(${code}): ${message.join(' ')}`;

            logAuth(errorMessage);
        },
        warn(code, ...message) {
            // 简化处理，避免复杂的参数结构
            const warnMessage = `警告(${code}): ${message.join(' ')}`;

            logAuth(warnMessage);
        },
        debug(code, ...message) {
            if (process.env.DEBUG_AUTH === "true") {
                // 简化处理，避免复杂的参数结构
                const debugMessage = `调试(${code}): ${message.join(' ')}`;

                logAuth(debugMessage);
            }
        },
    },
} satisfies NextAuthConfig;

// 仅在服务器端初始化 Auth.js 的 MongoDB 适配器
if (typeof window === 'undefined') {
    const initializeAdapter = async () => {
        try {
            logAuth("初始化MongoDB适配器");
            const { MongoDBAdapter } = await import("@auth/mongodb-adapter");

            // 改进MongoDB连接参数，添加重试和超时配置
            const mongodb = await import('@/lib/mongodb');
            const clientPromise = mongodb.default;

            // 测试连接
            try {
                const testClient = await clientPromise;
                // 设置30秒超时
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error("MongoDB连接测试超时")), 10000);
                });

                // 尝试ping测试，使用Promise.race确保不会无限等待
                await Promise.race([
                    testClient.db().command({ ping: 1 }),
                    timeoutPromise
                ]);

                logAuth("MongoDB连接测试成功");
            } catch (connError) {
                const errorMsg = "MongoDB连接测试失败";

                logAuth(errorMsg, connError);

                // 如果在开发环境中，则不抛出错误，使用内存适配器替代
                if (process.env.NODE_ENV === "development") {
                    logAuth("在开发环境中，将使用内存会话存储替代MongoDB");

                    // 不抛出错误，但返回null表示使用默认JWT模式
                    return;
                }

                throw new Error(errorMsg);
            }

            adapter = MongoDBAdapter(clientPromise, {
                databaseName: process.env.MONGODB_DB || "oohunt",
            }) as Adapter;

            logAuth("MongoDB适配器初始化成功");
        } catch (adapterError) {
            logAuth("MongoDB适配器初始化失败", adapterError);
            // 适配器初始化失败时，设置为null但不抛出错误
            adapter = null;
        }
    };

    // Set up adapter during initialization
    initializeAdapter().catch((error) => {
        logAuth("MongoDB适配器初始化过程中出现未捕获异常", error);
    });
}

// Dynamically add adapter
const authOptions = {
    ...config,
    adapter: adapter as Adapter | undefined,
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions); 
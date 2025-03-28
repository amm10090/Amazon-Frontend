import NextAuth, { type NextAuthConfig } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";

// Strategy: Execute database and authentication related code only on the server side
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let adapter: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let bcryptCompare: any = null;

// Use static configuration to avoid client-side imports of server-side dependencies
export const config = {
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID || process.env.AUTH_GITHUB_ID || "",
            clientSecret: process.env.GITHUB_SECRET || process.env.AUTH_GITHUB_SECRET || "",
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

                        // Use bcryptjs instead of bcrypt
                        const bcryptjs = await import('bcryptjs');

                        bcryptCompare = bcryptjs.compare;

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
                                return { id: "1", name: "Admin", email: "admin@example.com" };
                            }


                            return null;
                        }

                        // Compare passwords using bcryptjs
                        const isValid = await bcryptCompare(credentials.password, user.password);

                        if (!isValid) {

                            return null;
                        }

                        return {
                            id: user._id.toString(),
                            name: user.name || user.username,
                            email: user.email,
                            image: user.image
                        };
                    } else {
                        // On client-side, only check development default account
                        if (process.env.NODE_ENV === "development" &&
                            credentials.username === "admin" &&
                            credentials.password === "password") {
                            return { id: "1", name: "Admin", email: "admin@example.com" };
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
                if (isLoggedIn) return true;

                return false; // Redirect to login page
            } else if (isLoggedIn) {
                return true;
            }

            return true;
        },
        jwt({ token, user }) {
            if (user) token.id = user.id;

            return token;
        },
        session({ session, token }) {
            if (token.id) session.user.id = token.id as string;

            return session;
        },
    },
    session: { strategy: "jwt" },
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "YOUR_FALLBACK_SECRET_KEY",
    debug: process.env.NODE_ENV === "development",
    logger: {

    },
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
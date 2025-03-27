import 'next-auth';

declare module 'next-auth' {
    /**
     * 扩展 Session 类型
     */
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    }
} 
import type { DefaultSession } from "next-auth";

import type { UserRole } from "@/lib/models/UserRole";

declare module "next-auth" {
    interface User {
        role?: UserRole;
    }

    interface Session extends DefaultSession {
        user: {
            id: string;
            role: UserRole;
        } & DefaultSession["user"]
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        role?: UserRole;
    }
} 
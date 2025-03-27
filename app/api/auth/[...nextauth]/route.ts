import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const redirectUrl = req.nextUrl.pathname.replace("/api/auth", "/auth");

    return redirect(redirectUrl);
}

export async function POST(req: NextRequest) {
    const redirectUrl = req.nextUrl.pathname.replace("/api/auth", "/auth");

    return redirect(redirectUrl);
} 
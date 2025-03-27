'use client';

import Link from "next/link";
import { useState } from "react";

import { signOut } from "@/auth";

export default function SignOutPage() {
    const [isLoading, setIsLoading] = useState(false);

    async function handleSignOut() {
        setIsLoading(true);
        await signOut({ redirectTo: "/" });
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
                        Confirm Sign Out
                    </h2>
                    <p className="mt-2 text-center text-lg text-gray-600">
                        Are you sure you want to sign out of your account?
                    </p>
                </div>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={handleSignOut}
                        disabled={isLoading}
                        className={`rounded-md bg-red-600 py-2 px-4 text-sm font-semibold text-white hover:bg-red-500 ${isLoading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                    >
                        {isLoading ? "Signing out..." : "Confirm Sign Out"}
                    </button>
                    <Link
                        href="/"
                        className="rounded-md bg-gray-200 py-2 px-4 text-sm font-semibold text-gray-800 hover:bg-gray-300"
                    >
                        Cancel
                    </Link>
                </div>
            </div>
        </div>
    );
}

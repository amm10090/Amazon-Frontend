'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const errorMessages: Record<string, string> = {
    Configuration: "Server configuration error",
    AccessDenied: "Access denied",
    Verification: "Login link has expired or has been used",
    Default: "An error occurred during authentication"
};

export default function ErrorPage() {
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const errorType = searchParams?.get("error") || "Default";

        setError(errorType);
    }, [searchParams]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-red-600">
                        Authentication Error
                    </h2>
                    <p className="mt-2 text-center text-lg">
                        {error ? errorMessages[error] || errorMessages.Default : "Loading..."}
                    </p>
                </div>
                <div className="flex justify-center">
                    <Link
                        href="/auth/signin"
                        className="rounded-md bg-indigo-600 py-2 px-4 text-sm font-semibold text-white hover:bg-indigo-500"
                    >
                        Return to Login
                    </Link>
                </div>
            </div>
        </div>
    );
} 
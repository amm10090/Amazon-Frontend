'use client';

import { ToastProvider } from "@heroui/react";
import clsx from "clsx";
import type { NextFont } from 'next/dist/compiled/@next/font';
import { usePathname } from 'next/navigation';
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { Providers } from "@/app/providers";
import Footer from '@/components/layout/Footer';
import { Navbar } from "@/components/navbar";
import { FavoritesProvider } from '@/lib/favorites';

interface ClientLayoutProps {
    children: React.ReactNode;
    inter: NextFont;
    session: Session | null;
}

export function ClientLayout({ children, inter, session }: ClientLayoutProps) {
    const pathname = usePathname();
    const isDashboard = pathname?.startsWith('/dashboard');

    return (
        <SessionProvider session={session} basePath="/auth" refetchOnWindowFocus={false}>
            <FavoritesProvider>
                <Providers>
                    <div className={clsx(
                        "min-h-screen bg-background font-sans antialiased",
                        inter.className
                    )}>
                        <Navbar />
                        <main className={clsx(
                            "grow pt-1",
                            pathname?.startsWith('/about')
                                ? ""
                                : isDashboard
                                    ? ""
                                    : pathname?.startsWith('/products')
                                        ? "container mx-auto max-w-[1800px] px-2 md:px-3 lg:px-4"
                                        : "container mx-auto max-w-9xl px-2 md:px-3 lg:px-4"
                        )}>
                            {children}
                        </main>
                        <Footer />
                    </div>
                    <ToastProvider placement="bottom-right" />
                </Providers>
            </FavoritesProvider>
        </SessionProvider>
    );
} 
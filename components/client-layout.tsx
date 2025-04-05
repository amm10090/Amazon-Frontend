'use client';

import { ToastProvider } from "@heroui/react";
import clsx from "clsx";
import type { NextFont } from 'next/dist/compiled/@next/font';
import { usePathname } from 'next/navigation';
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { Providers } from "@/app/providers";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from '@/components/theme-provider';
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
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <FavoritesProvider>
                    <Providers>
                        <div className={clsx(
                            "min-h-screen bg-background font-sans antialiased",
                            inter.className
                        )}>
                            <Navbar />
                            <main className={clsx(
                                "grow pt-1",
                                !isDashboard && pathname?.startsWith('/products')
                                    ? "container mx-auto max-w-[1800px] px-2 md:px-3 lg:px-4"
                                    : "container mx-auto max-w-9xl px-2 md:px-3 lg:px-4"
                            )}>
                                {children}
                            </main>
                            <footer className="w-full flex items-center justify-center py-3">
                                <a
                                    className="flex items-center gap-1 text-current"
                                    href="https://heroui.com?utm_source=next-app-template"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="heroui.com homepage"
                                >
                                    <span className="text-default-600">Powered by</span>
                                    <p className="text-primary">OOHUNT</p>
                                </a>
                            </footer>
                        </div>
                        <ToastProvider placement="bottom-right" />
                    </Providers>
                </FavoritesProvider>
            </ThemeProvider>
        </SessionProvider>
    );
} 
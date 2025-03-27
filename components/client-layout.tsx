'use client';

import clsx from "clsx";
import type { NextFont } from 'next/dist/compiled/@next/font';
import { SessionProvider } from "next-auth/react";

import { Providers } from "@/app/providers";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from '@/components/theme-provider';
import { FavoritesProvider } from '@/lib/favorites';

interface ClientLayoutProps {
    children: React.ReactNode;
    inter: NextFont;
}

export function ClientLayout({ children, inter }: ClientLayoutProps) {
    return (
        <SessionProvider basePath="/auth">
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
                            <main className="container mx-auto max-w-9xl pt-1 px-2 md:px-3 lg:px-4 grow">
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
                    </Providers>
                </FavoritesProvider>
            </ThemeProvider>
        </SessionProvider>
    );
} 
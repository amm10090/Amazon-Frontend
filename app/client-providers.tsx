"use client";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider } from "next-themes";
import { useRouter } from "next/navigation";

export default function ClientProviders({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    return (
        <HeroUIProvider navigate={router.push}>
            <ThemeProvider attribute="class" defaultTheme="dark">
                {children}
            </ThemeProvider>
        </HeroUIProvider>
    );
} 
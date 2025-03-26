"use client";

import { HeroUIProvider } from "@heroui/react";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";
import * as React from "react";
import { useEffect } from "react";

import { initCacheSystem } from "@/lib/cache-utils";
import { FavoritesProvider } from "@/lib/favorites";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  // 初始化缓存系统
  useEffect(() => {
    try {
      initCacheSystem();
    } catch {
      return;
    }
  }, []);

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        {...themeProps}
      >
        <FavoritesProvider>
          {children}
        </FavoritesProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}

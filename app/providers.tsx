"use client";

import { HeroUIProvider } from "@heroui/react";
import type { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";
import * as React from "react";
import { useEffect } from "react";

import { initCacheSystem } from "@/lib/cache-utils";

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

export function Providers({ children, themeProps = {} }: ProvidersProps) {
  // 初始化缓存系统
  useEffect(() => {
    try {
      initCacheSystem();
    } catch {
      return;
    }
  }, []);

  return (
    <NextThemesProvider {...themeProps}>
      <HeroUIProvider>
        {children}
      </HeroUIProvider>
    </NextThemesProvider>
  );
}

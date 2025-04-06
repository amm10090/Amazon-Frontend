"use client";

import { HeroUIProvider } from "@heroui/react";
import type { useRouter } from "next/navigation";
import * as React from "react";
import { useEffect } from "react";

import { initCacheSystem } from "@/lib/cache-utils";

export interface ProvidersProps {
  children: React.ReactNode;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children }: ProvidersProps) {
  // 初始化缓存系统
  useEffect(() => {
    try {
      initCacheSystem();
    } catch {
      return;
    }
  }, []);

  return (
    <HeroUIProvider>
      {children}
    </HeroUIProvider>
  );
}

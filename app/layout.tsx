import "@/styles/globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata } from 'next';
import { Geist } from "next/font/google";

import { auth } from '@/auth';
import { Analytics, GoogleTagManager } from "@/components/analytics";
import { ClientLayout } from "@/components/client-layout";
import { BackTop } from "@/components/ui/BackTop";
import { FloatingFavorites } from "@/components/ui/FloatingFavorites";

const geist = Geist({
  subsets: ["latin"],

});

// 从环境变量获取Bing Webmaster ID
const BING_WEBMASTER_ID = process.env.NEXT_PUBLIC_BING_WEBMASTER_ID || '';

export const metadata: Metadata = {
  title: "Oohunt - Your Ultimate Shopping Companion",
  description: "Find the best deals on Amazon, Walmart, Target and more",
  icons: {
    icon: "/favicon.ico",
  },
  verification: {
    other: {
      'msvalidate.01': BING_WEBMASTER_ID
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 预加载会话信息
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning className={geist.className}>
      <head />
      <body>
        <GoogleTagManager />
        <ClientLayout session={session}>
          {children}
          <BackTop />
          <FloatingFavorites />
        </ClientLayout>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

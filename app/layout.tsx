import "@/styles/globals.css";
import type { Metadata } from 'next';
import { Inter } from "next/font/google";

import { auth } from '@/auth';
import { ClientLayout } from "@/components/client-layout";
import { BackTop } from "@/components/ui/BackTop";

const inter = Inter({
  subsets: ["latin"],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "OOHUNT - Your Ultimate Shopping Companion",
  description: "Find the best deals on Amazon, Walmart, Target and more",
  icons: {
    icon: "/favicon.ico",
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
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ClientLayout inter={inter} session={session}>
          {children}
          <BackTop />
        </ClientLayout>
      </body>
    </html>
  );
}

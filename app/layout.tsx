import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers>
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
        </Providers>
      </body>
    </html>
  );
}

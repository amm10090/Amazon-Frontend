import "@/styles/globals.css";
import { Inter } from "next/font/google";

import { ClientLayout } from "@/components/client-layout";

const inter = Inter({
  subsets: ["latin"],
  adjustFontFallback: false,
});

export const metadata = {
  title: "OOHUNT - Your Ultimate Shopping Destination",
  description: "Discover amazing products at great prices",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ClientLayout inter={inter}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}

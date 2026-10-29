import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { Nav } from "@/components/nav";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Marketing studio", template: "%s · Marketing studio" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={inter.variable}>
      <body className="flex min-h-full">
        <Nav />
        <main className="min-w-0 flex-1 px-10 py-8">{children}</main>
      </body>
    </html>
  );
}

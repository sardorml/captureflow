import type { Metadata } from "next";
import type { ReactNode } from "react";
import NextLink from "next/link";
import { Button, Chip } from "@heroui/react";
import { type AdminPermission, can } from "@captureflow/admin";
import { currentOperator } from "@/lib/guard";
import "./globals.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Instance admin",
  robots: { index: false, follow: false },
};

const TABS: { href: string; label: string; permission: AdminPermission }[] = [
  { href: "/", label: "Overview", permission: "users.read" },
  { href: "/users", label: "Users", permission: "users.read" },
  { href: "/audit", label: "Audit log", permission: "audit.read" },
  { href: "/admins", label: "Admins", permission: "admins.manage" },
];

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const operator = await currentOperator();
  // Operator tooling is dark-only; HeroUI reads data-theme for its own palette,
  // and tokens.css already defaults to the dark ramp.
  return (
    <html lang="en" data-theme="dark">
      <body className="bg-canvas text-fg min-h-dvh">
        {operator && (
          <header className="border-line border-b">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-4">
              <NextLink href="/" className="text-[15px] font-semibold">
                Instance admin
              </NextLink>
              <nav className="flex items-center gap-5" aria-label="Admin">
                {TABS.filter((t) => can(operator.role, t.permission)).map(
                  (t) => (
                    <NextLink
                      key={t.href}
                      href={t.href}
                      className="text-fg-muted hover:text-fg text-sm transition-colors motion-reduce:transition-none"
                    >
                      {t.label}
                    </NextLink>
                  ),
                )}
              </nav>
              <div className="ml-auto flex items-center gap-4">
                <Chip variant="secondary" size="sm">
                  {operator.email} · {operator.role}
                </Chip>
                <form action="/logout" method="post">
                  <Button type="submit" variant="ghost" size="sm">
                    Sign out
                  </Button>
                </form>
              </div>
            </div>
          </header>
        )}
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}

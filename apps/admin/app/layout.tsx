import type { Metadata } from "next";
import type { ReactNode } from "react";
import { type AdminPermission, can } from "@captureflow/admin";
import { currentOperator } from "@/lib/guard";
import { headers } from "next/headers";
import {
  THEME_INIT_HTML,
  readThemeFromCookieHeader,
  readThemePreferenceFromCookieHeader,
} from "@captureflow/ui/theme";
import { AccountMenu, type NavItem, SideNav, ThemeSwitcher } from "./_nav";
import { Providers } from "./_providers";
import "./globals.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Instance admin",
  robots: { index: false, follow: false },
};

const TABS: (NavItem & { permission: AdminPermission })[] = [
  { href: "/", label: "Overview", icon: "overview", permission: "users.read" },
  { href: "/users", label: "Users", icon: "users", permission: "users.read" },
  {
    href: "/workspaces",
    label: "Workspaces",
    icon: "workspaces",
    permission: "users.read",
  },
  {
    href: "/emails",
    label: "Emails",
    icon: "emails",
    permission: "mail.send",
  },
  {
    href: "/audit",
    label: "Audit log",
    icon: "audit",
    permission: "audit.read",
  },
  {
    href: "/admins",
    label: "Admins",
    icon: "admins",
    permission: "admins.manage",
  },
];

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const operator = await currentOperator();
  const cookie = (await headers()).get("cookie");
  return (
    /* suppressHydrationWarning: data-theme is the server's guess for a
       "system" preference; the init script corrects it before paint. */
    <html
      lang="en"
      data-theme={readThemeFromCookieHeader(cookie)}
      suppressHydrationWarning
    >
      <body className="bg-canvas text-fg min-h-dvh">
        <div hidden dangerouslySetInnerHTML={{ __html: THEME_INIT_HTML }} />
        <Providers>
          {operator ? (
            <div className="md:flex">
              <aside className="border-line flex flex-col gap-5 border-b px-3 py-4 md:sticky md:top-0 md:h-dvh md:w-64 md:shrink-0 md:border-r md:border-b-0">
                <AccountMenu email={operator.email} role={operator.role} />
                <div className="-mx-1 overflow-x-auto px-1 md:overflow-visible">
                  <SideNav
                    items={TABS.filter((t) => can(operator.role, t.permission))}
                  />
                </div>
                <div className="hidden md:mt-auto md:block">
                  <ThemeSwitcher
                    initial={readThemePreferenceFromCookieHeader(cookie)}
                  />
                </div>
              </aside>
              <main className="min-w-0 flex-1 px-4 py-8 md:px-12 md:py-12">
                <div className="mx-auto max-w-[1280px]">{children}</div>
              </main>
            </div>
          ) : (
            <main className="px-4">{children}</main>
          )}
        </Providers>
      </body>
    </html>
  );
}

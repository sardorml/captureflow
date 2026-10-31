import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist } from "next/font/google";
import { type AdminPermission, can, postHogConfig } from "@captureflow/admin";
import { getAdminEnv } from "@/lib/env";
import { currentOperator } from "@/lib/guard";
import { headers } from "next/headers";
import {
  THEME_INIT_HTML,
  readThemeFromCookieHeader,
  readThemePreferenceFromCookieHeader,
} from "@captureflow/ui/theme";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminSidebar, type NavItem } from "./_nav";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Instance admin",
  robots: { index: false, follow: false },
};

const TABS: (NavItem & { permission: AdminPermission })[] = [
  { href: "/", label: "Overview", icon: "overview", permission: "users.read" },
  {
    href: "/analytics",
    label: "Analytics",
    icon: "analytics",
    permission: "users.read",
  },
  {
    href: "/website",
    label: "Website",
    icon: "website",
    permission: "users.read",
  },
  { href: "/users", label: "Users", icon: "users", permission: "users.read" },
  {
    href: "/recordings",
    label: "Recordings",
    icon: "recordings",
    permission: "users.read",
  },
  {
    href: "/workspaces",
    label: "Workspaces",
    icon: "workspaces",
    permission: "users.read",
  },
  {
    href: "/inbox",
    label: "Inbox",
    icon: "inbox",
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
  const hasWebsite = postHogConfig(await getAdminEnv()) !== null;
  const cookie = (await headers()).get("cookie");
  const sidebarOpen = !/(?:^|;\s*)sidebar_state=false/.test(cookie ?? "");
  return (
    /* suppressHydrationWarning: data-theme is the server's guess for a
       "system" preference; the init script corrects it before paint. */
    <html
      lang="en"
      data-theme={readThemeFromCookieHeader(cookie)}
      className={geist.variable}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background text-foreground">
        <div hidden dangerouslySetInnerHTML={{ __html: THEME_INIT_HTML }} />
        <TooltipProvider>
          {operator ? (
            <SidebarProvider
              defaultOpen={sidebarOpen}
              className="h-svh overflow-hidden"
            >
              <AdminSidebar
                email={operator.email}
                role={operator.role}
                items={TABS.filter(
                  (t) =>
                    can(operator.role, t.permission) &&
                    (t.href !== "/website" || hasWebsite),
                )}
                themePreference={readThemePreferenceFromCookieHeader(cookie)}
              />
              <SidebarInset className="min-w-0 overflow-hidden">
                <header className="flex h-12 shrink-0 items-center gap-2 px-4">
                  <SidebarTrigger className="-ml-1" />
                </header>
                <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-12 md:px-12">
                  <div className="mx-auto max-w-[1280px]">{children}</div>
                </main>
              </SidebarInset>
            </SidebarProvider>
          ) : (
            <main className="px-4">{children}</main>
          )}
        </TooltipProvider>
      </body>
    </html>
  );
}

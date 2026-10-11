import type { Metadata } from "next";
import type { ReactNode } from "react";
import NextLink from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@heroui/react";
import { type AdminPermission, can } from "@captureflow/admin";
import { currentOperator } from "@/lib/guard";
import { type NavItem, SideNav } from "./_nav";
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
  // Operator tooling is dark-only; HeroUI reads data-theme for its own palette,
  // and tokens.css already defaults to the dark ramp.
  return (
    <html lang="en" data-theme="dark">
      <body className="bg-canvas text-fg min-h-dvh">
        {operator ? (
          <div className="md:flex">
            <aside className="border-line bg-canvas-2 flex flex-col gap-4 border-b p-4 md:sticky md:top-0 md:h-dvh md:w-60 md:shrink-0 md:border-r md:border-b-0">
              <NextLink href="/" className="flex items-center gap-2 px-3 py-1">
                <span className="bg-accent-bg grid size-7 place-items-center rounded-lg text-xs font-bold text-white">
                  CF
                </span>
                <span className="text-[15px] font-semibold">Admin</span>
              </NextLink>
              <div className="-mx-1 overflow-x-auto px-1 md:overflow-visible">
                <SideNav
                  items={TABS.filter((t) => can(operator.role, t.permission))}
                />
              </div>
              <div className="border-line mt-auto hidden flex-col gap-2 border-t pt-4 md:flex">
                <div className="px-3">
                  <div className="truncate text-sm font-medium">
                    {operator.email}
                  </div>
                  <div className="text-fg-subtle text-xs capitalize">
                    {operator.role}
                  </div>
                </div>
                <form action="/logout" method="post">
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <LogOut size={14} aria-hidden />
                    Sign out
                  </Button>
                </form>
              </div>
            </aside>
            <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8 2xl:px-12">
              <div className="mx-auto max-w-[1600px]">{children}</div>
            </main>
          </div>
        ) : (
          <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        )}
      </body>
    </html>
  );
}

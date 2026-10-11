"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  Mail,
  ScrollText,
  ShieldCheck,
  Users,
} from "lucide-react";
import { cn } from "@captureflow/ui/cn";

const ICONS = {
  overview: LayoutDashboard,
  users: Users,
  workspaces: Building2,
  emails: Mail,
  audit: ScrollText,
  admins: ShieldCheck,
} as const;

export type NavItem = { href: string; label: string; icon: keyof typeof ICONS };

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SideNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex gap-1 md:flex-col">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active = isActive(pathname, item.href);
        return (
          <NextLink
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors motion-reduce:transition-none",
              active
                ? "bg-tint-strong text-fg-strong font-medium"
                : "text-fg-muted hover:bg-tint hover:text-fg",
            )}
          >
            <Icon size={16} aria-hidden />
            {item.label}
          </NextLink>
        );
      })}
    </nav>
  );
}

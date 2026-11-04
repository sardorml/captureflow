"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  HardDrive,
  LayoutDashboard,
  Settings,
  Users,
  Video,
} from "lucide-react";
import { cn } from "@captureflow/ui/cn";

const ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/people", label: "People", icon: Users },
  { href: "/workspaces", label: "Workspaces", icon: Building2 },
  { href: "/recordings", label: "Recordings", icon: Video },
  { href: "/storage", label: "Storage", icon: HardDrive },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Admin"
      className="-mx-6 flex gap-1 overflow-x-auto px-6 lg:mx-0 lg:w-48 lg:shrink-0 lg:flex-col lg:px-0"
    >
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-tint text-fg-strong"
                : "text-fg-muted hover:bg-tint hover:text-fg",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

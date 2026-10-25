"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Camera,
  LayoutGrid,
  Link2,
  Receipt,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavLink = { href: string; icon: React.ReactNode; label: string };

/* Members is not an admin tool: seeing who else is in a workspace you were
   invited to is ordinary, and the page has always drawn itself for both roles —
   owners get remove buttons and the pending-invite list, members get "Leave
   workspace" on their own row. Only this link was hiding it from them. */
const MAIN_LINKS: NavLink[] = [
  { href: "/recordings", icon: <Link2 size={16} />, label: "Recordings" },
  { href: "/screenshots", icon: <Camera size={16} />, label: "Screenshots" },
  { href: "/members", icon: <Users size={16} />, label: "Members" },
  { href: "/workspaces", icon: <LayoutGrid size={16} />, label: "Workspaces" },
];

const ADMIN_LINKS: NavLink[] = [
  { href: "/settings", icon: <Settings size={16} />, label: "Settings" },
  { href: "/billing", icon: <Receipt size={16} />, label: "Billing" },
];

export function SidebarNav({
  isOwner,
  selfHosted,
}: {
  isOwner: boolean;
  selfHosted: boolean;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="px-3">
      <ul className="flex flex-col gap-0.5">
        {MAIN_LINKS.map((link) => (
          <NavItem key={link.href} link={link} active={isActive(link.href)} />
        ))}
      </ul>
      {isOwner && (
        <>
          <hr className="my-2 border-line" />
          <p className="px-4 py-1 text-[11px] font-medium text-fg-subtle">
            Admin tools
          </p>
          <ul className="flex flex-col gap-0.5">
            {ADMIN_LINKS.filter(
              (link) => !selfHosted || link.href !== "/billing",
            ).map((link) => (
              <NavItem
                key={link.href}
                link={link}
                active={isActive(link.href)}
              />
            ))}
          </ul>
        </>
      )}
    </nav>
  );
}

function NavItem({ link, active }: { link: NavLink; active: boolean }) {
  return (
    <li>
      <Link
        href={link.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex h-10 items-center gap-3 rounded-full px-4 text-sm transition-colors",
          active
            ? "bg-accent-soft font-semibold text-accent"
            : "text-fg hover:bg-tint",
        )}
      >
        {link.icon}
        {link.label}
      </Link>
    </li>
  );
}

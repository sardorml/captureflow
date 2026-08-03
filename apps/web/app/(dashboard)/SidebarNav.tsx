"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Link2, Receipt, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type NavLink = { href: string; icon: React.ReactNode; label: string };

// Billing is account-scoped, not workspace-scoped, so it sits here rather than
// under the owner-only admin tools below.
const MAIN_LINKS: NavLink[] = [
  { href: "/recordings", icon: <Link2 size={16} />, label: "Recordings" },
  { href: "/screenshots", icon: <Camera size={16} />, label: "Screenshots" },
  { href: "/billing", icon: <Receipt size={16} />, label: "Billing" },
];

const ADMIN_LINKS: NavLink[] = [
  { href: "/members", icon: <Users size={16} />, label: "Members" },
  { href: "/settings", icon: <Settings size={16} />, label: "Settings" },
];

export function SidebarNav({ isOwner }: { isOwner: boolean }) {
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
            {ADMIN_LINKS.map((link) => (
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
          "flex h-8 items-center gap-2 rounded-md pl-4 pr-2 text-sm transition-colors",
          active
            ? "bg-accent-soft text-fg font-medium"
            : "text-fg-muted hover:bg-tint hover:text-fg",
        )}
      >
        {link.icon}
        {link.label}
      </Link>
    </li>
  );
}

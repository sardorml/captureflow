"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Camera,
  Database,
  LayoutGrid,
  Link2,
  Receipt,
  Settings,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { formatBytes } from "@/lib/format";
import { storageFill, type StorageTone } from "@/lib/storage-fill";
import { cn } from "@/lib/utils";

type NavLink = { href: string; icon: ReactNode; label: string };

export type SidebarStorage = { usedBytes: number; limitBytes: number | null };

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

const STORAGE_LINK: NavLink = {
  href: "/storage",
  icon: <Database size={16} />,
  label: "Storage",
};

export function SidebarNav({
  isOwner,
  selfHosted,
  storage,
}: {
  isOwner: boolean;
  selfHosted: boolean;
  storage: SidebarStorage;
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
            <NavItem
              link={STORAGE_LINK}
              active={isActive(STORAGE_LINK.href)}
              trailing={<StorageGauge {...storage} />}
            />
          </ul>
        </>
      )}
    </nav>
  );
}

function NavItem({
  link,
  active,
  trailing,
}: {
  link: NavLink;
  active: boolean;
  trailing?: ReactNode;
}) {
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
        {trailing && (
          <span className="ml-auto flex items-center gap-2">{trailing}</span>
        )}
      </Link>
    </li>
  );
}

const RING_SIZE = 18;
const RING_STROKE = 2.5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;
// Below this the arc rounds away to nothing and an empty ring reads as broken.
const RING_MIN_ARC = 0.04;

const RING_TONE_CLASS: Record<StorageTone, string> = {
  ok: "stroke-success",
  near: "stroke-warning",
  full: "stroke-danger",
};

function StorageGauge({ usedBytes, limitBytes }: SidebarStorage) {
  const fill = storageFill(usedBytes, limitBytes);
  const used = formatBytes(usedBytes);
  const arc = fill && fill.ratio > 0 ? Math.max(fill.ratio, RING_MIN_ARC) : 0;
  return (
    <>
      <span
        className="text-xs font-normal tabular-nums text-fg-muted"
        aria-label={
          limitBytes === null
            ? `${used} used`
            : `${used} used of ${formatBytes(limitBytes)}`
        }
      >
        {used}
      </span>
      {fill && (
        <svg
          width={RING_SIZE}
          height={RING_SIZE}
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          className="-rotate-90"
          aria-hidden
          data-storage-tone={fill.tone}
        >
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            strokeWidth={RING_STROKE}
            className="stroke-tint-strong"
          />
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={`${arc * RING_LENGTH} ${RING_LENGTH}`}
            className={RING_TONE_CLASS[fill.tone]}
          />
        </svg>
      )}
    </>
  );
}

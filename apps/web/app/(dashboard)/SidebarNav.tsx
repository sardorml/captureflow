"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Camera,
  Database,
  ExternalLink,
  LayoutDashboard,
  LayoutGrid,
  Link2,
  MessageSquare,
  PenLine,
  Receipt,
  Settings,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { formatBytes } from "@/lib/format";
import { SUPPORT_EMAIL } from "@/lib/site";
import { storageFill, type StorageTone } from "@/lib/storage-fill";
import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  icon: ReactNode;
  label: string;
  external?: boolean;
};

export type SidebarStorage = { usedBytes: number; limitBytes: number | null };

const ICON = 18;

const CAPTURE_LINKS: NavLink[] = [
  {
    href: "/dashboard",
    icon: <LayoutDashboard size={ICON} />,
    label: "Dashboard",
  },
  { href: "/recordings", icon: <Link2 size={ICON} />, label: "Recordings" },
  { href: "/screenshots", icon: <Camera size={ICON} />, label: "Screenshots" },
  {
    href: "/canvas",
    icon: <PenLine size={ICON} />,
    label: "Canvas",
    external: true,
  },
];

// Members is for everyone: the page already draws itself for both roles.
const TEAM_LINKS: NavLink[] = [
  { href: "/members", icon: <Users size={ICON} />, label: "Members" },
  {
    href: "/workspaces",
    icon: <LayoutGrid size={ICON} />,
    label: "Workspaces",
  },
];

const ADMIN_LINKS: NavLink[] = [
  { href: "/settings", icon: <Settings size={ICON} />, label: "Settings" },
  { href: "/billing", icon: <Receipt size={ICON} />, label: "Billing" },
];

const STORAGE_LINK: NavLink = {
  href: "/storage",
  icon: <Database size={ICON} />,
  label: "Storage",
};

// Mail, like the account menu's entry; a self-hosted instance has its own support.
const SUPPORT_LINK: NavLink = {
  href: `mailto:${SUPPORT_EMAIL}`,
  icon: <MessageSquare size={ICON} />,
  label: "Contact support",
  external: true,
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
  const isActive = (link: NavLink) =>
    !link.external &&
    (pathname === link.href || pathname.startsWith(link.href + "/"));
  const group = (links: NavLink[]) => (
    <ul className="flex flex-col gap-0.5">
      {links.map((link) => (
        <NavItem key={link.href} link={link} active={isActive(link)} />
      ))}
    </ul>
  );

  return (
    <nav className="flex flex-col px-3">
      {group(CAPTURE_LINKS)}
      <Divider />
      {group(TEAM_LINKS)}
      {isOwner && (
        <>
          <Divider />
          <ul className="flex flex-col gap-0.5">
            {ADMIN_LINKS.filter(
              (link) => !selfHosted || link.href !== "/billing",
            ).map((link) => (
              <NavItem key={link.href} link={link} active={isActive(link)} />
            ))}
            <NavItem
              link={STORAGE_LINK}
              active={isActive(STORAGE_LINK)}
              trailing={<StorageGauge {...storage} />}
            />
          </ul>
        </>
      )}
      {!selfHosted && (
        <>
          <Divider />
          {group([SUPPORT_LINK])}
        </>
      )}
    </nav>
  );
}

function Divider() {
  return <hr className="my-2 border-line-strong" />;
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
  const className = cn(
    "flex h-9 items-center gap-3 rounded-lg px-3 text-[15px] transition-colors",
    active ? "bg-accent-soft font-medium text-accent" : "text-fg hover:bg-tint",
  );
  if (link.external) {
    const newTab = link.href.startsWith("http");
    return (
      <li>
        <a
          href={link.href}
          target={newTab ? "_blank" : undefined}
          rel={newTab ? "noopener noreferrer" : undefined}
          className={className}
        >
          {link.icon}
          {link.label}
          {newTab && (
            <ExternalLink size={16} className="ml-auto text-fg-subtle" />
          )}
        </a>
      </li>
    );
  }
  return (
    <li>
      <Link
        href={link.href}
        aria-current={active ? "page" : undefined}
        className={className}
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

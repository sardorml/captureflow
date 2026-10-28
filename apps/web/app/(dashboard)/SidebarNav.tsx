"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Camera,
  ExternalLink,
  LayoutDashboard,
  Link2,
  MessageSquare,
  PenLine,
  Settings,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { openSupportChat } from "@/components/marketing/support-chat";
import { SUPPORT_EMAIL } from "@/lib/site";
import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  icon?: ReactNode;
  label: string;
  external?: boolean;
  newTab?: boolean;
  onOpen?: () => void;
};

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
    newTab: true,
  },
];

// Members is for everyone: the page already draws itself for both roles.
const MEMBERS_LINK: NavLink = {
  href: "/members",
  icon: <Users size={ICON} />,
  label: "Members",
};

const SETTINGS_LINK: NavLink = {
  href: "/settings",
  icon: <Settings size={ICON} />,
  label: "Settings",
};

const PERSONAL_LINK: NavLink = {
  href: "/settings/personal",
  label: "Personal",
};
const WORKSPACE_LINK: NavLink = {
  href: "/settings/workspace",
  label: "Workspace",
};
const BILLING_LINK: NavLink = { href: "/billing", label: "Billing" };

// Opens the support chat, which falls back to mail when it can't load; the
// href covers a click before hydration. A self-hosted instance has its own support.
const SUPPORT_LINK: NavLink = {
  href: `mailto:${SUPPORT_EMAIL}`,
  icon: <MessageSquare size={ICON} />,
  label: "Contact support",
  external: true,
  onOpen: openSupportChat,
};

export function SidebarNav({
  isOwner,
  selfHosted,
}: {
  isOwner: boolean;
  selfHosted: boolean;
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

  const settingsLinks = [
    PERSONAL_LINK,
    ...(isOwner ? [WORKSPACE_LINK] : []),
    ...(isOwner && !selfHosted ? [BILLING_LINK] : []),
  ];

  return (
    <nav className="flex flex-col px-3">
      {group(CAPTURE_LINKS)}
      <Divider />
      <ul className="flex flex-col gap-0.5">
        <NavItem link={MEMBERS_LINK} active={isActive(MEMBERS_LINK)} />
        {/* The parent never lights up on its own: /settings redirects to a
            child, and the child row carries the highlight. */}
        <NavItem link={SETTINGS_LINK} active={false} />
        <li>
          <ul className="ml-[21px] flex flex-col gap-0.5 border-l border-line pl-2">
            {settingsLinks.map((link) => (
              <NavItem
                key={link.href}
                link={link}
                active={isActive(link)}
                nested
              />
            ))}
          </ul>
        </li>
      </ul>
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
  return <hr className="my-2 border-line" />;
}

function NavItem({
  link,
  active,
  nested = false,
}: {
  link: NavLink;
  active: boolean;
  nested?: boolean;
}) {
  const className = cn(
    "flex items-center gap-3 rounded-lg px-3 transition-colors",
    nested ? "h-8 text-sm" : "h-9 text-[15px]",
    active ? "bg-accent-soft font-medium text-accent" : "text-fg hover:bg-tint",
  );
  if (link.external) {
    return (
      <li>
        <a
          href={link.href}
          target={link.newTab ? "_blank" : undefined}
          rel={link.newTab ? "noopener noreferrer" : undefined}
          onClick={
            link.onOpen
              ? (event) => {
                  event.preventDefault();
                  link.onOpen?.();
                }
              : undefined
          }
          className={className}
        >
          {link.icon}
          {link.label}
          {link.newTab && (
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
      </Link>
    </li>
  );
}

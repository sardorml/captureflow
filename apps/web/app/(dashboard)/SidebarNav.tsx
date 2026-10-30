"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Camera,
  ChevronRight,
  ExternalLink,
  LayoutDashboard,
  Link2,
  MessageSquare,
  PenLine,
  Settings,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { openSupportChat } from "@/components/marketing/support-chat";
import { SUPPORT_EMAIL } from "@/lib/site";

type NavLink = {
  href: string;
  icon?: ReactNode;
  label: string;
  external?: boolean;
  newTab?: boolean;
  onOpen?: () => void;
};

const CAPTURE_LINKS: NavLink[] = [
  {
    href: "/dashboard",
    icon: <LayoutDashboard />,
    label: "Dashboard",
  },
  { href: "/recordings", icon: <Link2 />, label: "Recordings" },
  { href: "/screenshots", icon: <Camera />, label: "Screenshots" },
  {
    href: "/canvas",
    icon: <PenLine />,
    label: "Canvas",
    external: true,
    newTab: true,
  },
];

// Members is for everyone: the page already draws itself for both roles.
const MEMBERS_LINK: NavLink = {
  href: "/members",
  icon: <Users />,
  label: "Members",
};

const SETTINGS_LINK: NavLink = {
  href: "/settings",
  icon: <Settings />,
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
  icon: <MessageSquare />,
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

  const settingsLinks = [
    PERSONAL_LINK,
    ...(isOwner ? [WORKSPACE_LINK] : []),
    ...(isOwner && !selfHosted ? [BILLING_LINK] : []),
  ];

  return (
    <>
      <SidebarGroup>
        <SidebarMenu>
          {CAPTURE_LINKS.map((link) => (
            <NavItem key={link.href} link={link} active={isActive(link)} />
          ))}
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
        <SidebarMenu>
          <NavItem link={MEMBERS_LINK} active={isActive(MEMBERS_LINK)} />
          <Collapsible asChild defaultOpen className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={SETTINGS_LINK.label}>
                  {SETTINGS_LINK.icon}
                  <span>{SETTINGS_LINK.label}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {settingsLinks.map((link) => (
                    <SidebarMenuSubItem key={link.href}>
                      <SidebarMenuSubButton asChild isActive={isActive(link)}>
                        <Link href={link.href}>
                          <span>{link.label}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
          {!selfHosted && <NavItem link={SUPPORT_LINK} active={false} />}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}

function NavItem({ link, active }: { link: NavLink; active: boolean }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={link.label}>
        {link.external ? (
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
          >
            {link.icon}
            <span>{link.label}</span>
            {link.newTab && (
              <ExternalLink className="ml-auto text-muted-foreground" />
            )}
          </a>
        ) : (
          <Link href={link.href} aria-current={active ? "page" : undefined}>
            {link.icon}
            <span>{link.label}</span>
          </Link>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

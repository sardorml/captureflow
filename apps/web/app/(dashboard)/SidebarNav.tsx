"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Camera,
  ChevronRight,
  ExternalLink,
  LayoutDashboard,
  Link2,
  PenLine,
  Settings,
  ShieldCheck,
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
import { useAppMessages } from "@/components/app-i18n-provider";
import type { AppMessages } from "@/lib/i18n/app/messages";

type NavLink = {
  href: string;
  icon?: ReactNode;
  labelKey: keyof AppMessages["shell"]["nav"];
  external?: boolean;
  newTab?: boolean;
};

const CAPTURE_LINKS: NavLink[] = [
  {
    href: "/dashboard",
    icon: <LayoutDashboard />,
    labelKey: "dashboard",
  },
  { href: "/recordings", icon: <Link2 />, labelKey: "recordings" },
  { href: "/screenshots", icon: <Camera />, labelKey: "screenshots" },
  {
    href: "/canvas",
    icon: <PenLine />,
    labelKey: "canvas",
    external: true,
    newTab: true,
  },
];

// Members is for everyone: the page already draws itself for both roles.
const MEMBERS_LINK: NavLink = {
  href: "/members",
  icon: <Users />,
  labelKey: "members",
};

const SETTINGS_LINK: NavLink = {
  href: "/settings",
  icon: <Settings />,
  labelKey: "settings",
};

const PERSONAL_LINK: NavLink = {
  href: "/settings/personal",
  labelKey: "personal",
};
const WORKSPACE_LINK: NavLink = {
  href: "/settings/workspace",
  labelKey: "workspace",
};
const BILLING_LINK: NavLink = { href: "/billing", labelKey: "billing" };
// The self-hosted admin app, served beside this one; a plain link, since the
// router has no page for it.
const ADMIN_LINK: NavLink = {
  href: "/admin",
  icon: <ShieldCheck />,
  labelKey: "admin",
  external: true,
};

export function SidebarNav({
  isOwner,
  selfHosted,
  instanceAdmin,
}: {
  isOwner: boolean;
  selfHosted: boolean;
  instanceAdmin: boolean;
}) {
  const nav = useAppMessages().shell.nav;
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
        <SidebarGroupLabel>{nav.workspaceGroup}</SidebarGroupLabel>
        <SidebarMenu>
          <NavItem link={MEMBERS_LINK} active={isActive(MEMBERS_LINK)} />
          <Collapsible asChild defaultOpen className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={nav[SETTINGS_LINK.labelKey]}>
                  {SETTINGS_LINK.icon}
                  <span>{nav[SETTINGS_LINK.labelKey]}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {settingsLinks.map((link) => (
                    <SidebarMenuSubItem key={link.href}>
                      <SidebarMenuSubButton asChild isActive={isActive(link)}>
                        <Link href={link.href}>
                          <span>{nav[link.labelKey]}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
          {instanceAdmin && <NavItem link={ADMIN_LINK} active={false} />}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}

function NavItem({ link, active }: { link: NavLink; active: boolean }) {
  const label = useAppMessages().shell.nav[link.labelKey];
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={label}>
        {link.external ? (
          <a
            href={link.href}
            target={link.newTab ? "_blank" : undefined}
            rel={link.newTab ? "noopener noreferrer" : undefined}
          >
            {link.icon}
            <span>{label}</span>
            {link.newTab && (
              <ExternalLink className="ml-auto text-muted-foreground" />
            )}
          </a>
        ) : (
          <Link href={link.href} aria-current={active ? "page" : undefined}>
            {link.icon}
            <span>{label}</span>
          </Link>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

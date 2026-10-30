"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ChevronsUpDown,
  LayoutDashboard,
  Inbox,
  LogOut,
  Mail,
  Monitor,
  Moon,
  ScrollText,
  ShieldCheck,
  Sun,
  Users,
  Video,
} from "lucide-react";
import {
  type ThemePreference,
  writeThemePreferenceCookie,
} from "@captureflow/ui/theme";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

const ICONS = {
  overview: LayoutDashboard,
  users: Users,
  recordings: Video,
  workspaces: Building2,
  emails: Mail,
  inbox: Inbox,
  audit: ScrollText,
  admins: ShieldCheck,
} as const;

export type NavItem = { href: string; label: string; icon: keyof typeof ICONS };

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AdminSidebar({
  email,
  role,
  items,
  themePreference,
}: {
  email: string;
  role: string;
  items: NavItem[];
  themePreference: ThemePreference;
}) {
  const pathname = usePathname();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <AccountMenu email={email} role={role} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) => {
              const Icon = ICONS[item.icon];
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(pathname, item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <Icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <ThemeSwitcher initial={themePreference} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function AccountMenu({ email, role }: { email: string; role: string }) {
  const { isMobile } = useSidebar();
  const signOut = useRef<HTMLFormElement>(null);
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <form ref={signOut} action="/logout" method="post" hidden />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-md after:rounded-md">
                <AvatarFallback className="rounded-md bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
                  {email[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">CaptureFlow</span>
                <span className="truncate text-xs text-muted-foreground">
                  Instance admin
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-60"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="flex flex-col font-normal">
              <span className="truncate text-sm text-foreground">{email}</span>
              <span className="text-xs text-muted-foreground capitalize">
                {role}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => signOut.current?.requestSubmit()}>
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

const THEMES = [
  { id: "light", label: "Light", Icon: Sun },
  { id: "dark", label: "Dark", Icon: Moon },
  { id: "system", label: "System", Icon: Monitor },
] as const;

function ThemeSwitcher({ initial }: { initial: ThemePreference }) {
  const [preference, setPreference] = useState<ThemePreference>(initial);
  const choose = (next: ThemePreference) => {
    setPreference(next);
    writeThemePreferenceCookie(next);
    const theme =
      next === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : next;
    const root = document.documentElement;
    // Colour transitions are held off for two frames so nothing fades
    // between the themes.
    root.setAttribute("data-theme-switching", "");
    root.setAttribute("data-theme", theme);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => root.removeAttribute("data-theme-switching")),
    );
  };
  return (
    <ButtonGroup aria-label="Theme" className="w-full">
      {THEMES.map(({ id, label, Icon }) => (
        <Button
          key={id}
          type="button"
          size="sm"
          variant={preference === id ? "secondary" : "outline"}
          aria-pressed={preference === id}
          className="flex-1"
          onClick={() => choose(id)}
        >
          <Icon />
          {label}
        </Button>
      ))}
    </ButtonGroup>
  );
}

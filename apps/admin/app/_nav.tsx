"use client";

import { useRef, useState } from "react";
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
} from "lucide-react";
import {
  Avatar,
  Dropdown,
  Label,
  ListBox,
  ToggleButton,
  ToggleButtonGroup,
} from "@heroui/react";
import {
  type ThemePreference,
  isThemePreference,
  writeThemePreferenceCookie,
} from "@captureflow/ui/theme";

const ICONS = {
  overview: LayoutDashboard,
  users: Users,
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

export function SideNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const active = items.find((item) => isActive(pathname, item.href))?.href;
  return (
    <ListBox
      aria-label="Admin"
      selectionMode="single"
      selectedKeys={active ? [active] : []}
      disallowEmptySelection
      className="flex gap-0.5 overflow-x-auto p-0 md:flex-col md:overflow-visible [&>*+*]:mt-0"
    >
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        return (
          <ListBox.Item
            key={item.href}
            id={item.href}
            href={item.href}
            textValue={item.label}
            className="w-auto shrink-0 md:w-full text-fg-muted data-[hovered=true]:text-fg data-[selected=true]:bg-tint-strong data-[selected=true]:text-fg-strong h-9 gap-3 rounded-lg px-3 text-[15px]"
          >
            <Icon size={17} aria-hidden />
            <Label className="cursor-[inherit] text-inherit">
              {item.label}
            </Label>
          </ListBox.Item>
        );
      })}
    </ListBox>
  );
}

export function AccountMenu({ email, role }: { email: string; role: string }) {
  const signOut = useRef<HTMLFormElement>(null);
  return (
    <>
      <form ref={signOut} action="/logout" method="post" hidden />
      <Dropdown>
        <Dropdown.Trigger className="hover:bg-tint flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors motion-reduce:transition-none">
          <Avatar size="sm" color="accent" className="size-7 rounded-md">
            <Avatar.Fallback className="text-xs font-semibold">
              {email[0]?.toUpperCase() ?? "?"}
            </Avatar.Fallback>
          </Avatar>
          <span className="min-w-0 flex-1">
            <span className="text-fg-strong block truncate text-[15px] font-medium">
              CaptureFlow
            </span>
          </span>
          <ChevronsUpDown size={15} className="text-fg-subtle" aria-hidden />
        </Dropdown.Trigger>
        <Dropdown.Popover placement="bottom start" className="min-w-60">
          <Dropdown.Menu
            aria-label="Account"
            onAction={(key) => {
              if (key === "sign-out") signOut.current?.requestSubmit();
            }}
          >
            <Dropdown.Section>
              <Dropdown.Item id="who" textValue={email} isDisabled>
                <span className="flex min-w-0 flex-col">
                  <span className="text-fg truncate text-sm">{email}</span>
                  <span className="text-fg-subtle text-xs capitalize">
                    {role}
                  </span>
                </span>
              </Dropdown.Item>
            </Dropdown.Section>
            <Dropdown.Item id="sign-out" textValue="Sign out">
              <LogOut size={15} aria-hidden />
              <Label>Sign out</Label>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </>
  );
}

const THEMES = [
  { id: "light", label: "Light", Icon: Sun },
  { id: "dark", label: "Dark", Icon: Moon },
  { id: "system", label: "System", Icon: Monitor },
] as const;

export function ThemeSwitcher({ initial }: { initial: ThemePreference }) {
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
    document.documentElement.setAttribute("data-theme", theme);
  };
  return (
    <ToggleButtonGroup
      aria-label="Theme"
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[preference]}
      onSelectionChange={(keys) => {
        const [key] = [...keys];
        if (isThemePreference(key)) choose(key);
      }}
      size="sm"
      className="w-full"
    >
      {THEMES.map(({ id, label, Icon }) => (
        <ToggleButton key={id} id={id} aria-label={label} className="flex-1">
          <Icon size={14} aria-hidden />
          {label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

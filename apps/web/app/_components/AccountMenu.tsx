"use client";

import type { ReactNode } from "react";
import {
  HardDrive,
  LogOut,
  MessageSquare,
  Receipt,
  Settings,
} from "lucide-react";
import { getSeatPlan, type SeatPlanId } from "@captureflow/quota";
import type { ThemePreference } from "@captureflow/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/format";
import { SUPPORT_EMAIL } from "@/lib/site";
import { useAppMessages } from "@/components/app-i18n-provider";
import { ThemeSegments } from "./ThemeSegments";

export type AccountMenuPlan = "free" | SeatPlanId;

export type AccountMenuNavItem = {
  key: "billing" | "devices" | "settings" | "support";
  icon: ReactNode;
  href: string;
  // Right-aligned accessory — a plan chip, a count. Purely decorative.
  trailing?: ReactNode;
};

/*
 * The one account nav list. Both surfaces build from it so they can't drift:
 * the viewer renders on a possibly different origin, so it passes an absolute
 * base, and it has no subscription to hand over — the plan chip is dropped
 * there rather than guessed at. A self-hosted instance has no billing, and its
 * support is the company's own, not ours.
 */
export function accountNavItems({
  base = "",
  plan,
  selfHosted = false,
  billing = true,
}: {
  base?: string;
  plan?: AccountMenuPlan;
  selfHosted?: boolean;
  billing?: boolean;
}): AccountMenuNavItem[] {
  const items: AccountMenuNavItem[] = [
    {
      key: "billing",
      icon: <Receipt size={16} />,
      href: `${base}/billing`,
      trailing: plan === undefined ? undefined : <PlanChip plan={plan} />,
    },
    {
      key: "devices",
      icon: <HardDrive size={16} />,
      href: `${base}/devices`,
    },
    {
      key: "settings",
      icon: <Settings size={16} />,
      href: `${base}/settings`,
    },
    {
      key: "support",
      icon: <MessageSquare size={16} />,
      href: `mailto:${SUPPORT_EMAIL}`,
    },
  ];
  return items.filter(
    (i) =>
      !(selfHosted && (i.key === "billing" || i.key === "support")) &&
      !(!billing && i.key === "billing"),
  );
}

function PlanChip({ plan }: { plan: AccountMenuPlan }) {
  const m = useAppMessages();
  return (
    <Badge variant={plan === "free" ? "secondary" : "default"}>
      {plan === "free" ? m.shell.account.freePlan : getSeatPlan(plan).name}
    </Badge>
  );
}

type Props = {
  name: string | null;
  email: string;
  imageUrl: string | null;
  plan?: AccountMenuPlan;
  // Built by accountNavItems above; taken as a prop so a surface can pass its
  // own base URL and plan chip.
  navItems: AccountMenuNavItem[];
  // Renders the theme row when the surface can supply the stored preference.
  themePreference?: ThemePreference;
  signingOut: boolean;
  onSignOut: () => void;
};

export function AccountMenu({
  name,
  email,
  imageUrl,
  navItems,
  themePreference,
  signingOut,
  onSignOut,
}: Props) {
  const copy = useAppMessages().shell.account;
  const displayName = name?.trim() || email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={copy.menu}
        className="cursor-pointer rounded-full outline-none"
      >
        {/* 36px, the height of the buttons either side of it. */}
        <Avatar className="h-9 w-9">
          {imageUrl && <AvatarImage src={imageUrl} alt={displayName} />}
          <AvatarFallback>{initials(displayName)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="bottom" align="end" className="w-64">
        {/* Identity reads as one block: avatar beside the name and address,
            rather than the name alone over the address. */}
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <Avatar className="h-9 w-9 shrink-0">
            {imageUrl && <AvatarImage src={imageUrl} alt={displayName} />}
            <AvatarFallback>{initials(displayName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-base leading-7 font-semibold text-foreground">
              {displayName}
            </p>
            <p className="truncate text-xs leading-5 text-muted-foreground">
              {email}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator />

        {navItems.map((item) => {
          const content = (
            <>
              {item.icon}
              {copy.nav[item.key]}
              {item.trailing ? (
                <span className="ms-auto ps-2">{item.trailing}</span>
              ) : null}
            </>
          );
          return (
            <DropdownMenuItem key={item.key} asChild>
              <a href={item.href}>{content}</a>
            </DropdownMenuItem>
          );
        })}

        {themePreference ? (
          <>
            <DropdownMenuSeparator />
            <ThemeSegments initialPreference={themePreference} />
          </>
        ) : null}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          disabled={signingOut}
          onSelect={onSignOut}
        >
          <LogOut size={16} />
          {signingOut ? copy.signingOut : copy.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

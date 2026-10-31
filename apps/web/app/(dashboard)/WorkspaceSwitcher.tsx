"use client";

import type { PaidSeats } from "@/lib/billing/seat-checkout";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { withSplitLoaded } from "@/components/dev/split-loaded";
import { Check, ChevronsUpDown, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { WorkspaceMembership } from "@captureflow/quota";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { whenIdle } from "@/lib/when-idle";
import { workspaceLogoUrl } from "@/lib/site";
import { switchWorkspaceAction } from "./switch-workspace-action";

// Loaded once the page is idle, not with the dashboard's first paint.
const InviteModal = dynamic(
  () =>
    import("./InviteModal").then((m) =>
      withSplitLoaded("invite-modal", m.InviteModal),
    ),
  { ssr: false },
);

// The logo the workspace settings promise is "shown next to your workspace
// name". Without one it falls back to initials.
function WorkspaceMark({
  membership,
  className,
}: {
  membership: WorkspaceMembership;
  className: string;
}) {
  const url = workspaceLogoUrl(
    membership.workspace_logo_key,
    membership.workspace_updated_at,
  );
  return (
    <Avatar className={cn("shrink-0 rounded-md after:rounded-md", className)}>
      {url && <AvatarImage src={url} alt="" className="rounded-md" />}
      <AvatarFallback className="rounded-md bg-sidebar-primary text-xs text-sidebar-primary-foreground">
        {initials(membership.workspace_name)}
      </AvatarFallback>
    </Avatar>
  );
}

type Props = {
  currentWorkspaceId: string;
  memberships: WorkspaceMembership[];
  memberCount: number;
  canInvite: boolean;
  paidSeats: PaidSeats | null;
};

export function WorkspaceSwitcher({
  currentWorkspaceId,
  memberships,
  memberCount,
  canInvite,
  paidSeats,
}: Props) {
  const { isMobile } = useSidebar();
  const formRef = useRef<HTMLFormElement>(null);
  const [isInviting, setInviting] = useState(false);
  // Mounted closed once the page is idle, so the first invite opens at once,
  // and kept mounted so closing can animate out.
  const [inviteMounted, setInviteMounted] = useState(false);
  useEffect(
    () => (canInvite ? whenIdle(() => setInviteMounted(true)) : undefined),
    [canInvite],
  );
  const current =
    memberships.find((m) => m.workspace_id === currentWorkspaceId) ??
    memberships[0];
  if (!current) return null;

  const choose = (workspaceId: string) => {
    const input = formRef.current?.querySelector<HTMLInputElement>(
      "input[name=workspaceId]",
    );
    if (!input || !formRef.current) return;
    input.value = workspaceId;
    formRef.current.requestSubmit();
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                aria-label="Switch workspace"
                data-testid="workspace-card"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <WorkspaceMark membership={current} className="size-8" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {current.workspace_name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Default · {memberCount}{" "}
                    {memberCount === 1 ? "member" : "members"}
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
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Workspaces
              </DropdownMenuLabel>
              {memberships.map((m) => {
                const isCurrent = m.workspace_id === current.workspace_id;
                return (
                  <DropdownMenuItem
                    key={m.workspace_id}
                    onSelect={() => {
                      if (!isCurrent) choose(m.workspace_id);
                    }}
                    className="gap-2 p-2"
                  >
                    <WorkspaceMark membership={m} className="size-6" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate">{m.workspace_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {m.role === "owner" ? "You own this" : "You joined"}
                      </span>
                    </span>
                    {isCurrent && <Check className="ml-auto" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
        {canInvite && (
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Invite members"
              onClick={() => {
                setInviteMounted(true);
                setInviting(true);
              }}
            >
              <UserPlus />
              <span>Invite members</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>

      {/* Outside the menu on purpose: closing it unmounts its subtree, which
          would take the modal down with it. */}
      {inviteMounted ? (
        <InviteModal
          isOpen={isInviting}
          onOpenChange={setInviting}
          paidSeats={paidSeats}
        />
      ) : null}

      <form ref={formRef} action={switchWorkspaceAction} className="hidden">
        <input type="hidden" name="workspaceId" value="" />
      </form>
    </>
  );
}

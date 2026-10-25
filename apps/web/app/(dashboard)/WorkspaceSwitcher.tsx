"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronsUpDown, Info, LayoutGrid, UserPlus } from "lucide-react";
import {
  Avatar,
  Button,
  Chip,
  Dropdown,
  Popover,
  buttonVariants,
} from "@heroui/react";
import type { WorkspaceMembership } from "@captureflow/quota";
import { initials } from "@/lib/format";
import { workspaceLogoUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import { resolveWorkspaceCard, workspaceCardStyle } from "@/lib/workspace-card";
import { InviteModal } from "./InviteModal";
import { switchWorkspaceAction } from "./switch-workspace-action";

// The logo the workspace settings promise is "shown next to your workspace
// name". Without one it falls back to initials, the same treatment member
// avatars get.
function WorkspaceMark({
  membership,
  size,
}: {
  membership: WorkspaceMembership;
  size: number;
}) {
  const url = workspaceLogoUrl(
    membership.workspace_logo_key,
    membership.workspace_updated_at,
  );
  return (
    <Avatar
      className="shrink-0 rounded-full"
      style={{ width: size, height: size }}
    >
      {url && <Avatar.Image src={url} alt="" />}
      <Avatar.Fallback style={{ fontSize: Math.round(size * 0.4) }}>
        {initials(membership.workspace_name)}
      </Avatar.Fallback>
    </Avatar>
  );
}

/* A Popover rather than a Tooltip: this opens on press, which is both what the
   icon looks like it does and what works on touch. Popover.Content is only the
   container — Popover.Dialog is what carries the padding. */
function DefaultBadge({ canSwitch }: { canSwitch: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <Chip size="sm" color="accent">
        Default
      </Chip>
      <Popover>
        <Popover.Trigger
          className="inline-flex rounded-full text-fg-subtle transition-colors hover:text-fg"
          aria-label="What the default workspace means"
        >
          <Info size={14} />
        </Popover.Trigger>
        <Popover.Content placement="right" className="w-56">
          <Popover.Dialog className="p-3">
            <p className="text-start text-xs leading-5 text-fg-muted">
              New recordings and screenshots save here, including the ones you
              capture in the extension and the desktop app.
              {canSwitch && " Switch below to change that."}
            </p>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>
    </span>
  );
}

type Props = {
  currentWorkspaceId: string;
  memberships: WorkspaceMembership[];
  memberCount: number;
  recordingCount: number;
  canInvite: boolean;
};

export function WorkspaceSwitcher({
  currentWorkspaceId,
  memberships,
  memberCount,
  recordingCount,
  canInvite,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isOpen, setOpen] = useState(false);
  const [isInviting, setInviting] = useState(false);
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

  const plural = (n: number, noun: string) =>
    `${n} ${noun}${n === 1 ? "" : "s"}`;

  // The card above already is the current workspace; the list is what you can
  // move to.
  const others = memberships.filter(
    (m) => m.workspace_id !== current.workspace_id,
  );
  const canSwitch = others.length > 0;
  // The workspace background is a flat sheet behind the white card, so the
  // sidebar stays quiet and the colour still says which workspace it is.
  const sheetStyle = workspaceCardStyle(
    resolveWorkspaceCard(current.workspace_card_bg, current.workspace_id),
    current.workspace_updated_at,
  );

  return (
    <div className="flex flex-col gap-1.5">
      {/* The card states which workspace you are in and that it is the default
          without you having to open anything. The info button sits outside the
          Dropdown because React Aria's press context would otherwise route its
          press to the trigger. */}
      <div className="relative pt-2">
        <div
          data-testid="workspace-sheet"
          className="absolute inset-x-1 top-0 h-6 rounded-t-2xl"
          style={sheetStyle}
          aria-hidden="true"
        />
        <div
          ref={cardRef}
          data-testid="workspace-card"
          className="relative rounded-2xl bg-panel shadow-[0_1px_3px_rgb(0_0_0/0.06),0_0_0_1px_rgb(0_0_0/0.05)] dark:bg-panel-2 dark:shadow-[0_1px_3px_rgb(0_0_0/0.3),0_0_0_1px_rgb(255_255_255/0.06)]"
        >
          <Dropdown isOpen={isOpen} onOpenChange={setOpen}>
            <Dropdown.Trigger
              aria-label="Switch workspace"
              className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-t-xl px-3 pt-2.5 pb-1 outline-none"
            >
              <span className="truncate font-medium text-fg">
                {current.workspace_name}
              </span>
              <ChevronsUpDown size={14} className="shrink-0 text-fg-muted" />
            </Dropdown.Trigger>
            {/* Anchored to the card rather than to the trigger row, so it opens
              clear of the Default line instead of on top of it. outline-none
              because HeroUI resets the popover's focus ring with
              `:focus-visible:not(:focus)`, which never matches — so the browser
              draws its own ring around the whole panel on open. */}
            <Dropdown.Popover
              triggerRef={cardRef}
              placement="bottom start"
              className="min-w-64 outline-none"
            >
              <div
                className="h-14 rounded-t-[inherit]"
                style={sheetStyle}
                aria-hidden="true"
              />
              <div className="-mt-6 flex flex-col items-center gap-2 px-4 pb-3 text-center">
                <span className="rounded-full bg-panel p-1 dark:bg-panel-2">
                  <WorkspaceMark membership={current} size={48} />
                </span>
                <span className="truncate font-semibold text-fg">
                  {current.workspace_name}
                </span>
                <DefaultBadge canSwitch={canSwitch} />
                <span className="text-xs text-fg-muted">
                  {plural(memberCount, "member")} &middot;{" "}
                  {plural(recordingCount, "recording")}
                </span>
                {/* Inside the current workspace's block, since that is the
                  workspace the invite is to. */}
                {canInvite && (
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    className="mt-1"
                    onPress={() => {
                      setOpen(false);
                      setInviting(true);
                    }}
                  >
                    <UserPlus size={16} />
                    Invite to this workspace
                  </Button>
                )}
              </div>

              {canSwitch && (
                <>
                  <hr className="border-line" />
                  <p className="px-4 pt-2.5 pb-0.5 text-[11px] font-medium tracking-wide text-fg-subtle uppercase">
                    Switch to
                  </p>
                  <Dropdown.Menu onAction={(key) => choose(String(key))}>
                    {others.map((m) => (
                      <Dropdown.Item key={m.workspace_id} id={m.workspace_id}>
                        <WorkspaceMark membership={m} size={22} />
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate font-medium text-fg">
                            {m.workspace_name}
                          </span>
                          <span className="text-xs text-fg-muted">
                            {m.role === "owner" ? "You own this" : "You joined"}
                          </span>
                        </span>
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </>
              )}

              <hr className="border-line" />
              <div className="p-2">
                <Link
                  href="/workspaces"
                  onClick={() => setOpen(false)}
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "w-full justify-start",
                  )}
                >
                  <LayoutGrid size={16} />
                  All workspaces
                </Link>
              </div>
            </Dropdown.Popover>
          </Dropdown>

          <div className="flex items-center gap-2 px-3 pb-2.5 text-xs text-fg-muted">
            <DefaultBadge canSwitch={canSwitch} />
            <span className="h-3 w-px shrink-0 bg-line" />
            <span className="truncate">{plural(memberCount, "member")}</span>
          </div>
        </div>
      </div>

      {/* Outside the Dropdown on purpose: closing the popover unmounts its
          subtree, which would take the modal down with it. */}
      <InviteModal isOpen={isInviting} onOpenChange={setInviting} />

      <form ref={formRef} action={switchWorkspaceAction} className="hidden">
        <input type="hidden" name="workspaceId" value="" />
      </form>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { ChevronsUpDown, Info, UserPlus } from "lucide-react";
import { Avatar, Button, Chip, Dropdown, Popover } from "@heroui/react";
import type { WorkspaceMembership } from "@captureflow/quota";
import { initials } from "@/lib/format";
import { workspaceLogoUrl } from "@/lib/site";
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
  const [isOpen, setOpen] = useState(false);
  const [isInviting, setInviting] = useState(false);
  const current =
    memberships.find((m) => m.workspace_id === currentWorkspaceId) ??
    memberships[0];
  if (!current) return null;

  const choose = (workspaceId: string) => {
    if (workspaceId === currentWorkspaceId) return;
    const input = formRef.current?.querySelector<HTMLInputElement>(
      "input[name=workspaceId]",
    );
    if (!input || !formRef.current) return;
    input.value = workspaceId;
    formRef.current.requestSubmit();
  };

  const plural = (n: number, noun: string) =>
    `${n} ${noun}${n === 1 ? "" : "s"}`;

  const canSwitch = memberships.length > 1;

  return (
    <div className="flex flex-col gap-1.5">
      {/* The card states which workspace you are in and that it is the default
          without you having to open anything. The info button sits outside the
          Dropdown because React Aria's press context would otherwise route its
          press to the trigger. */}
      <div className="rounded-xl border border-line bg-canvas-2">
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
          {/* outline-none because HeroUI resets the popover's focus ring with
              `:focus-visible:not(:focus)`, which never matches — so the browser
              draws its own ring around the whole panel on open. */}
          <Dropdown.Popover className="min-w-64 outline-none">
            <div className="flex flex-col items-center gap-2 px-4 pt-4 pb-3 text-center">
              <WorkspaceMark membership={current} size={48} />
              <span className="truncate font-semibold text-fg">
                {current.workspace_name}
              </span>
              <DefaultBadge canSwitch={canSwitch} />
              <span className="text-xs text-fg-muted">
                {plural(memberCount, "member")} &middot;{" "}
                {plural(recordingCount, "recording")}
              </span>
            </div>

            {canSwitch && (
              <>
                <hr className="border-line" />
                <Dropdown.Menu
                  selectionMode="single"
                  selectedKeys={[currentWorkspaceId]}
                  onAction={(key) => choose(String(key))}
                >
                  {memberships.map((m) => (
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

            {canInvite && (
              <>
                <hr className="border-line" />
                <div className="p-2">
                  <Button
                    variant="ghost"
                    fullWidth
                    className="justify-start"
                    onPress={() => {
                      setOpen(false);
                      setInviting(true);
                    }}
                  >
                    <UserPlus size={16} />
                    Invite teammates
                  </Button>
                </div>
              </>
            )}
          </Dropdown.Popover>
        </Dropdown>

        <div className="flex items-center gap-2 px-3 pb-2.5 text-xs text-fg-muted">
          <DefaultBadge canSwitch={canSwitch} />
          <span className="h-3 w-px shrink-0 bg-line" />
          <span className="truncate">{plural(memberCount, "member")}</span>
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

"use client";

import { useRef, type ReactNode } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Avatar, Dropdown, buttonVariants } from "@heroui/react";
import type { WorkspaceMembership } from "@captureflow/quota";
import { initials } from "@/lib/format";
import { workspaceLogoUrl } from "@/lib/site";
import { switchWorkspaceAction } from "./switch-workspace-action";

// The logo the workspace settings promise is "shown next to your workspace
// name". Without one it falls back to initials, the same treatment member
// avatars get — the squared corners are what keep a workspace readable as a
// place rather than a person.
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
      className="shrink-0 rounded-[5px]"
      style={{ width: size, height: size }}
    >
      {url && <Avatar.Image src={url} alt="" />}
      <Avatar.Fallback className="text-[10px]">
        {initials(membership.workspace_name)}
      </Avatar.Fallback>
    </Avatar>
  );
}

type Props = {
  currentWorkspaceId: string;
  memberships: WorkspaceMembership[];
  inviteSlot?: ReactNode;
};

export function WorkspaceSwitcher({
  currentWorkspaceId,
  memberships,
  inviteSlot,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
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

  return (
    <div className="flex flex-col gap-1.5">
      <Dropdown>
        <Dropdown.Trigger
          aria-label="Switch workspace"
          className={buttonVariants({
            variant: "secondary",
            className: "w-full justify-between gap-2",
          })}
        >
          <span className="flex min-w-0 items-center gap-2">
            <WorkspaceMark membership={current} size={18} />
            <span className="truncate">{current.workspace_name}</span>
          </span>
          <ChevronsUpDown size={14} className="shrink-0" />
        </Dropdown.Trigger>
        <Dropdown.Popover className="min-w-56">
          <Dropdown.Menu
            selectionMode="single"
            selectedKeys={[currentWorkspaceId]}
            onAction={(key) => choose(String(key))}
          >
            {memberships.map((m) => (
              <Dropdown.Item key={m.workspace_id} id={m.workspace_id}>
                <WorkspaceMark membership={m} size={22} />
                <span className="flex flex-col">
                  <span className="font-medium text-fg">
                    {m.workspace_name}
                  </span>
                  <span className="text-xs text-fg-muted">
                    {m.role === "owner" ? "You own this" : "You joined"}
                  </span>
                </span>
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>

      {inviteSlot}

      <form ref={formRef} action={switchWorkspaceAction} className="hidden">
        <input type="hidden" name="workspaceId" value="" />
      </form>
    </div>
  );
}

"use client";

import { useRef, type ReactNode } from "react";
import { ChevronsUpDown, LayoutGrid } from "lucide-react";
import { Button, Dropdown, type MenuProps } from "antd";
import type { WorkspaceMembership } from "@captureflow/quota";
import { switchWorkspaceAction } from "./switch-workspace-action";

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

  const items: MenuProps["items"] = memberships.map((m) => ({
    key: m.workspace_id,
    label: (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontWeight: 500 }}>{m.workspace_name}</span>
        <span style={{ fontSize: 12, opacity: 0.65 }}>
          {m.role === "owner" ? "You own this" : "You joined"}
        </span>
      </div>
    ),
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <Dropdown
        trigger={["click"]}
        menu={{
          items,
          selectable: true,
          selectedKeys: [currentWorkspaceId],
          onClick: ({ key }) => choose(key),
        }}
      >
        <Button
          aria-label="Switch workspace"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            width: "100%",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              minWidth: 0,
            }}
          >
            <LayoutGrid size={16} />
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {current.workspace_name}
            </span>
          </span>
          <ChevronsUpDown size={14} />
        </Button>
      </Dropdown>

      {inviteSlot}

      <form
        ref={formRef}
        action={switchWorkspaceAction}
        style={{ display: "none" }}
      >
        <input type="hidden" name="workspaceId" value="" />
      </form>
    </div>
  );
}

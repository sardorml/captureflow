"use client";

import { Avatar, Tooltip } from "antd";
import { UserPlus } from "lucide-react";
import type { AvatarGroupItem } from "@captureflow/ui";
import { InviteModal } from "./InviteModal";

type Props = {
  items: AvatarGroupItem[];
  canInvite: boolean;
};

export function WorkspaceMembersStack({ items, canInvite }: Props) {
  if (items.length === 0 && !canInvite) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Avatar.Group max={{ count: 4 }}>
        {items.map((m) => (
          <Tooltip key={m.key} title={m.label}>
            <Avatar src={m.image || undefined}>{m.initials}</Avatar>
          </Tooltip>
        ))}
      </Avatar.Group>
      {canInvite && (
        <InviteModal
          trigger={
            <Avatar
              icon={<UserPlus size={14} />}
              style={{
                cursor: "pointer",
                backgroundColor: "transparent",
                borderStyle: "dashed",
              }}
            />
          }
        />
      )}
    </div>
  );
}

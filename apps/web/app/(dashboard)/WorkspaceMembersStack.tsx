"use client";

import { Avatar, theme, Tooltip } from "antd";
import { UserPlus } from "lucide-react";
import type { AvatarGroupItem } from "@captureflow/ui";
import { InviteModal } from "./InviteModal";

type Props = {
  items: AvatarGroupItem[];
  canInvite: boolean;
};

export function WorkspaceMembersStack({ items, canInvite }: Props) {
  const { token } = theme.useToken();
  if (items.length === 0 && !canInvite) return null;
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 32 }}
    >
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
                color: token.colorTextTertiary,
                borderColor: token.colorBorder,
                borderWidth: 1,
                borderStyle: "dashed",
              }}
            />
          }
        />
      )}
    </div>
  );
}

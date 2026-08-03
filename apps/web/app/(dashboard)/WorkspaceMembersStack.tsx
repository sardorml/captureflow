"use client";

import { Avatar, Tooltip } from "@heroui/react";
import { UserPlus } from "lucide-react";
import type { AvatarGroupItem } from "@captureflow/ui";
import { InviteModal } from "./InviteModal";

const MAX_VISIBLE = 4;

type Props = {
  items: AvatarGroupItem[];
  canInvite: boolean;
};

export function WorkspaceMembersStack({ items, canInvite }: Props) {
  if (items.length === 0 && !canInvite) return null;
  const visible = items.slice(0, MAX_VISIBLE);
  const overflow = items.length - visible.length;

  return (
    <div className="flex min-h-8 items-center gap-2">
      <div className="flex -space-x-2">
        {visible.map((m) => (
          <Tooltip key={m.key}>
            <Tooltip.Trigger className="inline-flex" tabIndex={0}>
              <Avatar className="h-8 w-8 ring-2 ring-canvas-2">
                {m.image && <Avatar.Image src={m.image} alt={m.label} />}
                <Avatar.Fallback>{m.initials}</Avatar.Fallback>
              </Avatar>
            </Tooltip.Trigger>
            <Tooltip.Content>{m.label}</Tooltip.Content>
          </Tooltip>
        ))}
        {overflow > 0 && (
          <Avatar className="h-8 w-8 ring-2 ring-canvas-2">
            <Avatar.Fallback>+{overflow}</Avatar.Fallback>
          </Avatar>
        )}
      </div>
      {canInvite && (
        <InviteModal
          trigger={
            <button
              type="button"
              aria-label="Invite teammates"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-dashed border-line-strong bg-transparent text-fg-subtle transition-colors hover:text-fg"
            >
              <UserPlus size={14} />
            </button>
          }
        />
      )}
    </div>
  );
}

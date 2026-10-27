"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { withSplitLoaded } from "@/components/dev/split-loaded";
import { Avatar, Tooltip } from "@heroui/react";
import { UserPlus } from "lucide-react";
import type { AvatarGroupItem } from "@captureflow/ui";

// Loaded on the first invite, not with every dashboard page.
const InviteModal = dynamic(
  () =>
    import("./InviteModal").then((m) =>
      withSplitLoaded("invite-modal", m.InviteModal),
    ),
  { ssr: false },
);

const MAX_VISIBLE = 4;

type Props = {
  items: AvatarGroupItem[];
  canInvite: boolean;
};

export function WorkspaceMembersStack({ items, canInvite }: Props) {
  const [inviting, setInviting] = useState(false);
  // Stays mounted after the first invite so closing can animate out.
  const [inviteMounted, setInviteMounted] = useState(false);
  if (items.length === 0 && !canInvite) return null;
  const visible = items.slice(0, MAX_VISIBLE);
  const overflow = items.length - visible.length;

  return (
    <div className="flex min-h-8 items-center gap-2">
      <div className="flex -space-x-2">
        {visible.map((m) => (
          <Tooltip key={m.key}>
            <Tooltip.Trigger className="inline-flex" tabIndex={0}>
              <Avatar className="h-8 w-8 ring-2 ring-panel">
                {m.image && <Avatar.Image src={m.image} alt={m.label} />}
                <Avatar.Fallback>{m.initials}</Avatar.Fallback>
              </Avatar>
            </Tooltip.Trigger>
            <Tooltip.Content>{m.label}</Tooltip.Content>
          </Tooltip>
        ))}
        {overflow > 0 && (
          <Avatar className="h-8 w-8 ring-2 ring-panel">
            <Avatar.Fallback>+{overflow}</Avatar.Fallback>
          </Avatar>
        )}
      </div>
      {canInvite && (
        <>
          <button
            type="button"
            aria-label="Invite teammates"
            onClick={() => {
              setInviteMounted(true);
              setInviting(true);
            }}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-dashed border-line-strong bg-transparent text-fg-subtle transition-colors hover:text-fg"
          >
            <UserPlus size={14} />
          </button>
          {inviteMounted ? (
            <InviteModal isOpen={inviting} onOpenChange={setInviting} />
          ) : null}
        </>
      )}
    </div>
  );
}

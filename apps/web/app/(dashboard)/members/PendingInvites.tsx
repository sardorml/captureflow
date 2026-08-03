"use client";

import type { WorkspaceInviteRow } from "@captureflow/quota";
import { Clock } from "lucide-react";
import { Button, Card, Typography } from "@heroui/react";
import { revokeInviteAction } from "./actions";

function formatRelative(ms: number): string {
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function PendingInvites({
  invites,
  canRevoke,
}: {
  invites: WorkspaceInviteRow[];
  canRevoke: boolean;
}) {
  return (
    <Card>
      <Card.Header>
        <Typography weight="semibold">
          Pending invitations{" "}
          <Typography color="muted" render={(p) => <span {...p} />}>
            ({invites.length})
          </Typography>
        </Typography>
      </Card.Header>
      <ul className="divide-y divide-line border-t border-line">
        {invites.map((invite) => (
          <li
            key={invite.id}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-fg">{invite.email}</p>
              <p
                className="mt-0.5 flex items-center gap-1 text-xs text-fg-muted"
                suppressHydrationWarning
              >
                <Clock size={12} />
                Invited {formatRelative(invite.created_at)}
              </p>
            </div>
            {canRevoke && (
              <form action={revokeInviteAction}>
                <input type="hidden" name="inviteId" value={invite.id} />
                <Button
                  variant="ghost"
                  size="sm"
                  type="submit"
                  className="text-danger"
                >
                  Revoke
                </Button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

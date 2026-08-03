"use client";

import type { WorkspaceMember } from "@captureflow/quota";
import { LogOut, X } from "lucide-react";
import { Avatar, Button, Card, Chip, Typography } from "@heroui/react";
import { leaveWorkspaceAction, removeMemberAction } from "./actions";

function initials(name: string, email: string): string {
  const source = name.trim() || email;
  return source
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type Props = {
  members: WorkspaceMember[];
  viewerUserId: string;
  viewerIsOwner: boolean;
};

export function MembersList({ members, viewerUserId, viewerIsOwner }: Props) {
  return (
    <Card>
      <Card.Header>
        <Typography weight="semibold">
          Members{" "}
          <Typography color="muted" render={(p) => <span {...p} />}>
            ({members.length})
          </Typography>
        </Typography>
      </Card.Header>
      <ul className="divide-y divide-line border-t border-line">
        {members.map((m) => {
          const isOwnerRow = m.role === "owner";
          const isSelfRow = m.user_id === viewerUserId;
          return (
            <li key={m.user_id} className="flex items-center gap-3 px-4 py-3">
              <Avatar className="h-9 w-9 shrink-0">
                {m.image && <Avatar.Image src={m.image} alt={m.name} />}
                <Avatar.Fallback>{initials(m.name, m.email)}</Avatar.Fallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-fg">{m.name || m.email}</p>
                <p className="truncate text-xs text-fg-muted">{m.email}</p>
              </div>
              <Chip size="sm" color={isOwnerRow ? "accent" : "default"}>
                {isOwnerRow ? "Admin" : "Member"}
              </Chip>
              {viewerIsOwner && !isOwnerRow ? (
                <form action={removeMemberAction}>
                  <input type="hidden" name="userId" value={m.user_id} />
                  <Button
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    type="submit"
                    aria-label={`Remove ${m.name || m.email} from workspace`}
                    className="text-danger"
                  >
                    <X size={16} />
                  </Button>
                </form>
              ) : !viewerIsOwner && isSelfRow ? (
                <form action={leaveWorkspaceAction}>
                  <Button
                    variant="secondary"
                    size="sm"
                    type="submit"
                    aria-label="Leave workspace"
                  >
                    <LogOut size={14} />
                    Leave
                  </Button>
                </form>
              ) : null}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import type { AdminInvite } from "@captureflow/admin";
import { revokeInviteAction } from "../actions";
import { RowMenu } from "../_row-menu";
import { Monogram, formatDate } from "../_ui";

export function InviteRow({ invite }: { invite: AdminInvite }) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Monogram name={invite.email} />
          <span className="text-fg-strong truncate font-medium">
            {invite.email}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-fg-muted capitalize">{invite.role}</TableCell>
      <TableCell className="text-fg-muted">{invite.invitedBy}</TableCell>
      <TableCell className="text-fg-muted whitespace-nowrap">
        {formatDate(invite.expiresAt).slice(0, 10)}
      </TableCell>
      <TableCell>
        <RowMenu
          label={`Actions for the invite to ${invite.email}`}
          actions={[
            {
              id: "revoke",
              label: "Revoke invite",
              danger: true,
              action: revokeInviteAction,
              fields: { tokenHash: invite.tokenHash, email: invite.email },
            },
          ]}
        />
      </TableCell>
    </TableRow>
  );
}

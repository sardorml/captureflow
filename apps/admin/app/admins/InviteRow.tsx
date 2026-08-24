"use client";

import { Table } from "@heroui/react";
import type { AdminInvite } from "@captureflow/admin";
import { revokeInviteAction } from "../actions";
import { ActionButton } from "../_form";
import { formatDate } from "../_ui";

export function InviteRow({ invite }: { invite: AdminInvite }) {
  return (
    <Table.Row>
      <Table.Cell className="font-medium">{invite.email}</Table.Cell>
      <Table.Cell className="text-fg-muted">{invite.role}</Table.Cell>
      <Table.Cell className="text-fg-muted">{invite.invitedBy}</Table.Cell>
      <Table.Cell className="tabular-nums whitespace-nowrap">
        {formatDate(invite.expiresAt)}
      </Table.Cell>
      <Table.Cell>
        <div className="flex justify-end">
          <ActionButton
            action={revokeInviteAction}
            label="Revoke"
            variant="danger-soft"
          >
            <input type="hidden" name="tokenHash" value={invite.tokenHash} />
            <input type="hidden" name="email" value={invite.email} />
          </ActionButton>
        </div>
      </Table.Cell>
    </Table.Row>
  );
}

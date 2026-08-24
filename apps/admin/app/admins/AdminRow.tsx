"use client";

import { Table } from "@heroui/react";
import { ADMIN_ROLES, type AdminAccount } from "@captureflow/admin";
import {
  changeRoleAction,
  removeAdminAction,
  setStatusAction,
} from "../actions";
import { ActionButton } from "../_form";
import { RoleSelect } from "../_select";
import { formatDate } from "../_ui";

export function AdminRow({
  admin,
  isSelf,
}: {
  admin: AdminAccount;
  isSelf: boolean;
}) {
  return (
    <Table.Row>
      <Table.Cell>
        <div className="font-medium">{admin.email}</div>
        <div className="text-fg-subtle text-xs">
          {isSelf ? "You" : admin.status}
          {" · joined "}
          {formatDate(admin.createdAt)}
        </div>
      </Table.Cell>
      <Table.Cell>
        {isSelf ? (
          <span className="text-fg-muted text-sm">{admin.role}</span>
        ) : (
          <ActionButton
            action={changeRoleAction}
            label="Save"
            busyLabel="Saving…"
          >
            <input type="hidden" name="adminId" value={admin.id} />
            <RoleSelect
              name="role"
              label={`Role for ${admin.email}`}
              defaultRole={admin.role}
              roles={ADMIN_ROLES}
            />
          </ActionButton>
        )}
      </Table.Cell>
      <Table.Cell className="tabular-nums whitespace-nowrap">
        {formatDate(admin.lastLoginAt)}
      </Table.Cell>
      <Table.Cell>
        {!isSelf && (
          <div className="flex justify-end gap-2">
            <ActionButton
              action={setStatusAction}
              label={admin.status === "active" ? "Disable" : "Enable"}
            >
              <input type="hidden" name="adminId" value={admin.id} />
              <input
                type="hidden"
                name="status"
                value={admin.status === "active" ? "disabled" : "active"}
              />
            </ActionButton>
            <ActionButton
              action={removeAdminAction}
              label="Remove"
              variant="danger-soft"
            >
              <input type="hidden" name="adminId" value={admin.id} />
            </ActionButton>
          </div>
        )}
      </Table.Cell>
    </Table.Row>
  );
}

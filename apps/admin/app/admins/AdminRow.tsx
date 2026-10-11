"use client";

import { useState, useTransition } from "react";
import { ListBox, Select, Table } from "@heroui/react";
import { ADMIN_ROLES, type AdminAccount } from "@captureflow/admin";
import {
  changeRoleAction,
  removeAdminAction,
  setStatusAction,
} from "../actions";
import { EMPTY } from "../_form";
import { RowMenu } from "../_row-menu";
import { Monogram, Tone, formatRelative } from "../_ui";

function RoleCell({ admin }: { admin: AdminAccount }) {
  const [role, setRole] = useState<string>(admin.role);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-2">
      <Select
        aria-label={`Role for ${admin.email}`}
        selectedKey={role}
        isDisabled={pending}
        onSelectionChange={(key) => {
          const next = String(key);
          const previous = role;
          setRole(next);
          setError(null);
          const data = new FormData();
          data.set("adminId", admin.id);
          data.set("role", next);
          start(async () => {
            const result = await changeRoleAction(EMPTY, data);
            if (result.error) {
              setRole(previous);
              setError(result.error);
            }
          });
        }}
        className="w-32"
      >
        <Select.Trigger className="capitalize">
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {ADMIN_ROLES.map((r) => (
              <ListBox.Item key={r} id={r} textValue={r} className="capitalize">
                {r}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
      {error && <span className="text-danger text-xs">{error}</span>}
    </div>
  );
}

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
        <div className="flex items-center gap-3">
          <Monogram name={admin.email} />
          <div className="min-w-0">
            <div className="text-fg-strong truncate font-medium">
              {admin.email}
            </div>
            {isSelf && <div className="text-fg-subtle text-xs">You</div>}
          </div>
        </div>
      </Table.Cell>
      <Table.Cell>
        {isSelf ? (
          <span className="text-fg-muted capitalize">{admin.role}</span>
        ) : (
          <RoleCell admin={admin} />
        )}
      </Table.Cell>
      <Table.Cell>
        <Tone color={admin.status === "active" ? "success" : "warning"}>
          {admin.status}
        </Tone>
      </Table.Cell>
      <Table.Cell className="text-fg-muted whitespace-nowrap">
        {formatRelative(admin.lastLoginAt)}
      </Table.Cell>
      <Table.Cell>
        {!isSelf && (
          <RowMenu
            label={`Actions for ${admin.email}`}
            actions={[
              {
                id: "status",
                label: admin.status === "active" ? "Disable" : "Enable",
                action: setStatusAction,
                fields: {
                  adminId: admin.id,
                  status: admin.status === "active" ? "disabled" : "active",
                },
              },
              {
                id: "remove",
                label: "Remove admin",
                danger: true,
                confirm: `Remove ${admin.email}? They lose access immediately.`,
                action: removeAdminAction,
                fields: { adminId: admin.id },
              },
            ]}
          />
        )}
      </Table.Cell>
    </Table.Row>
  );
}

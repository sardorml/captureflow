"use client";

import { useState, useTransition } from "react";
import { ADMIN_ROLES, type AdminAccount } from "@captureflow/admin";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
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
        value={role}
        disabled={pending}
        onValueChange={(next) => {
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
      >
        <SelectTrigger
          aria-label={`Role for ${admin.email}`}
          className="w-32 capitalize"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ADMIN_ROLES.map((r) => (
            <SelectItem key={r} value={r} className="capitalize">
              {r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <span className="text-destructive text-xs">{error}</span>}
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
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Monogram name={admin.email} />
          <div className="min-w-0">
            <div className="text-fg-strong truncate font-medium">
              {admin.email}
            </div>
            {isSelf && <div className="text-fg-subtle text-xs">You</div>}
          </div>
        </div>
      </TableCell>
      <TableCell>
        {isSelf ? (
          <span className="text-fg-muted capitalize">{admin.role}</span>
        ) : (
          <RoleCell admin={admin} />
        )}
      </TableCell>
      <TableCell>
        <Tone color={admin.status === "active" ? "success" : "warning"}>
          {admin.status}
        </Tone>
      </TableCell>
      <TableCell className="text-fg-muted whitespace-nowrap">
        {formatRelative(admin.lastLoginAt)}
      </TableCell>
      <TableCell>
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
      </TableCell>
    </TableRow>
  );
}

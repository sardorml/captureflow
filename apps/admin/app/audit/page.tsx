import { Table } from "@heroui/react";
import { listAudit } from "@captureflow/admin";
import { requirePermission } from "@/lib/guard";
import { getAdminEnv } from "@/lib/env";
import { DataTable, PageHeading, formatDate } from "../_ui";

export default async function AuditPage() {
  await requirePermission("audit.read");
  const env = await getAdminEnv();
  const audit = env?.DB ? await listAudit(env.DB, 200) : [];
  return (
    <div className="flex flex-col gap-5">
      <PageHeading title="Audit log">
        Every admin mutation, newest first. Append-only.
      </PageHeading>
      <DataTable
        label="Audit log"
        columns={["When", "Actor", "Action", "Target", "Detail"]}
      >
        {audit.map((a) => (
          <Table.Row key={a.id}>
            <Table.Cell className="tabular-nums whitespace-nowrap">
              {formatDate(a.createdAt)}
            </Table.Cell>
            <Table.Cell className="text-fg-muted">{a.actor}</Table.Cell>
            <Table.Cell className="font-medium">{a.action}</Table.Cell>
            <Table.Cell className="text-fg-muted">
              {a.targetType}/{a.targetId}
            </Table.Cell>
            <Table.Cell className="text-fg-subtle max-w-xs truncate">
              {a.detail ?? "—"}
            </Table.Cell>
          </Table.Row>
        ))}
      </DataTable>
    </div>
  );
}

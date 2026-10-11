import { Table } from "@heroui/react";
import { listAudit } from "@captureflow/admin";
import { requirePermission } from "@/lib/guard";
import { getAdminEnv } from "@/lib/env";
import {
  DataTable,
  Empty,
  PageHeader,
  Tone,
  formatDate,
  formatRelative,
} from "../_ui";

export default async function AuditPage() {
  await requirePermission("audit.read");
  const env = await getAdminEnv();
  const audit = env?.DB ? await listAudit(env.DB, 200) : [];
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Audit log"
        description="Every admin change, newest first. Entries can't be edited or removed."
      />
      {audit.length === 0 ? (
        <Empty title="Nothing logged yet">
          Every change made from this panel is recorded here.
        </Empty>
      ) : (
        <DataTable
          label="Audit log"
          columns={["Action", "Target", "Detail", "By", "When"]}
        >
          {audit.map((a) => (
            <Table.Row key={a.id}>
              <Table.Cell>
                <Tone color="default">{a.action}</Tone>
              </Table.Cell>
              <Table.Cell className="text-fg-muted max-w-xs truncate">
                {a.targetType}/{a.targetId}
              </Table.Cell>
              <Table.Cell className="text-fg-subtle max-w-xs truncate">
                {a.detail ?? "—"}
              </Table.Cell>
              <Table.Cell className="text-fg-muted">{a.actor}</Table.Cell>
              <Table.Cell className="text-fg-muted whitespace-nowrap">
                <span title={formatDate(a.createdAt)}>
                  {formatRelative(a.createdAt)}
                </span>
              </Table.Cell>
            </Table.Row>
          ))}
        </DataTable>
      )}
    </div>
  );
}

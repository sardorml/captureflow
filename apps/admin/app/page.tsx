import NextLink from "next/link";
import { Table } from "@heroui/react";
import { getAdminTotals, listAudit } from "@captureflow/admin";
import { requirePermission } from "@/lib/guard";
import { getAdminEnv } from "@/lib/env";
import {
  DataTable,
  Notice,
  SectionHeading,
  Stat,
  formatBytes,
  formatDate,
} from "./_ui";

export default async function OverviewPage() {
  await requirePermission("users.read");
  const env = await getAdminEnv();
  if (!env?.DB) return <Notice tone="error">No database binding.</Notice>;

  const [totals, audit] = await Promise.all([
    getAdminTotals(env.DB),
    listAudit(env.DB, 8),
  ]);
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Users" value={totals.users.toLocaleString()} />
        <Stat label="Recordings" value={totals.recordings.toLocaleString()} />
        <Stat label="Screenshots" value={totals.screenshots.toLocaleString()} />
        <Stat label="Stored" value={formatBytes(totals.storageBytes)} />
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <SectionHeading title="Recent admin actions" />
          <NextLink
            href="/audit"
            className="text-fg-muted hover:text-fg text-sm transition-colors motion-reduce:transition-none"
          >
            View all
          </NextLink>
        </div>
        <DataTable
          label="Recent admin actions"
          columns={["When", "Actor", "Action", "Target"]}
        >
          {audit.map((a) => (
            <Table.Row key={a.id}>
              <Table.Cell className="tabular-nums">
                {formatDate(a.createdAt)}
              </Table.Cell>
              <Table.Cell className="text-fg-muted">{a.actor}</Table.Cell>
              <Table.Cell className="font-medium">{a.action}</Table.Cell>
              <Table.Cell className="text-fg-muted">
                {a.targetType}/{a.targetId}
              </Table.Cell>
            </Table.Row>
          ))}
        </DataTable>
      </section>
    </div>
  );
}

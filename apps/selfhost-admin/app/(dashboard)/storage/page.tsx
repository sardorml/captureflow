import Link from "next/link";
import { listAdminRecordings, listAdminUsers } from "@captureflow/admin";
import {
  getDiskUsage,
  getInstanceStorage,
  listStrandedRecordings,
  listWorkspaceStorage,
} from "@captureflow/selfhost/library";
import { formatAgo, formatBytes, plural } from "@/lib/format";
import { requireAdmin } from "@/lib/session";
import { DangerForm } from "@/app/_danger";
import { RecordingsTable } from "@/app/_recordings";
import {
  Badge,
  Card,
  Cell,
  Empty,
  PageHeader,
  Stat,
  Stats,
  Table,
} from "@/app/_ui";
import { cleanStrandedAction } from "@/app/actions";

export default async function StoragePage() {
  const { DB, DATA_DIR, APP_URL } = await requireAdmin();
  const [storage, disk, stranded, workspaces, people, largest] =
    await Promise.all([
      getInstanceStorage(DB),
      getDiskUsage(DATA_DIR),
      listStrandedRecordings(DB),
      listWorkspaceStorage(DB, 10),
      listAdminUsers(DB, {
        search: "",
        page: 1,
        plan: "all",
        sort: "storage",
        pageSize: 10,
      }),
      listAdminRecordings(DB, {
        search: "",
        page: 1,
        visibility: "all",
        sort: "storage",
        pageSize: 10,
      }),
    ]);
  const used = storage.recordings.bytes + storage.screenshots.bytes;
  const usedShare = disk.totalBytes > 0 ? disk.dataBytes / disk.totalBytes : 0;

  return (
    <>
      <PageHeader
        title="Storage"
        description={`Media lives on disk under ${DATA_DIR}. Deleting a recording frees its space right away.`}
      />

      <Stats>
        <Stat
          label="Recordings"
          value={formatBytes(storage.recordings.bytes)}
          hint={plural(storage.recordings.count, "recording")}
        />
        <Stat
          label="Screenshots"
          value={formatBytes(storage.screenshots.bytes)}
          hint={plural(storage.screenshots.count, "screenshot")}
        />
        <Stat
          label="Data on disk"
          value={formatBytes(disk.dataBytes)}
          hint="Media, database and uploads in progress"
        />
        <Stat
          label="Free on disk"
          value={formatBytes(disk.freeBytes)}
          hint={`of ${formatBytes(disk.totalBytes)}`}
        />
      </Stats>

      <div className="h-2 overflow-hidden rounded-full bg-tint">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.min(100, Math.round(usedShare * 100))}%` }}
          aria-label={`${Math.round(usedShare * 100)}% of the disk holds CaptureFlow data`}
        />
      </div>

      <Card
        title="Unfinished uploads"
        description="Failed uploads, and pending ones older than a day, keep their space until they're removed."
        action={
          stranded.length > 0 ? (
            <DangerForm
              action={cleanStrandedAction}
              fields={{}}
              label={`Remove all (${formatBytes(storage.stranded.bytes)})`}
              pendingLabel="Removing…"
              confirm={`Remove ${plural(stranded.length, "unfinished upload")}? They can't be recovered.`}
            />
          ) : undefined
        }
      >
        {stranded.length === 0 ? (
          <Empty>Nothing to clean up.</Empty>
        ) : (
          <Table head={["Title", "Owner", "State", "Size", "Started"]}>
            {stranded.map((r) => (
              <tr key={r.slug}>
                <Cell className="max-w-64 truncate font-medium text-fg-strong">
                  {r.title || "Untitled"}
                </Cell>
                <Cell className="max-w-48 truncate">{r.ownerEmail ?? "—"}</Cell>
                <Cell>
                  <Badge tone={r.state === "failed" ? "warn" : "muted"}>
                    {r.state === "failed" ? "Failed" : "Stalled"}
                  </Badge>
                </Cell>
                <Cell className="whitespace-nowrap">
                  {formatBytes(r.sizeBytes)}
                </Cell>
                <Cell className="text-right whitespace-nowrap">
                  {formatAgo(r.createdAt)}
                </Cell>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Card
        title="By workspace"
        description={`${formatBytes(used)} across every workspace; the ten that hold the most.`}
      >
        {workspaces.length === 0 ? (
          <Empty>No workspaces yet.</Empty>
        ) : (
          <Table head={["Workspace", "Owner", "Recordings", "Storage"]}>
            {workspaces.map((w) => (
              <tr key={w.id}>
                <Cell className="max-w-64">
                  <Link
                    href={`/workspaces/${w.id}`}
                    className="block truncate font-medium text-fg-strong underline-offset-4 hover:underline"
                  >
                    {w.name}
                  </Link>
                  <span className="text-xs text-fg-muted">
                    {w.kind === "team" ? "Team" : "Personal"}
                  </span>
                </Cell>
                <Cell className="max-w-48 truncate">{w.ownerEmail}</Cell>
                <Cell>
                  {w.recordingCount}
                  {w.screenshotCount > 0 && (
                    <span className="text-fg-muted">
                      {" "}
                      + {plural(w.screenshotCount, "screenshot")}
                    </span>
                  )}
                </Cell>
                <Cell className="text-right whitespace-nowrap">
                  {formatBytes(w.bytes)}
                </Cell>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Card title="By person" description="The ten people who hold the most.">
        {people.rows.length === 0 ? (
          <Empty>No one yet.</Empty>
        ) : (
          <Table head={["Name", "Recordings", "Storage"]}>
            {people.rows.map((u) => (
              <tr key={u.id}>
                <Cell className="max-w-64">
                  <Link
                    href={`/people/${u.id}`}
                    className="block truncate font-medium text-fg-strong underline-offset-4 hover:underline"
                  >
                    {u.name || u.email}
                  </Link>
                  <span className="block truncate text-xs text-fg-muted">
                    {u.email}
                  </span>
                </Cell>
                <Cell>{u.recordingCount}</Cell>
                <Cell className="text-right whitespace-nowrap">
                  {formatBytes(u.storageBytes)}
                </Cell>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Card
        title="Largest recordings"
        description="Deleting one of these frees the most."
      >
        <RecordingsTable
          rows={largest.rows}
          appUrl={APP_URL}
          show={{ owner: true, workspace: true }}
        />
      </Card>
    </>
  );
}

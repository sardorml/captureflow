import Link from "next/link";
import type { AdminRecordingRow } from "@captureflow/admin";
import { formatAgo, formatBytes, formatDuration } from "@/lib/format";
import { DangerForm } from "./_danger";
import { Actions, Badge, Cell, Empty, Table } from "./_ui";
import { deleteRecordingAction } from "./actions";

const STATE_LABEL: Record<string, string> = {
  pending: "Uploading",
  failed: "Failed",
};

export function RecordingsTable({
  rows,
  appUrl,
  show = {},
}: {
  rows: AdminRecordingRow[];
  appUrl: string;
  show?: { owner?: boolean; workspace?: boolean };
}) {
  if (rows.length === 0) return <Empty>No recordings yet.</Empty>;
  const head = [
    "Title",
    ...(show.owner ? ["Recorded by"] : []),
    ...(show.workspace ? ["Workspace"] : []),
    "Length",
    "Size",
    "Views",
    "Recorded",
    "",
  ];
  return (
    <Table head={head}>
      {rows.map((r) => (
        <tr key={r.slug}>
          <Cell className="max-w-64">
            <div className="flex items-center gap-2">
              <a
                href={`${appUrl}/r/${r.slug}`}
                target="_blank"
                rel="noreferrer"
                className="truncate font-medium text-fg-strong underline-offset-4 hover:underline"
              >
                {r.title || "Untitled"}
              </a>
              {STATE_LABEL[r.state] && (
                <Badge tone={r.state === "failed" ? "warn" : "muted"}>
                  {STATE_LABEL[r.state]}
                </Badge>
              )}
            </div>
          </Cell>
          {show.owner && (
            <Cell className="max-w-48 truncate">
              {r.owner ? (
                <Link
                  href={`/users/${r.owner.id}`}
                  className="underline-offset-4 hover:underline"
                >
                  {r.owner.name || r.owner.email}
                </Link>
              ) : (
                "—"
              )}
            </Cell>
          )}
          {show.workspace && (
            <Cell className="max-w-48 truncate">
              {r.workspace ? (
                <Link
                  href={`/workspaces/${r.workspace.id}`}
                  className="underline-offset-4 hover:underline"
                >
                  {r.workspace.name}
                </Link>
              ) : (
                "—"
              )}
            </Cell>
          )}
          <Cell className="whitespace-nowrap">
            {formatDuration(r.durationMs)}
          </Cell>
          <Cell className="whitespace-nowrap">{formatBytes(r.sizeBytes)}</Cell>
          <Cell>{r.viewCount}</Cell>
          <Cell className="whitespace-nowrap">{formatAgo(r.createdAt)}</Cell>
          <Actions>
            <DangerForm
              action={deleteRecordingAction}
              fields={{ slug: r.slug }}
              label="Delete"
              pendingLabel="Deleting…"
              confirm={`Delete "${r.title || "Untitled"}"? Its video and share link are gone for good.`}
              size="sm"
            />
          </Actions>
        </tr>
      ))}
    </Table>
  );
}

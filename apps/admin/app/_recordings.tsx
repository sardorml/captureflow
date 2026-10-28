import NextLink from "next/link";
import { Table } from "@heroui/react";
import { MessageSquare, Smile } from "lucide-react";
import type { AdminRecordingRow } from "@captureflow/admin";
import {
  DataTable,
  PersonCell,
  RecordingCell,
  Tone,
  formatBytes,
  formatClock,
  formatRelative,
} from "./_ui";

const STATE_COLOR = {
  pending: "warning",
  failed: "danger",
} as const;

const VISIBILITY_COLOR = {
  public: "accent",
  workspace: "default",
  private: "default",
} as const;

export function RecordingsTable({
  label,
  rows,
  appBaseUrl,
}: {
  label: string;
  rows: AdminRecordingRow[];
  appBaseUrl: string | undefined;
}) {
  return (
    <DataTable
      label={label}
      columns={[
        "Recording",
        "Owner",
        "Access",
        "Views",
        "Activity",
        "Length",
        "Created",
      ]}
    >
      {rows.map((r) => (
        <Table.Row key={r.slug}>
          <Table.Cell>
            <RecordingCell
              title={r.title}
              slug={r.slug}
              visibility={r.visibility}
              state={r.state}
              appBaseUrl={appBaseUrl}
              detail={
                r.workspace && (
                  <>
                    {" · "}
                    <NextLink
                      href={`/workspaces/${r.workspace.id}`}
                      className="hover:underline"
                    >
                      {r.workspace.name}
                    </NextLink>
                  </>
                )
              }
            />
          </Table.Cell>
          <Table.Cell>
            {r.owner ? (
              <PersonCell
                id={r.owner.id}
                name={r.owner.name}
                email={r.owner.email}
              />
            ) : (
              <span className="text-fg-subtle">—</span>
            )}
          </Table.Cell>
          <Table.Cell>
            <div className="flex items-center gap-1.5">
              <Tone
                color={
                  VISIBILITY_COLOR[
                    r.visibility as keyof typeof VISIBILITY_COLOR
                  ] ?? "default"
                }
              >
                {r.visibility}
              </Tone>
              {r.state !== "ready" && (
                <Tone
                  color={
                    STATE_COLOR[r.state as keyof typeof STATE_COLOR] ??
                    "default"
                  }
                >
                  {r.state}
                </Tone>
              )}
            </div>
          </Table.Cell>
          <Table.Cell className="whitespace-nowrap">
            <div className="text-fg-strong tabular-nums">
              {r.viewCount.toLocaleString()}
            </div>
            <div className="text-fg-subtle text-xs">
              {r.viewerCount === 1 ? "1 viewer" : `${r.viewerCount} viewers`}
              {r.lastViewedAt && ` · ${formatRelative(r.lastViewedAt)}`}
            </div>
          </Table.Cell>
          <Table.Cell className="text-fg-muted whitespace-nowrap tabular-nums">
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1" title="Comments">
                <MessageSquare size={14} aria-label="Comments" />
                {r.commentCount}
              </span>
              <span className="flex items-center gap-1" title="Reactions">
                <Smile size={14} aria-label="Reactions" />
                {r.reactionCount}
              </span>
            </span>
          </Table.Cell>
          <Table.Cell className="whitespace-nowrap">
            <div className="text-fg-strong tabular-nums">
              {formatClock(r.durationMs)}
            </div>
            <div className="text-fg-subtle text-xs tabular-nums">
              {formatBytes(r.sizeBytes)}
            </div>
          </Table.Cell>
          <Table.Cell className="text-fg-muted whitespace-nowrap">
            {formatRelative(r.createdAt)}
          </Table.Cell>
        </Table.Row>
      ))}
    </DataTable>
  );
}

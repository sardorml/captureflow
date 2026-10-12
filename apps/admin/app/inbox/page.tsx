import NextLink from "next/link";
import { Chip, Table } from "@heroui/react";
import { listContactRequests, type ContactKind } from "@captureflow/admin";
import { requirePermission } from "@/lib/guard";
import { getAdminEnv } from "@/lib/env";
import {
  DataTable,
  Empty,
  PageHeader,
  formatDate,
  formatRelative,
} from "../_ui";
import { LinkTabs } from "../_filters";

const KINDS: { id: ContactKind; label: string; empty: string }[] = [
  {
    id: "suggestion",
    label: "Suggestions",
    empty: "Ideas sent from captureflow.dev/suggest-feature show up here.",
  },
  {
    id: "setup",
    label: "Setup requests",
    empty: "Messages sent from captureflow.dev/self-host-setup show up here.",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    empty: "Messages sent from captureflow.dev/enterprise show up here.",
  },
];

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  await requirePermission("users.read");
  const params = await searchParams;
  const kind = KINDS.find((k) => k.id === params.kind) ?? KINDS[0];
  const env = await getAdminEnv();
  const rows = env?.DB ? await listContactRequests(env.DB, kind.id) : [];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Inbox"
        description="Messages sent from the public forms, newest first."
      />

      <div className="flex flex-col gap-4">
        <LinkTabs
          label="Form"
          selected={kind.id}
          items={KINDS.map((k) => ({
            id: k.id,
            label: k.label,
            href: `/inbox?kind=${k.id}`,
          }))}
        />

        {rows.length === 0 ? (
          <Empty title={`No ${kind.label.toLowerCase()} yet`}>
            {kind.empty}
          </Empty>
        ) : (
          <DataTable
            label={kind.label}
            columns={[
              kind.id === "suggestion" ? "Idea" : "Company",
              "Details",
              "From",
              "When",
            ]}
          >
            {rows.map((r) => (
              <Table.Row key={r.id}>
                <Table.Cell className="max-w-xl">
                  <div className="text-fg-strong font-medium">{r.subject}</div>
                  {r.body ? (
                    <p className="text-fg-muted mt-0.5 line-clamp-3 text-sm whitespace-pre-wrap">
                      {r.body}
                    </p>
                  ) : null}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(r.details)
                      .filter(([, value]) => value)
                      .map(([key, value]) => (
                        <Chip key={key} size="sm" variant="soft">
                          {value}
                        </Chip>
                      ))}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="text-fg">
                    {r.userId ? (
                      <NextLink
                        href={`/users/${r.userId}`}
                        className="hover:underline"
                      >
                        {r.name}
                      </NextLink>
                    ) : (
                      r.name
                    )}
                  </div>
                  <a
                    href={`mailto:${r.email}?subject=${encodeURIComponent(`Re: ${r.subject}`)}`}
                    className="text-fg-subtle text-xs hover:underline"
                  >
                    {r.email}
                  </a>
                </Table.Cell>
                <Table.Cell className="text-fg-muted whitespace-nowrap">
                  <span title={formatDate(r.createdAt)}>
                    {formatRelative(r.createdAt)}
                  </span>
                </Table.Cell>
              </Table.Row>
            ))}
          </DataTable>
        )}
      </div>
    </div>
  );
}

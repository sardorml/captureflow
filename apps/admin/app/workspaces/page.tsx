import NextLink from "next/link";
import { TableCell, TableRow } from "@/components/ui/table";
import { ADMIN_PAGE_SIZE, listAdminWorkspaces } from "@captureflow/admin";
import { requirePermission } from "@/lib/guard";
import { getAdminEnv } from "@/lib/env";
import {
  DataTable,
  Empty,
  Monogram,
  PageHeader,
  PersonCell,
  Tone,
  formatBytes,
  formatRelative,
  pageParam,
  queryString,
} from "../_ui";
import { FilterBar, LinkTabs, Pager } from "../_filters";

const KINDS = [
  { id: "all", label: "All" },
  { id: "team", label: "Team" },
  { id: "personal", label: "Personal" },
] as const;

export default async function WorkspacesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kind?: string; page?: string }>;
}) {
  await requirePermission("users.read");
  const params = await searchParams;
  const q = params.q ?? "";
  const kind = KINDS.find((k) => k.id === params.kind)?.id ?? "all";
  const page = pageParam(params.page);
  const env = await getAdminEnv();
  const { rows, total } = env?.DB
    ? await listAdminWorkspaces(env.DB, { search: q, page, kind })
    : { rows: [], total: 0 };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Workspaces" />

      <div className="flex flex-col gap-4">
        <LinkTabs
          label="Workspace kind"
          selected={kind}
          items={KINDS.map((k) => ({
            id: k.id,
            label: k.label,
            href: `/workspaces${queryString({ q, kind: k.id })}`,
          }))}
        />
        <FilterBar
          search={{ placeholder: "Search name, slug or owner…", value: q }}
        />

        {rows.length === 0 ? (
          <Empty title="No workspaces found">
            {q ? "Nothing matches this search." : "None of this kind yet."}
          </Empty>
        ) : (
          <DataTable
            label="Workspaces"
            columns={[
              "Workspace",
              "Kind",
              "Owner",
              "Members",
              "Recordings",
              "Stored",
              "Created",
            ]}
          >
            {rows.map((w) => (
              <TableRow key={w.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Monogram name={w.name} />
                    <NextLink
                      href={`/workspaces/${w.id}`}
                      className="text-fg-strong truncate font-medium hover:underline"
                    >
                      {w.name}
                    </NextLink>
                  </div>
                </TableCell>
                <TableCell>
                  <Tone color={w.kind === "team" ? "accent" : "default"}>
                    {w.kind}
                  </Tone>
                </TableCell>
                <TableCell>
                  <PersonCell
                    id={w.owner.id}
                    name={w.owner.name}
                    email={w.owner.email}
                  />
                </TableCell>
                <TableCell className="tabular-nums whitespace-nowrap">
                  {w.memberCount}
                  {w.pendingInvites ? (
                    <span className="text-fg-subtle">
                      {" "}
                      +{w.pendingInvites} invited
                    </span>
                  ) : null}
                </TableCell>
                <TableCell className="tabular-nums">
                  {w.recordingCount}
                </TableCell>
                <TableCell className="tabular-nums whitespace-nowrap">
                  {formatBytes(w.storageBytes)}
                </TableCell>
                <TableCell className="text-fg-muted whitespace-nowrap">
                  {formatRelative(w.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        )}

        <Pager page={page} total={total} pageSize={ADMIN_PAGE_SIZE} />
      </div>
    </div>
  );
}

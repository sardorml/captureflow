import NextLink from "next/link";
import { Button, Input, Table, TextField } from "@heroui/react";
import { ADMIN_PAGE_SIZE, listAdminWorkspaces } from "@captureflow/admin";
import { requirePermission } from "@/lib/guard";
import { getAdminEnv } from "@/lib/env";
import {
  DataTable,
  Initials,
  PageHeading,
  Pager,
  PersonCell,
  formatBytes,
  formatDate,
  pageParam,
  queryString,
} from "../_ui";
import { OptionSelect } from "../_select";

const KINDS = [
  { id: "all", label: "All kinds" },
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
    <div className="flex flex-col gap-6">
      <PageHeading title="Workspaces">
        Every workspace, who owns it, and what lives in it.
      </PageHeading>

      <form className="flex flex-wrap items-end gap-2" action="/workspaces">
        <TextField name="q" defaultValue={q} aria-label="Search workspaces">
          <Input placeholder="Search name, slug or owner" className="w-72" />
        </TextField>
        <OptionSelect
          name="kind"
          label="Kind"
          defaultValue={kind}
          options={KINDS}
        />
        <Button type="submit" variant="outline">
          Apply
        </Button>
      </form>

      <DataTable
        label="Workspaces"
        columns={[
          "Workspace",
          "Owner",
          "Members",
          "Recordings",
          "Screenshots",
          "Stored",
          "Created",
        ]}
      >
        {rows.map((w) => (
          <Table.Row key={w.id}>
            <Table.Cell>
              <div className="flex items-center gap-3">
                <Initials name={w.name} />
                <div className="min-w-0">
                  <NextLink
                    href={`/workspaces/${w.id}`}
                    className="font-medium hover:underline"
                  >
                    {w.name}
                  </NextLink>
                  <div className="text-fg-subtle text-xs">{w.kind}</div>
                </div>
              </div>
            </Table.Cell>
            <Table.Cell>
              <PersonCell
                id={w.owner.id}
                name={w.owner.name}
                email={w.owner.email}
              />
            </Table.Cell>
            <Table.Cell className="tabular-nums whitespace-nowrap">
              {w.memberCount}
              {w.pendingInvites ? ` (+${w.pendingInvites} invited)` : ""}
            </Table.Cell>
            <Table.Cell className="tabular-nums whitespace-nowrap">
              {w.recordingCount}
            </Table.Cell>
            <Table.Cell className="tabular-nums whitespace-nowrap">
              {w.screenshotCount}
            </Table.Cell>
            <Table.Cell className="tabular-nums whitespace-nowrap">
              {formatBytes(w.storageBytes)}
            </Table.Cell>
            <Table.Cell className="tabular-nums whitespace-nowrap">
              {formatDate(w.createdAt).slice(0, 10)}
            </Table.Cell>
          </Table.Row>
        ))}
      </DataTable>

      <Pager
        page={page}
        total={total}
        pageSize={ADMIN_PAGE_SIZE}
        hrefFor={(p) => `/workspaces${queryString({ q, kind, page: p })}`}
      />
    </div>
  );
}

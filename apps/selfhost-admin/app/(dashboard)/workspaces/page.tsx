import Link from "next/link";
import { ADMIN_PAGE_SIZE, listAdminWorkspaces } from "@captureflow/admin";
import { formatBytes, plural } from "@/lib/format";
import { requireAdmin } from "@/lib/session";
import { Filters } from "@/app/_filters";
import { Card, Cell, Empty, PageHeader, Pager, Table } from "@/app/_ui";
import { CreateWorkspaceForm } from "@/app/forms";

const KINDS = [
  { value: "team", label: "Teams" },
  { value: "personal", label: "Personal" },
  { value: "all", label: "All" },
] as const;

type Kind = (typeof KINDS)[number]["value"];

function one(v: string | string[] | undefined): string {
  return typeof v === "string" ? v : "";
}

export default async function WorkspacesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { DB } = await requireAdmin();
  const sp = await searchParams;
  const q = one(sp.q);
  const kind: Kind = KINDS.some((k) => k.value === one(sp.kind))
    ? (one(sp.kind) as Kind)
    : "team";
  const page = Math.max(1, Number(one(sp.page)) || 1);
  const { rows, total } = await listAdminWorkspaces(DB, {
    search: q,
    page,
    kind,
  });

  return (
    <>
      <PageHeader
        title="Workspaces"
        description="A workspace for each team. Everyone also has a personal one."
      />

      <Card
        title="New workspace"
        description="You become its owner; invite people from its page."
      >
        <CreateWorkspaceForm />
      </Card>

      <Card
        title={plural(total, "workspace")}
        action={
          <Filters
            search={q}
            placeholder="Name or owner"
            selects={[{ name: "kind", value: kind, options: [...KINDS] }]}
          />
        }
      >
        {rows.length === 0 ? (
          <Empty>No workspaces match.</Empty>
        ) : (
          <Table head={["Name", "Owner", "People", "Recordings", "Storage"]}>
            {rows.map((w) => (
              <tr key={w.id}>
                <Cell className="max-w-64">
                  <Link
                    href={`/workspaces/${w.id}`}
                    className="block truncate font-medium text-fg-strong underline-offset-4 hover:underline"
                  >
                    {w.name}
                  </Link>
                  {kind === "all" && (
                    <span className="text-xs text-fg-muted">
                      {w.kind === "team" ? "Team" : "Personal"}
                    </span>
                  )}
                </Cell>
                <Cell className="max-w-48 truncate">
                  {w.owner.name || w.owner.email}
                </Cell>
                <Cell>
                  {w.memberCount}
                  {w.pendingInvites > 0 && (
                    <span className="text-fg-muted">
                      {" "}
                      +{w.pendingInvites} invited
                    </span>
                  )}
                </Cell>
                <Cell>{w.recordingCount}</Cell>
                <Cell className="text-right whitespace-nowrap">
                  {formatBytes(w.storageBytes)}
                </Cell>
              </tr>
            ))}
          </Table>
        )}
        <Pager
          page={page}
          total={total}
          pageSize={ADMIN_PAGE_SIZE}
          params={{ q, kind }}
        />
      </Card>
    </>
  );
}

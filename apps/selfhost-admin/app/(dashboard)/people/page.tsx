import Link from "next/link";
import {
  ADMIN_PAGE_SIZE,
  listAdminUsers,
  type UserSort,
} from "@captureflow/admin";
import { listInstanceAdminIds } from "@captureflow/selfhost/instance";
import { formatAgo, formatBytes, formatDate, plural } from "@/lib/format";
import { requireAdmin } from "@/lib/session";
import { Filters } from "@/app/_filters";
import { Badge, Card, Cell, Empty, PageHeader, Pager, Table } from "@/app/_ui";

const SORTS: { value: UserSort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "active", label: "Recently active" },
  { value: "storage", label: "Most storage" },
];

function one(v: string | string[] | undefined): string {
  return typeof v === "string" ? v : "";
}

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { DB } = await requireAdmin();
  const sp = await searchParams;
  const q = one(sp.q);
  const sort = SORTS.some((s) => s.value === one(sp.sort))
    ? (one(sp.sort) as UserSort)
    : "newest";
  const page = Math.max(1, Number(one(sp.page)) || 1);
  const [{ rows, total }, adminIds] = await Promise.all([
    listAdminUsers(DB, { search: q, page, plan: "all", sort }),
    listInstanceAdminIds(DB),
  ]);
  const admins = new Set(adminIds);

  return (
    <>
      <PageHeader
        title="People"
        description="Everyone with an account here. Open someone to manage their access."
      />
      <Card
        title={plural(total, "person", "people")}
        action={
          <Filters
            search={q}
            placeholder="Name or email"
            selects={[{ name: "sort", value: sort, options: SORTS }]}
          />
        }
      >
        {rows.length === 0 ? (
          <Empty>No one matches.</Empty>
        ) : (
          <Table
            head={[
              "Name",
              "Joined",
              "Last active",
              "Workspaces",
              "Recordings",
              "Storage",
              "Access",
            ]}
          >
            {rows.map((u) => (
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
                <Cell className="whitespace-nowrap">
                  {formatDate(u.createdAt)}
                </Cell>
                <Cell className="whitespace-nowrap">
                  {formatAgo(u.lastActiveAt)}
                </Cell>
                <Cell>{u.workspaceCount}</Cell>
                <Cell>{u.recordingCount}</Cell>
                <Cell className="whitespace-nowrap">
                  {formatBytes(u.storageBytes)}
                </Cell>
                <Cell className="text-right">
                  {admins.has(u.id) ? (
                    <Badge>Admin</Badge>
                  ) : (
                    <span className="text-fg-muted">Member</span>
                  )}
                </Cell>
              </tr>
            ))}
          </Table>
        )}
        <Pager
          page={page}
          total={total}
          pageSize={ADMIN_PAGE_SIZE}
          params={{ q, sort }}
        />
      </Card>
    </>
  );
}

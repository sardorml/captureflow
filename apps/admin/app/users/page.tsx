import { Chip, Table } from "@heroui/react";
import {
  ADMIN_PAGE_SIZE,
  listAdminUsers,
  type PlanFilter,
  type UserSort,
} from "@captureflow/admin";
import { SEAT_PLAN } from "@captureflow/admin";
import { requirePermission } from "@/lib/guard";
import { getAdminEnv } from "@/lib/env";
import {
  DataTable,
  Empty,
  PageHeader,
  PersonCell,
  PlanChip,
  formatBytes,
  formatRelative,
  pageParam,
} from "../_ui";
import { FilterBar, Pager } from "../_filters";

const PLAN_FILTERS = [
  { id: "all", label: "All plans" },
  { id: "team", label: SEAT_PLAN.name },
  { id: "free", label: "Free" },
] as const;

const SORTS = [
  { id: "newest", label: "Newest first" },
  { id: "storage", label: "Most storage" },
  { id: "active", label: "Recently active" },
] as const;

function planFilter(raw: string | undefined): PlanFilter {
  return PLAN_FILTERS.find((f) => f.id === raw)?.id ?? "all";
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    plan?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  await requirePermission("users.read");
  const params = await searchParams;
  const q = params.q ?? "";
  const plan = planFilter(params.plan);
  const sort: UserSort =
    SORTS.find((s) => s.id === params.sort)?.id ?? "newest";
  const page = pageParam(params.page);
  const env = await getAdminEnv();
  const { rows, total } = env?.DB
    ? await listAdminUsers(env.DB, { search: q, page, plan, sort })
    : { rows: [], total: 0 };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Users" />

      <div className="flex flex-col gap-4">
        <FilterBar
          search={{ placeholder: "Search name or email…", value: q }}
          selects={[
            {
              param: "plan",
              label: "Plan",
              value: plan,
              options: [...PLAN_FILTERS],
            },
            {
              param: "sort",
              label: "Sort",
              value: sort,
              options: [...SORTS],
            },
          ]}
        />

        {rows.length === 0 ? (
          <Empty title="No users found">
            {q || plan !== "all"
              ? "Nothing matches these filters."
              : "Accounts appear here as soon as people sign up."}
          </Empty>
        ) : (
          <DataTable
            label="Users"
            columns={[
              "User",
              "Plan",
              "Recordings",
              "Screenshots",
              "Stored",
              "Last active",
              "Joined",
            ]}
          >
            {rows.map((u) => (
              <Table.Row key={u.id}>
                <Table.Cell>
                  <PersonCell
                    id={u.id}
                    name={u.name}
                    email={u.email}
                    badge={
                      u.emailVerified ? null : (
                        <Chip size="sm" variant="soft" color="warning">
                          Unverified
                        </Chip>
                      )
                    }
                  />
                </Table.Cell>
                <Table.Cell>
                  <PlanChip plan={u.plan} />
                </Table.Cell>
                <Table.Cell className="tabular-nums">
                  {u.recordingCount}
                </Table.Cell>
                <Table.Cell className="tabular-nums">
                  {u.screenshotCount}
                </Table.Cell>
                <Table.Cell className="tabular-nums whitespace-nowrap">
                  {formatBytes(u.storageBytes)}
                </Table.Cell>
                <Table.Cell className="text-fg-muted whitespace-nowrap">
                  {formatRelative(u.lastActiveAt)}
                </Table.Cell>
                <Table.Cell className="text-fg-muted whitespace-nowrap">
                  {formatRelative(u.createdAt)}
                </Table.Cell>
              </Table.Row>
            ))}
          </DataTable>
        )}

        <Pager page={page} total={total} pageSize={ADMIN_PAGE_SIZE} />
      </div>
    </div>
  );
}

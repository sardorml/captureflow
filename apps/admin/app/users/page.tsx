import { Button, Chip, Input, Table, TextField } from "@heroui/react";
import {
  ADMIN_PAGE_SIZE,
  listAdminUsers,
  type PlanFilter,
  type UserSort,
} from "@captureflow/admin";
import { requirePermission } from "@/lib/guard";
import { getAdminEnv } from "@/lib/env";
import {
  DataTable,
  PageHeading,
  Pager,
  PersonCell,
  PlanChip,
  formatBytes,
  formatDate,
  formatRelative,
  pageParam,
  queryString,
} from "../_ui";
import { OptionSelect } from "../_select";

const PLAN_FILTERS = [
  { id: "all", label: "All plans" },
  { id: "pro", label: "Pro (paid or granted)" },
  { id: "granted", label: "Granted" },
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
    <div className="flex flex-col gap-6">
      <PageHeading title="Users">
        Every product account, its plan, and the storage it is charged for.
      </PageHeading>

      {/* A GET form, so the filters stay in the URL and stay shareable —
          unlike a failure, which belongs in the page. */}
      <form className="flex flex-wrap items-end gap-2" action="/users">
        <TextField name="q" defaultValue={q} aria-label="Search users">
          <Input placeholder="Search name or email" className="w-72" />
        </TextField>
        <OptionSelect
          name="sort"
          label="Sort"
          defaultValue={sort}
          options={SORTS}
          className="min-w-[170px]"
        />
        <OptionSelect
          name="plan"
          label="Plan"
          defaultValue={plan}
          options={PLAN_FILTERS}
          className="min-w-[190px]"
        />
        <Button type="submit" variant="outline">
          Apply
        </Button>
      </form>

      <DataTable
        label="Users"
        columns={[
          "User",
          "Plan",
          "Workspaces",
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
                    <Chip size="sm" variant="secondary">
                      unverified
                    </Chip>
                  )
                }
              />
            </Table.Cell>
            <Table.Cell>
              <PlanChip plan={u.plan} />
            </Table.Cell>
            <Table.Cell className="tabular-nums whitespace-nowrap">
              {u.workspaceCount}
            </Table.Cell>
            <Table.Cell className="tabular-nums whitespace-nowrap">
              {u.recordingCount}
            </Table.Cell>
            <Table.Cell className="tabular-nums whitespace-nowrap">
              {u.screenshotCount}
            </Table.Cell>
            <Table.Cell className="tabular-nums whitespace-nowrap">
              {formatBytes(u.storageBytes)}
            </Table.Cell>
            <Table.Cell className="tabular-nums whitespace-nowrap">
              {formatRelative(u.lastActiveAt)}
            </Table.Cell>
            <Table.Cell className="tabular-nums whitespace-nowrap">
              {formatDate(u.createdAt).slice(0, 10)}
            </Table.Cell>
          </Table.Row>
        ))}
      </DataTable>

      <Pager
        page={page}
        total={total}
        pageSize={ADMIN_PAGE_SIZE}
        hrefFor={(p) =>
          `/users${queryString({
            q,
            plan,
            sort: sort === "newest" ? undefined : sort,
            page: p,
          })}`
        }
      />
    </div>
  );
}

import {
  ADMIN_PAGE_SIZE,
  listAdminRecordings,
  type RecordingSort,
  type RecordingVisibilityFilter,
} from "@captureflow/admin";
import { requirePermission } from "@/lib/guard";
import { getAdminEnv } from "@/lib/env";
import { Empty, PageHeader, pageParam } from "../_ui";
import { FilterBar, Pager } from "../_filters";
import { RecordingsTable } from "../_recordings";

const VISIBILITY_FILTERS = [
  { id: "all", label: "Any access" },
  { id: "public", label: "Public" },
  { id: "workspace", label: "Workspace" },
  { id: "private", label: "Private" },
] as const;

const SORTS = [
  { id: "newest", label: "Newest first" },
  { id: "views", label: "Most viewed" },
  { id: "storage", label: "Largest" },
] as const;

export default async function RecordingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    access?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  await requirePermission("users.read");
  const params = await searchParams;
  const q = params.q ?? "";
  const visibility: RecordingVisibilityFilter =
    VISIBILITY_FILTERS.find((f) => f.id === params.access)?.id ?? "all";
  const sort: RecordingSort =
    SORTS.find((s) => s.id === params.sort)?.id ?? "newest";
  const page = pageParam(params.page);
  const env = await getAdminEnv();
  const { rows, total } = env?.DB
    ? await listAdminRecordings(env.DB, { search: q, page, visibility, sort })
    : { rows: [], total: 0 };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Recordings"
        description={`${total.toLocaleString()} recording${total === 1 ? "" : "s"}`}
      />

      <div className="flex flex-col gap-4">
        <FilterBar
          search={{
            placeholder: "Search title, owner or workspace…",
            value: q,
          }}
          selects={[
            {
              param: "access",
              label: "Access",
              value: visibility,
              options: [...VISIBILITY_FILTERS],
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
          <Empty title="No recordings found">
            {q || visibility !== "all"
              ? "Nothing matches these filters."
              : "Recordings appear here as soon as someone records."}
          </Empty>
        ) : (
          <RecordingsTable
            label="Recordings"
            rows={rows}
            appBaseUrl={env?.APP_BASE_URL}
          />
        )}

        <Pager page={page} total={total} pageSize={ADMIN_PAGE_SIZE} />
      </div>
    </div>
  );
}

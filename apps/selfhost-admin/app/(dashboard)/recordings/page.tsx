import {
  ADMIN_PAGE_SIZE,
  listAdminRecordings,
  type RecordingSort,
  type RecordingVisibilityFilter,
} from "@captureflow/admin";
import { plural } from "@/lib/format";
import { requireAdmin } from "@/lib/session";
import { Filters } from "@/app/_filters";
import { RecordingsTable } from "@/app/_recordings";
import { Card, PageHeader, Pager } from "@/app/_ui";

const SORTS: { value: RecordingSort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "views", label: "Most viewed" },
  { value: "storage", label: "Largest" },
];

const VISIBILITIES: { value: RecordingVisibilityFilter; label: string }[] = [
  { value: "all", label: "Any visibility" },
  { value: "public", label: "Anyone with the link" },
  { value: "workspace", label: "Workspace only" },
  { value: "private", label: "Private" },
];

function one(v: string | string[] | undefined): string {
  return typeof v === "string" ? v : "";
}

export default async function RecordingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { DB, APP_URL } = await requireAdmin();
  const sp = await searchParams;
  const q = one(sp.q);
  const sort = SORTS.some((s) => s.value === one(sp.sort))
    ? (one(sp.sort) as RecordingSort)
    : "newest";
  const visibility = VISIBILITIES.some((v) => v.value === one(sp.visibility))
    ? (one(sp.visibility) as RecordingVisibilityFilter)
    : "all";
  const page = Math.max(1, Number(one(sp.page)) || 1);
  const { rows, total } = await listAdminRecordings(DB, {
    search: q,
    page,
    visibility,
    sort,
  });

  return (
    <>
      <PageHeader
        title="Recordings"
        description="Every recording on this CaptureFlow, whoever made it."
      />
      <Card
        title={plural(total, "recording")}
        action={
          <Filters
            search={q}
            placeholder="Title, person or workspace"
            selects={[
              { name: "visibility", value: visibility, options: VISIBILITIES },
              { name: "sort", value: sort, options: SORTS },
            ]}
          />
        }
      >
        <RecordingsTable
          rows={rows}
          appUrl={APP_URL}
          show={{ owner: true, workspace: true }}
        />
        <Pager
          page={page}
          total={total}
          pageSize={ADMIN_PAGE_SIZE}
          params={{ q, sort, visibility }}
        />
      </Card>
    </>
  );
}

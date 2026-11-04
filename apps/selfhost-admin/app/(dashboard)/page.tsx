import Link from "next/link";
import { getAdminTotals, listAdminRecordings } from "@captureflow/admin";
import { getInstanceSignupState } from "@captureflow/selfhost/instance";
import {
  getDiskUsage,
  getInstanceStorage,
} from "@captureflow/selfhost/library";
import { formatBytes, plural } from "@/lib/format";
import { requireAdmin } from "@/lib/session";
import { RecordingsTable } from "@/app/_recordings";
import { Alert, Card, PageHeader, Stat, Stats } from "@/app/_ui";

export default async function OverviewPage() {
  const { DB, DATA_DIR, APP_URL } = await requireAdmin();
  const [totals, storage, disk, setup, recent] = await Promise.all([
    getAdminTotals(DB),
    getInstanceStorage(DB),
    getDiskUsage(DATA_DIR),
    getInstanceSignupState(DB),
    listAdminRecordings(DB, {
      search: "",
      page: 1,
      visibility: "all",
      pageSize: 8,
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Overview"
        description="Everything on this CaptureFlow, at a glance."
      />

      {!setup.setupCompleted && (
        <Alert>
          Setup isn&rsquo;t finished.{" "}
          <Link
            href="/setup"
            className="font-medium underline underline-offset-4"
          >
            Pick up where you left off
          </Link>
          .
        </Alert>
      )}

      {storage.stranded.count > 0 && (
        <Alert>
          {plural(storage.stranded.count, "upload")} never finished and still
          take {formatBytes(storage.stranded.bytes)}.{" "}
          <Link
            href="/storage"
            className="font-medium underline underline-offset-4"
          >
            Clean up
          </Link>
          .
        </Alert>
      )}

      <Stats>
        <Stat label="People" value={totals.users} href="/people" />
        <Stat
          label="Workspaces"
          value={totals.workspaces}
          hint={`${plural(totals.teamWorkspaces, "team")}, the rest personal`}
          href="/workspaces"
        />
        <Stat
          label="Recordings"
          value={totals.recordings}
          hint={`${plural(totals.screenshots, "screenshot")} too`}
          href="/recordings"
        />
        <Stat
          label="Storage used"
          value={formatBytes(totals.storageBytes)}
          hint={`${formatBytes(disk.freeBytes)} free on disk`}
          href="/storage"
        />
      </Stats>

      <Card
        title="Recent recordings"
        action={
          <Link
            href="/recordings"
            className="text-sm text-fg-muted underline-offset-4 hover:underline"
          >
            All recordings
          </Link>
        }
      >
        <RecordingsTable
          rows={recent.rows}
          appUrl={APP_URL}
          show={{ owner: true, workspace: true }}
        />
      </Card>
    </>
  );
}

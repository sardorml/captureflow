import { Suspense } from "react";
import Link from "next/link";
import { getAdminTotals, listAdminRecordings } from "@captureflow/admin";
import { getInstanceSignupState } from "@captureflow/selfhost/instance";
import {
  getDiskUsage,
  getInstanceStorage,
} from "@captureflow/selfhost/library";
import { getEnv } from "@/lib/env";
import { formatBytes, plural } from "@/lib/format";
import { requireAdmin } from "@/lib/session";
import { RecordingsTable } from "@/app/_recordings";
import {
  Alert,
  Card,
  EmailSetupLink,
  Empty,
  PageHeader,
  Stat,
  Stats,
} from "@/app/_ui";

// The gate runs first; each section below then streams in on its own, so the
// directory walk behind the free-space figure holds nothing else up.
export default async function OverviewPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader
        title="Overview"
        description="Everything on this CaptureFlow, at a glance."
      />

      <Suspense fallback={null}>
        <Notices />
      </Suspense>

      <Suspense fallback={<StatsSkeleton />}>
        <Totals />
      </Suspense>

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
        <Suspense fallback={<Empty>Loading recordings…</Empty>}>
          <RecentRecordings />
        </Suspense>
      </Card>
    </>
  );
}

async function Notices() {
  const { DB, MAIL_CONFIGURED } = getEnv();
  const [setup, storage] = await Promise.all([
    getInstanceSignupState(DB),
    getInstanceStorage(DB),
  ]);
  return (
    <>
      {!MAIL_CONFIGURED && (
        <Alert tone="warn">
          Email isn&rsquo;t set up, so nobody is emailed their invite or
          password link. <EmailSetupLink />.
        </Alert>
      )}
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
    </>
  );
}

async function Totals() {
  const totals = await getAdminTotals(getEnv().DB);
  return (
    <Stats>
      <Stat label="Users" value={totals.users} href="/users" />
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
        hint={
          <Suspense fallback="Checking free space…">
            <DiskFree />
          </Suspense>
        }
        href="/storage"
      />
    </Stats>
  );
}

async function DiskFree() {
  const disk = await getDiskUsage(getEnv().DATA_DIR);
  return <>{formatBytes(disk.freeBytes)} free on disk</>;
}

function StatsSkeleton() {
  return (
    <Stats>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-24 rounded-2xl bg-panel ring-1 ring-line motion-safe:animate-pulse"
        />
      ))}
    </Stats>
  );
}

async function RecentRecordings() {
  const { DB, APP_URL } = getEnv();
  const recent = await listAdminRecordings(DB, {
    search: "",
    page: 1,
    visibility: "all",
    pageSize: 8,
  });
  return (
    <RecordingsTable
      rows={recent.rows}
      appUrl={APP_URL}
      show={{ owner: true, workspace: true }}
    />
  );
}

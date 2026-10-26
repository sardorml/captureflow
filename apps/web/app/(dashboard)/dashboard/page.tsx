import type { ReactNode } from "react";
import Link from "next/link";
import { preconnect } from "react-dom";
import { ArrowRight, PenLine } from "lucide-react";
import { ProgressBar, buttonVariants } from "@heroui/react";
import {
  totalStorageForUser,
  UNLIMITED_STORAGE_BYTES,
} from "@captureflow/quota";
import { SplitLoaded } from "@/components/dev/split-loaded";
import { getAppWebEnv } from "@/lib/cf-env";
import { resolveCurrentWorkspace } from "@/lib/current-workspace";
import {
  DAY_MS,
  countSince,
  dayOf,
  formatRecordedTime,
} from "@/lib/dashboard-metrics";
import {
  loadDashboardActivity,
  loadDashboardTotals,
} from "@/lib/dashboard-metrics-db";
import { formatBytes } from "@/lib/format";
import { viewerMediaUrl } from "@/lib/recording/media-url";
import {
  listRecordingsForWorkspace,
  type DashboardRecordingRow,
} from "@/lib/recordings-db";
import { requireSession } from "@/lib/session-guard";
import {
  CHROME_WEBSTORE_URL,
  DOWNLOAD_URL,
  R2_PUBLIC_BASE_URL,
} from "@/lib/site";
import { storageFill, type StorageTone } from "@/lib/storage-fill";
import { getEffectiveStorageLimit } from "@/lib/user-quota";
import { RecordButton } from "../RecordButton";
import {
  RecentRecordingCard,
  type RecentRecording,
} from "./RecentRecordingCard";
import { StartCard } from "./StartCard";

export const dynamic = "force-dynamic";

const RECENT_COUNT = 6;
const WEEK_DAYS = 7;

const METER_COLOR: Record<StorageTone, "success" | "warning" | "danger"> = {
  ok: "success",
  near: "warning",
  full: "danger",
};

export default async function DashboardPage() {
  const session = await requireSession();
  const env = await getAppWebEnv();
  const userId = session.user.id;
  const current = await resolveCurrentWorkspace(
    userId,
    session.user.name ?? null,
  );
  const workspaceId = current.workspace.id;
  const now = Date.now();
  const since = (dayOf(now) - (WEEK_DAYS - 1)) * DAY_MS;
  const [activity, totals, usedBytes, limit, recentRows] = await Promise.all([
    loadDashboardActivity(workspaceId, userId, since),
    loadDashboardTotals(workspaceId, userId),
    env?.DB ? totalStorageForUser(env.DB, userId) : 0,
    getEffectiveStorageLimit(userId),
    listRecordingsForWorkspace(workspaceId, userId, {
      limit: RECENT_COUNT,
      offset: 0,
    }),
  ]);
  const recent = await Promise.all(recentRows.map(toRecent));
  if (recentRows.some((r) => r.visibility === "public")) {
    preconnect(env?.R2_PUBLIC_BASE_URL ?? R2_PUBLIC_BASE_URL);
  }

  const limitBytes = limit >= UNLIMITED_STORAGE_BYTES ? null : limit;
  const fill = storageFill(usedBytes, limitBytes);
  const thisWeek = countSince(activity.recordings, WEEK_DAYS, now);
  const viewersThisWeek = countSince(activity.viewers, WEEK_DAYS, now);
  const firstName = session.user.name?.trim().split(/\s+/)[0];

  return (
    <div className="flex flex-col gap-8">
      <SplitLoaded name="page" />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-fg-strong">
            {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
          </h1>
          <p className="mt-2 text-base text-fg-muted">
            {current.workspace.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/canvas"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "secondary" })}
          >
            <PenLine size={16} />
            Open the canvas
          </a>
          <div className="hidden md:block">
            <RecordButton label="New recording" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 divide-line overflow-hidden rounded-2xl bg-panel ring-1 ring-line-strong sm:grid-cols-4 sm:divide-x [&>*:nth-child(n+3)]:border-t [&>*:nth-child(n+3)]:border-line sm:[&>*:nth-child(n+3)]:border-t-0">
        <Stat
          label="Recordings"
          value={totals.recordings.toLocaleString()}
          hint={thisWeek > 0 ? `+${thisWeek} this week` : "None this week"}
          href="/recordings"
        />
        <Stat
          label="Views"
          value={totals.views.toLocaleString()}
          hint={
            viewersThisWeek > 0
              ? `${plural(viewersThisWeek, "new viewer")} this week`
              : "No new viewers this week"
          }
          href="/recordings?sort=views"
        />
        <Stat
          label="Recorded"
          value={formatRecordedTime(totals.recordedMs)}
          hint={plural(totals.screenshots, "screenshot")}
          href="/screenshots"
        />
        <Stat
          label="Storage"
          value={formatBytes(usedBytes)}
          hint={
            limitBytes === null ? "No limit" : `of ${formatBytes(limitBytes)}`
          }
          href="/storage"
        >
          {fill && (
            <ProgressBar
              value={Math.round(fill.ratio * 100)}
              color={METER_COLOR[fill.tone]}
              aria-label="Storage used"
              className="mt-2"
            >
              <ProgressBar.Track className="h-1 rounded-full bg-tint-strong">
                <ProgressBar.Fill className="rounded-full" />
              </ProgressBar.Track>
            </ProgressBar>
          )}
        </Stat>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-fg-strong">
            Recent recordings
          </h2>
          <Link
            href="/recordings"
            className="flex items-center gap-1 text-sm text-fg-muted transition-colors hover:text-fg"
          >
            All recordings
            <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
        {recent.length === 0 ? (
          <StartCard
            storeUrl={CHROME_WEBSTORE_URL}
            downloadUrl={DOWNLOAD_URL}
          />
        ) : (
          <div className="-m-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((r) => (
              <RecentRecordingCard key={r.slug} recording={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

async function toRecent(row: DashboardRecordingRow): Promise<RecentRecording> {
  const posterSource = row.posterThumbKey ?? row.posterKey;
  return {
    slug: row.slug,
    title: row.title,
    posterUrl: posterSource ? await viewerMediaUrl(row, posterSource) : null,
    posterBlur: row.posterBlur,
    width: row.width,
    height: row.height,
    durationMs: row.durationMs,
    viewCount: row.viewCount,
    createdAt: row.createdAt,
    ready: row.state === "ready",
  };
}

function plural(n: number, noun: string): string {
  return `${n.toLocaleString()} ${noun}${n === 1 ? "" : "s"}`;
}

function Stat({
  label,
  value,
  hint,
  href,
  children,
}: {
  label: string;
  value: string;
  hint: string;
  href: string;
  children?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex min-w-0 flex-col px-5 py-4 transition-colors hover:bg-tint"
    >
      <span className="text-sm text-fg-muted">{label}</span>
      <span className="mt-1 text-2xl font-semibold tracking-tight tabular-nums text-fg-strong">
        {value}
      </span>
      <span className="mt-0.5 text-xs text-fg-subtle">{hint}</span>
      {children}
    </Link>
  );
}

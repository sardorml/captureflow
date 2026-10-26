import type { ReactNode } from "react";
import Link from "next/link";
import { preconnect } from "react-dom";
import { ArrowRight, MessageSquare, PenLine } from "lucide-react";
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
  MAX_METRIC_RANGE,
  dayOf,
  daySeries,
  formatRecordedTime,
} from "@/lib/dashboard-metrics";
import {
  listRecentActivity,
  loadDashboardActivity,
  loadDashboardTotals,
  type ActivityItem,
} from "@/lib/dashboard-metrics-db";
import { formatBytes, formatRelativeShort } from "@/lib/format";
import { DEFAULT_LIST_FILTERS } from "@/lib/list-filters";
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
  viewUrlFor,
} from "@/lib/site";
import { storageFill, type StorageTone } from "@/lib/storage-fill";
import { getEffectiveStorageLimit } from "@/lib/user-quota";
import { RecordButton } from "../RecordButton";
import {
  RecentRecordingCard,
  RecordingPoster,
  recordingTitle,
  type RecentRecording,
} from "./RecentRecordingCard";
import { StartCard } from "./StartCard";
import { ViewersCard } from "./ViewersCard";

export const dynamic = "force-dynamic";

const RECENT_COUNT = 6;
const TOP_COUNT = 5;
const ACTIVITY_COUNT = 6;

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
  const since = (dayOf(now) - (MAX_METRIC_RANGE - 1)) * DAY_MS;
  const [activity, totals, usedBytes, limit, recentRows, topRows, latest] =
    await Promise.all([
      loadDashboardActivity(workspaceId, userId, since),
      loadDashboardTotals(workspaceId, userId),
      env?.DB ? totalStorageForUser(env.DB, userId) : 0,
      getEffectiveStorageLimit(userId),
      listRecordingsForWorkspace(workspaceId, userId, {
        limit: RECENT_COUNT,
        offset: 0,
      }),
      listRecordingsForWorkspace(
        workspaceId,
        userId,
        { limit: TOP_COUNT, offset: 0 },
        { ...DEFAULT_LIST_FILTERS, sort: "views" },
      ),
      listRecentActivity(workspaceId, userId, ACTIVITY_COUNT),
    ]);
  const [recent, top] = await Promise.all([
    Promise.all(recentRows.map(toRecent)),
    Promise.all(topRows.filter((r) => r.viewCount > 0).map(toRecent)),
  ]);
  if ([...recentRows, ...topRows].some((r) => r.visibility === "public")) {
    preconnect(env?.R2_PUBLIC_BASE_URL ?? R2_PUBLIC_BASE_URL);
  }

  const limitBytes = limit >= UNLIMITED_STORAGE_BYTES ? null : limit;
  const fill = storageFill(usedBytes, limitBytes);
  const thisWeek = daySeries(activity.recordings, 7, now).total;
  const viewersThisWeek = daySeries(activity.viewers, 7, now).total;
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
            {current.workspace.name} · {plural(totals.recordings, "recording")}{" "}
            · {plural(totals.views, "view")}
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
        />
        <Stat
          label="Views"
          value={totals.views.toLocaleString()}
          hint={
            viewersThisWeek > 0
              ? `${plural(viewersThisWeek, "new viewer")} this week`
              : "No new viewers this week"
          }
        />
        <Stat
          label="Recorded"
          value={formatRecordedTime(totals.recordedMs)}
          hint={plural(totals.screenshots, "screenshot")}
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

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="flex flex-col gap-4 lg:col-span-2">
          <SectionHeading
            title="Recent recordings"
            link={{ href: "/recordings", label: "All recordings" }}
          />
          {recent.length === 0 ? (
            <StartCard
              storeUrl={CHROME_WEBSTORE_URL}
              downloadUrl={DOWNLOAD_URL}
            />
          ) : (
            <div className="-m-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {recent.map((r) => (
                <RecentRecordingCard key={r.slug} recording={r} />
              ))}
            </div>
          )}
        </section>

        <aside className="flex flex-col gap-6">
          <ViewersCard viewers={activity.viewers} now={now} />

          <section className="rounded-2xl bg-panel p-5 ring-1 ring-line-strong">
            <SectionHeading
              title="Most viewed"
              link={{ href: "/recordings?sort=views", label: "See all" }}
              small
            />
            {top.length === 0 ? (
              <p className="mt-3 text-sm text-fg-muted">
                Share a link and the recordings people open will show up here.
              </p>
            ) : (
              <ol className="mt-3 flex flex-col gap-3">
                {top.map((r, i) => (
                  <li key={r.slug}>
                    <a
                      href={viewUrlFor(r.slug)}
                      className="group flex items-center gap-3"
                    >
                      <span className="w-4 text-xs tabular-nums text-fg-subtle">
                        {i + 1}
                      </span>
                      <RecordingPoster
                        recording={r}
                        className="h-10 w-[72px] rounded-md"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-fg group-hover:text-fg-strong">
                          {recordingTitle(r.title)}
                        </span>
                        <span className="block text-xs text-fg-muted">
                          {plural(r.viewCount, "view")}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="rounded-2xl bg-panel p-5 ring-1 ring-line-strong">
            <SectionHeading title="Latest activity" small />
            {latest.length === 0 ? (
              <p className="mt-3 text-sm text-fg-muted">
                Comments and reactions on your recordings land here.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-3">
                {latest.map((item) => (
                  <ActivityRow key={item.id} item={item} />
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
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
  href?: string;
  children?: ReactNode;
}) {
  const body = (
    <>
      <span className="text-sm text-fg-muted">{label}</span>
      <span className="mt-1 text-2xl font-semibold tracking-tight tabular-nums text-fg-strong">
        {value}
      </span>
      <span className="mt-0.5 text-xs text-fg-subtle">{hint}</span>
      {children}
    </>
  );
  const className = "flex min-w-0 flex-col px-5 py-4";
  return href ? (
    <Link
      href={href}
      className={`${className} transition-colors hover:bg-tint`}
    >
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

function SectionHeading({
  title,
  link,
  small = false,
}: {
  title: string;
  link?: { href: string; label: string };
  small?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2
        className={
          small
            ? "text-sm font-medium text-fg-muted"
            : "text-lg font-semibold text-fg-strong"
        }
      >
        {title}
      </h2>
      {link && (
        <Link
          href={link.href}
          className="flex items-center gap-1 text-sm text-fg-muted transition-colors hover:text-fg"
        >
          {link.label}
          <ArrowRight size={14} aria-hidden />
        </Link>
      )}
    </div>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const who = item.userName?.trim() || "Someone";
  return (
    <li>
      <a href={viewUrlFor(item.slug)} className="group flex gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-tint text-sm">
          {item.kind === "reaction" ? (
            item.emoji
          ) : (
            <MessageSquare size={14} className="text-fg-muted" aria-hidden />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-fg">
            <span className="font-medium text-fg-strong">{who}</span>{" "}
            {item.kind === "reaction" ? "reacted to" : "commented on"}{" "}
            <span className="font-medium text-fg-strong">
              {recordingTitle(item.title)}
            </span>
          </span>
          {item.kind === "comment" && item.body && (
            <span className="mt-0.5 line-clamp-2 block text-sm text-fg-muted">
              {item.body}
            </span>
          )}
          <span className="mt-0.5 block text-xs text-fg-subtle">
            {formatRelativeShort(item.createdAt)}
          </span>
        </span>
      </a>
    </li>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";
import { preconnect } from "react-dom";
import { ArrowRight, PenLine, TrendingUp } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  can,
  getWorkspaceEntitlement,
  isSelfHosted,
  listMembers,
  type WorkspaceMember,
} from "@captureflow/quota";
import { SplitLoaded } from "@/components/dev/split-loaded";
import { getAppWebEnv } from "@/lib/cf-env";
import { resolveCurrentWorkspace } from "@/lib/current-workspace";
import {
  DAY_MS,
  countSince,
  dayOf,
  formatRecordedTime,
  lastDays,
} from "@/lib/dashboard-metrics";
import {
  loadDashboardActivity,
  loadDashboardTotals,
} from "@/lib/dashboard-metrics-db";
import { formatDuration } from "@/lib/format";
import { viewerMediaUrl } from "@/lib/recording/media-url";
import { countUserRecordingsInWorkspace } from "@/lib/recording/quota";
import {
  listRecordingsForWorkspace,
  type DashboardRecordingRow,
} from "@/lib/recordings-db";
import { requireSession } from "@/lib/session-guard";
import { CHROME_WEBSTORE_URL, R2_PUBLIC_BASE_URL } from "@/lib/site";
import { storageFill, type StorageTone } from "@/lib/storage-fill";
import { RecordButton } from "../RecordButton";
import {
  RecentRecordingCard,
  type RecentRecording,
} from "./RecentRecordingCard";
import { StartCard } from "./StartCard";

export const dynamic = "force-dynamic";

const RECENT_COUNT = 6;
const WEEK_DAYS = 7;

type Tone = "accent" | "warning" | "danger";

const METER_TONE: Record<StorageTone, Tone> = {
  ok: "accent",
  near: "warning",
  full: "danger",
};

const TONE_FILL: Record<Tone, string> = {
  accent: "fill-primary",
  warning: "fill-amber-500",
  danger: "fill-destructive",
};

const TONE_STROKE: Record<Tone, string> = {
  accent: "stroke-primary",
  warning: "stroke-amber-500",
  danger: "stroke-destructive",
};

const SPARK_HEIGHT = 24;
const RING_SIZE = 36;
const RING_STROKE = 3.5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

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
  // Free adds a fourth tile for this person's recording allowance.
  const [activity, totals, entitlement, recentRows, ownCount, members] =
    await Promise.all([
      loadDashboardActivity(workspaceId, userId, since),
      loadDashboardTotals(workspaceId, userId),
      env?.DB
        ? getWorkspaceEntitlement(env.DB, workspaceId, {
            selfHosted: isSelfHosted(env),
          })
        : null,
      listRecordingsForWorkspace(workspaceId, userId, {
        limit: RECENT_COUNT,
        offset: 0,
      }),
      countUserRecordingsInWorkspace(workspaceId, userId),
      env?.DB ? listMembers(env.DB, workspaceId) : [],
    ]);
  const authors = new Map(members.map((m) => [m.user_id, m]));
  const recent = await Promise.all(
    recentRows.map((row) => toRecent(row, authors.get(row.userId))),
  );
  if (recentRows.some((r) => r.visibility === "public")) {
    preconnect(env?.R2_PUBLIC_BASE_URL ?? R2_PUBLIC_BASE_URL);
  }

  const allowance = entitlement?.recordingsPerPerson ?? null;
  const allowanceFill =
    allowance === null ? null : storageFill(ownCount, allowance);
  const minutesEach = Math.round((entitlement?.maxRecordingMs ?? 0) / 60_000);
  const recordingsByDay = lastDays(activity.recordings, WEEK_DAYS, now);
  const viewersByDay = lastDays(activity.viewers, WEEK_DAYS, now);
  const thisWeek = countSince(activity.recordings, WEEK_DAYS, now);
  const viewersThisWeek = countSince(activity.viewers, WEEK_DAYS, now);
  const averageMs =
    totals.recordings > 0 ? totals.recordedMs / totals.recordings : 0;
  const firstName = session.user.name?.trim().split(/\s+/)[0];
  const canRecord = can(current.role, "record");

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
          {canRecord && (
            <div className="hidden md:block">
              <RecordButton label="New recording" />
            </div>
          )}
        </div>
      </header>

      <div
        className={`grid grid-cols-2 gap-3 ${allowanceFill ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
      >
        <Stat
          label="Recordings"
          value={totals.recordings.toLocaleString()}
          hint={thisWeek > 0 ? `+${thisWeek} this week` : "None this week"}
          up={thisWeek > 0}
          href="/recordings"
          aside={<Sparkline values={recordingsByDay} tone="accent" />}
        />
        <Stat
          label="Views"
          value={totals.views.toLocaleString()}
          hint={
            viewersThisWeek > 0
              ? `+${plural(viewersThisWeek, "viewer")} this week`
              : "No new viewers this week"
          }
          up={viewersThisWeek > 0}
          href="/recordings?sort=views"
          aside={<Sparkline values={viewersByDay} tone="accent" />}
        />
        <Stat
          label="Recorded"
          value={formatRecordedTime(totals.recordedMs)}
          hint={
            totals.recordings > 0
              ? `${formatDuration(averageMs)} per recording on average`
              : "Nothing recorded yet"
          }
          href="/recordings"
        />
        {allowance !== null && allowanceFill ? (
          <Stat
            label="Recordings left"
            value={`${Math.max(0, allowance - ownCount)} of ${allowance}`}
            hint={`Free plan, up to ${minutesEach} min each`}
            href={current.role === "owner" ? "/billing" : "/recordings"}
            aside={
              <Ring
                ratio={allowanceFill.ratio}
                tone={METER_TONE[allowanceFill.tone]}
              />
            }
          />
        ) : null}
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
        {recent.length === 0 && canRecord ? (
          <StartCard storeUrl={CHROME_WEBSTORE_URL} />
        ) : recent.length === 0 ? (
          <p className="text-sm text-fg-muted">
            Nothing has been shared in this workspace yet.
          </p>
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

async function toRecent(
  row: DashboardRecordingRow,
  author: WorkspaceMember | undefined,
): Promise<RecentRecording> {
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
    commentCount: row.commentCount,
    reactionCount: row.reactionCount,
    createdAt: row.createdAt,
    author: author
      ? { name: author.name?.trim() || author.email, image: author.image }
      : null,
    ready: row.state === "ready",
    aiGenerated: row.client === "agent",
  };
}

function plural(n: number, noun: string): string {
  return `${n.toLocaleString()} ${noun}${n === 1 ? "" : "s"}`;
}

function Stat({
  label,
  value,
  hint,
  up = false,
  href,
  aside,
}: {
  label: string;
  value: string;
  hint: string;
  up?: boolean;
  href: string;
  aside?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="min-w-0 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader>
          <CardDescription>{label}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {value}
          </CardTitle>
          {aside && <CardAction>{aside}</CardAction>}
        </CardHeader>
        <CardContent
          className={`flex items-center gap-1 text-xs ${up ? "text-accent-strong" : "text-muted-foreground"}`}
        >
          {up && <TrendingUp size={13} aria-hidden />}
          {hint}
        </CardContent>
      </Card>
    </Link>
  );
}

// The last week, one bar a day; a quiet day keeps a stub so the week reads.
function Sparkline({ values, tone }: { values: number[]; tone: Tone }) {
  const max = Math.max(1, ...values);
  const width = values.length * 9 - 3;
  return (
    <svg
      width={width}
      height={SPARK_HEIGHT}
      viewBox={`0 0 ${width} ${SPARK_HEIGHT}`}
      className="shrink-0"
      aria-hidden
    >
      {values.map((n, i) => {
        const h = n > 0 ? Math.max(3, (n / max) * SPARK_HEIGHT) : 3;
        return (
          <rect
            key={i}
            x={i * 9}
            y={SPARK_HEIGHT - h}
            width={6}
            height={h}
            rx={1.5}
            className={n > 0 ? TONE_FILL[tone] : "fill-line-strong"}
          />
        );
      })}
    </svg>
  );
}

function Ring({ ratio, tone }: { ratio: number; tone: Tone }) {
  const arc = Math.min(1, ratio > 0 ? Math.max(ratio, 0.03) : 0);
  return (
    <svg
      width={RING_SIZE}
      height={RING_SIZE}
      viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
      className="shrink-0 -rotate-90"
      aria-hidden
    >
      <circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RING_RADIUS}
        fill="none"
        strokeWidth={RING_STROKE}
        className="stroke-line-strong"
      />
      <circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RING_RADIUS}
        fill="none"
        strokeWidth={RING_STROKE}
        strokeLinecap="round"
        strokeDasharray={`${arc * RING_LENGTH} ${RING_LENGTH}`}
        opacity={arc > 0 ? 1 : 0}
        className={TONE_STROKE[tone]}
      />
    </svg>
  );
}

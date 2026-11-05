import type { ReactNode } from "react";
import Link from "next/link";
import { preconnect } from "react-dom";
import { ArrowRight, PenLine } from "lucide-react";
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
import { formatRecordedTime } from "@/lib/dashboard-metrics";
import { loadDashboardTotals } from "@/lib/dashboard-metrics-db";
import { formatDuration } from "@/lib/format";
import { getAppI18n } from "@/lib/i18n/app/server";
import { fmt, plural } from "@/lib/i18n/format";
import { formatNumber } from "@/lib/i18n/intl";
import { viewerMediaUrl } from "@/lib/recording/media-url";
import { countUserRecordingsInWorkspace } from "@/lib/recording/quota";
import {
  listRecordingsForWorkspace,
  type DashboardRecordingRow,
} from "@/lib/recordings-db";
import { requireSession } from "@/lib/session-guard";
import { CHROME_WEBSTORE_URL, R2_PUBLIC_BASE_URL } from "@/lib/site";
import { RecordButton } from "../RecordButton";
import {
  RecentRecordingCard,
  type RecentRecording,
} from "./RecentRecordingCard";
import { storageFill, type StorageTone } from "@/lib/storage-fill";
import { StartCard } from "./StartCard";

export const dynamic = "force-dynamic";

const RECENT_COUNT = 8;

type Tone = "accent" | "warning" | "danger";

const METER_TONE: Record<StorageTone, Tone> = {
  ok: "accent",
  near: "warning",
  full: "danger",
};

const TONE_STROKE: Record<Tone, string> = {
  accent: "stroke-primary",
  warning: "stroke-amber-500",
  danger: "stroke-destructive",
};

const RING_SIZE = 36;
const RING_STROKE = 3.5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

export default async function DashboardPage() {
  const session = await requireSession();
  const { messages, lang } = await getAppI18n();
  const copy = messages.library.dashboard;
  const env = await getAppWebEnv();
  const userId = session.user.id;
  const current = await resolveCurrentWorkspace(
    userId,
    session.user.name ?? null,
  );
  const workspaceId = current.workspace.id;
  // Free adds a fourth tile for this person's recording allowance.
  const [totals, entitlement, recentRows, ownCount, members] =
    await Promise.all([
      loadDashboardTotals(workspaceId, userId),
      env?.DB
        ? getWorkspaceEntitlement(env.DB, workspaceId, {
            selfHosted: isSelfHosted(env),
            userId,
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
  const averageMs =
    totals.recordings > 0 ? totals.recordedMs / totals.recordings : 0;
  const firstName = session.user.name?.trim().split(/\s+/)[0];
  const canRecord = can(current.role, "record");

  return (
    <div className="flex flex-col gap-6">
      <SplitLoaded name="page" />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg-strong">
            {firstName
              ? fmt(copy.welcomeName, { name: firstName })
              : copy.welcome}
          </h1>
          <p className="mt-1 text-sm text-fg-muted">{current.workspace.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/canvas"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "secondary" })}
          >
            <PenLine size={16} />
            {copy.openCanvas}
          </a>
          {canRecord && (
            <div className="hidden md:block">
              <RecordButton label={copy.newRecording} />
            </div>
          )}
        </div>
      </header>

      <div
        className={`grid grid-cols-2 gap-3 ${allowanceFill ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
      >
        <Stat
          label={copy.stats.recordings}
          value={formatNumber(totals.recordings, lang)}
          hint={
            totals.screenshots > 0
              ? fmt(
                  plural(copy.stats.plusScreenshots, totals.screenshots, lang),
                  { count: formatNumber(totals.screenshots, lang) },
                )
              : copy.stats.noScreenshots
          }
          href="/recordings"
        />
        <Stat
          label={copy.stats.views}
          value={formatNumber(totals.views, lang)}
          hint={
            totals.recordings > 0
              ? fmt(copy.stats.viewsAverage, {
                  count: formatNumber(totals.views / totals.recordings, lang, {
                    maximumFractionDigits: 1,
                  }),
                })
              : copy.stats.noViews
          }
          href="/recordings?sort=views"
        />
        <Stat
          label={copy.stats.recorded}
          value={formatRecordedTime(totals.recordedMs, copy.recordedTime)}
          hint={
            totals.recordings > 0
              ? fmt(copy.stats.recordedAverage, {
                  duration: formatDuration(averageMs),
                })
              : copy.stats.nothingRecorded
          }
          href="/recordings"
        />
        {allowance !== null && allowanceFill ? (
          <Stat
            label={copy.stats.recordingsLeft}
            value={fmt(copy.stats.leftOfAllowance, {
              left: Math.max(0, allowance - ownCount),
              allowance,
            })}
            hint={fmt(copy.stats.freePlanLimit, { minutes: minutesEach })}
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
            {copy.recent.title}
          </h2>
          <Link
            href="/recordings"
            className="flex items-center gap-1 text-sm text-fg-muted transition-colors hover:text-fg"
          >
            {copy.recent.all}
            <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
        {recent.length === 0 && canRecord ? (
          <StartCard storeUrl={CHROME_WEBSTORE_URL} />
        ) : recent.length === 0 ? (
          <p className="text-sm text-fg-muted">{copy.recent.empty}</p>
        ) : (
          <div className="-m-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-xl:[&>*:nth-child(n+7)]:hidden">
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

function Stat({
  label,
  value,
  hint,
  href,
  aside,
}: {
  label: string;
  value: string;
  hint?: string;
  href: string;
  aside?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="min-w-0 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card size="sm" className="h-full transition-colors hover:bg-muted/50">
        <CardHeader>
          <CardDescription>{label}</CardDescription>
          <CardTitle className="font-semibold tabular-nums group-data-[size=sm]/card:text-2xl">
            {value}
          </CardTitle>
          {aside && <CardAction>{aside}</CardAction>}
        </CardHeader>
        {hint && (
          <CardContent className="text-xs text-muted-foreground">
            {hint}
          </CardContent>
        )}
      </Card>
    </Link>
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

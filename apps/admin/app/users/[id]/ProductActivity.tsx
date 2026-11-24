import {
  AlertTriangle,
  Camera,
  CreditCard,
  ExternalLink,
  FileText,
  Flame,
  MousePointerClick,
  PlayCircle,
  Sparkles,
  UserRound,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";
import {
  type ActivityKind,
  type ActivitySession,
  type PostHogConfig,
  getUserProductActivity,
} from "@captureflow/admin";
import { cn } from "@/lib/utils";
import type { Hue } from "../../_dashboard";
import { Empty, Notice, Stat, StatGrid, formatRelative } from "../../_ui";
import { countryLabel, formatSeconds } from "../../analytics/_parts";

const KIND: Record<ActivityKind, [LucideIcon, Hue]> = {
  page: [FileText, "muted"],
  click: [MousePointerClick, "blue"],
  form: [MousePointerClick, "blue"],
  recording: [Video, "violet"],
  screenshot: [Camera, "violet"],
  account: [UserRound, "emerald"],
  workspace: [Users, "emerald"],
  billing: [CreditCard, "amber"],
  error: [AlertTriangle, "amber"],
  frustration: [Flame, "amber"],
  other: [Sparkles, "muted"],
};

const CHIP: Record<Hue, string> = {
  blue: "bg-primary/10 text-accent-strong",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  muted: "bg-muted text-muted-foreground",
};

const SESSIONS_SHOWN = 30;

const DAY = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "numeric",
});
const TIME = new Intl.DateTimeFormat("en", {
  hour: "numeric",
  minute: "2-digit",
});

function placeLabel(place: string | null): string | null {
  if (!place) return null;
  const parts = place.split(", ");
  const code = parts.pop() ?? "";
  return [...parts, countryLabel(code)].join(", ");
}

function sessionLength(s: ActivitySession): string {
  const seconds = (s.endedAt - s.startedAt) / 1000;
  return seconds < 1 ? "a moment" : formatSeconds(seconds);
}

export async function ProductActivity({
  config,
  email,
}: {
  config: PostHogConfig | null;
  email: string;
}) {
  if (!config) {
    return (
      <Notice>
        Product activity comes from PostHog. Set POSTHOG_API_HOST,
        POSTHOG_PROJECT_ID and POSTHOG_PERSONAL_API_KEY on the admin to see it.
      </Notice>
    );
  }
  let data;
  try {
    data = await getUserProductActivity(config, email);
  } catch (err) {
    console.error("[admin] user activity", err);
    return (
      <Notice tone="error">Couldn&apos;t load activity from PostHog.</Notice>
    );
  }
  if (data.sessions.length === 0) {
    return (
      <Empty title={`Nothing in the last ${data.days} days`}>
        PostHog has no activity for {email} in this period.
      </Empty>
    );
  }
  const now = Date.now();

  return (
    <div className="flex flex-col gap-6">
      <StatGrid columns={4}>
        <Stat
          label="Visits"
          value={data.totals.sessions.toLocaleString()}
          hint={`Last seen ${formatRelative(data.lastSeenAt, now)}`}
        />
        <Stat
          label="Time spent"
          value={formatSeconds(data.totals.seconds)}
          hint={`Across ${data.days} days`}
        />
        <Stat
          label="Pages viewed"
          value={data.totals.pages.toLocaleString()}
          hint={
            data.topPages.length
              ? `Mostly ${data.topPages
                  .slice(0, 3)
                  .map((p) => p.label)
                  .join(", ")}`
              : undefined
          }
        />
        <Stat
          label="Actions"
          value={data.totals.actions.toLocaleString()}
          hint={
            data.totals.errors
              ? `${data.totals.errors} errors or frustrated clicks`
              : "No errors"
          }
        />
      </StatGrid>

      {data.truncated && (
        <Notice>
          Showing the most recent events only; this person was very active.
        </Notice>
      )}

      <div className="flex flex-col gap-3">
        {data.sessions.slice(0, SESSIONS_SHOWN).map((s, i) => (
          <SessionCard key={s.id} session={s} isOpen={i === 0} now={now} />
        ))}
        {data.sessions.length > SESSIONS_SHOWN && (
          <p className="text-fg-subtle text-sm">
            {data.sessions.length - SESSIONS_SHOWN} older visits not shown.
          </p>
        )}
      </div>
    </div>
  );
}

function SessionCard({
  session: s,
  isOpen,
  now,
}: {
  session: ActivitySession;
  isOpen: boolean;
  now: number;
}) {
  const place = placeLabel(s.place);
  const headline = s.steps.find(
    (step) => step.kind !== "page" && step.kind !== "click",
  );
  return (
    <details
      open={isOpen}
      className="group bg-card rounded-xl border [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
        <span className="text-fg-strong font-medium">
          {DAY.format(s.startedAt)} · {TIME.format(s.startedAt)}
        </span>
        <span className="text-fg-muted text-sm">
          {sessionLength(s)} · {s.pageCount}{" "}
          {s.pageCount === 1 ? "page" : "pages"} · {s.steps.length}{" "}
          {s.steps.length === 1 ? "step" : "steps"}
        </span>
        {headline && (
          <span className="text-fg-muted truncate text-sm">
            — {headline.text}
            {headline.subject ? ` ${headline.subject}` : ""}
          </span>
        )}
        <span className="text-fg-subtle ml-auto flex items-center gap-3 text-xs">
          {s.device && <span>{s.device}</span>}
          {place && <span>{place}</span>}
          <span>{formatRelative(s.startedAt, now)}</span>
        </span>
      </summary>
      <div className="border-t px-4 py-4">
        {s.replayUrl && (
          <a
            href={s.replayUrl}
            target="_blank"
            rel="noreferrer"
            className="text-accent-strong mb-4 inline-flex items-center gap-1.5 text-sm hover:underline"
          >
            <PlayCircle size={15} aria-hidden />
            Watch this visit in PostHog
            <ExternalLink size={12} aria-hidden />
          </a>
        )}
        <ol className="flex flex-col">
          {s.steps.map((step, i) => {
            const [Icon, hue] = KIND[step.kind];
            return (
              <li key={step.id} className="relative flex gap-3 pb-3 last:pb-0">
                {i < s.steps.length - 1 && (
                  <span className="bg-line absolute top-7 bottom-0 left-[13px] w-px" />
                )}
                <span
                  className={cn(
                    "relative flex size-7 shrink-0 items-center justify-center rounded-full",
                    CHIP[hue],
                  )}
                >
                  <Icon size={13} aria-hidden />
                </span>
                <div className="flex min-w-0 flex-1 items-baseline gap-3 pt-1">
                  <p className="text-fg min-w-0 flex-1 truncate text-sm">
                    {step.text}
                    {step.subject && (
                      <span className="text-fg-strong font-medium">
                        {" "}
                        {step.subject}
                      </span>
                    )}
                    {step.count > 1 && (
                      <span className="text-fg-subtle"> ×{step.count}</span>
                    )}
                    {step.kind !== "page" && step.path && (
                      <span className="text-fg-subtle text-xs">
                        {" "}
                        on {step.path}
                      </span>
                    )}
                  </p>
                  <span className="text-fg-subtle shrink-0 text-xs tabular-nums">
                    {TIME.format(step.at)}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </details>
  );
}

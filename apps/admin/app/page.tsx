import NextLink from "next/link";
import {
  CreditCard,
  Eye,
  ShieldCheck,
  UserPlus,
  Users,
  Video,
} from "lucide-react";
import {
  getAdminTotals,
  getRecordingActivityByWeek,
  getRecordingTotals,
  getSignupsByWeek,
  listAdminRecordings,
  listAdminUsers,
  listAudit,
} from "@captureflow/admin";
import { requirePermission } from "@/lib/guard";
import { getAdminEnv } from "@/lib/env";
import {
  Empty,
  Monogram,
  Notice,
  PageHeader,
  formatBytes,
  formatDuration,
  formatRelative,
  shareUrl,
} from "./_ui";
import {
  Donut,
  Feed,
  GrowthChart,
  KpiCard,
  Meter,
  Panel,
  SplitBar,
  type FeedItem,
} from "./_dashboard";

const WEEKS = 12;
const WEEK_MS = 7 * 24 * 3600 * 1000;
const TOP = 6;
const FEED = 7;

function weekLabels(now: number): string[] {
  return Array.from({ length: WEEKS }, (_, i) =>
    new Date(now - (WEEKS - i) * WEEK_MS + 24 * 3600 * 1000).toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric", timeZone: "UTC" },
    ),
  );
}

function percent(value: number, total: number): string {
  return `${total ? Math.round((value / total) * 100) : 0}%`;
}

export default async function OverviewPage() {
  await requirePermission("users.read");
  const env = await getAdminEnv();
  if (!env?.DB) return <Notice tone="error">No database binding.</Notice>;

  const firstPage = { search: "", page: 1, pageSize: FEED };
  const [
    totals,
    recordingTotals,
    signups,
    activity,
    latest,
    mostViewed,
    newest,
    heaviest,
    audit,
  ] = await Promise.all([
    getAdminTotals(env.DB),
    getRecordingTotals(env.DB),
    getSignupsByWeek(env.DB, WEEKS),
    getRecordingActivityByWeek(env.DB, WEEKS),
    listAdminRecordings(env.DB, { ...firstPage, visibility: "all" }),
    listAdminRecordings(env.DB, {
      ...firstPage,
      pageSize: TOP,
      visibility: "all",
      sort: "views",
    }),
    listAdminUsers(env.DB, { ...firstPage, plan: "all" }),
    listAdminUsers(env.DB, {
      ...firstPage,
      pageSize: TOP,
      plan: "all",
      sort: "storage",
    }),
    listAudit(env.DB, FEED),
  ]);
  const now = Date.now();
  const free = totals.users - totals.teamUsers;
  const screenshotBytes = Math.max(
    0,
    totals.storageBytes - recordingTotals.recordingBytes,
  );
  const topViews = Math.max(1, ...mostViewed.rows.map((r) => r.viewCount));
  const topBytes = Math.max(1, ...heaviest.rows.map((u) => u.storageBytes));

  const feed: FeedItem[] = [
    ...newest.rows.map((u) => ({
      key: `user-${u.id}`,
      icon: <UserPlus size={15} aria-hidden />,
      hue: "blue" as const,
      at: u.createdAt,
      text: (
        <>
          <NextLink
            href={`/users/${u.id}`}
            className="text-fg-strong font-medium hover:underline"
          >
            {u.name || u.email}
          </NextLink>{" "}
          signed up
        </>
      ),
    })),
    ...latest.rows.map((r) => ({
      key: `rec-${r.slug}`,
      icon: <Video size={15} aria-hidden />,
      hue: "violet" as const,
      at: r.createdAt,
      text: (
        <>
          <span className="text-fg-strong font-medium">
            {r.owner?.name || r.owner?.email || "Someone"}
          </span>{" "}
          recorded{" "}
          <span className="text-fg-strong">
            {r.title || "an untitled recording"}
          </span>
        </>
      ),
    })),
    ...audit.map((a) => ({
      key: `audit-${a.id}`,
      icon: <ShieldCheck size={15} aria-hidden />,
      hue: "amber" as const,
      at: a.createdAt,
      text: (
        <>
          <span className="text-fg-strong font-medium">{a.actor}</span>{" "}
          {a.action.replaceAll("_", " ").replaceAll(".", " ")}
        </>
      ),
    })),
  ]
    .sort((a, b) => b.at - a.at)
    .slice(0, FEED);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Overview"
        description="How the instance is growing, what people watch, and where storage goes"
        actions={
          <span className="border-line text-fg-muted rounded-full border px-3 py-1 text-xs">
            Last {WEEKS} weeks
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={<Users size={18} aria-hidden />}
          hue="blue"
          label="Users"
          value={totals.users.toLocaleString()}
          href="/users"
          trend={signups}
          footnote={`${signups.at(-1) ?? 0} signed up this week`}
        />
        <KpiCard
          icon={<Video size={18} aria-hidden />}
          hue="violet"
          label="Recordings"
          value={totals.recordings.toLocaleString()}
          href="/recordings"
          trend={activity.recordings}
          footnote={`${formatDuration(recordingTotals.recordedMs)} recorded · ${recordingTotals.publicRecordings} public`}
        />
        <KpiCard
          icon={<Eye size={18} aria-hidden />}
          hue="emerald"
          label="Views"
          value={recordingTotals.views.toLocaleString()}
          href="/recordings?sort=views"
          trend={activity.viewers}
          footnote={`${recordingTotals.viewers.toLocaleString()} unique viewers`}
        />
        <KpiCard
          icon={<CreditCard size={18} aria-hidden />}
          hue="amber"
          label="Paid users"
          value={totals.teamUsers.toLocaleString()}
          href="/users?plan=team"
          footnote={`${percent(totals.teamUsers, totals.users)} of users · ${totals.paidWorkspaces} paid workspaces`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel
          title="Growth"
          description="New users, recordings and viewers each week"
          className="xl:col-span-2"
        >
          <GrowthChart
            labels={weekLabels(now)}
            series={[
              { label: "Sign-ups", hue: "blue", values: signups },
              {
                label: "Recordings",
                hue: "violet",
                values: activity.recordings,
              },
              {
                label: "New viewers",
                hue: "emerald",
                values: activity.viewers,
              },
            ]}
          />
        </Panel>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <Panel
            title="Plans"
            action={{ href: "/workspaces", label: "Workspaces" }}
          >
            <Donut
              center={totals.users.toLocaleString()}
              caption="users"
              parts={[
                { label: "Paid", value: totals.teamUsers, hue: "amber" },
                { label: "Free", value: free, hue: "muted" },
              ]}
            />
            <p className="text-fg-subtle border-line border-t pt-3 text-xs">
              {totals.workspaces.toLocaleString()} workspaces ·{" "}
              {totals.teamWorkspaces} team · {totals.paidWorkspaces} paid
            </p>
          </Panel>

          <Panel title="Storage">
            <p className="text-fg-strong -mt-2 text-[28px] leading-none font-semibold tracking-tight tabular-nums">
              {formatBytes(totals.storageBytes)}
            </p>
            <SplitBar
              parts={[
                {
                  label: `${totals.recordings.toLocaleString()} recordings`,
                  value: recordingTotals.recordingBytes,
                  display: formatBytes(recordingTotals.recordingBytes),
                  hue: "violet",
                },
                {
                  label: `${totals.screenshots.toLocaleString()} screenshots`,
                  value: screenshotBytes,
                  display: formatBytes(screenshotBytes),
                  hue: "blue",
                },
              ]}
            />
          </Panel>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel
          title="Most viewed"
          description="Recordings people watch the most"
          action={{ href: "/recordings?sort=views", label: "All recordings" }}
          className="xl:col-span-2"
        >
          {mostViewed.rows.length === 0 ? (
            <Empty title="No recordings yet" />
          ) : (
            <ol className="flex flex-col gap-4">
              {mostViewed.rows.map((r, i) => {
                const href =
                  r.visibility === "public" && r.state !== "failed"
                    ? shareUrl(env.APP_BASE_URL, r.slug)
                    : null;
                const title = r.title || "Untitled recording";
                return (
                  <li key={r.slug} className="flex items-center gap-4">
                    <span className="text-fg-subtle w-5 shrink-0 text-sm font-medium tabular-nums">
                      {i + 1}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <div className="min-w-0 truncate text-sm">
                          {href ? (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-fg-strong font-medium hover:underline"
                            >
                              {title}
                            </a>
                          ) : (
                            <span className="text-fg-strong font-medium">
                              {title}
                            </span>
                          )}
                          <span className="text-fg-subtle">
                            {" · "}
                            {r.owner?.name || r.owner?.email || "Unknown"}
                            {r.visibility !== "public" && ` · ${r.visibility}`}
                          </span>
                        </div>
                        <span className="text-fg-strong shrink-0 text-sm font-medium tabular-nums">
                          {r.viewCount.toLocaleString()}
                          <span className="text-fg-subtle font-normal">
                            {r.viewCount === 1 ? " view" : " views"}
                          </span>
                        </span>
                      </div>
                      <Meter ratio={r.viewCount / topViews} hue="emerald" />
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Panel>

        <Panel title="Activity" description="Latest across the instance">
          {feed.length === 0 ? (
            <Empty title="Nothing yet" />
          ) : (
            <Feed items={feed} formatTime={(ms) => formatRelative(ms, now)} />
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel
          title="Newest users"
          action={{ href: "/users", label: "All users" }}
        >
          <ul className="flex flex-col gap-3">
            {newest.rows.slice(0, TOP).map((u) => (
              <li key={u.id} className="flex items-center gap-3">
                <Monogram name={u.name || u.email} />
                <div className="min-w-0 flex-1">
                  <NextLink
                    href={`/users/${u.id}`}
                    className="text-fg-strong block truncate text-sm font-medium hover:underline"
                  >
                    {u.name || u.email}
                  </NextLink>
                  <p className="text-fg-subtle truncate text-xs">{u.email}</p>
                </div>
                <span
                  className={
                    u.plan.tier === "team"
                      ? "rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400"
                      : "text-fg-subtle text-xs"
                  }
                >
                  {u.plan.tier === "team" ? "Paid" : "Free"}
                </span>
                <span className="text-fg-subtle w-16 shrink-0 text-right text-xs">
                  {formatRelative(u.createdAt, now)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Most storage"
          action={{ href: "/users?sort=storage", label: "By storage" }}
        >
          <ul className="flex flex-col gap-4">
            {heaviest.rows.map((u) => (
              <li key={u.id} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <NextLink
                    href={`/users/${u.id}`}
                    className="text-fg-strong min-w-0 truncate font-medium hover:underline"
                  >
                    {u.name || u.email}
                  </NextLink>
                  <span className="text-fg-subtle shrink-0 text-xs tabular-nums">
                    {u.recordingCount === 1
                      ? "1 recording"
                      : `${u.recordingCount} recordings`}{" "}
                    ·{" "}
                    <span className="text-fg-strong font-medium">
                      {formatBytes(u.storageBytes)}
                    </span>
                  </span>
                </div>
                <Meter ratio={u.storageBytes / topBytes} hue="violet" />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

import { Suspense } from "react";
import {
  type PostHogConfig,
  type WebRange,
  type WebRow,
  WEB_RANGES,
  getActivation,
  getWebAnalytics,
  isWebRange,
  postHogConfig,
} from "@captureflow/admin";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminEnv } from "@/lib/env";
import { requirePermission } from "@/lib/guard";
import { GrowthChart, Panel } from "../_dashboard";
import { LinkTabs } from "../_filters";
import {
  DataTable,
  Notice,
  PageHeader,
  PersonCell,
  Section,
  formatRelative,
} from "../_ui";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  BarList,
  CohortTable,
  FunnelSteps,
  MetricTile,
  countryLabel,
  formatSeconds,
  pct,
} from "./_parts";

const WEEKS = 8;

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  await requirePermission("users.read");
  const env = await getAdminEnv();
  if (!env?.DB) return <Notice tone="error">No database binding.</Notice>;
  const params = await searchParams;
  const range: WebRange = isWebRange(params.range) ? params.range : "7d";
  const posthog = postHogConfig(env);
  const now = Date.now();
  const activation = await getActivation(env.DB, WEEKS, now);
  const { funnel } = activation;

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Analytics"
        description="Who signs up, who records, and who comes back"
      />

      <Section
        title="Activation"
        description={`Everyone who signed up in the last ${WEEKS} weeks`}
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <Panel title="Funnel" description="Each step out of all signups">
            <FunnelSteps
              steps={[
                {
                  label: "Signed up",
                  count: funnel.signedUp,
                  hint: "Created an account",
                },
                {
                  label: "Recorded",
                  count: funnel.recorded,
                  hint: "Finished at least one recording",
                },
                {
                  label: "Recorded again",
                  count: funnel.recordedTwice,
                  hint: "Finished two or more",
                },
                {
                  label: "Came back",
                  count: funnel.returned,
                  hint: "Active on a later day than signup",
                },
              ]}
            />
          </Panel>
          <Panel
            title="Weekly retention"
            description="Share of each signup week active in the weeks after"
          >
            <CohortTable cohorts={activation.cohorts} />
            <p className="text-xs text-muted-foreground">
              Active means signed in, recorded, took a screenshot, watched or
              commented.
            </p>
          </Panel>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Panel
            title="Time to first recording"
            description="How long after signing up"
          >
            <BarList
              rows={activation.timeToFirstRecording.map((b) => ({
                key: b.label,
                label: b.label,
                value: b.count,
                detail: pct(b.count, funnel.signedUp),
              }))}
            />
          </Panel>
          <Panel
            title="First recording made with"
            description="Where people record for the first time"
          >
            <BarList
              rows={activation.firstClient.map((b) => ({
                key: b.label,
                label: b.label,
                value: b.count,
                detail: pct(b.count, funnel.recorded),
              }))}
              empty="Nobody has recorded yet"
            />
          </Panel>
        </div>
      </Section>

      <Section
        title="Recorded once, never came back"
        description="One recording, then nothing after their signup day"
      >
        {activation.oneAndDone.length ? (
          <DataTable
            label="Recorded once, never came back"
            columns={["User", "Recorded", "Signed up"]}
          >
            {activation.oneAndDone.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <PersonCell id={u.id} name={u.name ?? ""} email={u.email} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatRelative(u.firstRecordingAt, now)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatRelative(u.createdAt, now)}
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        ) : (
          <p className="text-sm text-muted-foreground">Nobody fits this yet.</p>
        )}
      </Section>

      {posthog && (
        <Section
          title="Website"
          description={`Visits to ${posthog.siteHost}, from PostHog`}
          actions={
            <LinkTabs
              label="Range"
              selected={range}
              items={Object.entries(WEB_RANGES).map(([id, r]) => ({
                id,
                label: r.label.replace("Last ", ""),
                href: `/analytics?range=${id}`,
              }))}
            />
          }
        >
          <Suspense key={range} fallback={<WebSkeleton />}>
            <Website config={posthog} range={range} />
          </Suspense>
        </Section>
      )}
    </div>
  );
}

function WebSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}

const HOUR_LABEL = new Intl.DateTimeFormat("en", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});
const DAY_LABEL = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function visitorRows(rows: WebRow[], label = (key: string) => key) {
  return rows.map((r) => ({
    key: r.key,
    label: label(r.key),
    value: r.visitors,
    detail: `${r.views.toLocaleString()} views`,
  }));
}

function sourceLabel(key: string): string {
  return key === "$direct" || key === "(none)" ? "Direct" : key;
}

async function Website({
  config,
  range,
}: {
  config: PostHogConfig;
  range: WebRange;
}) {
  let data;
  try {
    data = await getWebAnalytics(config, range);
  } catch (err) {
    return (
      <Notice tone="error">
        Couldn&apos;t load PostHog:{" "}
        {err instanceof Error ? err.message : "unknown error"}
      </Notice>
    );
  }
  const { overview } = data;
  const label = range === "24h" ? HOUR_LABEL : DAY_LABEL;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <MetricTile
          label="Visitors"
          value={overview.visitors.current.toLocaleString()}
          previous={overview.visitors.previous.toLocaleString()}
          compared={overview.visitors}
        />
        <MetricTile
          label="Page views"
          value={overview.pageviews.current.toLocaleString()}
          previous={overview.pageviews.previous.toLocaleString()}
          compared={overview.pageviews}
        />
        <MetricTile
          label="Sessions"
          value={overview.sessions.current.toLocaleString()}
          previous={overview.sessions.previous.toLocaleString()}
          compared={overview.sessions}
        />
        <MetricTile
          label="Session duration"
          value={formatSeconds(overview.sessionSeconds.current)}
          previous={formatSeconds(overview.sessionSeconds.previous)}
          compared={overview.sessionSeconds}
        />
        <MetricTile
          label="Bounce rate"
          value={`${Math.round(overview.bounceRate.current * 100)}%`}
          previous={`${Math.round(overview.bounceRate.previous * 100)}%`}
          compared={overview.bounceRate}
          lowerIsBetter
        />
      </div>

      <Panel title="Unique visitors" description={WEB_RANGES[range].label}>
        <GrowthChart
          labels={data.series.map((p) => label.format(p.at))}
          series={[
            {
              label: "This period",
              hue: "blue",
              values: data.series.map((p) => p.current),
            },
            {
              label: "Previous period",
              hue: "muted",
              values: data.series.map((p) => p.previous),
            },
          ]}
        />
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Pages" description="Visitors per page">
          <BarList rows={visitorRows(data.pages)} />
        </Panel>
        <Panel title="Entry pages" description="Where sessions start">
          <BarList rows={visitorRows(data.entryPages)} />
        </Panel>
        <Panel title="Sources" description="Referring site of each session">
          <BarList rows={visitorRows(data.sources, sourceLabel)} />
        </Panel>
        <Panel title="Campaigns" description="utm_source of each session">
          <BarList
            rows={visitorRows(data.campaigns.filter((r) => r.key !== "(none)"))}
            empty="No tagged campaigns in this period"
          />
        </Panel>
        <Panel title="Countries">
          <BarList rows={visitorRows(data.countries, countryLabel)} />
        </Panel>
        <Panel title="Devices">
          <BarList rows={visitorRows(data.devices)} />
        </Panel>
        <Panel title="Browsers">
          <BarList rows={visitorRows(data.browsers)} />
        </Panel>
        <Panel title="Operating systems">
          <BarList rows={visitorRows(data.systems)} />
        </Panel>
      </div>
    </div>
  );
}

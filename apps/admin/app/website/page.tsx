import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  type PostHogConfig,
  type WebRange,
  type WebRow,
  WEB_RANGES,
  getWebAnalytics,
  isWebRange,
  postHogConfig,
} from "@captureflow/admin";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminEnv } from "@/lib/env";
import { requirePermission } from "@/lib/guard";
import { GrowthChart, Panel } from "../_dashboard";
import { LinkTabs } from "../_filters";
import { Notice, PageHeader } from "../_ui";
import {
  BarList,
  MetricTile,
  countryLabel,
  formatSeconds,
} from "../analytics/_parts";

function webHref(range: string, site: string): string {
  return `/website?${new URLSearchParams({ range, site })}`;
}

export default async function WebsitePage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; site?: string }>;
}) {
  await requirePermission("users.read");
  const params = await searchParams;
  const posthog = postHogConfig(await getAdminEnv(), params.site);
  if (!posthog) notFound();
  const range: WebRange = isWebRange(params.range) ? params.range : "7d";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Website"
        description={`Visits to ${posthog.siteHost}, from PostHog`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {posthog.siteHosts.length > 1 && (
              <LinkTabs
                label="Site"
                selected={posthog.siteHost}
                items={posthog.siteHosts.map((host) => ({
                  id: host,
                  label: host,
                  href: webHref(range, host),
                }))}
              />
            )}
            <LinkTabs
              label="Range"
              selected={range}
              items={Object.entries(WEB_RANGES).map(([id, r]) => ({
                id,
                label: r.label.replace("Last ", ""),
                href: webHref(id, posthog.siteHost),
              }))}
            />
          </div>
        }
      />
      <Suspense key={`${range}-${posthog.siteHost}`} fallback={<WebSkeleton />}>
        <Website config={posthog} range={range} />
      </Suspense>
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
              total: overview.visitors.current,
            },
            {
              label: "Previous period",
              hue: "muted",
              values: data.series.map((p) => p.previous),
              total: overview.visitors.previous,
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

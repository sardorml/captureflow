"use client";

import { useMemo, useState } from "react";
import { Tabs } from "@heroui/react";
import {
  METRIC_RANGES,
  daySeries,
  labelStep,
  type DaySeries,
  type MetricRange,
} from "@/lib/dashboard-metrics";
import type { DashboardActivity } from "@/lib/dashboard-metrics-db";

// Selected state on the tab itself: the sliding indicator measures before
// the font settles and sits off the first tab until a click.
const TAB_CLASS =
  "h-8 justify-center rounded-lg px-3.5 text-sm font-medium text-fg-muted data-[selected=true]:bg-panel-2 data-[selected=true]:text-fg data-[selected=true]:shadow-sm dark:data-[selected=true]:bg-white/10";

const CHART_HEIGHT = 100;

export function MetricCards({
  activity,
  now,
}: {
  activity: DashboardActivity;
  now: number;
}) {
  const [range, setRange] = useState<MetricRange>(7);
  const series = useMemo(
    () => ({
      recordings: daySeries(activity.recordings, range, now),
      screenshots: daySeries(activity.screenshots, range, now),
      viewers: daySeries(activity.viewers, range, now),
    }),
    [activity, range, now],
  );

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        selectedKey={String(range)}
        onSelectionChange={(key) => setRange(Number(key) as MetricRange)}
        aria-label="How far back to count"
      >
        <Tabs.ListContainer className="w-fit rounded-xl bg-tint p-1">
          <Tabs.List className="flex gap-0 p-0">
            {METRIC_RANGES.map((days) => (
              <Tabs.Tab key={days} id={String(days)} className={TAB_CLASS}>
                {days}d
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Recordings" series={series.recordings} />
        <MetricCard label="Screenshots" series={series.screenshots} />
        <MetricCard label="Viewers" series={series.viewers} />
      </div>
    </div>
  );
}

function MetricCard({ label, series }: { label: string; series: DaySeries }) {
  const days = series.counts.length;
  const max = Math.max(1, ...series.counts);
  const step = labelStep(days);
  return (
    <div className="flex h-64 flex-col rounded-2xl bg-panel p-5 ring-1 ring-line-strong">
      <p className="text-3xl font-semibold tabular-nums text-fg-strong">
        {series.total}
      </p>
      <p className="mt-1 text-sm font-semibold text-fg">{label}</p>
      <svg
        className="mt-auto h-24 w-full"
        viewBox={`0 0 ${days} ${CHART_HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden
      >
        {series.counts.map((n, i) => {
          if (n === 0) return null;
          const height = (n / max) * CHART_HEIGHT;
          return (
            <rect
              key={i}
              x={i + 0.15}
              y={CHART_HEIGHT - height}
              width={0.7}
              height={height}
              className="fill-accent"
            />
          );
        })}
      </svg>
      <div className="mt-3 flex justify-between text-xs text-fg-muted">
        {series.labels.map((text, i) => {
          if (i % step !== 0) return null;
          // Narrow cards show every other label.
          const alternate = (i / step) % 2 === 1;
          return (
            <span key={text} className={alternate ? "hidden sm:inline" : ""}>
              {text}
            </span>
          );
        })}
      </div>
    </div>
  );
}

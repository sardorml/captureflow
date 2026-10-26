"use client";

import { useMemo, useState } from "react";
import { Tabs } from "@heroui/react";
import {
  METRIC_RANGES,
  daySeries,
  labelStep,
  type DayCount,
  type MetricRange,
} from "@/lib/dashboard-metrics";

// Selected state on the tab itself: the sliding indicator measures before
// the font settles and sits off the first tab until a click.
const TAB_CLASS =
  "h-7 justify-center rounded-md px-2.5 text-xs font-medium text-fg-muted data-[selected=true]:bg-panel-2 data-[selected=true]:text-fg data-[selected=true]:shadow-sm dark:data-[selected=true]:bg-white/10";

const CHART_HEIGHT = 100;

export function ViewersCard({
  viewers,
  now,
}: {
  viewers: DayCount[];
  now: number;
}) {
  const [range, setRange] = useState<MetricRange>(30);
  const series = useMemo(
    () => daySeries(viewers, range, now),
    [viewers, range, now],
  );
  const max = Math.max(1, ...series.counts);
  const step = labelStep(range);

  return (
    <section className="rounded-2xl bg-panel p-5 ring-1 ring-line-strong">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-fg-muted">Viewers</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-fg-strong">
            {series.total}
          </p>
          <p className="mt-0.5 text-xs text-fg-subtle">
            People who opened a recording in the last {range} days
          </p>
        </div>
        <Tabs
          selectedKey={String(range)}
          onSelectionChange={(key) => setRange(Number(key) as MetricRange)}
          aria-label="How far back to count"
        >
          <Tabs.ListContainer className="w-fit rounded-lg bg-tint p-0.5">
            <Tabs.List className="flex gap-0 p-0">
              {METRIC_RANGES.map((days) => (
                <Tabs.Tab key={days} id={String(days)} className={TAB_CLASS}>
                  {days}d
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      </div>
      <svg
        className="mt-5 h-24 w-full"
        viewBox={`0 0 ${range} ${CHART_HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden
      >
        {series.counts.map((n, i) => {
          const height = Math.max(2, (n / max) * CHART_HEIGHT);
          return (
            <rect
              key={i}
              x={i + 0.15}
              y={CHART_HEIGHT - height}
              width={0.7}
              height={height}
              className={n > 0 ? "fill-accent" : "fill-tint-strong"}
            />
          );
        })}
      </svg>
      <div className="mt-2 flex justify-between text-[11px] text-fg-subtle">
        {series.labels.map((text, i) => {
          if (i % step !== 0) return null;
          const alternate = (i / step) % 2 === 1;
          return (
            <span key={text} className={alternate ? "hidden sm:inline" : ""}>
              {text}
            </span>
          );
        })}
      </div>
    </section>
  );
}

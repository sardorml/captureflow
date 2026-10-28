import type { ReactNode } from "react";
import NextLink from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@captureflow/ui/cn";

export type Hue = "blue" | "violet" | "emerald" | "amber";

const HUE: Record<
  Hue,
  { chip: string; bar: string; stroke: string; fill: string; dot: string }
> = {
  blue: {
    chip: "bg-accent/10 text-accent",
    bar: "bg-accent",
    stroke: "stroke-accent",
    fill: "fill-accent/10",
    dot: "bg-accent",
  },
  violet: {
    chip: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    bar: "bg-violet-500",
    stroke: "stroke-violet-500",
    fill: "fill-violet-500/10",
    dot: "bg-violet-500",
  },
  emerald: {
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500",
    stroke: "stroke-emerald-500",
    fill: "fill-emerald-500/10",
    dot: "bg-emerald-500",
  },
  amber: {
    chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    bar: "bg-amber-500",
    stroke: "stroke-amber-500",
    fill: "fill-amber-500/10",
    dot: "bg-amber-500",
  },
};

export function Panel({
  title,
  description,
  action,
  className,
  children,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "border-line bg-panel flex min-w-0 flex-col gap-5 rounded-2xl border p-5",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-fg-strong text-[15px] font-semibold">{title}</h2>
          {description && (
            <p className="text-fg-muted mt-0.5 text-sm">{description}</p>
          )}
        </div>
        {action && (
          <NextLink
            href={action.href}
            className="text-fg-muted hover:text-fg flex shrink-0 items-center gap-1 text-sm transition-colors motion-reduce:transition-none"
          >
            {action.label}
            <ArrowRight size={14} aria-hidden />
          </NextLink>
        )}
      </header>
      {children}
    </section>
  );
}

// This week's count against last week's, as the plain difference.
function Delta({ current, previous }: { current: number; previous: number }) {
  const change = current - previous;
  if (change === 0) {
    return <span className="text-fg-subtle text-xs">Same as last week</span>;
  }
  const up = change > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
        up ? "bg-success/10 text-success" : "bg-danger/10 text-danger",
      )}
      title="Against last week"
    >
      <Icon size={12} aria-hidden />
      {up ? "+" : "−"}
      {Math.abs(change).toLocaleString()} vs last week
    </span>
  );
}

const AREA_W = 120;
const AREA_H = 40;

function AreaSpark({ values, hue }: { values: number[]; hue: Hue }) {
  const max = Math.max(1, ...values);
  const step = AREA_W / Math.max(1, values.length - 1);
  const points = values.map(
    (v, i) => [i * step, AREA_H - 2 - (v / max) * (AREA_H - 4)] as const,
  );
  const line = points.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join("");
  return (
    <svg
      viewBox={`0 0 ${AREA_W} ${AREA_H}`}
      className="h-10 w-28 shrink-0 overflow-visible"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d={`${line}L${AREA_W},${AREA_H}L0,${AREA_H}Z`}
        className={HUE[hue].fill}
      />
      <path
        d={line}
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className={HUE[hue].stroke}
      />
    </svg>
  );
}

export function KpiCard({
  icon,
  hue,
  label,
  value,
  href,
  trend,
  footnote,
}: {
  icon: ReactNode;
  hue: Hue;
  label: string;
  value: string;
  href: string;
  trend?: number[];
  footnote: string;
}) {
  const current = trend?.at(-1) ?? 0;
  const previous = trend?.at(-2) ?? 0;
  return (
    <NextLink
      href={href}
      className="border-line bg-panel hover:border-line-strong group flex min-w-0 flex-col gap-4 rounded-2xl border p-5 transition-colors motion-reduce:transition-none"
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-xl",
            HUE[hue].chip,
          )}
        >
          {icon}
        </span>
        {trend && <Delta current={current} previous={previous} />}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-fg-muted text-sm">{label}</p>
          <p className="text-fg-strong mt-1 text-[28px] leading-none font-semibold tracking-tight tabular-nums">
            {value}
          </p>
        </div>
        {trend && <AreaSpark values={trend} hue={hue} />}
      </div>
      <p className="text-fg-subtle truncate text-xs">{footnote}</p>
    </NextLink>
  );
}

export type Series = { label: string; hue: Hue; values: number[] };

export function GrowthChart({
  series,
  labels,
}: {
  series: Series[];
  labels: string[];
}) {
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const ticks = [max, Math.round(max / 2), 0];
  return (
    <div className="flex flex-1 flex-col gap-4">
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {series.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-sm">
            <span className={cn("size-2.5 rounded-full", HUE[s.hue].dot)} />
            <span className="text-fg-muted">{s.label}</span>
            <span className="text-fg-strong font-medium tabular-nums">
              {s.values.reduce((a, b) => a + b, 0).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex min-h-56 flex-1 gap-3">
        <div className="text-fg-subtle flex flex-col justify-between pb-6 text-right text-[11px] tabular-nums">
          {ticks.map((t, i) => (
            <span
              key={i}
              className="-translate-y-1/2 first:translate-y-0 last:translate-y-0"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="relative flex-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="border-line absolute inset-x-0 border-t border-dashed"
                style={{ top: `${i * 50}%` }}
              />
            ))}
            <div className="absolute inset-0 grid grid-flow-col items-end gap-1.5 sm:gap-3">
              {labels.map((label, week) => (
                <div
                  key={label}
                  className="flex h-full items-end justify-center gap-0.5"
                  title={series
                    .map((s) => `${s.label}: ${s.values[week] ?? 0}`)
                    .join("\n")}
                >
                  {series.map((s) => {
                    const v = s.values[week] ?? 0;
                    return (
                      <div
                        key={s.label}
                        className={cn(
                          "w-full max-w-3 rounded-t-[3px]",
                          v > 0 ? HUE[s.hue].bar : "bg-line",
                        )}
                        style={{
                          height:
                            v > 0 ? `${Math.max(3, (v / max) * 100)}%` : "2px",
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="text-fg-subtle grid grid-flow-col gap-1.5 text-center text-[11px] sm:gap-3">
            {labels.map((label, i) => (
              <span
                key={label}
                className={cn(i % 2 === 1 && "invisible sm:visible")}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const RING = 120;
const RING_STROKE = 14;
const RING_R = (RING - RING_STROKE) / 2;
const RING_LEN = 2 * Math.PI * RING_R;

export function Donut({
  parts,
  center,
  caption,
}: {
  parts: { label: string; value: number; hue: Hue | "muted" }[];
  center: string;
  caption: string;
}) {
  const total = parts.reduce((a, p) => a + p.value, 0);
  let offset = 0;
  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0">
        <svg
          width={RING}
          height={RING}
          viewBox={`0 0 ${RING} ${RING}`}
          className="-rotate-90"
          aria-hidden
        >
          <circle
            cx={RING / 2}
            cy={RING / 2}
            r={RING_R}
            fill="none"
            strokeWidth={RING_STROKE}
            className="stroke-line"
          />
          {total > 0 &&
            parts.map((p) => {
              const length = (p.value / total) * RING_LEN;
              const arc = (
                <circle
                  key={p.label}
                  cx={RING / 2}
                  cy={RING / 2}
                  r={RING_R}
                  fill="none"
                  strokeWidth={RING_STROKE}
                  strokeDasharray={`${length} ${RING_LEN}`}
                  strokeDashoffset={-offset}
                  className={
                    p.hue === "muted" ? "stroke-line-strong" : HUE[p.hue].stroke
                  }
                />
              );
              offset += length;
              return arc;
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-fg-strong text-xl font-semibold tabular-nums">
            {center}
          </span>
          <span className="text-fg-subtle text-[11px]">{caption}</span>
        </div>
      </div>
      <ul className="flex min-w-0 flex-1 flex-col gap-3">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-2 text-sm">
            <span
              className={cn(
                "size-2.5 shrink-0 rounded-full",
                p.hue === "muted" ? "bg-line-strong" : HUE[p.hue].dot,
              )}
            />
            <span className="text-fg-muted flex-1 truncate">{p.label}</span>
            <span className="text-fg-strong font-medium tabular-nums">
              {p.value.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SplitBar({
  parts,
}: {
  parts: { label: string; value: number; display: string; hue: Hue }[];
}) {
  const total = parts.reduce((a, p) => a + p.value, 0);
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-line flex h-2.5 overflow-hidden rounded-full">
        {total > 0 &&
          parts.map((p) => (
            <div
              key={p.label}
              className={HUE[p.hue].bar}
              style={{ width: `${(p.value / total) * 100}%` }}
            />
          ))}
      </div>
      <ul className="flex flex-col gap-2">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-2 text-sm">
            <span className={cn("size-2.5 rounded-full", HUE[p.hue].dot)} />
            <span className="text-fg-muted flex-1">{p.label}</span>
            <span className="text-fg-strong font-medium tabular-nums">
              {p.display}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Meter({ ratio, hue }: { ratio: number; hue: Hue }) {
  return (
    <div className="bg-line h-1.5 overflow-hidden rounded-full">
      <div
        className={cn("h-full rounded-full", HUE[hue].bar)}
        style={{
          width: `${Math.min(100, Math.max(ratio > 0 ? 3 : 0, ratio * 100))}%`,
        }}
      />
    </div>
  );
}

export type FeedItem = {
  key: string;
  icon: ReactNode;
  hue: Hue;
  text: ReactNode;
  at: number;
};

export function Feed({
  items,
  formatTime,
}: {
  items: FeedItem[];
  formatTime: (ms: number) => string;
}) {
  return (
    <ol className="flex flex-col">
      {items.map((item, i) => (
        <li key={item.key} className="relative flex gap-3 pb-4 last:pb-0">
          {i < items.length - 1 && (
            <span className="bg-line absolute top-8 bottom-0 left-[15px] w-px" />
          )}
          <span
            className={cn(
              "relative flex size-8 shrink-0 items-center justify-center rounded-full",
              HUE[item.hue].chip,
            )}
          >
            {item.icon}
          </span>
          <div className="min-w-0 flex-1 pt-1">
            <p className="text-fg line-clamp-2 text-sm leading-5">
              {item.text}
            </p>
            <p className="text-fg-subtle mt-0.5 text-xs">
              {formatTime(item.at)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

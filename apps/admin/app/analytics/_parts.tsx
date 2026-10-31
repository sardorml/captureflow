import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { CohortRow, Compared } from "@captureflow/admin";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function pct(value: number, total: number): string {
  return `${total ? Math.round((value / total) * 100) : 0}%`;
}

export function FunnelSteps({
  steps,
}: {
  steps: { label: string; count: number; hint: string }[];
}) {
  const top = Math.max(1, steps[0]?.count ?? 0);
  return (
    <ol className="flex flex-col gap-4">
      {steps.map((step, i) => {
        const prev = i > 0 ? steps[i - 1]!.count : null;
        return (
          <li key={step.label} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium">{step.label}</span>
              <span className="tabular-nums">
                <span className="font-semibold">
                  {step.count.toLocaleString()}
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  · {pct(step.count, top)}
                </span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(step.count / top) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {step.hint}
              {prev !== null && prev > 0 && (
                <> · {pct(step.count, prev)} of the step before</>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

const WEEK_LABEL = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function CohortTable({ cohorts }: { cohorts: CohortRow[] }) {
  const weeks = cohorts[0]?.retained.length ?? 0;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-xs tabular-nums">
        <thead>
          <tr className="text-muted-foreground">
            <th className="px-2 py-1 text-left font-medium">Signed up</th>
            <th className="px-2 py-1 text-right font-medium">Users</th>
            {Array.from({ length: weeks }, (_, i) => (
              <th key={i} className="px-2 py-1 text-center font-medium">
                {i === 0 ? "Week 0" : `+${i}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((row) => (
            <tr key={row.weekStart}>
              <td className="px-2 py-1 whitespace-nowrap text-muted-foreground">
                {WEEK_LABEL.format(row.weekStart)}
              </td>
              <td className="px-2 py-1 text-right font-medium">{row.size}</td>
              {row.retained.map((n, i) => {
                const ratio = row.size && n !== null ? n / row.size : 0;
                return (
                  <td
                    key={i}
                    className={cn(
                      "rounded-md px-2 py-1.5 text-center",
                      n === null || row.size === 0
                        ? "text-muted-foreground/40"
                        : ratio >= 0.5
                          ? "text-primary-foreground"
                          : "text-foreground",
                    )}
                    style={
                      n !== null && row.size > 0
                        ? {
                            backgroundColor: `color-mix(in oklab, var(--primary) ${Math.round(8 + ratio * 82)}%, transparent)`,
                          }
                        : undefined
                    }
                    title={
                      n !== null && row.size > 0
                        ? `${n} of ${row.size} active`
                        : undefined
                    }
                  >
                    {n === null || row.size === 0 ? "·" : pct(n, row.size)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BarList({
  rows,
  empty = "No data in this period",
}: {
  rows: { key: string; label: ReactNode; value: number; detail?: string }[];
  empty?: string;
}) {
  if (!rows.length) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="flex flex-col gap-1">
      {rows.map((row) => (
        <li
          key={row.key}
          className="relative flex items-center justify-between gap-3 overflow-hidden rounded-md px-2.5 py-1.5 text-sm"
        >
          <div
            className="absolute inset-y-0 left-0 rounded-md bg-primary/10"
            style={{ width: `${(row.value / max) * 100}%` }}
            aria-hidden
          />
          <span className="relative min-w-0 truncate">{row.label}</span>
          <span className="relative shrink-0 font-medium tabular-nums">
            {row.value.toLocaleString()}
            {row.detail && (
              <span className="ml-2 font-normal text-muted-foreground">
                {row.detail}
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

function change({ current, previous }: Compared): number | null {
  if (!previous) return null;
  return (current - previous) / previous;
}

export function MetricTile({
  label,
  value,
  previous,
  compared,
  lowerIsBetter = false,
}: {
  label: string;
  value: string;
  previous: string;
  compared: Compared;
  lowerIsBetter?: boolean;
}) {
  const delta = change(compared);
  const good = delta !== null && (lowerIsBetter ? delta < 0 : delta > 0);
  const Icon = delta !== null && delta < 0 ? ArrowDownRight : ArrowUpRight;
  return (
    <Card className="gap-2 px-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        {delta !== null && delta !== 0 && (
          <span
            className={cn(
              "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
              good
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "bg-destructive/10 text-destructive",
            )}
          >
            <Icon size={12} aria-hidden />
            {Math.abs(Math.round(delta * 1000) / 10)}%
          </span>
        )}
      </div>
      <span className="text-[28px] leading-none font-semibold tracking-tight tabular-nums">
        {value}
      </span>
      <span className="text-xs text-muted-foreground">
        vs. {previous} prior
      </span>
    </Card>
  );
}

export function formatSeconds(seconds: number): string {
  const s = Math.round(seconds);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
}

const REGION = new Intl.DisplayNames(["en"], { type: "region" });

export function countryLabel(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return code;
  const flag = String.fromCodePoint(
    ...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
  return `${flag} ${REGION.of(code) ?? code}`;
}

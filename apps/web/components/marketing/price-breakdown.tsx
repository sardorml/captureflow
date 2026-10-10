"use client";

import {
  CAPTUREFLOW_MONTHLY,
  CAPTUREFLOW_STORAGE_LABEL,
  LOOM_PLANS,
  getLoomMonthly,
  getYearlySavings,
  type LoomPlan,
} from "@/lib/marketing/loom-comparison";
import { cn } from "@/lib/utils";
import { useMessages } from "./i18n-provider";

export const usd = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  });

export function PriceBreakdown({
  plan,
  seats,
  className,
}: {
  plan: LoomPlan;
  seats: number;
  className?: string;
}) {
  const copy = useMessages().pricing.compare;
  const { label: planLabel, perSeat } = LOOM_PLANS.find((p) => p.id === plan)!;
  const loom = getLoomMonthly(plan, seats);
  const savings = usd(Math.round(getYearlySavings(plan, seats)));
  const fill = (s: string) =>
    s
      .replace("{plan}", planLabel)
      .replace("{seats}", String(seats))
      .replace("{perSeat}", usd(perSeat))
      .replace("{storage}", CAPTUREFLOW_STORAGE_LABEL)
      .replace("{savings}", savings);

  return (
    <div className={cn("rounded-xl bg-canvas px-4 pt-1 pb-4", className)}>
      <CostRow
        label={fill(copy.loomRow)}
        detail={fill(copy.loomDetail)}
        monthly={loom}
      />
      <CostRow
        label={fill(copy.captureflowRow)}
        detail={fill(copy.captureflowDetail)}
        monthly={CAPTUREFLOW_MONTHLY}
        isOurs
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg bg-success/15 px-4 py-3 text-success">
        <span className="text-[15px] font-medium">{copy.saveLabel}</span>
        <span
          key={savings}
          className="animate-storage-pop inline-block text-xl font-bold tracking-[-0.01em] whitespace-nowrap tabular-nums sm:text-2xl"
        >
          {fill(copy.saveValue)}
        </span>
      </div>
      <p className="mt-2 text-xs text-fg-subtle">{fill(copy.caption)}</p>
    </div>
  );
}

function CostRow({
  label,
  detail,
  monthly,
  isOurs,
}: {
  label: string;
  detail: string;
  monthly: number;
  isOurs?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 py-3",
        !isOurs && "border-b border-line",
      )}
    >
      <div>
        <p
          className={cn(
            "text-[15px]",
            isOurs ? "font-semibold text-fg" : "font-medium text-fg/80",
          )}
        >
          {label}
        </p>
        <p className="mt-0.5 text-sm text-fg-muted">{detail}</p>
      </div>
      <span className="flex items-baseline">
        <span
          className={cn(
            "text-xl font-bold tracking-[-0.01em] tabular-nums sm:text-2xl",
            isOurs ? "text-fg" : "text-fg/60 line-through decoration-2",
          )}
        >
          {usd(monthly)}
        </span>
        <span className="ms-0.5 text-sm font-medium text-fg-muted">/mo</span>
      </span>
    </div>
  );
}

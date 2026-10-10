"use client";

import NextLink from "next/link";
import { ArrowRight } from "lucide-react";
import {
  CAPTUREFLOW_MONTHLY,
  CAPTUREFLOW_STORAGE_LABEL,
  LOOM_PLANS,
  getLoomMonthly,
  getYearlySavings,
} from "@/lib/marketing/loom-comparison";
import { cn } from "@/lib/utils";
import { useLocalizedHref, useMessages } from "./i18n-provider";

const SEATS = 10;

const usd = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  });

export function CompareBanner() {
  const copy = useMessages().pricing.compare;
  const lh = useLocalizedHref();
  const loom = getLoomMonthly("business", SEATS);
  const fill = (s: string) =>
    s
      .replace("{seats}", String(SEATS))
      .replace("{perSeat}", usd(LOOM_PLANS[0]!.perSeat))
      .replace("{storage}", CAPTUREFLOW_STORAGE_LABEL)
      .replace(
        "{savings}",
        usd(Math.round(getYearlySavings("business", SEATS))),
      );

  const [titleBefore, titleAfter] = copy.title.split("{loom}");

  return (
    <NextLink
      href={lh("/alternatives/loom")}
      className="group mt-4 grid gap-6 rounded-2xl bg-panel p-5 transition-colors hover:bg-panel-2 sm:p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:items-center"
    >
      <div>
        <p className="text-2xl font-semibold tracking-[-0.02em] text-fg">
          {titleBefore}
          <span className="mx-0.5 inline-block -rotate-1 rounded-lg bg-fg px-2 py-0.5 text-canvas">
            {copy.loom}
          </span>
          {titleAfter}
        </p>
        <p className="mt-3 text-base leading-relaxed text-fg/85">
          {fill(copy.body)
            .split("**")
            .map((part, i) =>
              i % 2 ? (
                <strong key={i} className="font-semibold text-fg">
                  {part}
                </strong>
              ) : (
                part
              ),
            )}
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-fg">
          {copy.link}
          <ArrowRight
            size={15}
            className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </span>
      </div>

      <div className="rounded-xl bg-canvas px-4 pt-1 pb-4">
        <CostRow
          label={copy.loomRow}
          detail={fill(copy.loomDetail)}
          monthly={loom}
        />
        <CostRow
          label={fill(copy.captureflowRow)}
          detail={fill(copy.captureflowDetail)}
          monthly={CAPTUREFLOW_MONTHLY}
          isOurs
        />
        <div className="mt-3 flex items-center justify-between rounded-lg bg-success/15 px-4 py-3 text-success">
          <span className="text-[15px] font-medium">{copy.saveLabel}</span>
          <span className="text-2xl font-bold tracking-[-0.01em] tabular-nums">
            {fill(copy.saveValue)}
          </span>
        </div>
        <p className="mt-2 text-xs text-fg-subtle">{fill(copy.caption)}</p>
      </div>
    </NextLink>
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

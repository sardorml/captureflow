"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FREE_TIER } from "@captureflow/quota";
import {
  CAPTUREFLOW_PER_SEAT,
  LOOM_BRAND,
  LOOM_PLANS,
  LOOM_STARTER,
  getCaptureflowMonthly,
  getLoomMonthly,
} from "@/lib/marketing/loom-comparison";
import { track } from "@/lib/marketing/track";
import { PRODUCT_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";
import { SectionHeading, WIDE_RAIL, type SectionProps } from "./_shared";
import {
  CompareCell,
  OURS_BG,
  OursChip,
  type CompareValue,
} from "./compare-table";
import { useLocalizedHref, useMessages } from "./i18n-provider";
import { usd } from "./price-breakdown";

const THEIR_PLAN = "businessAi";
const GRID =
  "grid-cols-[minmax(170px,1.3fr)_repeat(3,minmax(140px,1fr))_minmax(210px,1fr)]";

type Row = {
  label: string;
  cells: [CompareValue, CompareValue, CompareValue, CompareValue];
};

// Their free and AI tiers beside ours, priced for the team size chosen in
// the pricing controls, laid out like the plan table.
export function WhyUsSection({
  seats,
  headingLevel = 2,
}: SectionProps & { seats: number }) {
  const m = useMessages();
  const lh = useLocalizedHref();
  const copy = m.pricing.whyUs;
  const r = copy.rows;
  const theirPaid = LOOM_PLANS.find((p) => p.id === THEIR_PLAN)!;
  const theirs = (plan: string) =>
    m.pricing.compare.loomRow.replace("{plan}", plan);
  const monthly = (amount: number) =>
    r.monthly.replace("{amount}", usd(amount));
  const upTo = (n: number) => r.upTo.replace("{n}", String(n));
  const minutes = r.minutes.replace(
    "{n}",
    String(Math.round(FREE_TIER.maxRecordingMs / 60_000)),
  );

  const columns = [
    { name: theirs(LOOM_STARTER.label) },
    { name: `${PRODUCT_NAME} ${m.pricing.plans.free.name}`, ours: true },
    { name: theirs(theirPaid.label) },
    { name: m.pricing.compare.captureflowRow, ours: true, paid: true },
  ];

  const rows: Row[] = [
    {
      label: r.perMember,
      cells: [
        usd(0),
        usd(0),
        usd(theirPaid.perSeat),
        usd(CAPTUREFLOW_PER_SEAT),
      ],
    },
    {
      label: r.team.replace("{seats}", String(seats)),
      cells: [
        r.free,
        r.free,
        monthly(getLoomMonthly(THEIR_PLAN, seats)),
        monthly(getCaptureflowMonthly(seats)),
      ],
    },
    {
      label: r.members,
      cells: [
        upTo(LOOM_STARTER.maxMembers),
        r.unlimited,
        r.unlimited,
        r.unlimited,
      ],
    },
    {
      label: r.recordings,
      cells: [
        upTo(FREE_TIER.recordingsPerPerson),
        upTo(FREE_TIER.recordingsPerPerson),
        r.unlimited,
        r.unlimited,
      ],
    },
    { label: r.length, cells: [minutes, minutes, r.unlimited, r.unlimited] },
    { label: r.transcripts, cells: [true, true, true, true] },
    { label: r.transcript, cells: [false, true, true, true] },
    { label: r.ai, cells: [false, false, true, true] },
    { label: r.openSource, cells: [false, true, false, true] },
    { label: r.viewers, cells: [r.free, r.free, r.free, r.free] },
  ];

  return (
    <div id="why-captureflow" className={cn("mt-24", WIDE_RAIL)}>
      <SectionHeading
        title={copy.heading
          .replace("{product}", PRODUCT_NAME)
          .replace("{brand}", LOOM_BRAND)}
        subtitle={copy.subtitle}
        level={headingLevel}
      />
      <section className="overflow-hidden rounded-2xl border border-line bg-panel">
        <div className="overflow-x-auto">
          <div className={cn("grid min-w-200", GRID)}>
            <div className="px-6 py-3" />
            {columns.map((column) => (
              <div
                key={column.name}
                className={cn(
                  "flex items-center justify-center border-l border-line px-2 py-2 text-center text-[15px] font-semibold text-fg",
                  column.ours && OURS_BG,
                )}
              >
                {column.paid ? (
                  <OursChip>{column.name}</OursChip>
                ) : (
                  <span className={cn(!column.ours && "text-fg-muted")}>
                    {column.name}
                  </span>
                )}
              </div>
            ))}
            {rows.map((row) => (
              <div key={row.label} className={cn("col-span-5 grid", GRID)}>
                <div className="border-t border-line px-6 py-3.5 text-[15px] text-fg">
                  {row.label}
                </div>
                {row.cells.map((cell, i) => (
                  <CompareCell
                    key={i}
                    value={cell}
                    ours={columns[i].ours}
                    pop={i === 3}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="mt-6 text-center">
        <Link
          href={lh("/alternatives/loom")}
          onClick={() =>
            track("marketing_cta_clicked", { location: "pricing_why_us" })
          }
          className="group inline-flex items-center gap-1.5 text-[15px] font-semibold text-fg transition-colors hover:text-fg/70 motion-reduce:transition-none"
        >
          {copy.cta}
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </Link>
      </div>
    </div>
  );
}

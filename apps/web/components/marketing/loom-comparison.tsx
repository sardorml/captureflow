"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { SEAT_PLAN } from "@captureflow/quota";
import {
  CAPTUREFLOW_PER_SEAT,
  LOOM_BRAND,
  LOOM_PLANS,
  LOOM_PRICES_CHECKED,
  LOOM_PRICING_URL,
  type LoomPlan,
} from "@/lib/marketing/loom-comparison";
import { PRODUCT_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";
import { MarketingSection, SectionHeading } from "./_shared";
import {
  CompareCell,
  OURS_BG,
  OursChip,
  type CompareValue,
} from "./compare-table";
import { GRADIENT_BORDER } from "./plan-cards";
import { PriceBreakdown } from "./price-breakdown";
import { RadioChoice, SeatsField } from "./pricing-fields";

const DEFAULT_SEATS = 10;
const GRID = "grid-cols-[minmax(150px,1.1fr)_repeat(2,minmax(160px,1fr))]";

const ROWS: ReadonlyArray<{
  label: string;
  loom: CompareValue;
  captureflow: CompareValue;
}> = [
  {
    label: "Pricing",
    loom: "Per person, $18–24 a month each",
    captureflow: `$${CAPTUREFLOW_PER_SEAT} a month per member, viewers free`,
  },
  {
    label: "Free plan",
    loom: "25 videos per person, 5 minutes each",
    captureflow: "25 recordings per person, 5 minutes each",
  },
  { label: "Self-host on your own cloud", loom: false, captureflow: true },
  { label: "Open source", loom: false, captureflow: "Yes, AGPL" },
  { label: "Instant share link", loom: true, captureflow: true },
  { label: "Camera bubble and effects", loom: true, captureflow: true },
  { label: "Comments and emoji reactions", loom: true, captureflow: true },
  { label: "View counts", loom: true, captureflow: true },
  {
    label: "Editing",
    loom: "Trim, stitch, transcript editing",
    captureflow: "Backgrounds, camera layout, cut from the transcript",
  },
  { label: "Annotated screenshots", loom: false, captureflow: true },
  { label: "Infinite canvas", loom: false, captureflow: true },
  {
    label: "Transcripts and captions",
    loom: true,
    captureflow: "Free on every plan",
  },
  {
    label: "AI titles, chapters and filler word removal",
    loom: "On Business + AI",
    captureflow: `On ${SEAT_PLAN.name}`,
  },
  {
    label: "Apps",
    loom: "Chrome, Mac, Windows, iOS, Android",
    captureflow: "Chrome and macOS",
  },
  { label: "Enterprise SSO", loom: true, captureflow: false },
  {
    label: "How long videos are kept",
    loom: "Until you delete them",
    captureflow:
      "Paid: until you delete them. Free: 30 days after the last view",
  },
];

const INTRO =
  "Both record your screen and camera and give your team a link to watch when it suits them. They differ in how they charge: Loom bills every person on the team, CaptureFlow bills only the people who record, viewers are free, and it costs nothing to self-host.";

const LOOM_FITS = [
  "You need Windows or mobile apps.",
  "Your company requires SSO and an uptime SLA.",
  "You want a vendor with a large support team behind it.",
];

const CAPTUREFLOW_FITS = [
  "You're paying for every person when only a few of them record.",
  "You want recordings in storage you own, or need to self-host.",
  "You'd rather read the code that handles your videos.",
];

export function LoomComparison() {
  const [seats, setSeats] = useState(DEFAULT_SEATS);
  const [plan, setPlan] = useState<LoomPlan>("businessAi");

  return (
    <MarketingSection id="compare">
      <SectionHeading
        level={1}
        title={
          <>
            {PRODUCT_NAME} <span className="text-fg-muted">vs</span>{" "}
            {LOOM_BRAND}
          </>
        }
        subtitle={INTRO}
      />

      <div className="mb-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        <SeatsField seats={seats} onChange={setSeats} />
        <RadioChoice
          label={`${LOOM_BRAND} plan`}
          value={plan}
          options={LOOM_PLANS.map((p) => ({ key: p.id, label: p.label }))}
          onChange={setPlan}
        />
      </div>
      <PriceBreakdown plan={plan} seats={seats} className="mx-auto max-w-3xl" />

      <div className="mt-24">
        <SectionHeading title="Feature by feature" />
        <ComparisonTable />
        <p className="mt-4 text-sm text-fg-muted">
          {LOOM_BRAND} prices are monthly billing from{" "}
          <a
            href={LOOM_PRICING_URL}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            loom.com/pricing
          </a>
          , checked {LOOM_PRICES_CHECKED}. Annual billing is about 17% less.{" "}
          {`${LOOM_BRAND} is a trademark of its owner; ${PRODUCT_NAME} isn’t affiliated with it.`}
        </p>
      </div>

      <div className="mt-24 grid gap-4 md:grid-cols-2">
        <FitCard
          title={`${LOOM_BRAND} is the better fit if`}
          items={LOOM_FITS}
        />
        <FitCard
          title={`${PRODUCT_NAME} is the better fit if`}
          items={CAPTUREFLOW_FITS}
          isHighlighted
        />
      </div>
    </MarketingSection>
  );
}

function ComparisonTable() {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-panel">
      <div className="overflow-x-auto">
        <div className={cn("grid min-w-120", GRID)}>
          <div className="px-6 py-3" />
          <div className="flex items-center justify-center border-l border-line px-2 py-2 text-center text-[15px] font-semibold text-fg-muted">
            {LOOM_BRAND}
          </div>
          <div
            className={cn(
              "flex items-center justify-center border-l border-line px-2 py-2 text-center text-[15px] font-semibold text-fg",
              OURS_BG,
            )}
          >
            <OursChip>{PRODUCT_NAME}</OursChip>
          </div>
          {ROWS.map((row) => (
            <div key={row.label} className={cn("col-span-3 grid", GRID)}>
              <div className="border-t border-line px-6 py-3.5 text-[15px] text-fg">
                {row.label}
              </div>
              <CompareCell value={row.loom} className="text-fg-muted" />
              <CompareCell value={row.captureflow} ours />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FitCard({
  title,
  items,
  isHighlighted,
}: {
  title: string;
  items: string[];
  isHighlighted?: boolean;
}) {
  const card = (
    <div
      className={cn(
        "h-full p-6 text-fg sm:p-8",
        isHighlighted
          ? "rounded-[26px] bg-[color-mix(in_oklab,var(--accent)_8%,var(--cf-panel))]"
          : "rounded-[28px] border border-line bg-panel",
      )}
    >
      <h3 className="text-xl font-bold tracking-[-0.02em]">{title}</h3>
      <ul className="mt-4 grid list-none gap-3">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-[15px] leading-6">
            <Check size={18} className="mt-0.5 shrink-0 text-fg-muted" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
  if (!isHighlighted) return card;
  return (
    <div className={cn("rounded-[28px] p-0.5", GRADIENT_BORDER)}>{card}</div>
  );
}

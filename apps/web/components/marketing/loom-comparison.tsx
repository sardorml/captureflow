"use client";

import { useState } from "react";
import { Check, Minus } from "lucide-react";
import { Label, Slider } from "@heroui/react";
import {
  CAPTUREFLOW_PER_SEAT,
  LOOM_PLANS,
  LOOM_PRICES_CHECKED,
  LOOM_PRICING_URL,
  type LoomPlan,
} from "@/lib/marketing/loom-comparison";
import { cn } from "@/lib/utils";
import {
  MarketingSection,
  SECTION_SUBTITLE_STYLE,
  SECTION_TITLE_STYLE,
} from "./_shared";
import { Paragraph, Title } from "./typography";
import { PriceBreakdown } from "./price-breakdown";

type Cell = boolean | string;

const ROWS: ReadonlyArray<{ label: string; loom: Cell; captureflow: Cell }> = [
  {
    label: "Pricing",
    loom: "Per person, $18–24 a month each",
    captureflow: `$${CAPTUREFLOW_PER_SEAT} a month per member, viewers free`,
  },
  {
    label: "Free plan",
    loom: "25 videos per person, 5 minutes each",
    captureflow: "25 recordings per person, 5 minutes each, free viewers",
  },
  {
    label: "Self-host on your own cloud",
    loom: false,
    captureflow: "Yes, on your Cloudflare account",
  },
  { label: "Open source", loom: false, captureflow: "Yes, AGPL" },
  { label: "Instant share link", loom: true, captureflow: true },
  { label: "Camera bubble", loom: true, captureflow: true },
  { label: "Comments and emoji reactions", loom: true, captureflow: true },
  { label: "View counts", loom: true, captureflow: true },
  {
    label: "Editing",
    loom: "Trim, stitch, transcript editing",
    captureflow: "Backgrounds, camera layout, mute, cut from the transcript",
  },
  {
    label: "Annotated screenshots",
    loom: false,
    captureflow: "Arrows, text and blur, shared as a link",
  },
  {
    label: "Transcripts and captions",
    loom: true,
    captureflow:
      "Yes, free, made with Whisper on the instance's own Cloudflare account",
  },
  {
    label: "AI titles, summaries, chapters",
    loom: "On Business + AI",
    captureflow: "Not yet, chapters are manual",
  },
  {
    label: "Apps",
    loom: "Chrome, Mac, Windows, iOS, Android",
    captureflow: "Chrome now, macOS coming soon",
  },
  { label: "Enterprise SSO", loom: true, captureflow: false },
  {
    label: "How long videos are kept",
    loom: "Until you delete them",
    captureflow:
      "Paid: until you delete them. Free: 30 days after the last view. Self-hosted: you decide",
  },
];

const INTRO =
  "**Loom** and **CaptureFlow** are both video messaging tools. You record your screen and camera, share a link, and your team watches when it suits them, instead of sitting through another meeting or reading a long thread. They differ in how they charge. Loom bills for each person on your team, while CaptureFlow bills for the storage you use, and it's free if you run it yourself.";

const LOOM_FITS = [
  "You want AI titles and summaries today.",
  "You need Windows or mobile apps.",
  "Your company requires SSO and an uptime SLA.",
];

const CAPTUREFLOW_FITS = [
  "You're paying per seat for a team that mostly records quick walkthroughs and bug reports.",
  "You want recordings in storage you own, or need to self-host.",
  "You'd rather read the code that handles your videos.",
];

export function LoomComparison() {
  return (
    <MarketingSection id="compare">
      <div className="mx-auto max-w-4xl text-center">
        <Title
          level={1}
          className="sm:whitespace-nowrap"
          align="center"
          style={{
            ...SECTION_TITLE_STYLE,
            fontSize: "clamp(2.5rem, 1.25rem + 4.5vw, 4.5rem)",
            lineHeight: 1.1,
          }}
        >
          <span className="inline-block -rotate-1 rounded-2xl bg-accent-bg px-4 pb-1 text-white">
            CaptureFlow
          </span>{" "}
          <span className="text-fg-muted">vs</span>{" "}
          <span className="inline-block rotate-1 rounded-2xl bg-fg px-4 pb-1 text-canvas">
            Loom
          </span>
        </Title>
        <Paragraph
          align="center"
          style={{
            ...SECTION_SUBTITLE_STYLE,
            fontSize: 20,
            marginTop: 28,
            maxWidth: 720,
            marginInline: "auto",
          }}
        >
          {INTRO.split("**").map((part, i) =>
            i % 2 ? (
              <strong key={i} className="font-semibold text-fg">
                {part}
              </strong>
            ) : (
              part
            ),
          )}
        </Paragraph>
      </div>

      <SavingsCalculator />

      <div className="mt-20">
        <Title level={2} style={{ ...SECTION_TITLE_STYLE, fontSize: 32 }}>
          Feature by feature
        </Title>
        <ComparisonTable />
        <p className="mt-4 text-sm text-fg-muted">
          Loom prices are monthly billing from{" "}
          <a
            href={LOOM_PRICING_URL}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            loom.com/pricing
          </a>
          , checked {LOOM_PRICES_CHECKED}. Annual billing is about 17% less.
          Loom is a trademark of its owner; CaptureFlow isn&apos;t affiliated
          with it.
        </p>
      </div>

      <div className="mt-20 grid gap-4 md:grid-cols-2">
        <FitCard title="Loom is the better fit if" items={LOOM_FITS} />
        <FitCard
          title="CaptureFlow is the better fit if"
          items={CAPTUREFLOW_FITS}
          isHighlighted
        />
      </div>
    </MarketingSection>
  );
}

function SavingsCalculator() {
  const [seats, setSeats] = useState(10);
  const [plan, setPlan] = useState<LoomPlan>("business");

  return (
    <div className="mx-auto mt-12 max-w-3xl rounded-2xl bg-panel p-2">
      <div className="rounded-xl bg-canvas p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-fg">Compare with Loom</span>
          <div
            role="radiogroup"
            aria-label="Loom plan"
            className="flex items-center gap-0.5 rounded-full bg-tint p-0.5"
          >
            {LOOM_PLANS.map((p) => {
              const isOn = p.id === plan;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={isOn}
                  onClick={() => setPlan(p.id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    isOn ? "bg-fg text-canvas" : "text-fg-muted hover:text-fg",
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <Slider
          className="mt-6"
          minValue={1}
          maxValue={50}
          value={seats}
          onChange={(v) => setSeats(Array.isArray(v) ? v[0]! : v)}
        >
          <div className="flex items-center justify-between">
            <Label>Team size</Label>
            <Slider.Output>
              {seats} {seats === 1 ? "person" : "people"}
            </Slider.Output>
          </div>
          <Slider.Track>
            <Slider.Fill />
            <Slider.Thumb />
          </Slider.Track>
        </Slider>

        <div className="mt-6">
          <PriceBreakdown plan={plan} seats={seats} className="px-0 pb-0" />
        </div>
        <p className="mt-4 text-sm text-fg-muted">
          Only the people who record are members; everyone who watches and
          comments is free. Self-hosted, it&apos;s $0 and you pay Cloudflare
          directly, often nothing on their free tiers.
        </p>
      </div>
    </div>
  );
}

function ComparisonTable() {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl bg-panel">
      <div className="grid grid-cols-[1.1fr_1fr_1fr] gap-3 px-4 py-3 text-xs font-semibold tracking-wide text-fg-muted uppercase sm:px-6">
        <span />
        <span>Loom</span>
        <span className="text-fg">CaptureFlow</span>
      </div>
      {ROWS.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[1.1fr_1fr_1fr] gap-3 border-t border-line px-4 py-3.5 text-sm sm:px-6"
        >
          <span className="font-medium text-fg">{row.label}</span>
          <CellValue value={row.loom} />
          <CellValue value={row.captureflow} />
        </div>
      ))}
    </div>
  );
}

function CellValue({ value }: { value: Cell }) {
  if (value === true)
    return <Check size={18} className="text-success" aria-label="Yes" />;
  if (value === false)
    return <Minus size={18} className="text-fg-subtle" aria-label="No" />;
  return <span className="text-fg-muted">{value}</span>;
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
  return (
    <div
      className={cn(
        "rounded-2xl p-6",
        isHighlighted ? "bg-accent-bg text-white" : "bg-panel",
      )}
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <ul className="mt-4 grid gap-3">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-[15px] leading-6">
            <Check
              size={18}
              className={cn(
                "mt-0.5 shrink-0",
                isHighlighted ? "text-white" : "text-fg-muted",
              )}
            />
            <span className={isHighlighted ? "text-white/90" : "text-fg-muted"}>
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

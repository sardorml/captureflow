"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Typography } from "@heroui/react";
import { MarketingSection, SectionHeading, type SectionProps } from "./_shared";
import { useMessages } from "./i18n-provider";

type CardKey = "engineering" | "design" | "support" | "updates";

const CARDS = [
  { key: "engineering" },
  { key: "design" },
  { key: "support" },
  { key: "updates" },
] as const satisfies readonly { key: CardKey }[];

const AVATAR_SRC = "/avatar-presenter.webp";

/*
 * Scenes are laid out in pixels against this landscape box and scaled as one to
 * the card's width, so a narrow card shrinks the picture instead of squeezing it
 * into a portrait.
 */
const SCENE_WIDTH = 360;
const SCENE_HEIGHT = 270;

const SYNTAX = {
  keyword: "text-[#c792ea]",
  call: "text-[#82aaff]",
} as const;

const CHART_BARS = [34, 48, 40, 58, 52, 70, 96] as const;

// The device window every scene but support sits in, bleeding off the bottom.
const SCREEN =
  "absolute inset-x-[22px] top-[26px] bottom-0 overflow-hidden rounded-t-[14px] shadow-[0_20px_40px_rgb(0_0_0/0.5)]";

function Presenter({
  backdrop,
  className,
}: {
  backdrop: string;
  className: string;
}) {
  return (
    <div
      className={`absolute size-[84px] overflow-hidden rounded-full shadow-[0_0_0_4px_#fff,0_18px_40px_rgb(0_0_0/0.5)] ${className}`}
      style={{ backgroundColor: backdrop }}
    >
      <img src={AVATAR_SRC} alt="" className="block size-full object-cover" />
    </div>
  );
}

// The recorder's control bar: stop, running time, pause, discard.
function ControlPill({ time }: { time: string }) {
  return (
    <div className="absolute bottom-[18px] left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-white py-2 pr-3.5 pl-2.5 font-mono text-[13px] leading-none font-semibold text-[#111] shadow-[0_12px_30px_rgb(0_0_0/0.45)]">
      <span className="flex size-[22px] items-center justify-center rounded-full bg-[#ef4444]">
        <span className="size-2 rounded-[2px] bg-white" />
      </span>
      {time}
      <span className="h-3.5 w-px bg-[#e4e4e7]" />
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
        <rect x="3" y="2" width="3" height="10" rx="1" fill="#3f3f46" />
        <rect x="8" y="2" width="3" height="10" rx="1" fill="#3f3f46" />
      </svg>
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
        <path
          d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"
          fill="none"
          stroke="#3f3f46"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function CodeLine({
  n,
  tone,
  children,
}: {
  n: number;
  tone?: "removed" | "added";
  children: ReactNode;
}) {
  const row =
    tone === "removed"
      ? "bg-[rgb(239_68_68/0.14)] text-[#f87171]"
      : tone === "added"
        ? "bg-[rgb(34_197_94/0.14)] text-[#4ade80]"
        : "";
  return (
    <div className={row}>
      <span
        className={`mr-3 inline-block w-[34px] text-right ${tone ? "" : "text-[#55555e]"}`}
      >
        {n}
      </span>
      {children}
    </div>
  );
}

function EngineeringScene({ file, pr }: { file: string; pr: string }) {
  return (
    <>
      <div className={`${SCREEN} bg-[#0d0d12] ring-1 ring-white/[0.08]`}>
        <div className="flex h-8 items-center gap-2 border-b border-white/[0.06] px-3 font-mono text-[11px] leading-none font-medium text-[#8b8b95]">
          <span className="size-2 rounded-full bg-[#3a3a44]" />
          <span className="size-2 rounded-full bg-[#3a3a44]" />
          <span className="size-2 rounded-full bg-[#3a3a44]" />
          <span className="ml-2 text-[#c9c9d1]">{file}</span>
          <span className="text-[#a78bfa]">{pr}</span>
        </div>
        <div className="py-2.5 font-mono text-[11.5px] leading-[1.75] font-medium whitespace-pre text-[#c9c9d1]">
          <CodeLine n={41}>
            <span className={SYNTAX.keyword}>export async function</span>{" "}
            <span className={SYNTAX.call}>applyPromo</span>(cart) {"{"}
          </CodeLine>
          <CodeLine n={42}>
            {"  "}
            <span className={SYNTAX.keyword}>const</span> code =
            cart.promo?.trim()
          </CodeLine>
          <CodeLine n={43} tone="removed">
            - if (code) return cart
          </CodeLine>
          <CodeLine n={43} tone="added">
            + if (!code) return cart
          </CodeLine>
          <CodeLine n={44}>
            {"  "}
            <span className={SYNTAX.keyword}>const</span> rule ={" "}
            <span className={SYNTAX.keyword}>await</span>{" "}
            <span className={SYNTAX.call}>lookup</span>(code)
          </CodeLine>
          <CodeLine n={45}>
            {"  "}
            <span className={SYNTAX.keyword}>return</span> {"{"} ...cart, total:
            rule.<span className={SYNTAX.call}>apply</span>(cart.total) {"}"}
          </CodeLine>
          <CodeLine n={46}>{"}"}</CodeLine>
        </div>
      </div>
      <Presenter backdrop="#3a3150" className="right-4 bottom-[60px]" />
      <ControlPill time="1:26" />
    </>
  );
}

function DesignScene({
  cardTitle,
  comment,
}: {
  cardTitle: string;
  comment: string;
}) {
  return (
    <>
      <div className={`${SCREEN} bg-[#141418]`}>
        <div className="absolute top-0 left-1/2 -ml-[145px] h-full w-[290px]">
          <div className="absolute top-[18px] left-8 flex h-[180px] w-[116px] flex-col overflow-hidden rounded-xl bg-[#232329] shadow-[0_2px_6px_rgb(0_0_0/0.3)]">
            <div className="m-2 mb-0 h-[68px] rounded-lg bg-white/[0.06]" />
            <div className="flex flex-1 flex-col gap-1.5 p-2.5">
              <div className="text-[11px] leading-[1.1] font-bold text-[#f4f4f5]">
                {cardTitle}
              </div>
              <div className="h-[5px] rounded-[3px] bg-white/10" />
              <div className="h-[5px] w-[70%] rounded-[3px] bg-white/10" />
              <div className="mt-1 flex gap-1">
                <span className="h-3.5 w-9 rounded-full bg-white/[0.08]" />
                <span className="h-3.5 w-7 rounded-full bg-white/[0.08]" />
              </div>
              <div className="mt-auto h-[22px] rounded-full bg-[#f4f4f5]" />
            </div>
          </div>
          <div className="absolute top-3.5 left-7 h-[188px] w-[124px] rounded-[14px] shadow-[0_0_0_2px_#0d99ff]" />
          <div className="absolute top-[40px] left-[164px] flex items-center gap-1.5 rounded-[10px_10px_10px_2px] bg-white px-2 py-1.5 text-[10px] leading-none font-semibold whitespace-nowrap text-[#18181b] shadow-[0_6px_14px_rgb(0_0_0/0.15)]">
            <span className="size-4 rounded-full bg-[#14b8a6] text-center text-[8px] leading-4 font-bold text-white">
              MR
            </span>
            {comment}
          </div>
        </div>
      </div>
      <Presenter backdrop="#123a36" className="right-4 bottom-[60px]" />
      <ControlPill time="0:39" />
    </>
  );
}

function SupportScene({
  question,
  reply,
  link,
  resolved,
}: {
  question: string;
  reply: string;
  link: string;
  resolved: string;
}) {
  return (
    <>
      <div className="absolute top-4 right-[18px] left-14 rounded-[16px_16px_4px_16px] bg-white px-3 py-2.5 text-[13px] leading-[1.4] font-medium text-[#18181b] shadow-[0_12px_30px_rgb(0_0_0/0.35)]">
        {question}
      </div>
      <div className="absolute top-[82px] right-[30px] left-[18px] flex flex-col gap-2.5 rounded-[16px_16px_16px_4px] bg-[#0b1730] px-3 pt-2.5 pb-3 shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_30px_rgb(0_0_0/0.35)]">
        <div className="text-[13px] leading-[1.4] font-medium text-[#e4e4e7]">
          {reply}
          <br />
          <span className="font-mono text-[12px] text-[#60a5fa]">{link}</span>
        </div>
        <div className="relative h-[62px] overflow-hidden rounded-[10px] bg-[#e9e9ec]">
          <div className="absolute inset-y-0 left-0 w-11 border-r border-[#e1e1e5] bg-white" />
          <div className="absolute top-3 left-14 h-2 w-[90px] rounded bg-[#18181b]" />
          <div className="absolute top-7 right-3 left-14 h-6 rounded-md bg-white" />
          <div className="absolute top-[58px] left-14 h-6 w-[72px] rounded-md bg-[#1463ff]" />
          <div className="absolute top-1/2 left-1/2 -mt-[18px] -ml-[18px] flex size-9 items-center justify-center rounded-full bg-[rgb(17_17_17/0.85)]">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
              <path d="M4 2.5 L11.5 7 L4 11.5 Z" fill="#fff" />
            </svg>
          </div>
          <div className="absolute right-2 bottom-2 size-[34px] overflow-hidden rounded-full shadow-[0_0_0_2px_#fff]">
            <img src={AVATAR_SRC} alt="" className="size-full object-cover" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-3 left-[22px] flex items-center gap-2 rounded-full bg-white/10 py-[7px] pr-3 pl-2 text-[12px] leading-none font-medium text-[#dbe6ff]">
        <span className="flex size-[18px] items-center justify-center rounded-full bg-[#22c55e]">
          <svg width="10" height="10" viewBox="0 0 22 22" aria-hidden>
            <path
              d="M5 11.5 L9.2 15.5 L17 7"
              fill="none"
              stroke="#fff"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {resolved}
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  note,
  noteClass,
}: {
  label: string;
  value: string;
  note: string;
  noteClass: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[10px] bg-[#f4f4f5] p-2.5">
      <div className="text-[10px] leading-none font-medium text-[#71717a]">
        {label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[18px] leading-none font-bold tracking-[-0.02em]">
          {value}
        </span>
        <span className={`text-[10px] leading-none font-semibold ${noteClass}`}>
          {note}
        </span>
      </div>
    </div>
  );
}

function UpdatesScene({
  title,
  range,
  signups,
  shipped,
  features,
}: {
  title: string;
  range: string;
  signups: string;
  shipped: string;
  features: string;
}) {
  return (
    <>
      <div
        className={`${SCREEN} flex flex-col gap-3 bg-white p-4 text-[#18181b]`}
      >
        <div className="flex min-w-0 items-center justify-between gap-2.5">
          <div className="min-w-0 truncate text-[13px] leading-none font-bold">
            {title}
          </div>
          <div className="flex-none text-[11px] leading-none font-medium text-[#71717a]">
            {range}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat
            label={signups}
            value="2,418"
            note="+18%"
            noteClass="text-[#0d9488]"
          />
          <Stat
            label={shipped}
            value="7"
            note={features}
            noteClass="text-[#71717a]"
          />
        </div>
        <div className="flex h-[76px] items-end gap-[7px] pt-1">
          {CHART_BARS.map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t ${i === CHART_BARS.length - 1 ? "bg-[#14b8a6]" : "bg-[#d4d4d8]"}`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
      <Presenter backdrop="#1b4a44" className="bottom-[60px] left-10" />
      <ControlPill time="2:04" />
    </>
  );
}

function ScaledScene({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / SCENE_WIDTH);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden"
      style={{ aspectRatio: `${SCENE_WIDTH} / ${SCENE_HEIGHT}` }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width: SCENE_WIDTH,
          height: SCENE_HEIGHT,
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function UseCaseCard({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-[28px] bg-panel-2 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_24px_60px_rgb(0_0_0/0.4)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <ScaledScene>{children}</ScaledScene>
      <div className="flex flex-col gap-2.5 px-7 pt-7 pb-8">
        <Typography.Heading
          level={3}
          style={{
            fontSize: 26,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            margin: 0,
          }}
        >
          {title}
        </Typography.Heading>
        <Typography.Paragraph
          color="muted"
          style={{ fontSize: 17, lineHeight: 1.5, margin: 0 }}
        >
          {body}
        </Typography.Paragraph>
      </div>
    </article>
  );
}

export function UseCasesSection({ headingLevel = 2 }: SectionProps = {}) {
  const m = useMessages();
  const copy = m.useCases;

  const scenes: Record<CardKey, ReactNode> = {
    engineering: (
      <EngineeringScene file={copy.engineeringFile} pr={copy.engineeringPr} />
    ),
    design: (
      <DesignScene
        cardTitle={copy.designCardTitle}
        comment={copy.designComment}
      />
    ),
    support: (
      <SupportScene
        question={copy.supportQuestion}
        reply={copy.supportReply}
        link={copy.supportLink}
        resolved={copy.supportResolved}
      />
    ),
    updates: (
      <UpdatesScene
        title={copy.updatesTitle}
        range={copy.updatesRange}
        signups={copy.updatesSignups}
        shipped={copy.updatesShipped}
        features={copy.updatesFeatures}
      />
    ),
  };

  return (
    <MarketingSection
      id="use-cases"
      // Wider than the 1024 rail so four cards fit in one row.
      style={{ maxWidth: 1328 }}
    >
      <SectionHeading title={copy.heading} level={headingLevel} />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {CARDS.map((card) => (
          <UseCaseCard
            key={card.key}
            title={copy.cards[card.key].title}
            body={copy.cards[card.key].body}
          >
            {scenes[card.key]}
          </UseCaseCard>
        ))}
      </div>
    </MarketingSection>
  );
}

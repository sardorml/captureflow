"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Typography } from "@heroui/react";
import { cn } from "@/lib/utils";
import { MarketingSection, SectionHeading, type SectionProps } from "./_shared";
import { CARD_SURFACE } from "./tokens";
import { useMessages } from "./i18n-provider";

type CardKey = "engineering" | "design" | "support" | "updates";

const CARDS: readonly CardKey[] = [
  "design",
  "engineering",
  "support",
  "updates",
];

/*
 * Scenes are laid out in pixels against this landscape box and scaled as one to
 * the card's width, so a narrow card shrinks the picture instead of squeezing it
 * into a portrait.
 */
const SCENE_WIDTH = 547;
const SCENE_HEIGHT = 360;

const CHART_BARS = [34, 48, 40, 58, 70, 96] as const;

// The window every scene but support sits in, bleeding off the bottom.
const WINDOW =
  "absolute inset-x-9 top-10 -bottom-6 overflow-hidden rounded-[22px] text-[#181818]";

function Presenter({ photo }: { photo: string }) {
  return (
    <div className="absolute right-6 bottom-6 size-[140px] overflow-hidden rounded-full shadow-[0_0_0_5px_#fff]">
      <img
        src={photo}
        alt=""
        width={320}
        height={320}
        loading="lazy"
        className="block size-full object-cover"
      />
    </div>
  );
}

function WindowBar({
  name,
  badge,
  barClass,
  badgeClass,
  nameClass = "text-[#444444]",
}: {
  name: string;
  badge: string;
  barClass: string;
  badgeClass: string;
  nameClass?: string;
}) {
  return (
    <div
      className={`flex h-[42px] items-center gap-2 px-[18px] font-mono text-[13px] leading-none font-medium whitespace-nowrap ${barClass}`}
    >
      <span className="size-2.5 rounded-full bg-[#ff5f57]" />
      <span className="size-2.5 rounded-full bg-[#febc2e]" />
      <span className="size-2.5 rounded-full bg-[#28c840]" />
      <span className={`ml-2.5 ${nameClass}`}>{name}</span>
      <span
        className={`rounded-full px-[9px] py-[5px] font-sans text-[12px] font-semibold ${badgeClass}`}
      >
        {badge}
      </span>
    </div>
  );
}

function Initials({ children, size }: { children: string; size: number }) {
  return (
    <span
      className="flex flex-none items-center justify-center rounded-full bg-[#f59e0b] font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {children}
    </span>
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
      ? "bg-[rgb(239_68_68/0.16)] text-[#fca5a5]"
      : tone === "added"
        ? "bg-[rgb(96_165_250/0.18)] text-[#93c5fd]"
        : "";
  return (
    <div className={row}>
      <span
        className={`mr-4 inline-block w-11 text-right ${tone ? "" : "text-[#727272]"}`}
      >
        {n}
      </span>
      {children}
    </div>
  );
}

const KEYWORD = "text-[#c4a7ff]";

function EngineeringScene({ file, pr }: { file: string; pr: string }) {
  return (
    <div className="absolute inset-0">
      <div className={`${WINDOW} bg-[#1b2233]`}>
        <WindowBar
          name={file}
          badge={pr}
          barClass="bg-[#161c2a]"
          badgeClass="bg-[rgb(96_165_250/0.18)] text-[#93c5fd]"
          nameClass="text-[#c7d2ee]"
        />
        <div className="py-4 font-mono text-[14px] leading-[1.8] font-medium whitespace-pre text-[#dbe3f7]">
          <CodeLine n={41}>
            <span className={KEYWORD}>export async function</span>{" "}
            <span className="text-[#8fb4ff]">applyPromo</span>(cart) {"{"}
          </CodeLine>
          <CodeLine n={42}>
            {"  "}
            <span className={KEYWORD}>const</span> code = cart.promo?.trim()
          </CodeLine>
          <CodeLine n={43} tone="removed">
            - if (code) return cart
          </CodeLine>
          <CodeLine n={43} tone="added">
            + if (!code) return cart
          </CodeLine>
          <CodeLine n={44}>
            {"  "}
            <span className={KEYWORD}>const</span> rule ={" "}
            <span className={KEYWORD}>await</span> lookup(code)
          </CodeLine>
        </div>
      </div>
      <div className="absolute bottom-[30px] left-14 flex items-center gap-2.5 rounded-full bg-white py-2.5 pr-4 pl-2.5 font-mono text-[15px] leading-none font-semibold text-[#181818]">
        <span className="flex size-7 items-center justify-center rounded-full bg-[#ef4444]">
          <span className="size-2.5 rounded-[2px] bg-white" />
        </span>
        1:26
      </div>
      <Presenter photo="/presenter-engineering.webp" />
    </div>
  );
}

function DesignScene({
  app,
  badge,
  cardTitle,
  colors,
  comment,
}: {
  app: string;
  badge: string;
  cardTitle: string;
  colors: string;
  comment: string;
}) {
  return (
    <div className="absolute inset-0">
      <div className={`${WINDOW} bg-[#f5f5f5] ring-1 ring-black/5`}>
        <WindowBar
          name={app}
          badge={badge}
          barClass="bg-[#eaeaea]"
          badgeClass="bg-[#f3e8ff] text-[#7c3aed]"
        />
        <div className="absolute top-[62px] left-1/2 -ml-[150px] flex h-[250px] w-[170px] flex-col overflow-hidden rounded-[18px] bg-white">
          <div className="h-[100px] bg-[#b9dcff]" />
          <div className="flex flex-col gap-2 p-3.5">
            <div className="text-[15px] leading-[1.1] font-bold">
              {cardTitle}
            </div>
            <div className="h-[7px] rounded bg-[#e4e4e4]" />
            <div className="h-[7px] w-[70%] rounded bg-[#e4e4e4]" />
            <div className="mt-2 h-[30px] rounded-full bg-[#1184f7]" />
          </div>
        </div>
        <div className="absolute top-14 left-1/2 -ml-[156px] h-[262px] w-[182px] rounded-[22px] shadow-[0_0_0_2.5px_#7c3aed]" />
        <div className="absolute top-[84px] left-1/2 ml-11 flex w-[150px] flex-col gap-2.5 rounded-2xl bg-white p-3.5">
          <div className="text-[13px] leading-none font-bold">{colors}</div>
          <div className="flex gap-[7px]">
            <span className="size-6 rounded-[7px] bg-[#1184f7]" />
            <span className="size-6 rounded-[7px] bg-[#181818]" />
            <span className="size-6 rounded-[7px] bg-[#b9dcff]" />
          </div>
        </div>
      </div>
      <div className="absolute top-[228px] left-1/2 -ml-[48px] flex items-center gap-[9px] rounded-[16px_16px_16px_4px] bg-white py-2.5 pr-3.5 pl-2.5 text-[15px] leading-none font-semibold whitespace-nowrap text-[#181818]">
        <Initials size={26}>MR</Initials>
        {comment}
      </div>
      <Presenter photo="/presenter-support.webp" />
    </div>
  );
}

function SupportScene({
  question,
  reply,
  link,
}: {
  question: string;
  reply: string;
  link: string;
}) {
  return (
    <div className="absolute inset-0">
      <div className="absolute top-10 left-9 flex max-w-[calc(100%-72px)] items-end gap-3">
        <Initials size={40}>DK</Initials>
        <div className="rounded-[22px_22px_22px_6px] bg-white px-[22px] py-[18px] text-[19px] leading-[1.35] font-medium text-[#7c3aed]">
          {question}
        </div>
      </div>
      <div className="absolute top-[150px] right-9 -bottom-6 left-[88px] flex flex-col gap-4 rounded-3xl bg-[#3b2a4f] px-6 py-[22px]">
        <div className="text-[18px] leading-[1.4] font-medium text-white">
          {reply}
          <br />
          <span className="font-mono text-[16px] text-[#b89cf5]">{link}</span>
        </div>
        <div className="relative flex-1 overflow-hidden rounded-[14px] bg-[linear-gradient(135deg,#6d4fb3,#4c2f5c_55%,#7a2a3a)]">
          <img
            src="/presenter-design.webp"
            alt=""
            width={320}
            height={320}
            loading="lazy"
            className="absolute -bottom-[34px] left-[18px] size-[120px] rounded-full object-cover shadow-[0_0_0_4px_#fff]"
          />
          <div className="absolute right-[18px] bottom-4 left-[156px] h-2 rounded bg-white/35">
            <div className="h-full w-[38%] rounded bg-white" />
          </div>
        </div>
      </div>
    </div>
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
    <div className="flex flex-col gap-2 rounded-[14px] bg-[#f5f5f5] p-3.5">
      <div className="text-[13px] leading-none font-medium text-[#727272]">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[24px] leading-none font-bold tracking-[-0.02em]">
          {value}
        </span>
        <span className={`text-[13px] leading-none font-semibold ${noteClass}`}>
          {note}
        </span>
      </div>
    </div>
  );
}

function Reaction({ children }: { children: string }) {
  return (
    <span className="flex size-[46px] items-center justify-center rounded-full bg-white text-[24px] leading-none">
      {children}
    </span>
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
    <div className="absolute inset-0">
      <div
        className={`${WINDOW} flex flex-col gap-[18px] rounded-3xl bg-white px-[26px] py-6 ring-1 ring-black/5`}
      >
        <div className="flex items-center justify-between">
          <div className="text-[20px] leading-none font-bold tracking-[-0.02em]">
            {title}
          </div>
          <span className="rounded-full bg-[#fff1e3] px-2.5 py-1.5 text-[13px] leading-none font-semibold text-[#c2410c]">
            {range}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 pr-[110px]">
          <Stat
            label={signups}
            value="2,418"
            note="+18%"
            noteClass="text-[#1184f7]"
          />
          <Stat
            label={shipped}
            value="7"
            note={features}
            noteClass="text-[#727272]"
          />
        </div>
        <div className="flex flex-1 items-end gap-2.5 pr-[130px]">
          {CHART_BARS.map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t-md ${i === CHART_BARS.length - 1 ? "bg-[#1184f7]" : "bg-[#e5e5e5]"}`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
      <div className="absolute top-[22px] right-[150px] flex gap-2">
        <Reaction>🔥</Reaction>
        <Reaction>👏</Reaction>
      </div>
      <Presenter photo="/presenter-updates.webp" />
    </div>
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

// Each card's title sits on its own highlight, in the scene's accent.
const TITLE_TONES: Record<CardKey, string> = {
  design:
    "bg-[#ede9fe] text-[#6d28d9] dark:bg-[#6d28d9]/35 dark:text-[#ddd6fe]",
  engineering:
    "bg-[#dbeafe] text-[#1d4ed8] dark:bg-[#1d4ed8]/35 dark:text-[#bfdbfe]",
  support:
    "bg-[#ccfbf1] text-[#0f766e] dark:bg-[#0f766e]/35 dark:text-[#99f6e4]",
  updates:
    "bg-[#fef3c7] text-[#b45309] dark:bg-[#b45309]/35 dark:text-[#fde68a]",
};

function UseCaseCard({
  tone,
  title,
  body,
  children,
}: {
  tone: CardKey;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <article
      className={cn(
        CARD_SURFACE,
        "flex min-w-0 flex-col overflow-hidden rounded-[28px] transition-transform duration-300 ease-out hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
      )}
    >
      <ScaledScene>{children}</ScaledScene>
      <div className="flex flex-col items-start gap-2.5 px-7 pt-7 pb-8">
        <h3
          className={cn(
            TITLE_TONES[tone],
            "-ml-2 inline-block rounded-md px-2 py-1 text-[24px] leading-tight font-bold tracking-[-0.03em]",
          )}
        >
          {title}
        </h3>
        <Typography.Paragraph
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
        app={copy.designApp}
        badge={copy.designBadge}
        cardTitle={copy.designCardTitle}
        colors={copy.designColors}
        comment={copy.designComment}
      />
    ),
    support: (
      <SupportScene
        question={copy.supportQuestion}
        reply={copy.supportReply}
        link={copy.supportLink}
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
        {CARDS.map((key) => (
          <UseCaseCard
            key={key}
            tone={key}
            title={copy.cards[key].title}
            body={copy.cards[key].body}
          >
            {scenes[key]}
          </UseCaseCard>
        ))}
      </div>
    </MarketingSection>
  );
}

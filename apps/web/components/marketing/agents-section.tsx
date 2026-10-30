"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUp,
  Check,
  ChevronDown,
  GitPullRequest,
  Hash,
  Loader2,
  Mic,
  Play,
  Plus,
} from "lucide-react";
import { AppIcon } from "@/components/brand-mark";
import { cn } from "@/lib/utils";
import { MarketingSection, SectionHeading, type SectionProps } from "./_shared";
import { useMessages } from "./i18n-provider";
import { McpConnectDetails } from "./mcp-connect";
import { CARD_SURFACE } from "./tokens";
import { useLoopClock, useOnScreen, useReducedMotion } from "./modes-intro";
import { ClaudeLogo, CursorLogo, OpenAILogo } from "./platform-logos";

/*
 * One request in an agent's chat: record a demo of a feature, attach it to the
 * pull request and post the link in Slack. The agent reports each step as it
 * goes, with a small preview of what the step made, then replies with the
 * link. One clock drives it over a sixteen-second loop; reduced motion holds
 * the finished frame.
 */
const LOOP_S = 16;
const REST_T = 0.97;
const TYPE = [0.4, 4] as const;
const SEND = 4.3;
const STEP_AT = [4.6, 7.4, 10];
const STEP_DONE = [7.2, 9.8, 12];
const REPLY = 13.4;
const LINK = "captureflow.dev/r/k3J9xQ";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function Pill({
  children,
  ghost,
  className,
}: {
  children: ReactNode;
  ghost?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex h-9 items-center gap-1.5 rounded-full px-3 text-[14px] font-medium text-fg",
        !ghost && "border border-line bg-tint",
        className,
      )}
    >
      {children}
    </span>
  );
}

// The feature on camera, small: a reports page with the new export button.
function VideoThumb() {
  const copy = useMessages().agents.video;
  return (
    <span className="relative flex h-[63px] w-28 shrink-0 overflow-hidden rounded-md border border-black/10 bg-white text-[#111]">
      <span className="flex w-[22%] flex-col gap-1 border-r border-black/5 bg-[#f7f7f8] p-1">
        {[0, 1, 2].map((r) => (
          <span key={r} className="h-[3px] rounded bg-black/10" />
        ))}
      </span>
      <span className="flex flex-1 flex-col gap-1 p-1.5">
        <span className="flex items-center justify-between">
          <span className="text-[7px] font-semibold">{copy.page}</span>
          <span className="rounded-sm bg-[#2563eb] px-1 text-[5px] text-white">
            {copy.button}
          </span>
        </span>
        {[0, 1, 2, 3].map((r) => (
          <span key={r} className="h-[3px] rounded bg-black/8" />
        ))}
      </span>
      <span className="absolute inset-0 flex items-center justify-center bg-black/10">
        <span className="flex size-5 items-center justify-center rounded-full bg-[#2563eb] text-white">
          <Play size={9} className="ml-px fill-white" />
        </span>
      </span>
    </span>
  );
}

function Preview({
  icon,
  title,
  detail,
}: {
  icon: ReactNode;
  title: ReactNode;
  detail: ReactNode;
}) {
  return (
    <div className="ml-6 flex items-center gap-3 rounded-xl border border-line bg-panel p-2 pr-4">
      {icon}
      <div className="min-w-0 text-[13px] leading-snug">
        <p className="truncate font-semibold text-fg">{title}</p>
        <div className="truncate text-fg-muted">{detail}</div>
      </div>
    </div>
  );
}

function StepPreview({ i }: { i: number }) {
  const copy = useMessages().agents;
  if (i === 0) {
    return (
      <Preview
        icon={<VideoThumb />}
        title={copy.video.title}
        detail={
          <span className="flex items-center gap-1.5">
            <AppIcon size={12} />
            {copy.video.duration} · {LINK}
          </span>
        }
      />
    );
  }
  if (i === 1) {
    return (
      <Preview
        icon={
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1f883d] text-white">
            <GitPullRequest size={16} />
          </span>
        }
        title={`${copy.pr.title} ${copy.pr.number}`}
        detail={`${copy.pr.repo} · ${copy.pr.comment}`}
      />
    );
  }
  return (
    <Preview
      icon={
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#3f0e40] text-white">
          <Hash size={16} />
        </span>
      }
      title={`#${copy.slack.channel}`}
      detail={`${copy.slack.author}: ${copy.slack.text}`}
    />
  );
}

function Bubble({ you, children }: { you?: boolean; children: ReactNode }) {
  return (
    <p
      className={cn(
        "max-w-[78%] rounded-2xl px-4 py-2.5 text-[15px] leading-snug",
        you
          ? "ml-auto rounded-br-md bg-accent-bg text-white"
          : "rounded-bl-md border border-line bg-panel text-fg",
      )}
    >
      {children}
    </p>
  );
}

function Step({ i, done }: { i: number; done: boolean }) {
  const status = useMessages().agents.statuses[i];
  return (
    <div className="flex flex-col gap-2 px-1">
      <p className="flex items-center gap-2 text-[14px] text-fg">
        {done ? (
          <Check size={15} className="text-[#22c55e]" />
        ) : (
          <Loader2 size={15} className="animate-spin text-fg-muted" />
        )}
        {status}
        {!done && "…"}
      </p>
      {done && <StepPreview i={i} />}
    </div>
  );
}

// Each message arrives on its own; the one before it rises and fades out.
function Feed({ s }: { s: number }) {
  const copy = useMessages().agents;
  const items: { key: string; node: ReactNode }[] = [];
  if (s >= SEND) {
    items.push({ key: "prompt", node: <Bubble you>{copy.prompt}</Bubble> });
  }
  STEP_AT.forEach((at, i) => {
    if (s >= at) {
      items.push({
        key: `step-${i}`,
        node: <Step i={i} done={s >= STEP_DONE[i]!} />,
      });
    }
  });
  if (s >= REPLY)
    items.push({ key: "reply", node: <Bubble>{copy.reply}</Bubble> });
  return (
    <div className="relative flex h-[190px] flex-col justify-end gap-3 overflow-hidden px-2 pb-4 [mask-image:linear-gradient(to_bottom,transparent,black_56px)]">
      <AnimatePresence mode="popLayout" initial={false}>
        {items.slice(-2).map((item, i, shown) => (
          <motion.div
            key={item.key}
            layout
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: i < shown.length - 1 ? 0.45 : 1, y: 0 }}
            exit={{ opacity: 0, y: -48 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {item.node}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

const MODELS = [
  { name: "Claude", logo: <ClaudeLogo className="size-3.5" /> },
  { name: "Codex", logo: <OpenAILogo className="size-3.5 text-white" /> },
  { name: "Cursor", logo: <CursorLogo className="size-3.5 text-white" /> },
];

function ModelLogo({ i }: { i: number }) {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#0d0d10]">
      {MODELS[i]!.logo}
    </span>
  );
}

function ModelPicker() {
  const [model, setModel] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-9 items-center gap-1.5 rounded-full px-3 text-[14px] font-medium text-fg transition-colors hover:bg-tint"
      >
        <ModelLogo i={model} />
        {MODELS[model]!.name}
        <ChevronDown size={14} className="text-fg-muted" />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute bottom-full left-0 z-10 mb-2 flex w-44 flex-col gap-0.5 rounded-2xl border border-line bg-panel p-1.5 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.35)]"
        >
          {MODELS.map((m, i) => (
            <li key={m.name}>
              <button
                type="button"
                role="option"
                aria-selected={i === model}
                onClick={() => {
                  setModel(i);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-[14px] font-medium text-fg hover:bg-tint"
              >
                <ModelLogo i={i} />
                <span className="flex-1">{m.name}</span>
                {i === model && <Check size={14} className="text-fg-muted" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Chat({ s }: { s: number }) {
  const copy = useMessages().agents;
  const typed = clamp01((s - TYPE[0]) / (TYPE[1] - TYPE[0]));
  const sent = s >= SEND;
  const text = sent
    ? ""
    : copy.prompt.slice(0, Math.round(typed * copy.prompt.length));
  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col text-left">
      <Feed s={s} />
      <div className="rounded-3xl border border-line bg-panel px-4 pt-4 pb-3 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.25)]">
        <p className="min-h-[48px] px-1 text-[16px] leading-normal text-fg">
          {text || <span className="text-fg-subtle">{copy.placeholder}</span>}
          {text && (
            <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-fg" />
          )}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-full border border-line bg-tint text-fg">
              <Plus size={16} />
            </span>
            <Pill className="hidden sm:flex">
              {copy.mode}
              <ChevronDown size={14} className="text-fg-muted" />
            </Pill>
            <ModelPicker />
          </div>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-full border border-line bg-tint text-fg">
              <Mic size={16} />
            </span>
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-full transition-[background-color,transform]",
                text
                  ? "bg-fg-strong text-canvas"
                  : "border border-line bg-tint text-fg-muted",
                s >= SEND - 0.25 && s < SEND && "scale-90",
              )}
            >
              <ArrowUp size={16} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AgentChatDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(ref);
  const reducedMotion = useReducedMotion();
  const t = useLoopClock(onScreen && !reducedMotion, LOOP_S, REST_T);
  // The first frame can land a hair before the clock started, so wrap below zero.
  const s = ((((reducedMotion ? REST_T : t) % 1) + 1) % 1) * LOOP_S;
  return (
    <div ref={ref}>
      <Chat s={s} />
    </div>
  );
}

const WORD_MS = 2200;
const WORD_COLORS = ["#2f80ff", "#10b981", "#f97316", "#8b5cf6"];

function RotatingWord({ words }: { words: readonly string[] }) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % words.length),
      WORD_MS,
    );
    return () => clearInterval(id);
  }, [reducedMotion, words.length]);
  return (
    <span className="grid justify-items-center">
      <AnimatePresence initial={false}>
        <motion.span
          key={words[index]}
          className="[grid-area:1/1]"
          style={{ color: WORD_COLORS[index % WORD_COLORS.length] }}
          initial={{ y: "0.25em", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-0.25em", opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function AgentsSection({ headingLevel = 2 }: SectionProps = {}) {
  const m = useMessages();
  const steps = m.agents.steps;
  return (
    <MarketingSection id="agents" style={{ scrollMarginTop: 24 }}>
      <SectionHeading
        title={
          <>
            {m.agents.heading} <RotatingWord words={m.agents.headingWords} />
          </>
        }
        subtitle={m.agents.subtitle}
        level={headingLevel}
      />
      <ol className="mx-auto flex w-full max-w-[720px] flex-col text-left">
        {steps.map((step, i) => (
          <li key={step.title} className="relative flex gap-5 pb-10 last:pb-0">
            {i < steps.length - 1 && (
              <span className="absolute top-10 bottom-1 left-[17.5px] w-px bg-line" />
            )}
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line bg-canvas text-[15px] font-medium text-fg-muted tabular-nums">
              {i + 1}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-3 pt-1">
              <h3 className="text-[22px] leading-tight font-semibold text-fg-strong">
                {step.title}
              </h3>
              <p className="text-[17px] leading-normal text-fg-muted">
                {step.body}
              </p>
              {i === 0 && (
                <div className={cn(CARD_SURFACE, "mt-1 rounded-xl p-4")}>
                  <McpConnectDetails />
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </MarketingSection>
  );
}

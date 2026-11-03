"use client";

import { useRef, type ReactNode } from "react";
import {
  Check,
  GitPullRequest,
  Hash,
  Link2,
  LoaderCircle,
  Mail,
  Mic,
  MousePointer2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessages } from "./i18n-provider";
import { useLoopAnimation, useSceneLoop, type SceneState } from "./scene-frame";
import { ScaledScene, WINDOW, WindowBar } from "./use-cases-section";

const ASK_LOOP_MS = 7000;
const ASK_STEPS = [0, 2200, 3400, 4600];
const TYPING_END = 2000 / ASK_LOOP_MS;

const RECORD_LOOP_MS = 7000;
const RECORD_STEPS = [0, 1400, 3000, 4300];

const VOICE_LOOP_MS = 6000;
const VOICE_TICK_MS = 300;
const VOICE_STEPS = Array.from(
  { length: VOICE_LOOP_MS / VOICE_TICK_MS },
  (_, i) => i * VOICE_TICK_MS,
);
const WAVE = [28, 52, 76, 44, 92, 60, 34, 80, 56, 100, 40, 68];

const SHARE_LOOP_MS = 8000;
const SHARE_STEPS = [0, 1200, 2200, 3200, 4200];
const PLACE_ICONS = [GitPullRequest, Hash, Mail];
const REACTIONS = ["🎉", "👏", "🔥"];

function popIn(shown: boolean) {
  return cn(
    "transition-[opacity,translate,scale] duration-300 ease-out",
    shown
      ? "translate-y-0 scale-100 opacity-100"
      : "translate-y-2 scale-95 opacity-0",
  );
}

function LoopingScene({
  steps,
  loopMs,
  children,
}: {
  steps: readonly number[];
  loopMs: number;
  children: (state: SceneState) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const state = useSceneLoop(ref, steps, loopMs);
  return (
    <div ref={ref} aria-hidden>
      <ScaledScene>{children(state)}</ScaledScene>
    </div>
  );
}

export function AskScene() {
  return (
    <LoopingScene steps={ASK_STEPS} loopMs={ASK_LOOP_MS}>
      {(state) => <AskContent {...state} />}
    </LoopingScene>
  );
}

function AskContent({ step, playing }: SceneState) {
  const copy = useMessages().agents.scenes.ask;
  const promptRef = useRef<HTMLSpanElement>(null);
  useLoopAnimation(
    promptRef,
    [
      { clipPath: "inset(0 100% 0 0)", offset: 0, easing: "steps(22)" },
      { clipPath: "inset(0 0 0 0)", offset: TYPING_END },
      { clipPath: "inset(0 0 0 0)", offset: 1 },
    ],
    ASK_LOOP_MS,
    playing,
  );

  return (
    <div className="absolute inset-0">
      <div className={`${WINDOW} bg-[#1b2233]`}>
        <WindowBar
          name={copy.name}
          badge={copy.badge}
          barClass="bg-[#161c2a]"
          badgeClass="bg-[rgb(96_165_250/0.18)] text-[#93c5fd]"
          nameClass="text-[#c7d2ee]"
        />
        <div className="px-6 py-6 font-mono text-[19px] leading-none font-medium text-[#dbe3f7]">
          <p className="flex gap-3 whitespace-nowrap">
            <span className="text-[#8fb4ff]">❯</span>
            <span ref={promptRef}>{copy.prompt}</span>
          </p>
          <ul className="mt-7 flex flex-col gap-5 text-[17px]">
            {copy.steps.map((label, i) => {
              const startsAt = i + 1;
              const done = step > startsAt || step === ASK_STEPS.length - 1;
              return (
                <li
                  key={label}
                  className={cn(
                    "flex items-center gap-3",
                    popIn(step >= startsAt),
                  )}
                >
                  {done ? (
                    <Check className="size-5 text-[#4ade80]" strokeWidth={3} />
                  ) : (
                    <LoaderCircle className="size-5 animate-spin text-[#8fb4ff] motion-reduce:animate-none" />
                  )}
                  {label}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function RecordScene() {
  return (
    <LoopingScene steps={RECORD_STEPS} loopMs={RECORD_LOOP_MS}>
      {(state) => <RecordContent {...state} />}
    </LoopingScene>
  );
}

function RecordContent({ step, playing }: SceneState) {
  const copy = useMessages().agents.scenes.record;
  const cursorRef = useRef<HTMLDivElement>(null);
  useLoopAnimation(
    cursorRef,
    [
      { transform: "translate(0, 0) scale(1)" },
      { transform: "translate(-200px, 48px) scale(1)", offset: 0.18 },
      { transform: "translate(-200px, 48px) scale(0.8)", offset: 0.21 },
      { transform: "translate(-120px, 100px) scale(1)", offset: 0.4 },
      { transform: "translate(-120px, 100px) scale(0.8)", offset: 0.43 },
      { transform: "translate(-50px, 158px) scale(1)", offset: 0.58 },
      { transform: "translate(-50px, 158px) scale(0.8)", offset: 0.61 },
      { transform: "translate(-50px, 158px) scale(1)", offset: 0.85 },
      { transform: "translate(0, 0) scale(1)" },
    ],
    RECORD_LOOP_MS,
    playing,
  );
  const paid = step === RECORD_STEPS.length - 1;

  return (
    <div className="absolute inset-0">
      <div className={`${WINDOW} bg-white ring-1 ring-black/5`}>
        <WindowBar
          name={copy.url}
          badge={copy.badge}
          barClass="bg-[#eaeaea]"
          badgeClass="bg-[#f3e8ff] text-[#7c3aed]"
        />
        <div className="flex flex-col gap-3 px-6 pt-5">
          <p className="text-[22px] leading-none font-bold tracking-[-0.02em]">
            {copy.title}
          </p>
          {copy.fields.map((field, i) => (
            <p
              key={field}
              className={cn(
                "rounded-xl border-2 px-3.5 py-2.5 text-[15px] leading-none text-black/55 transition-colors duration-200",
                step === i + 1 ? "border-[#1184f7]" : "border-[#e5e5e5]",
              )}
            >
              {field}
            </p>
          ))}
          <p
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl py-3 text-[16px] leading-none font-semibold text-white transition-colors duration-300",
              paid ? "bg-[#16a34a]" : "bg-[#1184f7]",
            )}
          >
            {paid && <Check className="size-4" strokeWidth={3} />}
            {paid ? copy.paid : copy.pay}
          </p>
        </div>
        <div ref={cursorRef} className="absolute top-[70px] left-[380px]">
          <MousePointer2
            className="size-10 fill-[#181818] text-white drop-shadow-md"
            strokeWidth={1.5}
          />
        </div>
      </div>
    </div>
  );
}

export function VoiceScene() {
  return (
    <LoopingScene steps={VOICE_STEPS} loopMs={VOICE_LOOP_MS}>
      {(state) => <VoiceContent {...state} />}
    </LoopingScene>
  );
}

function VoiceContent({ step }: SceneState) {
  const copy = useMessages().agents.scenes.voice;

  return (
    <div className="absolute inset-0">
      <div
        className={`${WINDOW} flex flex-col gap-6 rounded-3xl bg-white px-[26px] py-6 ring-1 ring-black/5`}
      >
        <div>
          <p className="text-[28px] leading-tight font-bold tracking-[-0.02em]">
            {copy.title}
          </p>
          <p className="mt-1.5 text-[17px] leading-tight text-[#727272]">
            {copy.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-4 rounded-[14px] bg-[#f5f5f5] p-3.5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#1184f7] text-white">
            <Mic className="size-6" />
          </span>
          <div className="flex h-16 flex-1 items-center justify-between">
            {WAVE.map((_, i) => (
              <span
                key={i}
                className="w-1.5 rounded-full bg-[#1184f7] transition-[height] duration-300 ease-in-out motion-reduce:transition-none"
                style={{ height: `${WAVE[(i + step) % WAVE.length]}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ShareScene() {
  return (
    <LoopingScene steps={SHARE_STEPS} loopMs={SHARE_LOOP_MS}>
      {(state) => <ShareContent {...state} />}
    </LoopingScene>
  );
}

function ShareContent({ step }: SceneState) {
  const copy = useMessages().agents.scenes.share;
  const copied = step >= 1;

  return (
    <div className="absolute inset-0">
      <div
        className={`${WINDOW} flex flex-col gap-4 rounded-3xl bg-white px-[26px] py-6 ring-1 ring-black/5`}
      >
        <p className="text-[20px] leading-none font-bold tracking-[-0.02em]">
          {copy.title}
        </p>
        <div className="flex items-center gap-2.5 rounded-[14px] bg-[#f5f5f5] p-2.5 pl-3.5">
          <Link2 className="size-5 shrink-0 text-[#727272]" />
          <span className="min-w-0 flex-1 truncate text-[16px] font-medium">
            {copy.link}
          </span>
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg text-white transition-colors duration-300",
              copied ? "bg-[#16a34a]" : "bg-[#1184f7]",
            )}
          >
            <Check className="size-5" strokeWidth={3} />
          </span>
        </div>
        <ul className="grid grid-cols-3 gap-3">
          {copy.places.map((place, i) => {
            const Icon = PLACE_ICONS[i]!;
            return (
              <li
                key={place}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-[14px] bg-[#f5f5f5] py-4 text-[15px] leading-none font-semibold",
                  popIn(step >= i + 2),
                )}
              >
                <Icon className="size-7 text-[#1184f7]" />
                {place}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="absolute top-[22px] right-14 flex gap-2">
        {REACTIONS.map((reaction, i) => (
          <span
            key={reaction}
            className={cn(
              "flex size-[46px] items-center justify-center rounded-full bg-white text-[24px] leading-none shadow-md",
              popIn(step >= i + 2),
            )}
          >
            {reaction}
          </span>
        ))}
      </div>
    </div>
  );
}

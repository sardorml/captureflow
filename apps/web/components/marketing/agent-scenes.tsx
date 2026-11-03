"use client";

import { useRef } from "react";
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
import { SceneFrame, useLoopAnimation, type SceneState } from "./scene-frame";

// Authored at 600×400 and shown about 250px wide, so type starts around 30px.
const SCENE_HEIGHT = 400;

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
      : "translate-y-3 scale-95 opacity-0",
  );
}

export function AskScene() {
  return (
    <SceneFrame
      steps={ASK_STEPS}
      loopMs={ASK_LOOP_MS}
      sceneHeight={SCENE_HEIGHT}
      background="linear-gradient(160deg,#bfd4fe,#a5e4f3)"
    >
      {(state) => <AskContent {...state} />}
    </SceneFrame>
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
    <div className="absolute inset-6 overflow-hidden rounded-3xl bg-[#14161c] px-8 py-7 font-mono text-[#e6e8ee] shadow-[0_20px_44px_rgb(15_40_90/0.28)]">
      <div className="flex gap-2.5">
        <span className="size-4 rounded-full bg-[#ff5f57]" />
        <span className="size-4 rounded-full bg-[#febc2e]" />
        <span className="size-4 rounded-full bg-[#28c840]" />
      </div>
      <p className="mt-7 flex gap-4 text-[30px] whitespace-nowrap">
        <span className="text-[#7aa2ff]">❯</span>
        <span ref={promptRef}>{copy.prompt}</span>
      </p>
      <ul className="mt-7 flex flex-col gap-4 text-[28px]">
        {copy.steps.map((label, i) => {
          const startsAt = i + 1;
          const done = step > startsAt || step === ASK_STEPS.length - 1;
          return (
            <li
              key={label}
              className={cn("flex items-center gap-4", popIn(step >= startsAt))}
            >
              {done ? (
                <Check className="size-7 text-[#4ade80]" strokeWidth={3} />
              ) : (
                <LoaderCircle className="size-7 animate-spin text-[#7aa2ff] motion-reduce:animate-none" />
              )}
              {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function RecordScene() {
  return (
    <SceneFrame
      steps={RECORD_STEPS}
      loopMs={RECORD_LOOP_MS}
      sceneHeight={SCENE_HEIGHT}
      background="linear-gradient(160deg,#d9c8fd,#f3c1ee)"
    >
      {(state) => <RecordContent {...state} />}
    </SceneFrame>
  );
}

function RecordContent({ step, playing }: SceneState) {
  const copy = useMessages().agents.scenes.record;
  const cursorRef = useRef<HTMLDivElement>(null);
  useLoopAnimation(
    cursorRef,
    [
      { transform: "translate(0, 0) scale(1)" },
      { transform: "translate(-170px, 26px) scale(1)", offset: 0.18 },
      { transform: "translate(-170px, 26px) scale(0.8)", offset: 0.21 },
      { transform: "translate(-120px, 86px) scale(1)", offset: 0.4 },
      { transform: "translate(-120px, 86px) scale(0.8)", offset: 0.43 },
      { transform: "translate(-50px, 156px) scale(1)", offset: 0.58 },
      { transform: "translate(-50px, 156px) scale(0.8)", offset: 0.61 },
      { transform: "translate(-50px, 156px) scale(1)", offset: 0.85 },
      { transform: "translate(0, 0) scale(1)" },
    ],
    RECORD_LOOP_MS,
    playing,
  );
  const paid = step === RECORD_STEPS.length - 1;

  return (
    <div className="absolute inset-6 overflow-hidden rounded-3xl bg-white text-[#181818] shadow-[0_20px_44px_rgb(76_29_149/0.25)]">
      <div className="flex h-14 items-center gap-2.5 bg-[#f2f3f5] px-5">
        <span className="size-4 rounded-full bg-[#ff5f57]" />
        <span className="size-4 rounded-full bg-[#febc2e]" />
        <span className="size-4 rounded-full bg-[#28c840]" />
        <span className="ml-3 flex-1 rounded-full bg-white px-5 py-1 text-[22px] text-black/55">
          {copy.url}
        </span>
      </div>
      <div className="flex flex-col gap-3 px-7 pt-4">
        <p className="text-[34px] leading-tight font-bold tracking-[-0.03em]">
          {copy.title}
        </p>
        {copy.fields.map((field, i) => (
          <p
            key={field}
            className={cn(
              "rounded-xl border-[3px] px-4 py-1.5 text-[24px] text-black/55 transition-colors duration-200",
              step === i + 1 ? "border-[#2563eb]" : "border-[#e5e7eb]",
            )}
          >
            {field}
          </p>
        ))}
        <p
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl py-2.5 text-[26px] font-semibold text-white transition-colors duration-300",
            paid ? "bg-[#16a34a]" : "bg-[#2563eb]",
          )}
        >
          {paid && <Check className="size-7" strokeWidth={3} />}
          {paid ? copy.paid : copy.pay}
        </p>
      </div>
      <div ref={cursorRef} className="absolute top-[116px] left-[410px]">
        <MousePointer2
          className="size-14 fill-[#181818] text-white drop-shadow-lg"
          strokeWidth={1.5}
        />
      </div>
    </div>
  );
}

export function VoiceScene() {
  return (
    <SceneFrame
      steps={VOICE_STEPS}
      loopMs={VOICE_LOOP_MS}
      sceneHeight={SCENE_HEIGHT}
      background="linear-gradient(160deg,#b9f0d0,#c7ecff)"
    >
      {(state) => <VoiceContent {...state} />}
    </SceneFrame>
  );
}

function VoiceContent({ step }: SceneState) {
  const copy = useMessages().agents.scenes.voice;

  return (
    <div className="absolute inset-6 flex flex-col justify-between rounded-3xl bg-white p-8 text-[#181818] shadow-[0_20px_44px_rgb(6_78_59/0.2)]">
      <div>
        <p className="text-[50px] leading-[1.1] font-bold tracking-[-0.03em]">
          {copy.title}
        </p>
        <p className="mt-3 text-[30px] leading-tight text-black/55">
          {copy.subtitle}
        </p>
      </div>
      <div className="flex items-center gap-5">
        <span className="flex size-[72px] shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-white">
          <Mic className="size-9" />
        </span>
        <div className="flex h-20 flex-1 items-center justify-between">
          {WAVE.map((_, i) => (
            <span
              key={i}
              className="w-3 rounded-full bg-[#2563eb] transition-[height] duration-300 ease-in-out motion-reduce:transition-none"
              style={{ height: `${WAVE[(i + step) % WAVE.length]}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ShareScene() {
  return (
    <SceneFrame
      steps={SHARE_STEPS}
      loopMs={SHARE_LOOP_MS}
      sceneHeight={SCENE_HEIGHT}
      background="linear-gradient(160deg,#fde0b8,#f9bfd2)"
    >
      {(state) => <ShareContent {...state} />}
    </SceneFrame>
  );
}

function ShareContent({ step, playing }: SceneState) {
  const copy = useMessages().agents.scenes.share;
  const copied = step >= 1;

  return (
    <div className="absolute inset-6 flex flex-col justify-center gap-8">
      <div className="flex items-center gap-3 rounded-2xl bg-white p-3.5 pl-5 text-[#181818] shadow-[0_16px_36px_rgb(120_40_60/0.2)]">
        <Link2 className="size-8 shrink-0 text-black/50" />
        <span className="min-w-0 flex-1 truncate text-[28px] font-medium">
          {copy.link}
        </span>
        <span
          className={cn(
            "flex size-14 shrink-0 items-center justify-center rounded-xl text-white transition-colors duration-300",
            copied ? "bg-[#16a34a]" : "bg-[#2563eb]",
          )}
        >
          <Check className="size-8" strokeWidth={3} />
        </span>
      </div>
      <ul className="grid grid-cols-3 gap-4">
        {copy.places.map((place, i) => {
          const Icon = PLACE_ICONS[i]!;
          const shownAt = i + 2;
          return (
            <li
              key={place}
              className={cn(
                "relative flex flex-col items-center gap-2 rounded-2xl bg-white py-5 text-[26px] font-semibold text-[#181818] shadow-[0_12px_28px_rgb(120_40_60/0.18)]",
                popIn(step >= shownAt),
              )}
            >
              <Icon className="size-11 text-[#2563eb]" />
              {place}
              {playing && step === shownAt && (
                <span className="absolute top-0 left-1/2 animate-reaction-rise text-[44px]">
                  {REACTIONS[i]}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

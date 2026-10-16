"use client";

import { useEffect, useRef } from "react";
import { Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppScreen } from "./editor-scene";
import { useMessages } from "./i18n-provider";
import { SceneFrame, useLoopAnimation, type SceneState } from "./scene-frame";
import { WebcamLoop } from "./webcam-loop";

const LOOP_MS = 12000;

// Where each activity item sits on the timeline, 0–1, in the same order as
// the copy's `events`; the playhead reaches it at that fraction of the loop.
const EVENT_AT = [0.12, 0.24, 0.38, 0.52, 0.66, 0.78, 0.9];
const STEPS = [0, ...EVENT_AT.map((at) => at * LOOP_MS)];

const AVATAR_COLORS: Record<string, string> = {
  AR: "#8b5cf6",
  CK: "#0d9488",
  JB: "#2563eb",
  MC: "#f59e0b",
  SL: "#ec4899",
};

export function FeedbackScene() {
  return (
    <SceneFrame steps={STEPS} loopMs={LOOP_MS} background="#ead9fb">
      {(state) => <FeedbackContent {...state} />}
    </SceneFrame>
  );
}

function FeedbackContent({ step, playing }: SceneState) {
  const m = useMessages().collaboration.categories;
  const copy = m.feedback.scene;
  const fillRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLSpanElement>(null);
  useLoopAnimation(
    fillRef,
    [{ width: "0%" }, { width: "100%" }],
    LOOP_MS,
    playing,
  );
  useLoopAnimation(
    headRef,
    [{ left: "0%" }, { left: "100%" }],
    LOOP_MS,
    playing,
  );

  const events = copy.events.map((event, i) => ({
    ...event,
    position: EVENT_AT[i],
    color: AVATAR_COLORS[event.initials],
  }));
  const latest = step > 0 ? events[step - 1] : null;

  return (
    <div className="absolute inset-x-6 top-1/2 flex -translate-y-1/2 items-stretch gap-4">
      <div className="flex w-[372px] shrink-0 flex-col rounded-2xl bg-white p-3 text-[#18181b] shadow-[0_20px_44px_rgb(76_29_149/0.18)]">
        <p className="text-[13px] leading-tight font-bold">{copy.title}</p>
        <p className="mt-1 flex items-center gap-1.5 text-[9px] text-black/50">
          <Initials color={AVATAR_COLORS.AR} size={14}>
            {copy.author[0]}
          </Initials>
          {copy.author} · {copy.age}
        </p>

        <div className="relative mt-2.5 h-[196px] overflow-hidden rounded-lg border border-black/5">
          <AppScreen copy={m.share.scene} />
          <div className="absolute right-2.5 bottom-2.5 size-[144px] overflow-hidden rounded-full bg-[#d9d4c8] shadow-[0_0_0_3px_#fff,0_8px_18px_rgb(0_0_0/0.25)]">
            <WebcamLoop name="headband" />
          </div>
        </div>

        <div className="mt-9 flex items-center gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#7c3aed]">
            <Pause className="size-3 fill-white text-white" />
          </span>
          <div className="relative h-1.5 flex-1 rounded-full bg-[#ede5f8]">
            <div
              ref={fillRef}
              className="absolute inset-y-0 left-0 rounded-full bg-[#7c3aed]"
              style={{ width: playing ? "0%" : "100%" }}
            />
            {events.map((event, i) => (
              <span
                key={i}
                className={cn(
                  "absolute bottom-full mb-1.5 -translate-x-1/2 transition-all duration-300",
                  i < step ? "scale-100 opacity-100" : "scale-50 opacity-0",
                )}
                style={{ left: `${event.position * 100}%` }}
              >
                {"emoji" in event ? (
                  <span className="text-[11px] leading-none">
                    {event.emoji}
                  </span>
                ) : (
                  <Initials color={event.color} size={14}>
                    {event.initials}
                  </Initials>
                )}
              </span>
            ))}
            {latest && "emoji" in latest ? (
              <FloatingEmoji
                key={step}
                emoji={latest.emoji}
                left={latest.position * 100}
              />
            ) : null}
            {latest && "text" in latest ? (
              <CommentPop
                key={step}
                left={latest.position * 100}
                color={latest.color}
                initials={latest.initials}
                text={latest.text}
              />
            ) : null}
            <span
              ref={headRef}
              className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_1.5px_#7c3aed]"
              style={{ left: playing ? "0%" : "100%" }}
            />
          </div>
          <span className="font-mono text-[9px] text-black/45 tabular-nums">
            {copy.duration}
          </span>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 overflow-hidden rounded-2xl bg-white p-3 text-[#18181b] shadow-[0_20px_44px_rgb(76_29_149/0.18)]">
        <p className="mb-0.5 flex items-center justify-between text-[11px] font-bold">
          {copy.activity}
          <span className="rounded-full bg-[#ede5f8] px-1.5 py-0.5 text-[9px] text-[#7c3aed] tabular-nums">
            {step}
          </span>
        </p>
        {events.map((event, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-1.5 overflow-hidden transition-all duration-500",
              i < step
                ? "max-h-12 translate-y-0 opacity-100"
                : "-mt-2 max-h-0 -translate-y-1 opacity-0",
            )}
          >
            <Initials color={event.color} size={18}>
              {event.initials}
            </Initials>
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="flex items-center gap-1 text-[9px] font-semibold">
                {event.name}
                <span className="rounded bg-[#ede5f8] px-1 font-mono text-[8px] font-medium text-[#7c3aed]">
                  {event.at}
                </span>
                {"emoji" in event ? (
                  <span className="text-[11px] leading-none">
                    {event.emoji}
                  </span>
                ) : null}
              </p>
              {"text" in event ? (
                <p className="text-[9px] leading-snug text-black/65">
                  {event.text}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FloatingEmoji({ emoji, left }: { emoji: string; left: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    ref.current?.animate(
      [
        { transform: "translate(-50%, 0) scale(0.6)", opacity: 0 },
        {
          transform: "translate(-50%, -24px) scale(1.4)",
          opacity: 1,
          offset: 0.3,
        },
        { transform: "translate(-50%, -64px) scale(1.6)", opacity: 0 },
      ],
      { duration: 1400, easing: "ease-out", fill: "forwards" },
    );
  }, []);

  return (
    <span
      ref={ref}
      className="absolute bottom-full text-[18px] leading-none opacity-0"
      style={{ left: `${left}%` }}
    >
      {emoji}
    </span>
  );
}

function CommentPop({
  left,
  color,
  initials,
  text,
}: {
  left: number;
  color: string;
  initials: string;
  text: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    ref.current?.animate(
      [
        { transform: "translate(-50%, 6px) scale(0.9)", opacity: 0 },
        { transform: "translate(-50%, 0) scale(1)", opacity: 1 },
      ],
      { duration: 300, easing: "ease-out", fill: "forwards" },
    );
  }, []);

  return (
    <span
      ref={ref}
      className="absolute bottom-full mb-7 flex items-center gap-1.5 rounded-[10px_10px_10px_3px] bg-[#16181d] py-1.5 pr-2.5 pl-1.5 text-[9px] font-semibold whitespace-nowrap text-white opacity-0 shadow-lg"
      style={{ left: `${left}%` }}
    >
      <Initials color={color} size={14}>
        {initials}
      </Initials>
      {text}
    </span>
  );
}

function Initials({
  color,
  size,
  children,
}: {
  color: string;
  size: number;
  children: string;
}) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.42,
      }}
    >
      {children}
    </span>
  );
}

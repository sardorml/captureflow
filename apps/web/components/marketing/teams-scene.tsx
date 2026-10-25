"use client";

import { useEffect, useRef } from "react";
import { Check, Globe, Lock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessages } from "./i18n-provider";
import { SceneFrame, type SceneState } from "./scene-frame";

const LOOP_MS = 12000;

// Type the invite, send it, Leo joins, then the first recording walks
// Public → Workspace → Private.
const STEPS = [0, 1200, 2700, 3900, 6000, 8000];

const NEW_MEMBER_PHOTO = "/presenter-engineering.webp";
const INITIALS_COLORS: Record<string, string> = {
  AR: "#8b5cf6",
  CK: "#0d9488",
  JB: "#1184f7",
};
const VISIBILITY_ICONS = [Globe, Users, Lock];
const THUMBS = [BoardThumb, CodeThumb, ChartThumb];
const PRESENTERS = [
  "/webcam/sweater.jpg",
  "/presenter-engineering.webp",
  "/webcam/headband.jpg",
];

export function TeamsScene() {
  return (
    <SceneFrame steps={STEPS} loopMs={LOOP_MS} background="#d3efe4">
      {(state) => <TeamsContent {...state} />}
    </SceneFrame>
  );
}

function TeamsContent({ step }: SceneState) {
  const copy = useMessages().collaboration.categories.workspaces.scene;
  const typing = step === 1 || step === 2;
  const sent = step === 2;
  const joined = step >= 3;
  const celebrating = step === 3;
  const visibility = step >= 5 ? 2 : step >= 4 ? 1 : 0;
  const VisibilityIcon = VISIBILITY_ICONS[visibility];

  return (
    <div className="absolute inset-x-7 top-1/2 flex -translate-y-1/2 items-stretch justify-between gap-4 text-[#181818]">
      <div className="flex w-[316px] flex-col rounded-2xl bg-white p-5 shadow-[0_24px_50px_rgb(6_78_59/0.16)]">
        <p className="text-[18px] leading-tight font-bold">{copy.team}</p>
        <p className="mt-0.5 text-[10px] text-black/50 tabular-nums">
          {copy.members[joined ? 1 : 0]}
        </p>

        <div className="mt-4 flex h-11 items-center">
          {copy.memberInitials.map((initials, i) => (
            <span
              key={initials}
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white shadow-[0_0_0_3px_#fff]",
                i > 0 && "-ml-2.5",
              )}
              style={{ background: INITIALS_COLORS[initials] }}
            >
              {initials}
            </span>
          ))}
          <span
            className={cn(
              "size-11 shrink-0 overflow-hidden rounded-full bg-[#e7e5e4] shadow-[0_0_0_3px_#fff] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
              joined
                ? "-ml-2.5 scale-100 opacity-100"
                : "-ml-11 scale-50 opacity-0",
            )}
          >
            <img
              src={NEW_MEMBER_PHOTO}
              alt=""
              className="size-full object-cover"
            />
          </span>
          <span
            className={cn(
              "ml-3 rounded-full bg-[#1184f7] px-2.5 py-1 text-[9px] font-semibold whitespace-nowrap text-white transition-all duration-300",
              celebrating
                ? "translate-x-0 opacity-100"
                : "-translate-x-1 opacity-0",
            )}
          >
            {copy.joined}
          </span>
        </div>

        <div className="mt-4 flex gap-1.5">
          <span className="flex h-8 flex-1 items-center rounded-lg border border-black/10 px-2.5 text-[10px]">
            {typing ? (
              <Typed text={copy.inviteEmail} />
            ) : (
              <span className="text-black/35">{copy.invitePlaceholder}</span>
            )}
          </span>
          <span
            className={cn(
              "flex h-8 w-[62px] items-center justify-center gap-1 rounded-lg text-[10px] font-semibold transition-colors duration-300",
              sent ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#181818] text-white",
            )}
          >
            {sent ? <Check className="size-3" strokeWidth={3} /> : null}
            {sent ? copy.invited : copy.invite}
          </span>
        </div>

        <div className="mt-4 border-t border-black/5 pt-4">
          <p className="text-[11px] font-medium">
            {copy.whoCanWatch}{" "}
            <span className="text-[#1184f7]">
              {copy.visibility[visibility].detail}
            </span>
          </p>
          <div className="relative mt-2 grid grid-cols-3 rounded-lg bg-[#eaeaea] p-1 text-[10px] font-semibold">
            <span
              className="absolute inset-y-1 left-1 rounded-md bg-[#1184f7] shadow transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                width: "calc((100% - 8px) / 3)",
                transform: `translateX(${visibility * 100}%)`,
              }}
            />
            {copy.visibility.map((option, i) => (
              <span
                key={option.label}
                className={cn(
                  "relative py-1.5 text-center transition-colors duration-300",
                  i === visibility ? "text-white" : "text-black/45",
                )}
              >
                {option.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5 rounded-2xl bg-white p-4 shadow-[0_24px_50px_rgb(6_78_59/0.16)]">
        <p className="text-[12px] font-bold">{copy.recordings}</p>
        {copy.videos.map((video, i) => {
          const Thumb = THUMBS[i];
          return (
            <div
              key={video.title}
              className={cn(
                "flex items-center gap-2 rounded-lg p-1",
                i === 0 && "bg-[#e1f0ff] shadow-[0_0_0_1.5px_#1184f7]",
              )}
            >
              <span className="relative h-[42px] w-[64px] shrink-0 overflow-hidden rounded-md border border-black/5">
                <Thumb />
                <span
                  className="absolute right-1 bottom-1 size-[18px] overflow-hidden rounded-full shadow-[0_0_0_1.5px_#fff]"
                  style={{
                    background: `center / cover url(${PRESENTERS[i]})`,
                  }}
                />
                <span className="absolute bottom-1 left-1 rounded-[3px] bg-black/70 px-1 font-mono text-[6.5px] leading-[10px] text-white">
                  {video.duration}
                </span>
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="line-clamp-2 text-[9px] leading-tight font-semibold">
                  {video.title}
                </span>
                <span className="flex items-center gap-1 text-[8px] text-black/50">
                  <span
                    className="flex size-3 shrink-0 items-center justify-center rounded-full text-[5px] font-bold text-white"
                    style={{ background: INITIALS_COLORS[video.initials] }}
                  >
                    {video.initials}
                  </span>
                  {video.author}
                </span>
              </span>
              {i === 0 ? (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-[#1184f7] shadow-[0_1px_3px_rgb(0_0_0/0.12)]">
                  <VisibilityIcon className="size-2.5" />
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BoardThumb() {
  return (
    <span className="flex size-full flex-col bg-[#f5f5f5]">
      <span className="h-1.5 shrink-0 bg-[#e6e6e6]" />
      <span className="flex flex-1 gap-[3px] p-1">
        {["#f59e0b", "#1184f7", "#22c55e"].map((color) => (
          <span
            key={color}
            className="flex flex-1 flex-col gap-[2px] rounded-[2px] bg-[#ededed] p-[2px]"
          >
            <span className="flex h-2 flex-col justify-end rounded-[1px] bg-white p-[1px]">
              <span
                className="h-[1.5px] w-2/3 rounded-full"
                style={{ background: color }}
              />
            </span>
            <span className="flex h-2 flex-col justify-end rounded-[1px] bg-white p-[1px]">
              <span
                className="h-[1.5px] w-1/2 rounded-full"
                style={{ background: color }}
              />
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}

function CodeThumb() {
  const rows = [
    { width: "70%", tone: "bg-[#a78bfa]/70" },
    { width: "55%", tone: "bg-[#93c5fd]/70" },
    { width: "62%", tone: "bg-[#fca5a5]", row: "bg-[#ef4444]/20" },
    { width: "66%", tone: "bg-[#86efac]", row: "bg-[#22c55e]/20" },
    { width: "48%", tone: "bg-[#93c5fd]/70" },
  ];
  return (
    <span className="flex size-full flex-col gap-[2px] bg-[#1e2433] py-1.5">
      {rows.map((r, i) => (
        <span key={i} className={cn("flex h-[4px] items-center px-1.5", r.row)}>
          <span
            className={cn("h-[2px] rounded-full", r.tone)}
            style={{ width: r.width }}
          />
        </span>
      ))}
    </span>
  );
}

function ChartThumb() {
  return (
    <span className="flex size-full flex-col bg-white p-1.5">
      <span className="h-[2px] w-6 rounded-full bg-black/40" />
      <span className="mt-auto flex h-6 items-end gap-[2px]">
        {[40, 55, 48, 66, 78, 100].map((h, i) => (
          <span
            key={i}
            className={cn(
              "flex-1 rounded-t-[1px]",
              i === 5 ? "bg-[#1184f7]" : "bg-[#e3e3e3]",
            )}
            style={{ height: `${h}%` }}
          />
        ))}
      </span>
    </span>
  );
}

function Typed({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    ref.current?.animate([{ width: "0ch" }, { width: `${text.length}ch` }], {
      duration: 900,
      easing: `steps(${text.length}, end)`,
      fill: "forwards",
    });
  }, [text]);

  return (
    <span
      ref={ref}
      className="inline-block overflow-hidden font-mono whitespace-nowrap"
      style={{ width: `${text.length}ch` }}
    >
      {text}
    </span>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { Check, Globe, Lock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessages } from "./i18n-provider";
import { SceneFrame, type SceneState } from "./scene-frame";

const LOOP_MS = 10000;

// Type two invites and send them, Chris then Jordan join, then the sharing
// default walks Public → Workspace → Private.
const STEPS = [0, 600, 2100, 3000, 3700, 5600, 7600];

const INVITE_TYPING_MS = 1500;

const INITIALS_COLORS: Record<string, string> = {
  AR: "#8b5cf6",
  CK: "#0d9488",
  JB: "#1184f7",
};
const VISIBILITY_ICONS = [Globe, Users, Lock];

export function TeamsScene() {
  return (
    <SceneFrame
      steps={STEPS}
      loopMs={LOOP_MS}
      background="linear-gradient(160deg,#b6ecd3,#97d9c2)"
    >
      {(state) => <TeamsContent {...state} />}
    </SceneFrame>
  );
}

function TeamsContent({ step }: SceneState) {
  const copy = useMessages().collaboration.categories.workspaces.scene;
  const typing = step === 1 || step === 2;
  const sent = step === 2;
  const memberCount = step >= 4 ? 3 : step >= 3 ? 2 : 1;
  const celebrating = step === 4;
  const visibility = step >= 6 ? 2 : step >= 5 ? 1 : 0;
  const VisibilityIcon = VISIBILITY_ICONS[visibility];

  return (
    <div className="absolute inset-0 flex items-center justify-center text-[#181818]">
      <div className="flex w-[440px] flex-col rounded-2xl bg-white p-6 shadow-[0_24px_50px_rgb(6_78_59/0.16)]">
        <p className="text-[22px] leading-tight font-bold">{copy.team}</p>
        <p className="mt-1 text-[14px] text-black/50 tabular-nums">
          {copy.members[memberCount - 1]}
        </p>

        <div className="mt-5 flex h-12 items-center">
          {copy.memberInitials.map((initials, i) => (
            <span
              key={initials}
              className={cn(
                "flex size-12 shrink-0 items-center justify-center rounded-full text-[14px] font-bold text-white shadow-[0_0_0_3px_#fff] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                i === 0
                  ? ""
                  : i < memberCount
                    ? "-ml-2.5 scale-100 opacity-100"
                    : "-ml-12 scale-50 opacity-0",
              )}
              style={{ background: INITIALS_COLORS[initials] }}
            >
              {initials}
            </span>
          ))}
          <span
            className={cn(
              "ml-3 rounded-full bg-[#1184f7] px-3 py-1 text-[12px] font-semibold whitespace-nowrap text-white transition-all duration-300",
              celebrating
                ? "translate-x-0 opacity-100"
                : "-translate-x-1 opacity-0",
            )}
          >
            {copy.joined}
          </span>
        </div>

        <div className="mt-5 flex gap-2">
          <span className="flex h-10 min-w-0 flex-1 items-center overflow-hidden rounded-lg border border-black/10 px-3 text-[14px] whitespace-nowrap">
            {typing ? (
              <Typed text={copy.inviteEmail} duration={INVITE_TYPING_MS} />
            ) : (
              <span className="text-black/35">{copy.invitePlaceholder}</span>
            )}
          </span>
          <span
            className={cn(
              "flex h-10 w-[76px] shrink-0 items-center justify-center gap-1 rounded-lg text-[14px] font-semibold transition-colors duration-300",
              sent ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#181818] text-white",
            )}
          >
            {sent ? <Check className="size-3.5" strokeWidth={3} /> : null}
            {sent ? copy.invited : copy.invite}
          </span>
        </div>

        <div className="mt-5 border-t border-black/5 pt-5">
          <p className="flex items-center gap-1.5 text-[15px] font-medium">
            {copy.whoCanWatch}
            <VisibilityIcon className="size-4 text-[#1184f7]" />
            <span className="text-[#1184f7]">
              {copy.visibility[visibility].detail}
            </span>
          </p>
          <div className="relative mt-3 grid grid-cols-3 rounded-lg bg-[#eaeaea] p-1 text-[14px] font-semibold">
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
                  "relative py-2 text-center transition-colors duration-300",
                  i === visibility ? "text-white" : "text-black/45",
                )}
              >
                {option.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Typed({ text, duration }: { text: string; duration: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    ref.current?.animate([{ width: "0ch" }, { width: `${text.length}ch` }], {
      duration,
      easing: `steps(${text.length}, end)`,
      fill: "forwards",
    });
  }, [text, duration]);

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

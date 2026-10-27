"use client";

import { useRef } from "react";
import { MousePointer2, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessages } from "./i18n-provider";
import { SceneFrame, useLoopAnimation, type SceneState } from "./scene-frame";
import { WebcamLoop } from "./webcam-loop";

const LOOP_MS = 9000;

// Question, typing, reply with the link, the player unfurls, then a click
// starts it.
const STEPS = [0, 300, 900, 1700, 2200, 3300, 3900];

const PRESENTER = "/webcam/striped.jpg";
const PEOPLE_COLORS = ["#8b5cf6", "#0d9488", "#1184f7"];

type EmbedCopy = ReturnType<
  typeof useMessages
>["collaboration"]["categories"]["embed"]["scene"];

export function EmbedScene() {
  return (
    <SceneFrame
      steps={STEPS}
      loopMs={LOOP_MS}
      background="linear-gradient(160deg,#dcc6fb,#c6a9f6)"
      zoom={{ scale: 1, bounds: [40, 560] }}
    >
      {(state) => <EmbedContent {...state} />}
    </SceneFrame>
  );
}

function EmbedContent({ step }: SceneState) {
  const copy = useMessages().collaboration.categories.embed.scene;
  const asked = step >= 1;
  const typing = step === 2;
  const replied = step >= 3;
  const unfurled = step >= 4;
  const pointing = step >= 5;
  const playing = step >= 6;

  return (
    <>
      <div
        className={cn(
          "absolute top-5 right-10 w-[340px] rounded-2xl rounded-br-[4px] bg-white px-5 py-3.5 text-[16px] leading-snug font-medium text-[#a855f7] shadow-[0_16px_36px_rgb(76_29_149/0.14)] transition-all duration-300",
          asked ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        {copy.question}
      </div>

      <div
        className={cn(
          "absolute top-[114px] left-10 rounded-2xl rounded-tl-[4px] bg-[#42275a] px-5 py-3.5 shadow-[0_22px_44px_rgb(66_39_90/0.3)] transition-all duration-300",
          typing ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        <TypingDots />
      </div>

      <div
        className={cn(
          "absolute top-[114px] left-10 w-[430px] rounded-2xl rounded-tl-[4px] bg-[#42275a] px-5 py-3.5 shadow-[0_22px_44px_rgb(66_39_90/0.3)] transition-[opacity,translate] duration-300",
          replied ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        <p className="text-[15px] leading-snug text-white">{copy.reply}</p>
        <p className="mt-1 font-mono text-[15px] text-[#c99bf5]">{copy.url}</p>
        <div
          className={cn(
            "grid transition-[grid-template-rows,margin] duration-450 ease-[cubic-bezier(0.22,1,0.36,1)]",
            unfurled ? "mt-3 grid-rows-[1fr]" : "mt-0 grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <Player
              pointing={pointing}
              playing={playing}
              screen={copy}
              duration={copy.duration}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function Player({
  pointing,
  playing,
  screen,
  duration,
}: {
  pointing: boolean;
  playing: boolean;
  screen: EmbedCopy;
  duration: string;
}) {
  const fillRef = useRef<HTMLSpanElement>(null);
  useLoopAnimation(
    fillRef,
    [{ width: "0%" }, { width: "100%" }],
    LOOP_MS - STEPS[6],
    playing,
  );

  return (
    <div className="relative h-[184px] overflow-hidden rounded-xl bg-[linear-gradient(160deg,#4f6fb8,#3a2b5c_45%,#8c2f3a_75%,#2a1020)]">
      <div className="absolute inset-x-6 top-4 bottom-0 overflow-hidden rounded-t-lg bg-[#f5f5f5] text-[#181818]">
        <div className="flex h-5 items-center gap-1 bg-[#eaeaea] px-2">
          <span className="size-1.5 rounded-full bg-[#ff5f57]" />
          <span className="size-1.5 rounded-full bg-[#febc2e]" />
          <span className="size-1.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex">
          <div className="flex w-[92px] shrink-0 flex-col gap-0.5 border-r border-black/5 p-2.5">
            <span className="mb-1 text-[12px] font-bold">{screen.app}</span>
            {screen.nav.map((item, i) => (
              <span
                key={item}
                className={cn(
                  "rounded px-1.5 py-[3px] text-[11px] font-medium",
                  i === 1 ? "bg-[#ede5f8] text-[#7c3aed]" : "text-black/50",
                )}
              >
                {item}
              </span>
            ))}
          </div>
          <div className="flex flex-1 flex-col gap-1.5 p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold">{screen.members}</span>
              <span className="rounded bg-[#7c3aed] px-2 py-[3px] text-[11px] font-semibold text-white">
                {screen.invite}
              </span>
            </div>
            {screen.people.map((person, i) => (
              <span
                key={person.name}
                className="flex items-center gap-1.5 rounded bg-white px-1.5 py-1 shadow-[0_1px_2px_rgb(0_0_0/0.05)]"
              >
                <span
                  className="flex size-4 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white"
                  style={{ background: PEOPLE_COLORS[i] }}
                >
                  {person.initials}
                </span>
                <span className="flex-1 truncate text-[11px] font-medium">
                  {person.name}
                </span>
                <span className="text-[10px] text-black/40">{person.role}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <span className="absolute bottom-3 left-3 size-[84px] overflow-hidden rounded-full bg-[#d9d4c8] shadow-[0_0_0_3px_#fff,0_8px_18px_rgb(0_0_0/0.3)]">
        {playing ? (
          <WebcamLoop name="striped" />
        ) : (
          <img src={PRESENTER} alt="" className="size-full object-cover" />
        )}
      </span>

      <span
        className={cn(
          "absolute top-1/2 left-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#3b3550]/90 shadow-[0_0_0_6px_rgb(255_255_255/0.25)] transition-all duration-300",
          playing ? "scale-75 opacity-0" : "scale-100 opacity-100",
          pointing && !playing && "scale-110",
        )}
      >
        <Play className="size-6 translate-x-0.5 fill-white text-white" />
      </span>

      <MousePointer2
        className={cn(
          "absolute size-6 fill-white text-[#3b3550] drop-shadow transition-all duration-450 ease-[cubic-bezier(0.22,1,0.36,1)]",
          pointing ? "top-[104px] left-[215px]" : "top-[160px] left-[360px]",
          playing && "opacity-0",
        )}
      />

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex items-center gap-2 bg-[linear-gradient(transparent,rgb(0_0_0/0.65))] pt-5 pr-3 pb-2 pl-[104px] transition-opacity duration-300",
          playing ? "opacity-100" : "opacity-0",
        )}
      >
        <span className="relative h-1 flex-1 rounded-full bg-white/35">
          <span
            ref={fillRef}
            className="absolute inset-y-0 left-0 rounded-full bg-white"
          />
        </span>
        <span className="font-mono text-[12px] text-white">{duration}</span>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="flex h-4 items-center justify-center gap-1">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-1.5 animate-bounce rounded-full bg-white/70"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

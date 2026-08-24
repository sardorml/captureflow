"use client";

import type { LucideIcon } from "lucide-react";

export type SceneChip = { label: string; Icon: LucideIcon };

export type SceneKind = "share" | "screenshot" | "workspaces";

/*
 * The scene is authored against ScaledMockup's reference box, so every offset
 * here is a plain pixel value at that size and the whole thing scales as one.
 */
const REF_WIDTH = 440;
const REF_HEIGHT = 320;

/*
 * The window does not fill the panel: the margin it leaves at the top right is
 * where the chips go, and the one along the bottom is where the decoration
 * shows. Without that margin both land on the mockup and cover it.
 */
const BEZEL = 5;
const WINDOW = { left: 20, top: 46, width: 330 };

/*
 * Every mockup is authored against the full reference box, so the window scales
 * one down rather than handing it a smaller box to reflow into — squeezing them
 * cropped rows off the bottom of the longer ones.
 */
const INNER_SCALE = (WINDOW.width - BEZEL * 2) / REF_WIDTH;
const WINDOW_HEIGHT = REF_HEIGHT * INNER_SCALE + BEZEL * 2;

/*
 * Chips overlap the window's top-right corner and stagger the way stacked
 * cards do — the lower one sits further out and reads as the nearer of the
 * two. They stay inside the reference box, so the card's overflow never
 * clips a label.
 */
const CHIP_SLOTS = [
  { top: 6, right: 92, width: 78 },
  { top: 52, right: 6, width: 86 },
];

function Chip({
  chip,
  slot,
}: {
  chip: SceneChip;
  slot: (typeof CHIP_SLOTS)[number];
}) {
  const { Icon } = chip;
  return (
    <div
      className="absolute flex flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-[#1b1f27] px-2 py-2.5 text-center"
      style={{
        top: slot.top,
        right: slot.right,
        width: slot.width,
        boxShadow: "0 14px 34px rgb(0 0 0 / 0.5)",
      }}
    >
      <span className="flex size-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-accent">
        <Icon className="size-4" strokeWidth={2} />
      </span>
      <span className="text-[10px] font-semibold leading-[1.3] text-balance text-white">
        {chip.label}
      </span>
    </div>
  );
}

/*
 * One decoration per capability, bleeding past the window the way the sound of
 * a recording spills past its frame. Purely atmospheric — aria-hidden, and it
 * sits under the window so it never competes with the mockup itself.
 */
function Decoration({ kind }: { kind: SceneKind }) {
  if (kind === "share") {
    return (
      <svg
        aria-hidden
        viewBox="0 0 240 60"
        className="absolute text-accent"
        style={{ left: -18, bottom: 1, width: 200, opacity: 0.65 }}
      >
        <path
          d="M0 40c8 0 8-22 16-22s8 30 16 30 8-34 16-34 8 26 16 26 8-18 16-18 8 22 16 22 8-28 16-28 8 24 16 24 8-16 16-16 8 18 16 18 8-24 16-24 8 20 16 20 8-12 16-12 8 14 16 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (kind === "screenshot") {
    return (
      <div
        aria-hidden
        className="absolute rounded-xl border-2 border-dashed border-accent/60"
        style={{ left: 12, bottom: 4, width: 132, height: 34 }}
      >
        <span className="absolute -bottom-1 -right-1 size-2.5 rounded-full bg-accent" />
        <span className="absolute -bottom-1 -left-1 size-2.5 rounded-full bg-accent" />
      </div>
    );
  }
  return (
    <div
      aria-hidden
      className="absolute flex items-center"
      style={{ left: 16, bottom: 4 }}
    >
      {[0.9, 0.65, 0.4].map((o, i) => (
        <span
          key={i}
          className="size-6 rounded-full border-2 border-[#0f1218] bg-accent"
          style={{ opacity: o, marginLeft: i === 0 ? 0 : -9 }}
        />
      ))}
    </div>
  );
}

/*
 * Wraps a mockup in the illustrated stage the landing uses: a washed panel,
 * the frame floating inside it on a gradient bezel, and a pair of chips
 * naming what the slide is showing.
 */
export function MockupScene({
  kind,
  chips,
  children,
}: {
  kind: SceneKind;
  chips: SceneChip[];
  children: React.ReactNode;
}) {
  return (
    <div
      dir="ltr"
      className="relative overflow-hidden"
      style={{ width: REF_WIDTH, height: REF_HEIGHT }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 85% at 80% 6%, rgb(59 130 246 / 0.28), transparent 60%)," +
            "linear-gradient(155deg, #1b2130 0%, #12161f 55%, #0f1218 100%)",
        }}
      />

      <Decoration kind={kind} />

      {/* The bezel is the frame's own colour, so the window reads as one solid
          object rather than a screenshot pasted onto a panel. */}
      <div
        className="absolute"
        style={{
          left: WINDOW.left,
          top: WINDOW.top,
          width: WINDOW.width,
          height: WINDOW_HEIGHT,
          borderRadius: 16,
          padding: BEZEL,
          background:
            "linear-gradient(150deg, rgb(96 165 250 / 0.8), rgb(59 130 246 / 0.72) 45%, rgb(37 99 235 / 0.66))",
          boxShadow: "0 22px 48px rgb(0 0 0 / 0.55)",
        }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[11px]">
          <div
            className="origin-top-left"
            style={{
              width: REF_WIDTH,
              height: REF_HEIGHT,
              transform: `scale(${INNER_SCALE})`,
            }}
          >
            {children}
          </div>
        </div>
      </div>

      {chips.slice(0, CHIP_SLOTS.length).map((chip, i) => (
        <Chip key={chip.label} chip={chip} slot={CHIP_SLOTS[i]} />
      ))}
    </div>
  );
}

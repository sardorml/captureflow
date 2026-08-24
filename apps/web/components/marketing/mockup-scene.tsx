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
/*
 * One solid colour per section rather than one gradient for all three, so the
 * three panels read as three places. The accent is the same hue at full
 * strength: it frames the window and tints the chip glyphs.
 */
const PALETTE: Record<SceneKind, { panel: string; accent: string }> = {
  share: { panel: "#16233d", accent: "#3b82f6" },
  screenshot: { panel: "#241c3d", accent: "#8b5cf6" },
  workspaces: { panel: "#102e2c", accent: "#14b8a6" },
};

const CHIP_SLOTS = [
  { top: 6, right: 92, width: 78 },
  { top: 52, right: 6, width: 86 },
];

function Chip({
  chip,
  slot,
  accent,
}: {
  chip: SceneChip;
  slot: (typeof CHIP_SLOTS)[number];
  accent: string;
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
      <span
        className="flex size-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06]"
        style={{ color: accent }}
      >
        <Icon className="size-4" strokeWidth={2} />
      </span>
      <span className="text-[10px] font-semibold leading-[1.3] text-balance text-white">
        {chip.label}
      </span>
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
      className="relative overflow-hidden rounded-3xl"
      style={{
        width: REF_WIDTH,
        height: REF_HEIGHT,
        backgroundColor: PALETTE[kind].panel,
      }}
    >
      {/* The bezel carries the section's accent, so the window reads as one
          solid object rather than a screenshot pasted onto a panel. */}
      <div
        className="absolute"
        style={{
          left: WINDOW.left,
          top: WINDOW.top,
          width: WINDOW.width,
          height: WINDOW_HEIGHT,
          borderRadius: 16,
          padding: BEZEL,
          backgroundColor: PALETTE[kind].accent,
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
        <Chip
          key={chip.label}
          chip={chip}
          slot={CHIP_SLOTS[i]}
          accent={PALETTE[kind].accent}
        />
      ))}
    </div>
  );
}

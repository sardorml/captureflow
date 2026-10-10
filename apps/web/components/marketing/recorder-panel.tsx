"use client";

import type { CSSProperties, ReactNode } from "react";
import { useMessages } from "./i18n-provider";

/*
 * Every glyph in the panel is the extension's own SVG, copied from
 * apps/extension/entrypoints/popup/*, rather than the nearest lucide icon: two
 * icons drawn to different shares of their box read as different sizes side by
 * side, which is exactly what a portrait of the panel can't afford. Sizes are
 * the ones that end up on screen — the header pair is 20px because HeroUI's
 * Button sizes any icon inside it, the rest keep the size on the tag.
 */
const HOME_ICON = (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
    <path
      d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9.5z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const VIDEO_ICON = (
  <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden>
    <rect
      x="3"
      y="6.5"
      width="12.5"
      height="11"
      rx="2.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="m16 10.5 4.2-2.4v7.8L16 13.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const PHOTO_ICON = (
  <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden>
    <path
      d="M8.5 6.5 10 4.5h4l1.5 2H19a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18V8A1.5 1.5 0 0 1 5 6.5h3.5z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="12.7"
      r="3.2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
  </svg>
);

const CLOSE_ICON = (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
    <path
      d="m6 6 12 12M18 6 6 18"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const SCREEN_ICON = (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
    <rect
      x="3"
      y="5"
      width="18"
      height="12.5"
      rx="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M9 20.5h6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const CAMERA_ICON = (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
    <rect
      x="3"
      y="6.5"
      width="12.5"
      height="11"
      rx="2.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="m16 10.5 4.2-2.4v7.8L16 13.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const MIC_ICON = (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
    <rect
      x="9"
      y="3.5"
      width="6"
      height="11"
      rx="3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

// Points up because the panel's menu opens upward out of the footer.
const MORE_ICON = (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
    <path
      d="m7 14 5-5 5 5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Keep this mode set in sync with the extension popup's Tabs (video + screenshot).
// The mockup holds the video tab: it is the section's subject, and a panel that
// swapped under you while you read it was harder to follow than it was lively.
const MODES = [
  { key: "share", icon: VIDEO_ICON },
  { key: "screenshot", icon: PHOTO_ICON },
] as const;

/*
 * The panel is a portrait of the extension popup, so its palette is the
 * extension's own rather than anything from this page's theme — HeroUI's dark
 * tokens, plus the three surfaces popup.css lifts (a panel floating over
 * someone else's page can't sit at HeroUI's near-black). Values are copied from
 * @heroui/styles' dark theme and apps/extension/entrypoints/popup/popup.css;
 * they are scoped here so the mockup reads the same under either page theme.
 */
const EXT_PALETTE = {
  "--cf-ext-background": "#303030",
  "--cf-ext-surface": "#404040",
  "--cf-ext-foreground": "oklch(0.9911 0 0)",
  "--cf-ext-muted": "oklch(70.5% 0.015 286.067)",
  "--cf-ext-border": "oklch(28% 0.006 286.033)",
  "--cf-ext-separator": "oklch(25% 0.006 286.033)",
  "--cf-ext-accent": "oklch(0.6204 0.195 253.83)",
  "--cf-ext-accent-soft":
    "color-mix(in oklab, oklch(0.6204 0.195 253.83) 12%, transparent)",
  "--cf-ext-accent-soft-foreground":
    "color-mix(in oklab, oklch(0.6204 0.195 253.83) 80%, oklch(0.9911 0 0) 30%)",
  "--cf-ext-success": "oklch(0.7329 0.1935 150.81)",
  "--cf-ext-default": "oklch(27.4% 0.006 286.033)",
  "--cf-ext-segment": "oklch(0.3964 0.01 285.93)",
  // The one committing action carries its own warm fill, not the accent.
  "--cf-ext-start": "#e8563a",
} as CSSProperties;

// The panel is authored at the extension popup's own width and scaled as a
// single block, so the mockup is the panel at life size on any viewport wide
// enough to hold it and keeps its proportions on any that isn't. Keep this in
// step with apps/extension/entrypoints/popup/popup.css.
const PANEL_WIDTH = 280;

const ROW =
  "flex items-center gap-2.5 rounded-xl bg-[color:var(--cf-ext-surface)] px-2.5 py-2";

function StatePill({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${
        on
          ? "border-[color:var(--cf-ext-success)] text-[color:var(--cf-ext-success)]"
          : "border-[color:var(--cf-ext-separator)] text-[color:var(--cf-ext-muted)]"
      }`}
    >
      {label}
    </span>
  );
}

function DeviceRow({
  icon,
  label,
  on,
  onLabel,
  meter,
  ref,
}: {
  icon: ReactNode;
  label: string;
  on: boolean;
  onLabel: string;
  meter?: boolean;
  ref?: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={ref}
      className={`${ROW} relative overflow-hidden text-[color:var(--cf-ext-foreground)] ${
        on ? "outline outline-[color:var(--cf-ext-border)]" : ""
      }`}
    >
      <span className="flex shrink-0" aria-hidden>
        {icon}
      </span>
      {/* The popup names the device through a Select, whose trigger is
          min-h-9 — that, not the label, is what sets the row's height. */}
      <span className="flex min-h-9 min-w-0 flex-1 items-center">
        <span className="truncate text-sm font-medium">{label}</span>
      </span>
      <StatePill on={on} label={onLabel} />
      {meter && (
        // Mic level: a Meter pinned along the row's bottom edge, accent-filled.
        <span
          className="absolute inset-x-0 bottom-0 h-1 rounded-xs bg-[color:var(--cf-ext-accent)]"
          style={{ width: "42%" }}
          aria-hidden
        />
      )}
    </div>
  );
}

// Measured off the panel's own trigger: 40px tall, 24px radius, 1px border in
// --cf-ext-border, 14px/500 label, 8px gap, 16px inline padding.
function ToolButton({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="flex h-10 w-full items-center justify-center gap-2 rounded-3xl border border-[color:var(--cf-ext-border)] px-4 text-sm font-medium text-[color:var(--cf-ext-foreground)]">
      {label}
      {icon}
    </span>
  );
}

// A portrait of the extension popup at its own width, in its own palette.
export function RecorderPanel() {
  const m = useMessages();
  const copy = m.modes.panel;
  return (
    <div
      className="relative flex flex-col gap-2.5 rounded-2xl bg-[color:var(--cf-ext-background)] p-3 shadow-[0_16px_40px_rgba(0,0,0,0.28)]"
      style={{ ...EXT_PALETTE, width: PANEL_WIDTH }}
    >
      <header className="flex items-center justify-between gap-2 text-[color:var(--cf-ext-foreground)]">
        <span className="flex h-10 w-10 items-center justify-center">
          {HOME_ICON}
        </span>

        {/* Tabs: the list container paints the track, and the
                          selected tab gets the segment pill with an accent
                          glyph — HeroUI's indicator, not a white chip. */}
        <div className="inline-flex rounded-[20px] bg-[color:var(--cf-ext-default)] p-1">
          {MODES.map((mode, i) => {
            const isActive = i === 0;
            return (
              <span
                key={mode.key}
                aria-label={m.modes.tabs[mode.key].label}
                className={`flex h-8 items-center justify-center rounded-3xl px-4 ${
                  isActive
                    ? "bg-[color:var(--cf-ext-segment)] text-[color:var(--cf-ext-accent)]"
                    : "text-[color:var(--cf-ext-muted)]"
                }`}
              >
                {mode.icon}
              </span>
            );
          })}
        </div>

        <span className="flex h-10 w-10 items-center justify-center">
          {CLOSE_ICON}
        </span>
      </header>

      {/* HeroUI's Tabs.Panel pads the active panel, so the rows
                    are inset from the panel's own p-3 by another 8px. */}
      <div className="p-2">
        <div className="flex flex-col gap-2">
          {/* The source is the panel's headline choice, so the row
                          carries the accent the device rows don't. */}
          <div
            className={`${ROW} bg-[color:var(--cf-ext-accent-soft)] text-[color:var(--cf-ext-accent-soft-foreground)]`}
            aria-label={copy.sourceAria}
          >
            <span className="flex shrink-0" aria-hidden>
              {SCREEN_ICON}
            </span>
            <span className="flex-1 truncate text-sm font-semibold">
              {copy.source}
            </span>
            <span className="text-xs opacity-70">{copy.sourceHint}</span>
          </div>

          {/* The device rows sit closer to each other than to the
                          source above them, as they do in the popup. */}
          <section className="flex flex-col gap-1.5">
            <DeviceRow
              icon={CAMERA_ICON}
              label={copy.camera}
              on
              onLabel={copy.on}
            />
            <DeviceRow
              icon={MIC_ICON}
              label={copy.microphone}
              on
              onLabel={copy.on}
              meter
            />
          </section>

          <span className="flex h-10 items-center justify-center rounded-xl bg-[color:var(--cf-ext-start)] text-sm font-semibold text-white">
            {copy.startRecording}
          </span>
        </div>
      </div>

      <footer>
        <ToolButton icon={MORE_ICON} label={copy.more} />
      </footer>
    </div>
  );
}

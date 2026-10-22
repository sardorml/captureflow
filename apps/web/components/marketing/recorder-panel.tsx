"use client";

import type { CSSProperties, ReactNode } from "react";
import { useMessages } from "./i18n-provider";

/*
 * Every glyph in the panel is the extension's own SVG, copied from
 * apps/extension/entrypoints/popup/*, at the size it has there: two icons
 * drawn to different shares of their box read as different sizes side by
 * side, which is exactly what a portrait of the panel can't afford.
 */
const HOME_ICON = (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
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
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
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
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
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
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
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
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
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
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
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

const GLOBE_ICON = (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
    <circle
      cx="12"
      cy="12"
      r="8.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M3.5 12h17M12 3.5c2.6 2.6 2.6 14.4 0 17M12 3.5c-2.6 2.6-2.6 14.4 0 17"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
  </svg>
);

const MORE_ICON = (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
    <circle cx="5" cy="12" r="1.8" fill="currentColor" />
    <circle cx="12" cy="12" r="1.8" fill="currentColor" />
    <circle cx="19" cy="12" r="1.8" fill="currentColor" />
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
 * The panel is a portrait of the extension popup in its dark theme, so its
 * palette is scoped here rather than taken from this page's theme: the values
 * are popup.css's dark block, which is this site's own dark palette, and the
 * mockup reads the same under either page theme.
 */
const EXT_PALETTE = {
  "--cf-ext-background": "#201f1d",
  "--cf-ext-surface": "#2a2927",
  "--cf-ext-foreground": "#fcfcfc",
  "--cf-ext-muted": "#a3a19d",
  "--cf-ext-separator": "#363432",
  "--cf-ext-accent": "#0485f7",
  "--cf-ext-ring": "#8ec4fb",
  // The one committing action carries its own brick-red fill, not the accent.
  "--cf-ext-start": "#bc381c",
} as CSSProperties;

// The panel is authored at the extension popup's own width and scaled as a
// single block, so the mockup is the panel at life size on any viewport wide
// enough to hold it and keeps its proportions on any that isn't. Keep this in
// step with apps/extension/entrypoints/popup/popup.css.
const PANEL_WIDTH = 280;

// The popup's PANEL_ROW: 50px tall, 14px radius, 16px inline padding, a
// 15px semibold label beside a 24px icon.
const ROW =
  "flex h-[50px] items-center gap-2 rounded-[14px] px-4 text-[15px] font-semibold";
const ROW_GREY = `${ROW} border border-[color:var(--cf-ext-separator)] bg-[color:var(--cf-ext-surface)]`;

function DeviceRow({
  icon,
  label,
  meter,
}: {
  icon: ReactNode;
  label: string;
  meter?: boolean;
}) {
  return (
    <div
      className={`${ROW_GREY} relative overflow-hidden text-[color:var(--cf-ext-foreground)]`}
    >
      <span className="flex shrink-0" aria-hidden>
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
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

// The popup's footer action: a 22px icon over a 12px label.
function FooterAction({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="flex flex-col items-center gap-1 px-3 py-1 text-xs text-[color:var(--cf-ext-muted)]">
      {icon}
      {label}
    </span>
  );
}

// A portrait of the extension popup at its own width, in its own palette.
export function RecorderPanel() {
  const m = useMessages();
  const copy = m.modes.panel;
  return (
    <div
      className="relative flex flex-col gap-5 rounded-[20px] border border-[color:var(--cf-ext-separator)] bg-[color:var(--cf-ext-background)] px-[19px] pt-4 pb-5 text-[color:var(--cf-ext-foreground)] shadow-[0_4px_18px_rgb(0_0_0/0.45)]"
      style={{ ...EXT_PALETTE, width: PANEL_WIDTH }}
    >
      <header className="flex items-center justify-between gap-2">
        <span className="flex size-10 items-center justify-center">
          {HOME_ICON}
        </span>

        {/* The mode switch: a bordered track on the row colour, the selected
            tab on a pill of the card colour with an accent glyph. */}
        <div className="inline-flex rounded-[14px] border border-[color:var(--cf-ext-separator)] bg-[color:var(--cf-ext-surface)] p-1">
          {MODES.map((mode, i) => {
            const isActive = i === 0;
            return (
              <span
                key={mode.key}
                aria-label={m.modes.tabs[mode.key].label}
                className={`flex h-10 items-center justify-center rounded-[10px] px-[21px] ${
                  isActive
                    ? "bg-[color:var(--cf-ext-background)] text-[color:var(--cf-ext-accent)]"
                    : "text-[color:var(--cf-ext-muted)]"
                }`}
              >
                {mode.icon}
              </span>
            );
          })}
        </div>

        <span className="flex size-10 items-center justify-center">
          {CLOSE_ICON}
        </span>
      </header>

      <div className="flex flex-col gap-4">
        {/* The source is the panel's headline choice, so the row carries the
            accent the device rows don't. */}
        <div
          className={`${ROW} border-2 border-[color:var(--cf-ext-ring)] bg-[color:var(--cf-ext-accent)] text-white`}
          aria-label={copy.sourceAria}
        >
          <span className="flex shrink-0" aria-hidden>
            {SCREEN_ICON}
          </span>
          <span className="flex-1 truncate">{copy.source}</span>
        </div>

        <DeviceRow icon={CAMERA_ICON} label={copy.camera} />
        <DeviceRow icon={MIC_ICON} label={copy.microphone} meter />

        <span className="flex h-[50px] items-center justify-center rounded-[14px] border border-[color:var(--cf-ext-separator)] bg-[color:var(--cf-ext-start)] text-[15px] font-semibold text-white">
          {copy.startRecording}
        </span>
      </div>

      <footer className="-mt-2 flex justify-center gap-6">
        <FooterAction icon={GLOBE_ICON} label={copy.public} />
        <FooterAction icon={MORE_ICON} label={copy.more} />
      </footer>
    </div>
  );
}

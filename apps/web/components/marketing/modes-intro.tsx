"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Paragraph, Text } from "./typography";
import { Card } from "./ui";
import { TOKENS } from "./tokens";
import {
  Camera,
  Droplets,
  House,
  Link2,
  Mic,
  Monitor,
  MoreHorizontal,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import { MarketingSection, SectionHeading } from "./_shared";
import { useMessages } from "./i18n-provider";

// Keep this mode set in sync with the extension popup's Tabs (video + screenshot).
// The mockup holds the video tab: it is the section's subject, and a panel that
// swapped under you while you read it was harder to follow than it was lively.
const MODES = [
  { key: "share", icon: Video },
  { key: "screenshot", icon: Camera },
] as const;

/*
 * Each callout is pinned to the y of the control it describes, measured off the
 * live panel rather than guessed, so the leader always lands on that row. `anchor`
 * names the measured point; DOM order here is the mobile reading order.
 */
const CALLOUTS = [
  { key: "source", icon: Monitor, anchor: "source", side: "left" },
  { key: "link", icon: Link2, anchor: "start", side: "left" },
  { key: "screenshot", icon: Camera, anchor: "photoTab", side: "right" },
  { key: "devices", icon: Mic, anchor: "devices", side: "right" },
] as const;

// Callout box + the leader's span. The pair has to clear the panel on both
// sides inside the section's measure, which is why the pinned layout only
// switches on at xl.
const CALLOUT_WIDTH = 256;
const LEADER_GAP = "3.5rem";

/*
 * The panel is a portrait of the extension popup, so its palette is the
 * extension's own rather than anything from this page's theme — HeroUI's dark
 * tokens, plus the three surfaces popup.css lifts (a panel floating over
 * someone else's page can't sit at HeroUI's near-black). Values are copied from
 * @heroui/styles' dark theme and apps/extension/entrypoints/popup/popup.css;
 * they are scoped here so the mockup reads the same under either page theme.
 */
const EXT_PALETTE = {
  "--cf-ext-background": "#131317",
  "--cf-ext-surface": "#222228",
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

// The panel is authored at the extension popup's real width and scaled as one
// block, so the mockup keeps the proportions a user actually sees.
const PANEL_WIDTH = 308;
const MAX_SCALE = 1.35;

const ROW =
  "flex items-center gap-2.5 rounded-xl bg-[color:var(--cf-ext-surface)] px-2.5 py-2";

function IconGlyph({ icon: Glyph }: { icon: typeof Camera }) {
  return <Glyph className="h-4 w-4 shrink-0" strokeWidth={1.8} />;
}

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
  icon: typeof Camera;
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
      <IconGlyph icon={icon} />
      <span className="flex-1 truncate text-sm font-medium">{label}</span>
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

function ToolButton({
  icon: Glyph,
  label,
}: {
  icon: typeof Camera;
  label: string;
}) {
  return (
    // Disabled ghost buttons — foreground at HeroUI's --disabled-opacity.
    <span className="flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium text-[color:var(--cf-ext-foreground)] opacity-50">
      <Glyph className="h-4 w-4" strokeWidth={1.8} />
      {label}
    </span>
  );
}

function Callout({
  icon,
  title,
  body,
  side,
  pinned,
}: {
  icon: typeof Camera;
  title: string;
  body: string;
  side: "left" | "right";
  // Pinned beside the panel with a leader, rather than stacked underneath it.
  pinned: boolean;
}) {
  const isLeft = side === "left";
  return (
    <div
      className={`border-line bg-canvas/70 relative rounded-2xl border p-4 backdrop-blur-sm ${
        pinned ? "" : "w-full"
      }`}
    >
      {pinned && (
        <>
          {/* Runs from the box to the panel's edge at exactly the row's y —
              the box is centred on that y, so its mid-height is the anchor. */}
          <span
            aria-hidden
            className={`bg-line-strong absolute top-1/2 block h-px ${isLeft ? "left-full" : "right-full"}`}
            style={{ width: LEADER_GAP }}
          />
          <span
            aria-hidden
            className={`bg-accent absolute top-1/2 block size-1.5 -translate-y-1/2 rounded-full ${
              isLeft ? "left-full" : "right-full"
            }`}
            style={
              isLeft
                ? { marginLeft: `calc(${LEADER_GAP} - 3px)` }
                : { marginRight: `calc(${LEADER_GAP} - 3px)` }
            }
          />
        </>
      )}
      <div
        className={`flex items-start gap-3 ${pinned && isLeft ? "flex-row-reverse" : ""}`}
      >
        <span className="border-line text-fg-muted mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border">
          <IconGlyph icon={icon} />
        </span>
        <div>
          <Text strong style={{ fontSize: 16 }}>
            {title}
          </Text>
          <Paragraph
            type="secondary"
            style={{ margin: "4px 0 0", fontSize: 14, lineHeight: 1.5 }}
          >
            {body}
          </Paragraph>
        </div>
      </div>
    </div>
  );
}

export function ModesIntro() {
  const m = useMessages();
  const token = TOKENS;
  const copy = m.modes.panel;

  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Anchors are read off the live controls, so the leaders keep pointing at the
  // right rows if the panel's copy or spacing ever changes.
  const anchorRefs = useRef<Record<string, HTMLElement | null>>({});
  const [anchors, setAnchors] = useState<Record<string, number>>({});
  const [panelSize, setPanelSize] = useState({ w: 0, h: 0 });
  const [fit, setFit] = useState(1);
  // Only wide viewports can hold panel + two callout columns; narrower ones
  // stack the callouts under the panel, where a leader would point at nothing.
  const [pinned, setPinned] = useState(false);

  const setAnchorRef = (key: string) => (el: HTMLElement | null) => {
    anchorRefs.current[key] = el;
  };

  useEffect(() => {
    const measure = () => {
      const panel = panelRef.current;
      const container = containerRef.current;
      if (!panel || !container) return;
      const w = panel.offsetWidth;
      const h = panel.offsetHeight;
      const available = container.clientWidth;
      setPanelSize({ w, h });
      // Both guards matter: an unmeasurable container once scaled the panel to
      // 0 rather than leaving it at its natural size.
      setFit(
        w > 0 && available > 0
          ? Math.min(MAX_SCALE, (available * 0.92) / w)
          : 1,
      );

      const centre = (el: HTMLElement | null) =>
        el ? el.offsetTop + el.offsetHeight / 2 : 0;
      const camera = anchorRefs.current.camera;
      const mic = anchorRefs.current.mic;
      setAnchors({
        photoTab: centre(anchorRefs.current.photoTab),
        source: centre(anchorRefs.current.source),
        start: centre(anchorRefs.current.start),
        // One leader for the camera/mic pair: the midpoint of the two rows.
        devices:
          camera && mic
            ? (camera.offsetTop + mic.offsetTop + mic.offsetHeight) / 2
            : 0,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (panelRef.current) ro.observe(panelRef.current);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const sync = () => setPinned(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <MarketingSection id="modes" style={{ scrollMarginTop: 24 }}>
      <SectionHeading
        eyebrow={m.modes.eyebrow}
        title={m.modes.headingLine1}
        titleMuted={m.modes.headingLine2}
        subtitle={
          <>
            {m.modes.subtitleLine1}{" "}
            {/* Forced break desktop-only; on phones it would orphan words. */}
            <br className="hidden sm:inline" />
            {m.modes.subtitleLine2}
          </>
        }
      />

      <Card
        styles={{
          body: {
            paddingBlock: "clamp(40px, 6vw, 72px)",
            paddingInline: "clamp(24px, 4vw, 56px)",
          },
        }}
        style={{
          background: token.colorFillTertiary,
          borderColor: token.colorBorderSecondary,
        }}
      >
        {/* The callouts are pinned to the panel box rather than laid out in
            columns beside it: a grid track would squeeze them to whatever
            width was left over, and its rows can't line a box up with the
            control it describes. Absolute keeps each box at its own width and
            lets the pair overhang the card, which is overflow-visible. */}
        <div ref={containerRef} className="flex flex-col items-center">
          <div
            className="relative"
            style={{
              width: panelSize.w ? panelSize.w * fit : undefined,
              height: panelSize.h ? panelSize.h * fit : undefined,
            }}
          >
            {/* Content-sized so the panel lays out at its natural width,
                    then scales as one block. `dir=ltr` keeps cluster order
                    under RTL locales. */}
            <div
              className="absolute top-0 left-0 origin-top-left"
              dir="ltr"
              style={{ transform: `scale(${fit})` }}
            >
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2 rounded-lg bg-[#171717] px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-sm">
                {m.modes.tabs.share.caption}
              </div>

              <div
                ref={panelRef}
                className="relative flex flex-col gap-2.5 rounded-2xl bg-[color:var(--cf-ext-background)] p-3 shadow-[0_24px_64px_rgba(0,0,0,0.5)]"
                style={{ ...EXT_PALETTE, width: PANEL_WIDTH }}
              >
                <header className="flex items-center justify-between gap-2 text-[color:var(--cf-ext-foreground)]">
                  <span className="flex h-8 w-8 items-center justify-center">
                    <IconGlyph icon={House} />
                  </span>

                  {/* Tabs: the list container paints the track, and the
                          selected tab gets the segment pill with an accent
                          glyph — HeroUI's indicator, not a white chip. */}
                  <div className="inline-flex rounded-[20px] bg-[color:var(--cf-ext-default)] p-1">
                    {MODES.map((mode, i) => {
                      const Glyph = mode.icon;
                      const isActive = i === 0;
                      return (
                        <span
                          key={mode.key}
                          ref={isActive ? undefined : setAnchorRef("photoTab")}
                          aria-label={m.modes.tabs[mode.key].label}
                          className={`flex h-8 items-center justify-center rounded-3xl px-4 ${
                            isActive
                              ? "bg-[color:var(--cf-ext-segment)] text-[color:var(--cf-ext-accent)]"
                              : "text-[color:var(--cf-ext-muted)]"
                          }`}
                        >
                          <Glyph className="h-4 w-4" strokeWidth={1.8} />
                        </span>
                      );
                    })}
                  </div>

                  <span className="flex h-8 w-8 items-center justify-center">
                    <IconGlyph icon={X} />
                  </span>
                </header>

                <div className="flex flex-col gap-2">
                  {/* The source is the panel's headline choice, so the row
                          carries the accent the device rows don't. */}
                  <div
                    ref={setAnchorRef("source")}
                    className={`${ROW} bg-[color:var(--cf-ext-accent-soft)] text-[color:var(--cf-ext-accent-soft-foreground)]`}
                    aria-label={copy.sourceAria}
                  >
                    <IconGlyph icon={Monitor} />
                    <span className="flex-1 truncate text-sm font-semibold">
                      {copy.source}
                    </span>
                    <span className="text-xs opacity-70">
                      {copy.sourceHint}
                    </span>
                  </div>

                  <DeviceRow
                    ref={setAnchorRef("camera")}
                    icon={Camera}
                    label={copy.camera}
                    on={false}
                    onLabel={copy.off}
                  />
                  <DeviceRow
                    ref={setAnchorRef("mic")}
                    icon={Mic}
                    label={copy.microphone}
                    on
                    onLabel={copy.on}
                    meter
                  />

                  <span
                    ref={setAnchorRef("start")}
                    className="flex h-10 items-center justify-center rounded-xl bg-[color:var(--cf-ext-start)] text-sm font-semibold text-white"
                  >
                    {copy.startRecording}
                  </span>
                  <span className="-mt-1.5 text-center text-xs text-[color:var(--cf-ext-muted)]">
                    {copy.limit}
                  </span>
                </div>

                <footer className="grid grid-cols-3 items-start gap-1">
                  <ToolButton icon={Sparkles} label={copy.effects} />
                  <ToolButton icon={Droplets} label={copy.blur} />
                  <ToolButton icon={MoreHorizontal} label={copy.more} />
                </footer>
              </div>
            </div>

            {pinned &&
              CALLOUTS.map((callout) => (
                <div
                  key={callout.key}
                  className="absolute -translate-y-1/2"
                  style={{
                    width: CALLOUT_WIDTH,
                    // Anchors are panel coordinates; the box lives in the
                    // scaled wrapper, so they scale with it.
                    top: (anchors[callout.anchor] ?? 0) * fit,
                    ...(callout.side === "left"
                      ? { right: `calc(100% + ${LEADER_GAP})` }
                      : { left: `calc(100% + ${LEADER_GAP})` }),
                  }}
                >
                  <Callout
                    pinned
                    side={callout.side}
                    icon={callout.icon}
                    title={m.modes.points[callout.key].title}
                    body={m.modes.points[callout.key].body}
                  />
                </div>
              ))}
          </div>

          {!pinned && (
            <div className="mt-10 grid w-full max-w-[560px] gap-4 sm:grid-cols-2">
              {CALLOUTS.map((callout) => (
                <Callout
                  key={callout.key}
                  pinned={false}
                  side={callout.side}
                  icon={callout.icon}
                  title={m.modes.points[callout.key].title}
                  body={m.modes.points[callout.key].body}
                />
              ))}
            </div>
          )}
        </div>
      </Card>
    </MarketingSection>
  );
}

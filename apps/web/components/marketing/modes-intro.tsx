"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Paragraph, Text } from "./typography";
import {
  Camera,
  Droplet,
  House,
  Link2,
  Mic,
  Monitor,
  MoreHorizontal,
  Palette,
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
 * Each callout's leader ends on the control it describes — inside the panel, not
 * at its edge — so the target is a measured (x, y) on that element rather than
 * just a row's height. `inset` is how far in from the element's near edge the
 * dot lands: enough to read as on the control, short of the glyph or label it
 * would otherwise cover. DOM order here is the mobile reading order.
 */
const CALLOUTS = [
  { key: "source", icon: Monitor, anchor: "source", side: "left", inset: 30 },
  { key: "link", icon: Link2, anchor: "start", side: "left", inset: 44 },
  {
    key: "screenshot",
    icon: Camera,
    anchor: "photoTab",
    side: "right",
    inset: 5,
  },
  { key: "devices", icon: Mic, anchor: "mic", side: "right", inset: 6 },
] as const;

// Callout box + the leader's span. The pair has to clear the panel on both
// sides inside the section's measure, which is why the pinned layout only
// switches on at xl.
const CALLOUT_WIDTH = 256;
const LEADER_GAP = 56;
const CALLOUT_GAP = 20;
const LEADER_BEND = 20;
const OVERHANG = LEADER_GAP + CALLOUT_WIDTH;

type CalloutSpec = (typeof CALLOUTS)[number];

// Panel coordinates, before the fit scale is applied.
type Point = { x: number; y: number };

/*
 * The panel is a portrait of the extension popup, so its palette is the
 * extension's own rather than anything from this page's theme — HeroUI's dark
 * tokens, plus the three surfaces popup.css lifts (a panel floating over
 * someone else's page can't sit at HeroUI's near-black). Values are copied from
 * @heroui/styles' dark theme and apps/extension/entrypoints/popup/popup.css;
 * they are scoped here so the mockup reads the same under either page theme.
 */
const EXT_PALETTE = {
  "--cf-ext-background": "#1e1e24",
  "--cf-ext-surface": "#2c2c35",
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
const MAX_SCALE = 1;

const ROW =
  "flex items-center gap-2.5 rounded-xl bg-[color:var(--cf-ext-surface)] px-2.5 py-2";

function IconGlyph({
  icon: Glyph,
  size = 16,
}: {
  icon: typeof Camera;
  size?: number;
}) {
  return <Glyph size={size} className="shrink-0" strokeWidth={1.8} />;
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
      /* The lift on hover stays at 2px: the leaders are painted in their own
         overlay and don't travel with the box, so anything further would pull
         one off its line. */
      className={`border-line-strong bg-tint-strong hover:border-fg-subtle/60 relative rounded-2xl border p-4 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(0,0,0,0.5)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
        pinned ? "" : "w-full"
      }`}
    >
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
  const copy = m.modes.panel;

  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Anchors are read off the live controls, so the leaders keep pointing at the
  // right rows if the panel's copy or spacing ever changes.
  const anchorRefs = useRef<Record<string, HTMLElement | null>>({});
  const calloutRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [anchors, setAnchors] = useState<Record<string, Point>>({});
  const [slots, setSlots] = useState<Record<string, number>>({});
  const [panelSize, setPanelSize] = useState({ w: 0, h: 0 });
  const [fit, setFit] = useState(1);
  // Only wide viewports can hold panel + two callout columns; narrower ones
  // stack the callouts under the panel, where a leader would point at nothing.
  const [pinned, setPinned] = useState(false);

  const setAnchorRef = (key: string) => (el: HTMLElement | null) => {
    anchorRefs.current[key] = el;
  };

  const setCalloutRef = (key: string) => (el: HTMLDivElement | null) => {
    calloutRefs.current[key] = el;
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

      const next: Record<string, Point> = {};
      for (const callout of CALLOUTS) {
        const el = anchorRefs.current[callout.anchor];
        if (!el) continue;
        const y = el.offsetTop + el.offsetHeight / 2;
        const x =
          callout.side === "left"
            ? el.offsetLeft + callout.inset
            : el.offsetLeft + el.offsetWidth - callout.inset;
        next[callout.anchor] = { x, y };
      }
      setAnchors(next);
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

  /*
   * Each column is packed top-down from its boxes' own heights, so two of them
   * can never overlap however tall the copy runs, then centred on the panel.
   * A box that ends up off its control is fine — the leader angles across.
   */
  useEffect(() => {
    if (!pinned) return;
    const panelHeight = panelSize.h * fit;
    const next: Record<string, number> = {};
    for (const side of ["left", "right"] as const) {
      const column: { key: string; top: number; height: number }[] = [];
      let cursor = -Infinity;
      for (const callout of CALLOUTS.filter((c) => c.side === side)) {
        const height = calloutRefs.current[callout.key]?.offsetHeight ?? 0;
        const target = anchors[callout.anchor];
        const centre = target ? target.y * fit : panelHeight / 2;
        const top = Math.max(centre - height / 2, cursor);
        column.push({ key: callout.key, top, height });
        cursor = top + height + CALLOUT_GAP;
      }
      const first = column[0];
      const last = column[column.length - 1];
      if (!first || !last) continue;
      const span = last.top + last.height - first.top;
      const shift = (panelHeight - span) / 2 - first.top;
      for (const box of column) next[box.key] = box.top + shift;
    }
    setSlots(next);
  }, [pinned, anchors, fit, panelSize.h]);

  const slotTop = (callout: CalloutSpec) =>
    slots[callout.key] ?? (anchors[callout.anchor]?.y ?? 0) * fit;

  // Panel coordinates → the SVG's own box, which overhangs the panel by a full
  // callout on each side.
  const leaderFor = (callout: CalloutSpec) => {
    const target = anchors[callout.anchor];
    const top = slots[callout.key];
    const height = calloutRefs.current[callout.key]?.offsetHeight;
    if (!target || top == null || !height) return null;

    const isLeft = callout.side === "left";
    const panelWidth = panelSize.w * fit;
    const endX = OVERHANG + target.x * fit;
    const endY = target.y * fit;
    const startX = OVERHANG + (isLeft ? -LEADER_GAP : panelWidth + LEADER_GAP);
    const startY = top + height / 2;
    // The run straightens out just short of the panel so it arrives level with
    // the control rather than crossing other rows on the diagonal.
    const bendX = OVERHANG + (isLeft ? -LEADER_BEND : panelWidth + LEADER_BEND);
    return {
      points: `${startX},${startY} ${bendX},${endY} ${endX},${endY}`,
      endX,
      endY,
    };
  };

  return (
    /* Full-bleed band. MarketingSection is capped to the shared 1024px rail, so
       the background has to sit on a wrapper outside it; the gradient's fades
       stand in for edges, which would read as seams against the sections above
       and below. It darkens rather than lifts — the panel is the darkest thing
       on the page, and a lighter band left it looking like a hole. */
    <div
      className="w-full"
      style={{
        background:
          "linear-gradient(180deg, transparent, rgb(0 0 0 / 0.5) 12%, rgb(0 0 0 / 0.5) 88%, transparent)",
      }}
    >
      <MarketingSection id="modes" style={{ scrollMarginTop: 24 }}>
        <SectionHeading
          eyebrow={m.modes.eyebrow}
          title={m.modes.heading}
          subtitle={m.modes.subtitle}
        />

        {/* The callouts are pinned to the panel box rather than laid out in
          columns beside it: a grid track would squeeze them to whatever width
          was left over, and its rows can't line a box up with the control it
          describes. Absolute keeps each box at its own width. */}
        <div
          className="flex flex-col items-center"
          style={{ paddingBlock: "clamp(32px, 5vw, 64px)" }}
        >
          <div ref={containerRef} className="flex w-full flex-col items-center">
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
                      <IconGlyph icon={House} size={17} />
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
                            ref={
                              isActive ? undefined : setAnchorRef("photoTab")
                            }
                            aria-label={m.modes.tabs[mode.key].label}
                            className={`flex h-8 items-center justify-center rounded-3xl px-4 ${
                              isActive
                                ? "bg-[color:var(--cf-ext-segment)] text-[color:var(--cf-ext-accent)]"
                                : "text-[color:var(--cf-ext-muted)]"
                            }`}
                          >
                            <Glyph size={17} strokeWidth={1.8} />
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

                    {/* The device rows sit closer to each other than to the
                          source above them, as they do in the popup. */}
                    <section className="flex flex-col gap-1.5">
                      <DeviceRow
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
                    </section>

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
                    <ToolButton icon={Palette} label={copy.effects} />
                    <ToolButton icon={Droplet} label={copy.blur} />
                    <ToolButton icon={MoreHorizontal} label={copy.more} />
                  </footer>
                </div>
              </div>

              {pinned && (
                <>
                  {/* One overlay for every leader: a box can no longer sit level
                    with its control once the column is packed, so each leader
                    is an angled run that straightens out as it reaches the
                    panel and lands on the control itself. */}
                  <svg
                    aria-hidden
                    className="pointer-events-none absolute top-0 overflow-visible"
                    style={{
                      left: -OVERHANG,
                      width: panelSize.w * fit + OVERHANG * 2,
                      height: panelSize.h * fit,
                    }}
                  >
                    {CALLOUTS.map((callout) => {
                      const leader = leaderFor(callout);
                      if (!leader) return null;
                      return (
                        <g key={callout.key}>
                          {/* An alpha wash would vanish over the panel's own
                            surface, so the run is a solid grey held back by
                            opacity instead. */}
                          <polyline
                            points={leader.points}
                            fill="none"
                            stroke="var(--cf-fg-subtle)"
                            strokeOpacity={0.55}
                            strokeWidth={1}
                          />
                          <circle
                            cx={leader.endX}
                            cy={leader.endY}
                            r={3}
                            fill="var(--cf-accent-bg)"
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {CALLOUTS.map((callout) => (
                    <div
                      key={callout.key}
                      ref={setCalloutRef(callout.key)}
                      className="absolute"
                      style={{
                        width: CALLOUT_WIDTH,
                        top: slotTop(callout),
                        ...(callout.side === "left"
                          ? { right: `calc(100% + ${LEADER_GAP}px)` }
                          : { left: `calc(100% + ${LEADER_GAP}px)` }),
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
                </>
              )}
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
        </div>
      </MarketingSection>
    </div>
  );
}

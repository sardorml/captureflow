"use client";

import { useEffect, useRef, useState } from "react";
import { Paragraph, Text } from "./typography";
import { Col, Row } from "./layout";
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

const POINTS = [
  { key: "source", icon: Monitor },
  { key: "devices", icon: Mic },
  { key: "link", icon: Link2 },
] as const;

// The panel is authored at the extension popup's real width and scaled as one
// block, so the mockup keeps the proportions a user actually sees.
const PANEL_WIDTH = 308;
const MAX_SCALE = 1.35;

const ROW = "flex items-center gap-2.5 rounded-xl px-2.5 py-2";

function IconGlyph({ icon: Glyph }: { icon: typeof Camera }) {
  return <Glyph className="h-4 w-4 shrink-0" strokeWidth={1.8} />;
}

function StatePill({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${
        on ? "border-[#22c55e] text-[#22c55e]" : "border-white/20 text-white/45"
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
}: {
  icon: typeof Camera;
  label: string;
  on: boolean;
  onLabel: string;
  meter?: boolean;
}) {
  return (
    <div
      className={`${ROW} relative overflow-hidden bg-white/[0.06] text-white ${
        on ? "outline outline-white/15" : ""
      }`}
    >
      <IconGlyph icon={icon} />
      <span className="flex-1 truncate text-[13px] font-medium">{label}</span>
      <StatePill on={on} label={onLabel} />
      {meter && (
        <span
          className="absolute inset-x-0 bottom-0 h-[3px] bg-[#22c55e]/70"
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
    <span className="flex flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] font-medium text-white/55">
      <Glyph className="h-4 w-4" strokeWidth={1.8} />
      {label}
    </span>
  );
}

export function ModesIntro() {
  const m = useMessages();
  const token = TOKENS;
  const copy = m.modes.panel;

  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelSize, setPanelSize] = useState({ w: 0, h: 0 });
  const [fit, setFit] = useState(1);
  useEffect(() => {
    const measure = () => {
      const panel = panelRef.current;
      const container = containerRef.current;
      if (!panel || !container) return;
      const w = panel.offsetWidth;
      const h = panel.offsetHeight;
      setPanelSize({ w, h });
      setFit(
        w > 0 ? Math.min(MAX_SCALE, (container.clientWidth * 0.92) / w) : 1,
      );
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
        <Row gutter={[64, 40]} align="middle">
          <Col xs={{ span: 24, order: 2 }} lg={{ span: 11, order: 1 }}>
            <div className="flex flex-col gap-6">
              {POINTS.map((point) => {
                const pointCopy = m.modes.points[point.key];
                return (
                  <div key={point.key} className="flex items-start gap-3.5">
                    <span className="border-line text-fg-muted mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border">
                      <IconGlyph icon={point.icon} />
                    </span>
                    <div>
                      <Text strong style={{ fontSize: 17 }}>
                        {pointCopy.title}
                      </Text>
                      <Paragraph
                        type="secondary"
                        style={{
                          maxWidth: 420,
                          margin: "4px 0 0",
                          fontSize: 15,
                          lineHeight: 1.55,
                        }}
                      >
                        {pointCopy.body}
                      </Paragraph>
                    </div>
                  </div>
                );
              })}
            </div>
          </Col>

          <Col xs={{ span: 24, order: 1 }} lg={{ span: 13, order: 2 }}>
            <div ref={containerRef} className="flex justify-center">
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
                  <div className="pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#171717] px-3 py-1.5 text-xs font-medium text-white shadow-sm">
                    {m.modes.tabs.share.caption}
                  </div>

                  <div
                    ref={panelRef}
                    className="relative flex flex-col gap-2.5 rounded-2xl bg-[#0f0f0f] p-3 shadow-[0_24px_64px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
                    style={{ width: PANEL_WIDTH }}
                  >
                    <header className="flex items-center justify-between gap-2 text-white">
                      <span className="flex h-7 w-7 items-center justify-center text-white/55">
                        <IconGlyph icon={House} />
                      </span>

                      <div className="flex items-center gap-1 rounded-[10px] bg-white/[0.06] p-1">
                        {MODES.map((mode, i) => {
                          const Glyph = mode.icon;
                          const isActive = i === 0;
                          return (
                            <span
                              key={mode.key}
                              aria-label={m.modes.tabs[mode.key].label}
                              className={`flex h-7 w-9 items-center justify-center rounded-lg ${
                                isActive
                                  ? "bg-white text-[#171717]"
                                  : "text-white/55"
                              }`}
                            >
                              <Glyph className="h-4 w-4" strokeWidth={1.8} />
                            </span>
                          );
                        })}
                      </div>

                      <span className="flex h-7 w-7 items-center justify-center text-white/55">
                        <IconGlyph icon={X} />
                      </span>
                    </header>

                    <div className="flex flex-col gap-2">
                      {/* The source is the panel's headline choice, so the row
                          carries the accent the device rows don't. */}
                      <div
                        className={`${ROW} bg-[#2563eb]/20 text-[#93b4fd]`}
                        aria-label={copy.sourceAria}
                      >
                        <IconGlyph icon={Monitor} />
                        <span className="flex-1 truncate text-[13px] font-semibold">
                          {copy.source}
                        </span>
                        <span className="text-[11px] opacity-70">
                          {copy.sourceHint}
                        </span>
                      </div>

                      <DeviceRow
                        icon={Camera}
                        label={copy.camera}
                        on={false}
                        onLabel={copy.off}
                      />
                      <DeviceRow
                        icon={Mic}
                        label={copy.microphone}
                        on
                        onLabel={copy.on}
                        meter
                      />

                      <span className="flex h-10 items-center justify-center rounded-xl bg-[#e8563a] text-sm font-semibold text-white">
                        {copy.startRecording}
                      </span>
                      <span className="text-center text-[11px] text-white/45">
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
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </MarketingSection>
  );
}

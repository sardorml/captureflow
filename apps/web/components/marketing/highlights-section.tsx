"use client";

import type { ComponentType } from "react";
import {
  Code,
  Captions,
  Image as ImageIcon,
  MessageCircle,
  PenTool,
  Scissors,
  SquareDashedMousePointer,
  Video,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SectionProps } from "./_shared";
import {
  CARD_GRAY,
  CARD_ZOOM,
  FRAME_CARD,
  FRAME_CELL,
  FRAME_CELLS,
  FrameHeader,
  FrameSection,
  PillLink,
} from "./frame";
import {
  CameraPreview,
  CanvasPreview,
  EditingPreview,
  FeedbackPreview,
  OpenSourcePreview,
  RecordingPreview,
  ScreenshotsPreview,
  TranscriptsPreview,
} from "./highlight-previews";
import { useLocalizedHref, useMessages } from "./i18n-provider";

type TileKey =
  | "recording"
  | "transcripts"
  | "editing"
  | "camera"
  | "canvas"
  | "screenshots"
  | "feedback"
  | "openSource";

const TILES: readonly {
  key: TileKey;
  Icon: LucideIcon;
  color: string;
  Preview: ComponentType;
}[] = [
  {
    key: "recording",
    Icon: Video,
    color: "text-rose-500",
    Preview: RecordingPreview,
  },
  {
    key: "transcripts",
    Icon: Captions,
    color: "text-amber-500",
    Preview: TranscriptsPreview,
  },
  {
    key: "editing",
    Icon: Scissors,
    color: "text-sky-500",
    Preview: EditingPreview,
  },
  {
    key: "camera",
    Icon: ImageIcon,
    color: "text-violet-500",
    Preview: CameraPreview,
  },
  {
    key: "canvas",
    Icon: PenTool,
    color: "text-emerald-500",
    Preview: CanvasPreview,
  },
  {
    key: "screenshots",
    Icon: SquareDashedMousePointer,
    color: "text-red-500",
    Preview: ScreenshotsPreview,
  },
  {
    key: "feedback",
    Icon: MessageCircle,
    color: "text-orange-500",
    Preview: FeedbackPreview,
  },
  {
    key: "openSource",
    Icon: Code,
    color: "text-teal-500",
    Preview: OpenSourcePreview,
  },
];

const ARCS = [
  "right-[-44px] top-1 size-[272px] rounded-[118px] border-line/50",
  "right-[-20px] top-7 size-[224px] rounded-[94px] border-line/75",
  "right-1 top-[52px] size-44 rounded-[70px] border-line",
];

export function HighlightsSection({ headingLevel = 2 }: SectionProps = {}) {
  const copy = useMessages().highlights;
  const lh = useLocalizedHref();
  return (
    <FrameSection id="highlights">
      <FrameHeader
        title={copy.heading}
        subtitle={copy.subtitle}
        level={headingLevel}
        action={<PillLink href={lh("/features")}>{copy.cta}</PillLink>}
      />
      <ul className={cn(FRAME_CELLS, "list-none grid-cols-2 lg:grid-cols-4")}>
        {TILES.map(({ key, Icon, color, Preview }) => (
          <li key={key} className={cn(FRAME_CELL, FRAME_CARD, "relative h-40")}>
            <div aria-hidden className="absolute inset-0">
              {ARCS.map((arc) => (
                <span key={arc} className={cn("absolute border", arc)} />
              ))}
            </div>
            <div
              aria-hidden
              className="absolute top-[72px] -right-6 h-[120px] w-48 overflow-hidden rounded-2xl border border-line-strong max-sm:top-[84px]"
            >
              <div className={cn(CARD_ZOOM, CARD_GRAY, "size-full")}>
                <Preview />
              </div>
            </div>
            <Icon
              aria-hidden
              className={cn(
                "absolute top-[22px] right-5 size-4 transition-colors duration-300 motion-reduce:transition-none [@media(hover:hover)]:not-group-hover/card:text-fg-muted",
                color,
              )}
            />
            <div className="relative p-5">
              <h3 className="pr-6 text-[15px] leading-5 font-medium text-fg-strong">
                {copy.items[key].title}
              </h3>
              <p className="mt-0.5 text-xs leading-4 text-fg-muted">
                {copy.items[key].body}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </FrameSection>
  );
}

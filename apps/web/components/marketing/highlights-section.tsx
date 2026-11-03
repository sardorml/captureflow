"use client";

import type { ComponentType } from "react";
import {
  Captions,
  Eraser,
  FileText,
  Image as ImageIcon,
  MessageCircle,
  PenTool,
  Scissors,
  SquareDashedMousePointer,
  Video,
  type LucideIcon,
} from "lucide-react";
import type { SectionProps } from "./_shared";
import { FrameHeader, FrameSection, PillLink } from "./frame";
import {
  CameraPreview,
  CanvasPreview,
  EditingPreview,
  FeedbackPreview,
  FillerPreview,
  RecordingPreview,
  ScreenshotsPreview,
  SummaryPreview,
  TranscriptsPreview,
} from "./highlight-previews";
import { useLocalizedHref, useMessages } from "./i18n-provider";
import { PreviewTileGrid } from "./preview-tile";

type TileKey =
  | "recording"
  | "transcripts"
  | "editing"
  | "camera"
  | "canvas"
  | "screenshots"
  | "feedback"
  | "summary"
  | "filler";

const TILES: readonly {
  key: TileKey;
  Icon: LucideIcon;
  color: string;
  Preview: ComponentType;
}[] = [
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
    key: "summary",
    Icon: FileText,
    color: "text-blue-500",
    Preview: SummaryPreview,
  },
  {
    key: "filler",
    Icon: Eraser,
    color: "text-pink-500",
    Preview: FillerPreview,
  },
  {
    key: "recording",
    Icon: Video,
    color: "text-rose-500",
    Preview: RecordingPreview,
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
      <PreviewTileGrid
        items={TILES.map((tile) => ({ ...tile, ...copy.items[tile.key] }))}
      />
    </FrameSection>
  );
}

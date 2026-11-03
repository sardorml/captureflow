"use client";

import {
  AppWindow,
  ClipboardCheck,
  Download,
  Globe,
  Mic,
  Monitor,
  Presentation,
  Search,
} from "lucide-react";
import { DOCS_URL } from "@/lib/site";
import type { SectionProps } from "./_shared";
import { FrameHeader, FrameSection, PillLink } from "./frame";
import { useMessages } from "./i18n-provider";
import { IconTileGrid } from "./icon-tile";

export function McpFeaturesSection({ headingLevel = 2 }: SectionProps = {}) {
  const copy = useMessages().mcpFeatures;
  const { items } = copy;
  return (
    <FrameSection id="mcp-features">
      <FrameHeader
        title={copy.heading}
        subtitle={copy.subtitle}
        level={headingLevel}
        action={
          <PillLink href={`${DOCS_URL}/guide/local-agent`}>{copy.cta}</PillLink>
        }
      />
      <IconTileGrid
        items={[
          {
            key: "webApp",
            ...items.webApp,
            Icon: Globe,
            color: "text-sky-500",
          },
          {
            key: "screen",
            ...items.screen,
            Icon: Monitor,
            color: "text-violet-500",
          },
          {
            key: "window",
            ...items.window,
            Icon: AppWindow,
            color: "text-emerald-500",
          },
          {
            key: "slides",
            ...items.slides,
            Icon: Presentation,
            color: "text-blue-500",
          },
          {
            key: "voiceover",
            ...items.voiceover,
            Icon: Mic,
            color: "text-fuchsia-500",
          },
          {
            key: "report",
            ...items.report,
            Icon: ClipboardCheck,
            color: "text-green-500",
          },
          {
            key: "search",
            ...items.search,
            Icon: Search,
            color: "text-amber-500",
          },
          {
            key: "save",
            ...items.save,
            Icon: Download,
            color: "text-teal-500",
          },
        ]}
      />
    </FrameSection>
  );
}

"use client";

import type { CSSProperties, ReactNode } from "react";
import { Typography } from "@heroui/react";

// Shared layout + type primitives so every marketing section keeps one rhythm: a
// wide centered column, consistent vertical padding, and ONE heading/subtitle
// scale used everywhere (sections that can't use <SectionHeading/> import the
// style constants directly so sizes never drift).

// One rail for the whole landing: sections, the hero column, and the nav's
// floating pill (max-w-5xl) all resolve to the same 1024px.
export const MARKETING_MAX_WIDTH = 1024;

/*
 * A section is an h2 inside the landing, but the same section heads a route of
 * its own under /features, /pricing and friends, where it has to be the h1.
 */
export type HeadingLevel = 1 | 2;
export type SectionProps = { headingLevel?: HeadingLevel };

// Canonical section title/subtitle sizes. Title is fluid (clamp) so it reads big
// and bold while staying responsive; the negative tracking keeps the large end
// from looking loose.
export const SECTION_TITLE_STYLE: CSSProperties = {
  fontSize: "clamp(2.125rem, 1.2rem + 3.2vw, 3.5rem)",
  fontWeight: 700,
  lineHeight: 1.08,
  letterSpacing: "-0.02em",
  margin: 0,
};

export const SECTION_SUBTITLE_STYLE: CSSProperties = {
  fontSize: 18,
  lineHeight: 1.55,
  margin: 0,
};

export function MarketingSection({
  id,
  children,
  narrow = false,
  style,
}: {
  id?: string;
  children: ReactNode;
  narrow?: boolean;
  style?: CSSProperties;
}) {
  return (
    <section
      id={id}
      style={{
        width: "100%",
        maxWidth: narrow ? 880 : MARKETING_MAX_WIDTH,
        marginInline: "auto",
        paddingBlock: "clamp(64px, 10vw, 128px)",
        paddingInline: 24,
        ...style,
      }}
    >
      {children}
    </section>
  );
}

/*
 * Two-tone headline → subtitle. `titleMuted` renders as a second
 * headline line in the muted foreground, so the pair reads as one sentence
 * that fades out rather than two headings.
 */
export function SectionHeading({
  title,
  titleMuted,
  subtitle,
  align = "center",
  level = 2,
}: {
  title: ReactNode;
  titleMuted?: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
  level?: HeadingLevel;
}) {
  /* HeroUI's Typography always emits its own text-align, so the wrapper's
     value has to be handed to each child rather than inherited. */
  const heroUiAlign = align === "center" ? "center" : "start";

  return (
    <div style={{ textAlign: align, marginBottom: 48 }}>
      <Typography.Heading
        align={heroUiAlign}
        level={level}
        style={{ ...SECTION_TITLE_STYLE, marginBottom: subtitle ? 16 : 0 }}
      >
        {title}
        {titleMuted ? (
          <>
            {" "}
            <span className="text-fg-muted">{titleMuted}</span>
          </>
        ) : null}
      </Typography.Heading>
      {subtitle ? (
        <Typography.Paragraph
          align={heroUiAlign}
          color="muted"
          style={{
            ...SECTION_SUBTITLE_STYLE,
            maxWidth: 620,
            marginInline: align === "center" ? "auto" : 0,
          }}
        >
          {subtitle}
        </Typography.Paragraph>
      ) : null}
    </div>
  );
}

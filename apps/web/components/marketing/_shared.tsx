"use client";

import type { CSSProperties, ReactNode } from "react";

// Shared layout + type primitives so every marketing section keeps one rhythm: a
// wide centered column, consistent vertical padding, and ONE heading/subtitle
// scale used everywhere (sections that can't use <SectionHeading/> import the
// style constants directly so sizes never drift).

// One rail for the whole landing: sections, the hero column, and the nav's
// floating pill (max-w-5xl) all resolve to the same 1024px.
export const MARKETING_MAX_WIDTH = 1024;

// Breaks a block out of the rail to 1240px, keeping the 24px gutter below that.
export const WIDE_RAIL =
  "relative left-1/2 w-[min(calc(100vw-48px),1240px)] -translate-x-1/2";

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
  fontSize: "clamp(2.5rem, 1.25rem + 4.2vw, 4.5rem)",
  fontWeight: 700,
  lineHeight: 1.05,
  letterSpacing: "-0.03em",
  margin: 0,
};

export const SECTION_SUBTITLE_STYLE: CSSProperties = {
  fontSize: "clamp(1.125rem, 1rem + 0.5vw, 1.375rem)",
  lineHeight: 1.5,
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
  const Heading = level === 1 ? "h1" : "h2";

  return (
    <div style={{ textAlign: align, marginBottom: 48 }}>
      <Heading
        className="font-heading text-balance text-foreground"
        style={{ ...SECTION_TITLE_STYLE, marginBottom: subtitle ? 16 : 0 }}
      >
        {title}
        {titleMuted ? (
          <>
            {" "}
            <span className="text-fg-muted">{titleMuted}</span>
          </>
        ) : null}
      </Heading>
      {subtitle ? (
        <p
          className="text-base leading-7 text-foreground"
          style={{
            ...SECTION_SUBTITLE_STYLE,
            maxWidth: 720,
            marginInline: align === "center" ? "auto" : 0,
          }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

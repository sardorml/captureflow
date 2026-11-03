import type { CSSProperties, ReactNode } from "react";
import NextLink from "next/link";
import { ArrowRight } from "lucide-react";
import { splitLead } from "@/lib/marketing/split-lead";
import { cn } from "@/lib/utils";
import type { HeadingLevel } from "./_shared";

export const FRAME_WIDTH = "max-w-[1104px]";
const FRAME_RAILS = "min-[1104px]:border-x border-line-strong";

// The hairlines between cells are the grid's own background showing through
// its gaps, so they stay correct however the columns wrap.
export const FRAME_CELLS =
  "grid gap-px border-t border-line-strong bg-line-strong";
export const FRAME_CELL = "min-w-0 bg-canvas";

// A cell that reacts to hover. The picture inside it scales rather than the
// cell, so the hairlines stay put.
export const FRAME_CARD =
  "group/card overflow-hidden transition-colors duration-300 hover:bg-emphasis focus-within:bg-emphasis motion-reduce:transition-none";
// `will-change` keeps the picture on its own layer: without it, text inside jumps
// as it's redrawn at each step of the scale.
export const CARD_ZOOM =
  "[will-change:scale,filter] transition-[filter,scale] duration-300 ease-out motion-reduce:transition-none motion-safe:group-hover/card:scale-[1.04] motion-safe:group-focus-within/card:scale-[1.04]";
// Touch screens can't hover, so they keep the color.
export const CARD_GRAY =
  "group-focus-within/card:grayscale-0 group-hover/card:grayscale-0 [@media(hover:hover)]:grayscale";

export const FRAME_TITLE =
  "text-[28px] leading-[1.15] font-semibold tracking-[-0.05em] text-balance text-fg-strong sm:text-4xl sm:leading-10";

// The column every landing section hangs from, with a rail down each side.
export function Frame({ children }: { children: ReactNode }) {
  return (
    <div className={cn("mx-auto w-full", FRAME_WIDTH, FRAME_RAILS)}>
      {children}
    </div>
  );
}

function Crosshair({ className }: { className: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 15 15"
      className={cn(
        "absolute -top-[7px] z-10 hidden size-[15px] text-fg-muted min-[1104px]:block",
        className,
      )}
    >
      <path d="M7.5 0v15M0 7.5h15" stroke="currentColor" fill="none" />
    </svg>
  );
}

// A section, opened by a hairline running the full width of the viewport with a
// crosshair where it meets each rail.
export function FrameSection({
  id,
  children,
  style,
}: {
  id?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <section id={id} className="relative scroll-mt-14" style={style}>
      <span
        aria-hidden
        className="absolute top-0 left-1/2 h-px w-screen -translate-x-1/2 bg-line-strong"
      />
      <Crosshair className="-left-2" />
      <Crosshair className="-right-2" />
      {children}
    </section>
  );
}

export function TwoTone({ text }: { text: string }) {
  const { lead, rest } = splitLead(text);
  return (
    <>
      <span className="font-medium text-fg">{lead}</span>
      {rest && <span className="text-fg-muted"> {rest}</span>}
    </>
  );
}

// Heading and copy on the left, one action on the right.
export function FrameHeader({
  title,
  subtitle,
  action,
  level = 2,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  level?: HeadingLevel;
}) {
  const Heading = level === 1 ? "h1" : "h2";
  return (
    <div className="flex flex-col gap-6 px-6 pt-16 pb-10 md:flex-row md:items-end md:justify-between md:px-12">
      <div className="max-w-[672px] min-w-0">
        <Heading className={FRAME_TITLE}>{title}</Heading>
        {subtitle && (
          <p className="mt-4 text-lg leading-7">
            {typeof subtitle === "string" ? (
              <TwoTone text={subtitle} />
            ) : (
              subtitle
            )}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

const PILL_BASE =
  "group inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-medium whitespace-nowrap transition-colors motion-reduce:transition-none";

export const PILL_SOLID = cn(
  PILL_BASE,
  "bg-[color-mix(in_oklab,var(--cf-fg)_90%,var(--cf-canvas))] text-canvas hover:bg-[color-mix(in_oklab,var(--cf-fg)_75%,var(--cf-canvas))]",
);
export const PILL_OUTLINE = cn(
  PILL_BASE,
  "border border-line-strong bg-canvas text-fg hover:bg-tint",
);

export function PillLink({
  href,
  children,
  outline,
  onClick,
}: {
  href: string;
  children: ReactNode;
  outline?: boolean;
  onClick?: () => void;
}) {
  const className = outline ? PILL_OUTLINE : PILL_SOLID;
  const content = (
    <>
      {children}
      <ArrowRight
        size={16}
        className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
      />
    </>
  );
  if (/^https?:/.test(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
      >
        {content}
      </a>
    );
  }
  return (
    <NextLink href={href} className={className} onClick={onClick}>
      {content}
    </NextLink>
  );
}

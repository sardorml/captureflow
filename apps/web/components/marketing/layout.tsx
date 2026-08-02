import type { CSSProperties, ReactNode } from "react";

/*
 * Layout primitives for the marketing tree. HeroUI has no flex/grid components,
 * and the sections were written against a 24-column API — reimplementing that
 * shape here keeps every section's markup intact behind plain flexbox.
 */

type Align =
  | "start"
  | "center"
  | "end"
  | "baseline"
  | "stretch"
  | "flex-start"
  | "flex-end";
type Justify =
  | "start"
  | "center"
  | "end"
  | "space-between"
  | "space-around"
  | "flex-start"
  | "flex-end";

const ALIGN: Record<string, string> = {
  start: "flex-start",
  "flex-start": "flex-start",
  center: "center",
  end: "flex-end",
  "flex-end": "flex-end",
  baseline: "baseline",
  stretch: "stretch",
};

const JUSTIFY: Record<string, string> = {
  start: "flex-start",
  "flex-start": "flex-start",
  center: "center",
  end: "flex-end",
  "flex-end": "flex-end",
  "space-between": "space-between",
  "space-around": "space-around",
};

export function Flex({
  children,
  vertical,
  align,
  justify,
  gap,
  wrap,
  flex,
  className,
  style,
  id,
}: {
  children?: ReactNode;
  vertical?: boolean;
  align?: Align;
  justify?: Justify;
  gap?: number | string;
  wrap?: boolean;
  flex?: number | string;
  className?: string;
  style?: CSSProperties;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={className}
      style={{
        display: "flex",
        flexDirection: vertical ? "column" : "row",
        alignItems: align ? ALIGN[align] : undefined,
        justifyContent: justify ? JUSTIFY[justify] : undefined,
        gap,
        flexWrap: wrap ? "wrap" : undefined,
        flex,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Space({
  children,
  size = 8,
  orientation,
  direction,
  wrap,
  className,
  style,
}: {
  children?: ReactNode;
  size?: number;
  orientation?: "vertical" | "horizontal";
  direction?: "vertical" | "horizontal";
  wrap?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const vertical =
    orientation === "vertical" || direction === "vertical" || false;
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: vertical ? "column" : "row",
        alignItems: vertical ? undefined : "center",
        gap: size,
        flexWrap: wrap ? "wrap" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

type Gutter = number | [number, number];

export function Row({
  children,
  gutter = 0,
  align,
  justify,
  className,
  style,
}: {
  children?: ReactNode;
  gutter?: Gutter;
  align?: Align | "middle" | "top" | "bottom";
  justify?: Justify;
  className?: string;
  style?: CSSProperties;
}) {
  const [h, v] = Array.isArray(gutter) ? gutter : [gutter, gutter];
  const alignItems =
    align === "middle"
      ? "center"
      : align === "top"
        ? "flex-start"
        : align === "bottom"
          ? "flex-end"
          : align
            ? ALIGN[align]
            : undefined;
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems,
        justifyContent: justify ? JUSTIFY[justify] : undefined,
        columnGap: h,
        rowGap: v,
        /* Col subtracts this from its basis; without it a 12+12 pair is
           100% + gutter and wraps onto two rows. */
        ["--cf-gutter" as string]: `${h}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

type Span = number | { span: number; order?: number };

/*
 * A span's share of the row minus its share of the row's column-gap, so the
 * spans in a row sum to exactly 100% however the gutter is set.
 */
function widthFor(span: number): string {
  const pct = ((span / 24) * 100).toFixed(4).replace(/\.?0+$/, "");
  const factor = ((24 - span) / 24).toFixed(6).replace(/\.?0+$/, "");
  return `calc(${pct}% - var(--cf-gutter, 0px) * ${factor})`;
}

/*
 * 24-column spans resolved with flex-basis. Breakpoints match the Tailwind
 * defaults the rest of the app uses (sm 640, md 768, lg 1024) via a style
 * element rather than media-query hooks so this stays SSR-safe.
 */
export function Col({
  children,
  xs,
  sm,
  md,
  lg,
  className,
  style,
}: {
  children?: ReactNode;
  xs?: Span;
  sm?: Span;
  md?: Span;
  lg?: Span;
  className?: string;
  style?: CSSProperties;
}) {
  const pick = (s?: Span) => (typeof s === "number" ? s : s?.span);
  const order = (s?: Span) => (typeof s === "object" ? s.order : undefined);

  const base = pick(xs) ?? 24;
  const smSpan = pick(sm);
  const mdSpan = pick(md);
  const lgSpan = pick(lg);

  /* Order resolves per breakpoint like the spans do: the base is inline and
     each wider one rides a custom property the media queries read. Folding
     them into one value applied the widest order on mobile too. */
  const ordSm = order(sm);
  const ordMd = order(md);
  const ordLg = order(lg);

  const classes = [
    "cf-col",
    smSpan != null ? `cf-col-sm-${smSpan}` : "",
    mdSpan != null ? `cf-col-md-${mdSpan}` : "",
    lgSpan != null ? `cf-col-lg-${lgSpan}` : "",
    ordSm != null ? "cf-col-order-sm" : "",
    ordMd != null ? "cf-col-order-md" : "",
    ordLg != null ? "cf-col-order-lg" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      style={{
        flex: `0 0 ${widthFor(base)}`,
        maxWidth: widthFor(base),
        minWidth: 0,
        order: order(xs),
        ["--cf-col-order-sm" as string]: ordSm,
        ["--cf-col-order-md" as string]: ordMd,
        ["--cf-col-order-lg" as string]: ordLg,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* Joins the children's borders into one control — a flex row with the inner
 * radii collapsed. Reach for HeroUI's ButtonGroup in new code. */
Space.Compact = function SpaceCompact({
  children,
  className,
  style,
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={[
        "flex items-stretch [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {children}
    </div>
  );
};

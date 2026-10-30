"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
 * The marketing tree renders these from Server Components, so each is its own
 * top-level export of this client module rather than a compound static.
 * Props mirror the shape the sections already pass (`level`, `type`, `strong`).
 */

type Tone = "secondary" | "success" | "warning" | "danger";

type Align = "start" | "center" | "end";

type TextProps = {
  children?: ReactNode;
  align?: Align;
  type?: Tone;
  strong?: boolean;
  className?: string;
  style?: CSSProperties;
  suppressHydrationWarning?: boolean;
  id?: string;
};

const TONE_CLASS: Record<Tone, string> = {
  secondary: "text-fg-muted",
  success: "text-emerald-500",
  warning: "text-amber-500",
  danger: "text-destructive",
};

const ALIGN_CLASS: Record<Align, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

const HEADING_SIZE = {
  1: "text-4xl",
  2: "text-3xl",
  3: "text-2xl",
  4: "text-xl",
  5: "text-lg",
  6: "text-base",
} as const;

function toneClass(type?: Tone): string | undefined {
  return type ? TONE_CLASS[type] : undefined;
}

export function Text({
  children,
  align = "start",
  type,
  strong,
  className,
  style,
  ...rest
}: TextProps) {
  return (
    <p
      className={cn(
        "text-base leading-7 text-foreground",
        ALIGN_CLASS[align],
        strong && "font-semibold",
        toneClass(type),
        className,
      )}
      style={style}
      {...rest}
    >
      {children}
    </p>
  );
}

export function Title({
  children,
  align = "start",
  level = 1,
  className,
  style,
}: TextProps & { level?: 1 | 2 | 3 | 4 | 5 | 6 }) {
  const Heading = `h${level}` as const;
  return (
    <Heading
      className={cn(
        "font-heading font-semibold tracking-tight text-foreground",
        HEADING_SIZE[level],
        ALIGN_CLASS[align],
        className,
      )}
      style={style}
    >
      {children}
    </Heading>
  );
}

export function Paragraph({
  children,
  align = "start",
  type,
  className,
  style,
  ...rest
}: TextProps) {
  return (
    <p
      className={cn(
        "text-base leading-7 text-foreground",
        ALIGN_CLASS[align],
        toneClass(type),
        className,
      )}
      style={style}
      {...rest}
    >
      {children}
    </p>
  );
}

export function Link({
  children,
  href,
  target,
  rel,
  className,
  style,
}: TextProps & { href?: string; target?: string; rel?: string }) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={cn(
        "relative inline-flex h-fit w-fit items-center rounded-xl font-medium text-accent-strong underline-offset-4 decoration-[1.5px] transition-colors hover:underline motion-reduce:transition-none",
        className,
      )}
      style={style}
    >
      {children}
    </a>
  );
}

"use client";

import type { CSSProperties, ReactNode } from "react";
import { Link as HeroLink, Typography } from "@heroui/react";

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
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

function toneClass(type?: Tone): string | undefined {
  return type ? TONE_CLASS[type] : undefined;
}

export function Text({
  children,
  align,
  type,
  strong,
  className,
  style,
  ...rest
}: TextProps) {
  return (
    <Typography
      align={align}
      weight={strong ? "semibold" : undefined}
      className={[toneClass(type), className].filter(Boolean).join(" ")}
      style={style}
      {...rest}
    >
      {children}
    </Typography>
  );
}

export function Title({
  children,
  align,
  level = 1,
  className,
  style,
}: TextProps & { level?: 1 | 2 | 3 | 4 | 5 | 6 }) {
  return (
    <Typography.Heading
      align={align}
      level={level}
      className={className}
      style={style}
    >
      {children}
    </Typography.Heading>
  );
}

export function Paragraph({
  children,
  align,
  type,
  className,
  style,
  ...rest
}: TextProps) {
  return (
    <Typography.Paragraph
      align={align}
      className={[toneClass(type), className].filter(Boolean).join(" ")}
      style={style}
      {...rest}
    >
      {children}
    </Typography.Paragraph>
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
    <HeroLink
      href={href}
      target={target}
      rel={rel}
      className={className}
      style={style}
    >
      {children}
    </HeroLink>
  );
}

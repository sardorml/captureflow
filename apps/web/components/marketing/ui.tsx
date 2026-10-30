"use client";

import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button as UiButton, buttonVariants } from "@/components/ui/button";
import { Card as UiCard } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/*
 * Marketing-local adapters over shadcn/ui. The 20 landing sections were written
 * against a different prop vocabulary (`type="primary"`, `styles.body`); these
 * keep that call shape so the sections stay untouched.
 */

export function Card({
  children,
  style,
  styles,
  className,
  hoverable,
  onClick,
}: {
  children?: ReactNode;
  style?: CSSProperties;
  styles?: { body?: CSSProperties };
  className?: string;
  hoverable?: boolean;
  size?: "small" | "default";
  variant?: string;
  onClick?: () => void;
}) {
  return (
    <UiCard
      onClick={onClick}
      className={cn(
        "gap-3 overflow-visible rounded-3xl border border-line bg-panel-2 p-4 ring-0",
        hoverable && "transition-colors hover:bg-tint-strong",
        className,
      )}
      style={style}
    >
      {/* A card's real inset is the Card's own 16px plus whatever lands here.
          Every marketing card is tuned against the pair — change the sum at the
          call site, not by zeroing one half. */}
      <div style={{ padding: 20, ...styles?.body }}>{children}</div>
    </UiCard>
  );
}

const VARIANT_FOR_TYPE = {
  primary: "default",
  text: "ghost",
  link: "ghost",
  default: "secondary",
} as const;

type AntButtonType = keyof typeof VARIANT_FOR_TYPE;

export function Button({
  children,
  type = "default",
  size,
  href,
  target,
  rel,
  icon,
  block,
  disabled,
  onClick,
  className,
  style,
  tabIndex,
  htmlType,
  loading,
  ...rest
}: {
  children?: ReactNode;
  type?: AntButtonType;
  htmlType?: string;
  loading?: boolean;
  tabIndex?: number;
  size?: "small" | "large";
  href?: string;
  target?: string;
  rel?: string;
  icon?: ReactNode;
  block?: boolean;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement> | (() => void);
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}) {
  const variant = VARIANT_FOR_TYPE[type];
  const uiSize = size === "large" ? "lg" : size === "small" ? "sm" : "default";

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        style={style}
        tabIndex={tabIndex}
        aria-label={rest["aria-label"]}
        className={cn(
          buttonVariants({ variant, size: uiSize }),
          block && "w-full",
          className,
        )}
      >
        {icon}
        {children}
      </a>
    );
  }

  return (
    <UiButton
      variant={variant}
      size={uiSize}
      type={htmlType === "submit" ? "submit" : "button"}
      disabled={disabled || loading}
      onClick={onClick as MouseEventHandler<HTMLButtonElement> | undefined}
      className={cn(block && "w-full", className)}
      style={style}
      aria-label={rest["aria-label"]}
    >
      {icon}
      {children}
    </UiButton>
  );
}

const TAG_CLASS = {
  blue: "text-accent-strong",
  orange: "text-amber-500",
  green: "text-emerald-500",
  red: "text-destructive",
} as const;

export function Tag({
  children,
  color,
  className,
  style,
}: {
  children?: ReactNode;
  color?: string;
  variant?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        color && TAG_CLASS[color as keyof typeof TAG_CLASS],
        className,
      )}
      style={style}
    >
      {children}
    </Badge>
  );
}

export function Divider({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return <Separator className={className} style={style} />;
}

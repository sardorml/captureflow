"use client";

import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import {
  Card as HeroCard,
  Chip,
  Separator,
  Button as HeroButton,
  buttonVariants,
} from "@heroui/react";

/*
 * Marketing-local adapters over HeroUI. The 20 landing sections were written
 * against a different prop vocabulary (`type="primary"`, `styles.body`); these
 * keep that call shape so the sections stay untouched while HeroUI does the
 * rendering. New product code should use @heroui/react directly.
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
    <HeroCard
      onClick={onClick}
      className={[
        /* HeroUI's default card surface is #18181b, a single step off the
           marketing page's #171717, and both are #fff in light mode — so cards
           vanish. `panel-2` is the one raised token that separates in both. */
        "bg-panel-2",
        hoverable ? "transition-colors hover:bg-tint-strong" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {/* Note: HeroUI's .card pads itself (16px), so a card's real inset is that
          plus whatever lands here. Every marketing card is tuned against the
          pair — change the sum at the call site, not by zeroing one half. */}
      <div style={{ padding: 20, ...styles?.body }}>{children}</div>
    </HeroCard>
  );
}

const VARIANT_FOR_TYPE = {
  primary: "primary",
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
  const heroSize = size === "large" ? "lg" : size === "small" ? "sm" : "md";

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        style={style}
        tabIndex={tabIndex}
        aria-label={rest["aria-label"]}
        className={buttonVariants({
          variant,
          size: heroSize,
          fullWidth: block,
          className,
        })}
      >
        {icon}
        {children}
      </a>
    );
  }

  return (
    <HeroButton
      variant={variant}
      size={heroSize}
      type={htmlType === "submit" ? "submit" : undefined}
      fullWidth={block}
      isDisabled={disabled || loading}
      onPress={onClick as () => void}
      className={className}
      style={style}
      aria-label={rest["aria-label"]}
    >
      {icon}
      {children}
    </HeroButton>
  );
}

const CHIP_COLOR = {
  blue: "accent",
  orange: "warning",
  green: "success",
  red: "danger",
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
    <Chip
      size="sm"
      color={color ? CHIP_COLOR[color as keyof typeof CHIP_COLOR] : undefined}
      className={className}
      style={style}
    >
      {children}
    </Chip>
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

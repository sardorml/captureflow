"use client";

import type { ReactNode } from "react";
import { buttonVariants } from "@heroui/react";
import NextLink from "next/link";
import { track } from "@/lib/marketing/track";

// Same amber as the beta banner, and dark ink on it for the same reason: the
// fill stays amber in both themes, so a theme-flipping token would go near-white
// on amber in light mode.
const SOON_AMBER = "#f5a524";

/*
 * One install target. `href` may be an external store listing or an internal
 * route (Chrome falls back to /download until CHROME_WEBSTORE_URL is set), so
 * the new-tab treatment keys off the protocol rather than being hardcoded.
 */
export function InstallButton({
  href,
  label,
  icon,
  location,
  badge,
  primary,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  location: string;
  badge?: string;
  primary?: boolean;
}) {
  /* Explicit height: HeroUI's lg drops to 40px at md, which reads undersized
     under a headline this large. */
  const className = buttonVariants({
    variant: primary ? "primary" : "secondary",
    size: "lg",
    className: "h-11 gap-2.5 rounded-full pr-5 pl-2.5 text-[16px] font-medium",
  });
  const onClick = () => track("marketing_cta_clicked", { location });

  const link = /^https?:/.test(href) ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={onClick}
    >
      {icon}
      {label}
    </a>
  ) : (
    <NextLink href={href} className={className} onClick={onClick}>
      {icon}
      {label}
    </NextLink>
  );

  if (!badge) return link;

  /* The pill straddles the button's corner rather than sitting inside it: the
     label already fills the pill, and the amber has to read against the page as
     well as against the blue. pointer-events-none so the corner it covers still
     belongs to the button. */
  return (
    <span className="relative inline-flex">
      {link}
      <span
        className="pointer-events-none absolute -top-1.5 -right-1 rounded-full px-2 py-0.5 text-[11px] leading-none font-semibold"
        style={{ backgroundColor: SOON_AMBER, color: "#0a0a0a" }}
      >
        {badge}
      </span>
    </span>
  );
}

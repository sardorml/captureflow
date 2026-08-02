"use client";

import type { ReactNode } from "react";

/*
 * A tinted panel carrying the pitch (icon → name → price → CTA), with the
 * feature list sitting outside it on the page background rather than inside a
 * bordered card. Marketing is dark-only, so on-panel text is fixed white rather
 * than following the theme tokens.
 */
export type PlanFeature = { icon: ReactNode; label: string };

export type PlanCardProps = {
  panelClassName: string;
  icon: ReactNode;
  eyebrow?: string;
  name: string;
  tagline: string;
  price: string;
  period: string;
  note: string;
  cta: {
    label: string;
    href: string;
    target?: string;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  };
  features: PlanFeature[];
  footnote?: string;
  featured?: boolean;
};

export function PlanCard(props: PlanCardProps) {
  return (
    /* Outer card holds everything; the tinted panel is inset within it by the
       p-2, and the list + footnote sit below on the card's own surface. */
    <div className="grid rounded-2xl border border-line bg-panel-2 p-2 md:row-span-3 md:grid-rows-subgrid">
      <div
        className={`relative flex flex-col overflow-hidden rounded-xl p-5 ${props.panelClassName}`}
      >
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-lg bg-white/15 text-white">
            {props.icon}
          </span>
          {props.eyebrow ? (
            <span className="text-sm font-medium text-white/80">
              {props.eyebrow}
            </span>
          ) : null}
        </div>

        <h3 className="mt-3 text-xl font-semibold tracking-[-0.01em] text-white">
          {props.name}
        </h3>
        <p className="mt-1 max-w-72 text-sm leading-snug text-white/70">
          {props.tagline}
        </p>

        <p className="mt-4 text-4xl font-bold tracking-[-0.02em] text-white">
          {props.price}
          <span className="ms-1 align-baseline text-base font-normal text-white/70">
            {props.period}
          </span>
        </p>
        <p className="mt-1.5 mb-5 text-sm text-white/60">{props.note}</p>

        <a
          href={props.cta.href}
          target={props.cta.target}
          rel={
            props.cta.target === "_blank" ? "noopener noreferrer" : undefined
          }
          onClick={props.cta.onClick}
          className={[
            "mt-auto flex h-10 w-full shrink-0 items-center justify-center rounded-xl text-sm font-medium transition-colors motion-reduce:transition-none",
            props.featured
              ? "bg-white text-neutral-900 hover:bg-white/90"
              : "bg-black/30 text-white hover:bg-black/45",
          ].join(" ")}
        >
          {props.cta.label}
        </a>
      </div>

      <ul className="flex flex-1 list-none flex-col gap-2.5 px-3 pt-5 pb-4">
        {props.features.map((f) => (
          <li key={f.label} className="flex items-center gap-3">
            <span className="shrink-0 text-fg-subtle">{f.icon}</span>
            <span className="text-sm text-fg-muted">{f.label}</span>
          </li>
        ))}
      </ul>

      {props.footnote ? (
        <div className="border-t border-line px-3 pt-3 pb-1">
          <p className="text-sm text-fg-muted">{props.footnote}</p>
        </div>
      ) : null}
    </div>
  );
}

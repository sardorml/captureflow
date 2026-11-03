"use client";

import NextLink from "next/link";
import { ArrowRight } from "lucide-react";
import { track } from "@/lib/marketing/track";
import { useLocalizedHref, useMessages } from "./i18n-provider";

const BOTTOM_BAR_HEIGHT = 46;

export function TopBar() {
  const copy = useMessages().announcement;
  const lh = useLocalizedHref();
  return (
    <a
      href={`${lh("/")}#agents`}
      onClick={() => track("marketing_cta_clicked", { location: "top_bar" })}
      className="group flex h-10 items-center justify-center gap-2 border-b border-line bg-panel px-4 text-sm whitespace-nowrap"
    >
      <span className="rounded-full bg-tint-strong px-2 py-0.5 text-xs font-medium text-fg">
        {copy.badge}
      </span>
      <span className="font-medium text-fg">{copy.lead}</span>
      <span className="hidden text-fg-muted md:inline">{copy.rest}</span>
      <span className="ml-1 hidden items-center gap-1.5 font-medium text-fg sm:inline-flex">
        {copy.cta}
        <ArrowRight
          size={15}
          className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
        />
      </span>
    </a>
  );
}

// Fixed to the viewport; the spacer keeps the page's end clear of it.
export function BottomBar() {
  const m = useMessages();
  const lh = useLocalizedHref();
  return (
    <>
      <div aria-hidden style={{ height: BOTTOM_BAR_HEIGHT }} />
      <aside
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-center border-t border-line-strong bg-canvas/80 px-4 backdrop-blur-md"
        style={{ height: BOTTOM_BAR_HEIGHT }}
      >
        <NextLink
          href={lh("/download")}
          onClick={() =>
            track("marketing_cta_clicked", { location: "bottom_bar" })
          }
          className="group flex items-center gap-2 text-sm whitespace-nowrap"
        >
          <span className="font-medium text-fg">{m.cta.button}</span>
          <span className="hidden text-fg-muted sm:inline">
            · {m.hero.noCreditCard}
          </span>
          <ArrowRight
            size={15}
            className="text-fg-muted transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </NextLink>
      </aside>
    </>
  );
}

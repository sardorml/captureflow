"use client";

import type { CSSProperties, ReactNode } from "react";
import { TOKENS } from "./tokens";

/*
 * Dark-only root for every marketing page. The app theme still comes from the
 * cookie on <html>, but marketing opts out of it: `data-theme` re-declares the
 * token ramp for this subtree, so a visitor who picked light in the dashboard
 * still gets the dark landing. `data-marketing` lets globals.css paint the
 * document to match, which the overscroll gutter exposes.
 *
 * Also the baseline text color: nothing sets one on <body>, so anything that
 * inherits rather than picking a token — a HeroUI Accordion trigger, say —
 * would otherwise fall back to the UA default and render near-black.
 */
export function MarketingShell({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      data-theme="dark"
      data-marketing=""
      style={{
        minHeight: "100vh",
        background: TOKENS.colorBgContainer,
        color: TOKENS.colorText,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

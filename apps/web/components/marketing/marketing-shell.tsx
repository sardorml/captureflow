"use client";

import type { CSSProperties, ReactNode } from "react";
import { SupportChat } from "./support-chat";
import { TOKENS } from "./tokens";

/*
 * Root for every marketing page. It follows the theme cookie on <html> like the
 * app does; `data-marketing` lets globals.css scope the marketing-only tweaks.
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
      data-marketing=""
      style={{
        minHeight: "100vh",
        background: TOKENS.colorBgContainer,
        color: TOKENS.colorText,
        ...style,
      }}
    >
      {children}
      <SupportChat />
    </div>
  );
}

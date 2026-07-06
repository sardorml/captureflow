"use client";

import { theme } from "antd";

// Subtle square-net backdrop for the hero: a hairline grid over the container
// background, fading out before the demo mockup. Lines are drawn from
// colorText at low layer opacity so the effect tracks light/dark themes.

const CELL = 72;

export function HeroGridBg() {
  const { token } = theme.useToken();
  const bg = token.colorBgContainer;

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: bg,
        zIndex: 0,
      }}
    >
      <div
        className="opacity-5 dark:opacity-[0.03]"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(to right, ${token.colorText} 1px, transparent 1px), linear-gradient(to bottom, ${token.colorText} 1px, transparent 1px)`,
          backgroundSize: `${CELL}px ${CELL}px`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to bottom, transparent 55%, ${bg} 100%)`,
        }}
      />
    </div>
  );
}

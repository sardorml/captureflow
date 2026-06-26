"use client";

import { Play } from "lucide-react";
import { theme } from "antd";

// Stand-in for a screen recording in the landing mockups; the demo clip isn't bundled.
export function DemoStage() {
  const { token } = theme.useToken();

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        backgroundColor: "#0b1020",
        borderRadius: token.borderRadiusLG,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 120%, ${token.colorPrimary}40, transparent 70%)`,
        }}
      />
      <div
        className="absolute left-2 top-2 inline-flex items-center gap-1"
        style={{
          fontFamily: token.fontFamilyCode,
          fontSize: 9,
          color: "rgba(255,255,255,0.8)",
        }}
      >
        <span
          className="size-1.5 animate-rec-breathe rounded-full"
          style={{ backgroundColor: token.colorError }}
        />{" "}
        REC
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="flex size-10 items-center justify-center rounded-full"
          style={{
            backgroundColor: token.colorPrimary,
            color: token.colorWhite,
            boxShadow: token.boxShadowSecondary,
            outline: `5px solid ${token.colorPrimary}4d`,
          }}
        >
          <Play className="size-4 translate-x-px fill-current" />
        </span>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { applyTheme, DEFAULT_THEME, type Theme } from "@captureflow/ui";
import PullCord from "@/components/kokonutui/pull-cord";
import { useMessages } from "./i18n-provider";

let pullSound: HTMLAudioElement | null = null;

function loadPullSound() {
  pullSound ??= new Audio("/sounds/pull-cord.mp3");
  return pullSound;
}

function playPullSound() {
  const sound = loadPullSound();
  sound.currentTime = 0;
  // Browsers reject play() until the visitor has interacted with the page.
  void sound.play().catch(() => {});
}

export function ThemePullCord() {
  const copy = useMessages().footer;
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);

  useEffect(() => {
    loadPullSound();
    const root = document.documentElement;
    const sync = () => {
      const attr = root.getAttribute("data-theme");
      if (attr === "light" || attr === "dark") setTheme(attr);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="h-[259px] w-[207px]">
      <PullCord
        checked={theme === "light"}
        onCheckedChange={(on) => {
          playPullSound();
          applyTheme(on ? "light" : "dark");
        }}
        label={copy.lights}
        hint={theme === "light" ? copy.lightsOn : copy.lightsOff}
        className="origin-top-left scale-[0.72]"
      />
    </div>
  );
}

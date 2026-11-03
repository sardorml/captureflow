"use client";

import { useEffect, useState } from "react";
import { applyTheme, DEFAULT_THEME, type Theme } from "@captureflow/ui";
import PullCord from "@/components/kokonutui/pull-cord";

export function ThemePullCord() {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);

  useEffect(() => {
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
        onCheckedChange={(on) => applyTheme(on ? "light" : "dark")}
        label="Lights"
        className="origin-top-left scale-[0.72]"
      />
    </div>
  );
}

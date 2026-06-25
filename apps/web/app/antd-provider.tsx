"use client";

import { type ReactNode, useEffect, useState } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, theme as antdTheme } from "antd";
import { type Theme } from "@captureflow/ui";

// The existing ThemeToggle flips <html data-theme>; mirror that attribute into
// antd's algorithm so light/dark stays in sync without a full page reload.
export function AntdProvider({
  initialTheme,
  children,
}: {
  initialTheme: Theme;
  children: ReactNode;
}) {
  const [mode, setMode] = useState<Theme>(initialTheme);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      const next = root.dataset.theme;
      if (next === "light" || next === "dark") setMode(next);
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
    <AntdRegistry>
      <ConfigProvider
        theme={{
          algorithm:
            mode === "dark"
              ? antdTheme.darkAlgorithm
              : antdTheme.defaultAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
    </AntdRegistry>
  );
}

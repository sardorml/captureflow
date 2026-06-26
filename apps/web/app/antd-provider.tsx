"use client";

import { type ReactNode, useEffect, useState } from "react";
import { flushSync } from "react-dom";
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
    const current = root.dataset.theme;
    if (current === "light" || current === "dark") setMode(current);
    // The toggle changes data-theme inside a View Transition. Commit antd's
    // algorithm synchronously (flushSync) so its CSS-in-JS re-renders before the
    // browser snapshots the new theme — otherwise antd surfaces pop in after the
    // CSS-variable colours have already wiped.
    const observer = new MutationObserver(() => {
      const next = root.dataset.theme;
      if (next === "light" || next === "dark") {
        flushSync(() => setMode(next));
      }
    });
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
          token: {
            colorPrimary: "#2563eb",
            colorLink: "#2563eb",
            borderRadius: 8,
            fontFamily:
              'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          },
        }}
      >
        {children}
      </ConfigProvider>
    </AntdRegistry>
  );
}

"use client";

import type { ReactNode } from "react";
import { Layout, theme as antdTheme } from "antd";

// Theme-aware root for marketing pages: a full-height antd Layout whose
// background tracks the active light/dark token. Replaces the old forced-light
// `.marketing-root` Tailwind scope — the landing now follows the app theme.
export function MarketingShell({ children }: { children: ReactNode }) {
  const { token } = antdTheme.useToken();
  return (
    <Layout style={{ minHeight: "100vh", background: token.colorBgContainer }}>
      {children}
    </Layout>
  );
}

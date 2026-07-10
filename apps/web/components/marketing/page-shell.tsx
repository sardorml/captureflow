"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button, Flex, Typography, theme as antdTheme } from "antd";
import { ThemeToggle, DEFAULT_THEME, type Theme } from "@captureflow/ui";
import { Footer } from "./footer";
import { useMessages, useLocalizedHref } from "./i18n-provider";

type PageShellProps = {
  children: ReactNode;
  maxWidth?: number;
  title?: string;
  subtitle?: string;
  theme?: Theme;
};

export function PageShell({
  children,
  maxWidth = 960,
  title,
  subtitle,
  theme = DEFAULT_THEME,
}: PageShellProps) {
  const m = useMessages();
  const lh = useLocalizedHref();
  const { token } = antdTheme.useToken();

  return (
    <Flex
      vertical
      style={{ minHeight: "100vh", background: token.colorBgContainer }}
    >
      <header
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Flex
          align="center"
          justify="space-between"
          style={{
            width: "100%",
            paddingInline: "clamp(20px, 4vw, 56px)",
          }}
        >
          <Link
            href={lh("/")}
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <Image
              src="/logo.png"
              alt={m.pageShell.logoAlt}
              width={30}
              height={30}
              style={{ borderRadius: 7 }}
              draggable={false}
              priority
              unoptimized
            />
            <span
              style={{
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                color: token.colorText,
              }}
            >
              CaptureFlow
            </span>
          </Link>
          <Flex align="center" gap={4}>
            <Link href={lh("/")}>
              <Button type="text" icon={<ArrowLeft size={16} />}>
                {m.pageShell.backToHome}
              </Button>
            </Link>
            <ThemeToggle initialTheme={theme} className="h-8 w-8" />
          </Flex>
        </Flex>
      </header>

      <main style={{ flex: 1, width: "100%" }}>
        <div
          style={{
            maxWidth,
            marginInline: "auto",
            paddingInline: 24,
            paddingBlock: title ? "48px 64px" : "64px",
          }}
        >
          {title ? (
            <div style={{ marginBottom: 32 }}>
              <Typography.Title
                level={1}
                style={{ marginBottom: subtitle ? 8 : 0 }}
              >
                {title}
              </Typography.Title>
              {subtitle ? (
                <Typography.Paragraph
                  type="secondary"
                  style={{ fontSize: 18, margin: 0 }}
                >
                  {subtitle}
                </Typography.Paragraph>
              ) : null}
            </div>
          ) : null}
          {children}
        </div>
      </main>

      <Footer />
    </Flex>
  );
}

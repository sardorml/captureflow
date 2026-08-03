"use client";

import type { ReactNode } from "react";
import { Paragraph, Title } from "./typography";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Flex } from "./layout";
import { Button } from "./ui";
import { TOKENS } from "./tokens";
import { Footer } from "./footer";
import { MarketingShell } from "./marketing-shell";
import { useMessages, useLocalizedHref } from "./i18n-provider";

type PageShellProps = {
  children: ReactNode;
  maxWidth?: number;
  title?: string;
  subtitle?: string;
};

export function PageShell({
  children,
  maxWidth = 960,
  title,
  subtitle,
}: PageShellProps) {
  const m = useMessages();
  const lh = useLocalizedHref();
  const token = TOKENS;

  return (
    <MarketingShell style={{ display: "flex", flexDirection: "column" }}>
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
          <Link href={lh("/")}>
            <Button type="text" icon={<ArrowLeft size={16} />}>
              {m.pageShell.backToHome}
            </Button>
          </Link>
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
              <Title level={1} style={{ marginBottom: subtitle ? 8 : 0 }}>
                {title}
              </Title>
              {subtitle ? (
                <Paragraph type="secondary" style={{ fontSize: 18, margin: 0 }}>
                  {subtitle}
                </Paragraph>
              ) : null}
            </div>
          ) : null}
          {children}
        </div>
      </main>

      <Footer />
    </MarketingShell>
  );
}

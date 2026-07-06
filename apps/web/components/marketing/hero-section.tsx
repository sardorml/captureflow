"use client";

import { Button, Flex, Typography, theme } from "antd";
import { Code2, Star } from "lucide-react";
import { CURRENT_STAGE } from "@/lib/marketing/constants";
import { SOURCE_REPO_URL } from "@/lib/site";
import { track } from "@/lib/marketing/track";
import { WaitlistForm } from "./waitlist-form";
import { AppleLogo, ChromeLogo, FirefoxLogo } from "./platform-logos";
import { RecorderMockup } from "./recorder-mockup";
import { HeroGridBg } from "./hero-grid-bg";
import { useLocalizedHref, useMessages } from "./i18n-provider";

export function HeroSection({ stars = null }: { stars?: string | null }) {
  const m = useMessages();
  const lh = useLocalizedHref();
  const { token } = theme.useToken();

  const bg = token.colorBgContainer;
  const textShadow = `0 0 4px ${bg}, 0 0 4px ${bg}`;

  return (
    <>
      <section id="hero" style={{ position: "relative", overflow: "hidden" }}>
        <HeroGridBg />
        <div style={{ position: "relative", zIndex: 1 }}>
          <Flex
            vertical
            align="center"
            style={{
              maxWidth: 1280,
              marginInline: "auto",
              paddingInline: 24,
              paddingTop: 100,
              paddingBottom: 56,
              textAlign: "center",
            }}
          >
            <Typography.Title
              level={1}
              style={{
                textShadow,
                fontSize: "clamp(2.75rem, 1.5rem + 4.8vw, 4.5rem)",
                fontWeight: 700,
                lineHeight: 1.1,
                marginBottom: 16,
              }}
            >
              <span style={{ color: token.colorPrimary }}>{m.hero.aiWord}</span>{" "}
              {m.hero.titleMain}
              <br />
              {m.hero.titleSuffix}
            </Typography.Title>
            <Typography.Paragraph
              type="secondary"
              style={{ fontSize: 20, maxWidth: 760, textShadow }}
            >
              {m.hero.subtitleLine1} {m.hero.subtitleLine2}
            </Typography.Paragraph>

            {CURRENT_STAGE.showHeroBuyCta ? (
              <>
                <Flex
                  wrap
                  gap="middle"
                  justify="center"
                  align="center"
                  style={{ marginTop: 8 }}
                >
                  <Button
                    type="primary"
                    size="large"
                    href={lh("/download")}
                    onClick={() =>
                      track("marketing_cta_clicked", { location: "hero" })
                    }
                  >
                    {m.hero.ctaLabel}
                  </Button>
                  <Button
                    size="large"
                    href={SOURCE_REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    icon={<Code2 size={18} />}
                    onClick={() =>
                      track("marketing_cta_clicked", {
                        location: "hero_github",
                      })
                    }
                  >
                    GitHub
                    {stars ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          marginInlineStart: 8,
                          paddingInlineStart: 8,
                          borderInlineStart: `1px solid ${token.colorBorder}`,
                        }}
                      >
                        <Star size={14} />
                        {stars}
                      </span>
                    ) : null}
                  </Button>
                </Flex>
                <Flex
                  wrap
                  align="center"
                  justify="center"
                  gap="middle"
                  style={{
                    marginTop: 24,
                    fontSize: 14,
                    color: token.colorTextSecondary,
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <AppleLogo className="size-4" /> macOS
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <ChromeLogo className="size-4" /> Chrome
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <FirefoxLogo className="size-4" /> Firefox
                  </span>
                </Flex>
              </>
            ) : (
              <div style={{ marginTop: 8 }}>
                <WaitlistForm />
              </div>
            )}
          </Flex>

          <RecorderMockup />
        </div>
      </section>
      {/* Sentinel: the floating CTA appears once this scrolls into view. */}
      <div id="hero-end" aria-hidden style={{ height: 1, width: "100%" }} />
    </>
  );
}

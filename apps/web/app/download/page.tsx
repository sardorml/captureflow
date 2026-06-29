import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { Download, ArrowUpRight, Terminal, Package } from "lucide-react";
import { Button, Card, Col, Flex, Row, Tag } from "antd";
import { readThemeFromCookieHeader } from "@captureflow/ui";
import { I18nProvider } from "@/components/marketing/i18n-provider";
import { Text, Title, Paragraph } from "@/components/marketing/typography";
import { PageShell } from "@/components/marketing/page-shell";
import { ChromeLogo, FirefoxLogo } from "@/components/marketing/platform-logos";
import { MESSAGES } from "@/lib/marketing/messages";
import { DOWNLOAD_URL } from "@/lib/marketing/constants";
import { RELEASES_URL, DOCS_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Download",
  description: "Download the CaptureFlow screen recorder for macOS.",
};

const OTHER = [
  {
    icon: Terminal,
    title: "Build from source",
    body: "Clone the repo and run the recorder locally with pnpm.",
    href: `${DOCS_URL}/developer/build`,
  },
  {
    icon: Package,
    title: "All releases",
    body: "Browse every published build and changelog on GitHub.",
    href: RELEASES_URL,
  },
];

export default async function DownloadPage() {
  const theme = readThemeFromCookieHeader((await headers()).get("cookie"));
  const m = MESSAGES.download;

  return (
    <I18nProvider>
      <PageShell theme={theme}>
        <Flex vertical align="center" gap={28} style={{ textAlign: "center" }}>
          <Image
            src="/logo.png"
            alt="CaptureFlow"
            width={96}
            height={96}
            unoptimized
            draggable={false}
            style={{
              borderRadius: 22,
              boxShadow: "0 20px 60px -20px rgba(37, 99, 235, 0.45)",
            }}
          />

          <div>
            <Title level={1} style={{ marginBottom: 8 }}>
              {m.heading}
            </Title>
            <Paragraph
              type="secondary"
              style={{
                fontSize: 18,
                margin: 0,
                maxWidth: 560,
                marginInline: "auto",
              }}
            >
              {m.subtitle}
            </Paragraph>
          </div>

          <Flex vertical align="center" gap={12}>
            <Button
              type="primary"
              size="large"
              href={DOWNLOAD_URL}
              target="_blank"
              rel="noreferrer"
              icon={<Download size={18} />}
            >
              {m.button}
            </Button>

            <Flex wrap align="center" justify="center" gap={12}>
              <Button
                size="large"
                disabled
                aria-label="Chrome extension — coming soon"
                icon={<ChromeLogo className="h-[18px] w-[18px]" />}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  Chrome extension
                  <Tag style={{ margin: 0 }}>Soon</Tag>
                </span>
              </Button>
              <Button
                size="large"
                disabled
                aria-label="Firefox extension — coming soon"
                icon={<FirefoxLogo className="h-[18px] w-[18px]" />}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  Firefox extension
                  <Tag style={{ margin: 0 }}>Soon</Tag>
                </span>
              </Button>
            </Flex>

            <Text type="secondary" style={{ fontSize: 14 }}>
              {m.requirements}
            </Text>
          </Flex>
        </Flex>

        <div style={{ marginTop: 56 }}>
          <Title level={4} style={{ textAlign: "center" }}>
            {m.afterTitle}
          </Title>
          <Flex
            vertical
            gap={12}
            style={{ maxWidth: 420, marginInline: "auto", marginTop: 20 }}
          >
            {m.afterSteps.map((step, i) => (
              <Flex key={step} align="center" gap={12}>
                <Tag
                  style={{
                    width: 26,
                    height: 26,
                    margin: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    fontWeight: 600,
                  }}
                >
                  {i + 1}
                </Tag>
                <Text>{step}</Text>
              </Flex>
            ))}
          </Flex>
        </div>

        <div style={{ marginTop: 56 }}>
          <Title level={4} style={{ textAlign: "center" }}>
            Other ways to get it
          </Title>
          <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
            {OTHER.map(({ icon: Icon, title, body, href }) => (
              <Col key={title} xs={24} sm={12}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "block", height: "100%" }}
                >
                  <Card
                    hoverable
                    size="small"
                    styles={{ body: { padding: 20 } }}
                  >
                    <Flex align="flex-start" justify="space-between">
                      <Text type="secondary">
                        <Icon size={22} />
                      </Text>
                      <Text type="secondary">
                        <ArrowUpRight size={16} />
                      </Text>
                    </Flex>
                    <Title level={5} style={{ marginTop: 16, marginBottom: 4 }}>
                      {title}
                    </Title>
                    <Paragraph type="secondary" style={{ margin: 0 }}>
                      {body}
                    </Paragraph>
                  </Card>
                </a>
              </Col>
            ))}
          </Row>
        </div>

        <Paragraph
          type="secondary"
          style={{ textAlign: "center", marginTop: 40 }}
        >
          Prefer the cloud? <Link href="/signup">Create an account</Link> and
          view recordings in your browser.
        </Paragraph>
      </PageShell>
    </I18nProvider>
  );
}

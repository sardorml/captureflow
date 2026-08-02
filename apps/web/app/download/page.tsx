import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Download, ArrowUpRight, Terminal, Package } from "lucide-react";
import { Card, Chip, buttonVariants } from "@heroui/react";
import { I18nProvider } from "@/components/marketing/i18n-provider";
import { Text, Title, Paragraph } from "@/components/marketing/typography";
import { PageShell } from "@/components/marketing/page-shell";
import {
  ChromeLogo,
  FirefoxLogo,
  WindowsLogo,
} from "@/components/marketing/platform-logos";
import { MESSAGES } from "@/lib/marketing/messages";
import { CHROME_WEBSTORE_URL, DOWNLOAD_URL } from "@/lib/marketing/constants";
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
  const m = MESSAGES.download;

  return (
    <I18nProvider>
      <PageShell>
        <div className="flex flex-col items-center gap-7 text-center">
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

          {/* align is explicit: HeroUI's Typography emits text-align:start by
              default, which beats the centered ancestor. */}
          <div>
            <Title align="center" level={1} style={{ marginBottom: 8 }}>
              {m.heading}
            </Title>
            <Paragraph
              align="center"
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

          <div className="flex flex-col items-center gap-3">
            {/* Equal columns rather than shrink-to-fit: the two labels differ
                in length, so intrinsic widths made the pair look lopsided. */}
            <div className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
              <a
                href={DOWNLOAD_URL}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({
                  variant: "primary",
                  size: "lg",
                  className: "w-full gap-2",
                })}
              >
                <Download size={18} />
                {m.button}
              </a>
              <ChromeInstall />
            </div>

            <Text type="secondary" style={{ fontSize: 14 }}>
              {m.requirements}
            </Text>

            {/* Not buttons: nothing here is clickable yet, and three filled
                pills read as three CTAs competing with the real one. */}
            <p className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-fg-subtle">
              <span>Coming soon</span>
              <SoonPlatform
                label="Windows"
                icon={<WindowsLogo className="size-3.5" />}
              />
              <SoonPlatform
                label="Firefox"
                icon={<FirefoxLogo className="size-4" />}
              />
            </p>
          </div>
        </div>

        <div style={{ marginTop: 56 }}>
          <Title level={4} style={{ textAlign: "center" }}>
            {m.afterTitle}
          </Title>
          <div className="mx-auto mt-5 flex max-w-105 flex-col gap-3">
            {m.afterSteps.map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <Chip
                  size="sm"
                  className="h-6.5 w-6.5 justify-center rounded-full font-semibold"
                >
                  {i + 1}
                </Chip>
                <Text>{step}</Text>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 56 }}>
          <Title level={4} style={{ textAlign: "center" }}>
            Other ways to get it
          </Title>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {OTHER.map(({ icon: Icon, title, body, href }) => (
              <a
                key={title}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="block h-full"
              >
                <Card className="h-full p-5 transition-colors hover:bg-tint">
                  <div className="flex items-start justify-between text-fg-muted">
                    <Icon size={22} />
                    <ArrowUpRight size={16} />
                  </div>
                  <Title level={5} style={{ marginTop: 16, marginBottom: 4 }}>
                    {title}
                  </Title>
                  <Paragraph type="secondary" style={{ margin: 0 }}>
                    {body}
                  </Paragraph>
                </Card>
              </a>
            ))}
          </div>
        </div>

        <Paragraph
          type="secondary"
          style={{ textAlign: "center", marginTop: 40 }}
        >
          Prefer the cloud?{" "}
          <Link href="/login?mode=signup">Create an account</Link> and view
          recordings in your browser.
        </Paragraph>
      </PageShell>
    </I18nProvider>
  );
}

/*
 * White pill against the dark page, matching the plan cards' CTA — it has to
 * hold its own next to the blue primary rather than recede into the surface.
 * Set through .button's own colour vars so hover and pressed follow from the
 * same place instead of needing their own variants.
 */
const CHROME_BUTTON_CLASS = [
  "w-full gap-2",
  "[--button-bg:var(--cf-inverse)]",
  "[--button-fg:var(--cf-on-inverse)]",
  "[--button-bg-hover:#e5e5e5]",
  "[--button-bg-pressed:#d4d4d4]",
].join(" ");

/*
 * A live secondary CTA. Falls back to "#" until CHROME_WEBSTORE_URL is set —
 * setting that one constant turns it into the real store link (and opens it in
 * a new tab, which the placeholder must not do).
 */
function ChromeInstall() {
  const published = CHROME_WEBSTORE_URL !== null;
  return (
    <a
      href={CHROME_WEBSTORE_URL ?? "#"}
      target={published ? "_blank" : undefined}
      rel={published ? "noreferrer" : undefined}
      className={buttonVariants({
        variant: "tertiary",
        size: "lg",
        className: CHROME_BUTTON_CLASS,
      })}
    >
      <ChromeLogo className="size-[18px]" />
      Add to Chrome
    </a>
  );
}

function SoonPlatform({
  label,
  icon,
}: {
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-1.5">
      {icon}
      {label}
    </span>
  );
}

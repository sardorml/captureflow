import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Terminal, Package } from "lucide-react";
import { Card } from "@heroui/react";
import { Title, Paragraph } from "@/components/marketing/typography";
import { MarketingPage } from "@/components/marketing/marketing-page";
import { DownloadHero } from "@/components/marketing/download-hero";
import { RELEASES_URL, DOCS_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Download the screen recorder for Chrome",
  description:
    "Install the CaptureFlow Chrome extension to record your screen and share it with a link.",
  alternates: { canonical: "/download" },
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

export default function DownloadPage() {
  return (
    <MarketingPage>
      <DownloadHero />

      <section className="mx-auto w-full max-w-[960px] px-6 pt-10 pb-24">
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

        <Paragraph
          type="secondary"
          style={{ textAlign: "center", marginTop: 40 }}
        >
          Prefer the cloud?{" "}
          <Link href="/login?mode=signup">Create an account</Link> and view
          recordings in your browser.
        </Paragraph>
      </section>
    </MarketingPage>
  );
}

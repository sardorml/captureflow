"use client";

import NextLink from "next/link";
import { TOKENS } from "./tokens";
import { BrandMark } from "../brand-mark";
import { DISCORD_URL } from "@/lib/marketing/constants";
import { DOCS_URL, RELEASES_URL, SOURCE_REPO_URL } from "@/lib/site";
import { useLocalizedHref } from "./i18n-provider";

type FooterLink = { label: string; href: string; external?: boolean };
type FooterColumn = { title: string; links: FooterLink[] };

const LINK_CLASS =
  "text-[15px] text-fg-muted transition-colors hover:text-fg motion-reduce:transition-none";

function FooterAnchor({ link }: { link: FooterLink }) {
  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={LINK_CLASS}
      >
        {link.label}
      </a>
    );
  }
  return (
    <NextLink href={link.href} className={LINK_CLASS}>
      {link.label}
    </NextLink>
  );
}

export function Footer() {
  const lh = useLocalizedHref();
  const token = TOKENS;

  const columns: FooterColumn[] = [
    {
      title: "Product",
      links: [
        { label: "Features", href: lh("/features") },
        { label: "Pricing", href: lh("/pricing") },
        { label: "Download", href: lh("/download") },
        { label: "Roadmap", href: lh("/roadmap") },
        { label: "Suggest a feature", href: lh("/suggest-feature") },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Docs", href: DOCS_URL, external: true },
        {
          label: "Self-hosting",
          href: `${DOCS_URL}/self-hosting`,
          external: true,
        },
        { label: "Releases", href: RELEASES_URL, external: true },
        { label: "FAQ", href: lh("/faq") },
        { label: "Security", href: lh("/security") },
      ],
    },
    {
      title: "Community",
      links: [
        { label: "GitHub", href: SOURCE_REPO_URL, external: true },
        { label: "Discord", href: DISCORD_URL, external: true },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: lh("/privacy") },
        { label: "Terms of Service", href: lh("/terms") },
        { label: "Refund Policy", href: lh("/refund") },
        {
          label: "License (AGPL-3.0)",
          href: `${SOURCE_REPO_URL}/blob/main/LICENSE`,
          external: true,
        },
      ],
    },
  ];

  return (
    <footer
      style={{
        marginTop: "auto",
        background: token.colorBgContainer,
        paddingBlock: "88px 56px",
      }}
    >
      <div className="mx-auto w-full max-w-[1156px] px-6">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="flex flex-col gap-4">
            <NextLink
              href={lh("/")}
              aria-label="CaptureFlow"
              className="inline-flex items-center gap-2 text-fg"
            >
              <BrandMark size={28} />
              <span className="text-lg font-bold tracking-[-0.01em]">
                CaptureFlow
              </span>
            </NextLink>
            <p className="max-w-64 text-[15px] leading-relaxed text-fg-muted">
              Open-source screen recording with instant share links.
            </p>
          </div>

          {columns.map((column) => (
            <nav
              key={column.title}
              aria-label={column.title}
              className="flex flex-col gap-3"
            >
              <span className="text-sm font-semibold text-fg">
                {column.title}
              </span>
              {column.links.map((link) => (
                <FooterAnchor key={link.label} link={link} />
              ))}
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-line pt-6 text-sm text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <span suppressHydrationWarning>
            © {new Date().getFullYear()} CaptureFlow. All rights reserved.
          </span>
          <span>Open source under AGPL-3.0</span>
        </div>
      </div>
    </footer>
  );
}

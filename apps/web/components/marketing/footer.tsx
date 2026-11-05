"use client";

import NextLink from "next/link";
import { AppIcon } from "../brand-mark";
import { DISCORD_URL } from "@/lib/marketing/constants";
import { DOCS_URL, RELEASES_URL, SOURCE_REPO_URL } from "@/lib/site";
import { cn } from "@/lib/utils";
import { FRAME_WIDTH } from "./frame";
import { useLocalizedHref, useMessages } from "./i18n-provider";
import { LanguageSelect } from "./language-select";
import { ThemePullCord } from "./theme-pull-cord";

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

function FooterColumnNav({ column }: { column: FooterColumn }) {
  return (
    <nav aria-label={column.title} className="flex flex-col gap-3">
      <span className="text-sm font-semibold text-fg">{column.title}</span>
      {column.links.map((link) => (
        <FooterAnchor key={link.label} link={link} />
      ))}
    </nav>
  );
}

export function Footer() {
  const lh = useLocalizedHref();
  const { footer, nav } = useMessages();

  const columns: FooterColumn[] = [
    {
      title: footer.product.title,
      links: [
        { label: footer.product.features, href: lh("/features") },
        { label: footer.product.pricing, href: lh("/pricing") },
        { label: footer.product.compare, href: lh("/alternatives/loom") },
        { label: footer.product.download, href: lh("/download") },
        { label: footer.product.suggest, href: lh("/suggest-feature") },
      ],
    },
    {
      title: footer.resources.title,
      links: [
        { label: footer.resources.docs, href: DOCS_URL, external: true },
        {
          label: footer.resources.selfHosting,
          href: `${DOCS_URL}/self-hosting/overview`,
          external: true,
        },
        { label: footer.resources.blog, href: lh("/blog") },
        {
          label: footer.resources.releases,
          href: RELEASES_URL,
          external: true,
        },
        { label: footer.resources.faq, href: lh("/faq") },
        { label: footer.resources.security, href: lh("/security") },
      ],
    },
    {
      title: footer.community.title,
      links: [
        { label: "GitHub", href: SOURCE_REPO_URL, external: true },
        { label: "Discord", href: DISCORD_URL, external: true },
      ],
    },
    {
      title: footer.legal.title,
      links: [
        { label: footer.legal.privacy, href: lh("/privacy") },
        { label: footer.legal.terms, href: lh("/terms") },
        { label: footer.legal.refund, href: lh("/refund") },
        {
          label: footer.legal.license,
          href: `${SOURCE_REPO_URL}/blob/main/LICENSE`,
          external: true,
        },
      ],
    },
  ];

  return (
    <footer
      className={cn(
        "mx-auto mt-auto w-full border-t border-line-strong bg-panel min-[1104px]:border-x",
        FRAME_WIDTH,
      )}
    >
      <div className="px-6 pt-12 pb-8 md:px-12">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="flex flex-col gap-4">
            <NextLink
              href={lh("/")}
              aria-label="CaptureFlow"
              className="inline-flex items-center gap-2 text-fg"
            >
              <AppIcon size={28} />
              <span className="text-lg font-bold tracking-[-0.01em]">
                CaptureFlow
              </span>
            </NextLink>
            <p className="max-w-64 text-[15px] leading-relaxed text-fg-muted">
              {footer.tagline}
            </p>
            <ThemePullCord />
          </div>

          {columns.slice(0, -1).map((column) => (
            <FooterColumnNav key={column.title} column={column} />
          ))}

          {/* The last column also holds the language select, pushed down to
              the lamp card's baseline. */}
          <div className="flex flex-col items-start gap-12">
            <FooterColumnNav column={columns[columns.length - 1]!} />
            <LanguageSelect
              label={nav.language}
              className="min-w-44 text-fg md:mt-auto md:self-end"
            />
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-line pt-6 text-sm text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <span suppressHydrationWarning>
            {footer.rights.replace("{year}", String(new Date().getFullYear()))}
          </span>
          <span>{footer.openSource}</span>
        </div>
      </div>
    </footer>
  );
}

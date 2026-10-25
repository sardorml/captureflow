import NextLink from "next/link";
import { AppIcon } from "@/components/brand-mark";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import {
  MarketingSection,
  SectionHeading,
} from "@/components/marketing/_shared";

/*
 * Next renders the root not-found boundary into every route, so whatever this
 * page imports ships with every page. A plain header instead of the marketing
 * nav and footer keeps the animation library and the marketing copy out of
 * the dashboard and the share pages.
 */
export default function NotFound() {
  return (
    <MarketingShell>
      <header className="flex h-16 items-center px-[clamp(20px,4vw,56px)]">
        <NextLink
          href="/"
          aria-label="CaptureFlow home"
          className="inline-flex items-center gap-2 text-fg"
        >
          <AppIcon size={30} />
          <span className="text-xl font-semibold tracking-[-0.01em]">
            CaptureFlow
          </span>
        </NextLink>
      </header>
      <main>
        <MarketingSection narrow style={{ paddingBottom: 0 }}>
          <SectionHeading
            level={1}
            title="Page not found"
            subtitle="This page doesn't exist or has moved."
          />
          <div className="flex justify-center gap-3">
            <NextLink
              href="/"
              className="rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-canvas"
            >
              Go home
            </NextLink>
            <NextLink
              href="/blog"
              className="rounded-full bg-panel px-5 py-2.5 text-sm font-medium text-fg"
            >
              Read the blog
            </NextLink>
          </div>
        </MarketingSection>
      </main>
    </MarketingShell>
  );
}

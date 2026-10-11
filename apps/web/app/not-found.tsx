import NextLink from "next/link";
import { MarketingPage } from "@/components/marketing/marketing-page";
import {
  MarketingSection,
  SectionHeading,
} from "@/components/marketing/_shared";

export default function NotFound() {
  return (
    <MarketingPage>
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
    </MarketingPage>
  );
}

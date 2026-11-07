import type { Metadata } from "next";
import type { Messages } from "@/lib/marketing/messages";
import { X_CREATOR } from "@/lib/site";
import {
  DEFAULT_LOCALE,
  languageAlternates,
  localizedHref,
  ogLocaleOf,
  type Locale,
} from "./config";

export type MarketingPageId = keyof Messages["meta"];

export const PAGE_PATHS: Record<MarketingPageId, string> = {
  home: "/",
  features: "/features",
  pricing: "/pricing",
  faq: "/faq",
  download: "/download",
  enterprise: "/enterprise",
  selfHostSetup: "/self-host-setup",
  swarmDemo: "/swarm-demo",
};

const OG_IMAGE = "/og-image.png?v=5";
const PAGE_IMAGES: Partial<Record<MarketingPageId, string>> = {
  swarmDemo: "/og-swarm-demo.png?v=1",
};

/*
 * Title, description, canonical and the hreflang set for one page in one
 * language. The home page, every translated page and any page with its own
 * card image also get their own social card; other English inner pages keep
 * the site-wide one.
 */
export function pageMetadata(
  page: MarketingPageId,
  locale: Locale,
  messages: Messages,
): Metadata {
  const { title, description } = messages.meta[page];
  const path = PAGE_PATHS[page];
  const url = localizedHref(path, locale);
  const home = page === "home";
  const metadata: Metadata = {
    title: home ? { absolute: title } : title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
  };
  if (home) metadata.robots = { index: true, follow: true };
  const image = PAGE_IMAGES[page] ?? OG_IMAGE;
  if (!home && locale === DEFAULT_LOCALE && !PAGE_IMAGES[page]) return metadata;
  return {
    ...metadata,
    openGraph: {
      type: "website",
      url,
      siteName: "CaptureFlow",
      locale: ogLocaleOf(locale),
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: X_CREATOR,
    },
  };
}

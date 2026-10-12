import { STORAGE_PLANS, type StoragePlan } from "@captureflow/quota";
import { MESSAGES } from "./messages";

export const SITE_URL = "https://captureflow.dev";
export const SITE_NAME = "CaptureFlow";
/*
 * Brand first. "captureflow" is a contested term — three unrelated products
 * hold it — and for that query the docs homepage was outranking this one on
 * the strength of naming the brand up front while this title trailed it.
 */
export const SITE_TITLE =
  "CaptureFlow — Open-source screen recorder with shareable links";
export const SITE_DESCRIPTION =
  "Record your screen and share a link with your team or customers. An open-source screen recorder with annotated screenshots, self-hostable on Cloudflare.";
export const SUPPORT_EMAIL = "contact@sardor.codes";
export const ADMIN_INBOX_URL = "https://admin.captureflow.dev/inbox";
export const APP_VERSION = "0.9.2-beta";
export const DOWNLOAD_URL =
  "https://github.com/sardorml/captureflow/releases/latest";

/*
 * Extension store listings. null until each is published — the hero renders a
 * disabled "Soon" button for a null entry, so shipping is a one-line change.
 */
export const CHROME_WEBSTORE_URL: string | null =
  process.env.NEXT_PUBLIC_CHROME_WEBSTORE_URL ||
  "https://chromewebstore.google.com/detail/lgpgeoelaokbigdljofhkgbfnfcnmcol";
export const FIREFOX_ADDON_URL: string | null = null;
export const DOWNLOAD_DMG_SIZE_MB = 48;
export const MIN_MACOS_VERSION = "macOS 14 (Sonoma)";

export type Mode = {
  id: string;
  label: string;
  icon: string;
  anchor: string;
  description: string;
};

export const MODES: readonly Mode[] = [
  {
    id: "studio",
    label: "Record",
    icon: "screen_record",
    anchor: "#features",
    description:
      "Capture your whole screen, a window, or a region — system audio, mic, and webcam together, all from the menu bar.",
  },
  {
    id: "share",
    label: "Share",
    icon: "link",
    anchor: "#share",
    description:
      "Record straight to a copyable link. It uploads while you record, so the URL is on your clipboard the moment you stop.",
  },
  {
    id: "screenshot",
    label: "Screenshot",
    icon: "screenshot_keyboard",
    anchor: "#screenshot",
    description:
      "Capture a region, window, or whole screen. Annotate with arrows, text, and blur — share a hosted link.",
  },
] as const;

// ids must stay stable: they key the copy catalog and deep-link anchors.
export const FEATURES = [
  {
    id: "feature-timeline",
    heading: "A recording viewer built for feedback",
    description:
      "Every link opens to reactions, comments, and view counts — so your team can react to a recording without leaving the page.",
    video: "/feature-timeline.webm",
    poster: "/feature-timeline-poster.jpg",
  },
  {
    id: "feature-backgrounds",
    heading: "Screenshots — annotate and share",
    description:
      "Grab a region, window, or full screen, mark it up with arrows, text, and blur, and share it as an instant link.",
    video: "/feature-backgrounds.webm",
    poster: "/feature-backgrounds-poster.jpg",
  },
  {
    id: "feature-zoom",
    heading: "Stop recording, link is ready",
    description:
      "Your screen uploads while you record, so the share link is on your clipboard the moment you stop — no export queue, no render wait.",
    video: "/feature-zoom.webm",
    poster: "/feature-zoom-poster.jpg",
  },
  {
    id: "feature-export",
    heading: "Open source and self-hostable",
    description:
      "Run CaptureFlow on your own Cloudflare account — Workers, R2, and D1. AGPL-licensed, free, and yours to control.",
    video: "/feature-export.webm",
    poster: "/feature-export-poster.jpg",
  },
] as const;

export const PRO_CARD_HIGHLIGHTS: ReadonlyArray<string> = [
  "Fully managed hosting — no Cloudflare setup required",
  "Instant share links, Screenshots, workspaces & cloud storage we run for you",
];

// Storage plans as sold: the quota package owns which variant buys how much
// space; this adds the price and checkout link. The dashboard UpgradeModal and
// the landing pricing both render these.
type ManagedTier = StoragePlan & {
  price: string;
  checkoutUrl: string;
  tag?: "recommended" | "mostValue";
};

const CHECKOUTS: Record<
  StoragePlan["variantId"],
  Pick<ManagedTier, "price" | "checkoutUrl" | "tag">
> = {
  "1849420": {
    price: "6.99",
    checkoutUrl:
      "https://sardorml.lemonsqueezy.com/checkout/buy/93848ab4-4fb5-4df4-ac5b-5bbc198364bb",
  },
  "1849425": {
    price: "19.99",
    checkoutUrl:
      "https://sardorml.lemonsqueezy.com/checkout/buy/601f31c9-76c7-46f2-8d9c-48b762e88d93",
    tag: "recommended",
  },
  "1828191": {
    price: "29.99",
    checkoutUrl:
      "https://sardorml.lemonsqueezy.com/checkout/buy/775fbd57-6dea-4dee-9b27-4cc8aa664916",
    tag: "mostValue",
  },
};

export const MANAGED_TIERS: ReadonlyArray<ManagedTier> = STORAGE_PLANS.map(
  (plan) => ({ ...plan, ...CHECKOUTS[plan.variantId] }),
);

export type LaunchStage =
  | "waitlist"
  | "public-beta"
  | "early-access"
  | "launch";

export const LAUNCH_STAGE: LaunchStage = "public-beta";

export type StageConfig = {
  showHeroBadge: boolean;
  showHeroBuyCta: boolean;
  showPricingSection: boolean;
  showCtaBuyButton: boolean;
  showChangelogNav: boolean;
  heroBadgeLabel: string;
  heroCtaLabel: string;
  ctaHeadline: string;
  ctaSubtitle: string;
  ctaButtonLabel: string;
  price: number;
  originalPrice: number | null;
  discountBadge: string | null;
  pricingHeading: string;
  pricingSubheading: string;
  pricingButtonLabel: string;
  priceFootnote: string;
};

export const STAGE_CONFIG: Record<LaunchStage, StageConfig> = {
  waitlist: {
    showHeroBadge: false,
    showHeroBuyCta: false,
    showPricingSection: false,
    showCtaBuyButton: false,
    showChangelogNav: true,
    heroBadgeLabel: "",
    heroCtaLabel: "",
    ctaHeadline: "Be first when CaptureFlow launches",
    ctaSubtitle: "I'll email you when CaptureFlow is ready.",
    ctaButtonLabel: "",
    price: 9,
    originalPrice: null,
    discountBadge: null,
    pricingHeading: "",
    pricingSubheading: "",
    pricingButtonLabel: "",
    priceFootnote: "",
  },
  "public-beta": {
    showHeroBadge: false,
    showHeroBuyCta: true,
    showPricingSection: true,
    showCtaBuyButton: true,
    showChangelogNav: false,
    heroBadgeLabel: "Open source, free to run",
    heroCtaLabel: "Try CaptureFlow for free",
    ctaHeadline: "Ready to record?",
    ctaSubtitle:
      "Free download. No credit card. Say it in a quick video message instead of another meeting.",
    ctaButtonLabel: "Try CaptureFlow for free",
    price: 9,
    originalPrice: null,
    discountBadge: null,
    pricingHeading: "Start free, pay for more storage",
    pricingSubheading:
      "Start with free storage and upgrade only when you need more space.",
    pricingButtonLabel: "Get started",
    priceFootnote: "Cancel anytime.",
  },
  "early-access": {
    showHeroBadge: true,
    showHeroBuyCta: true,
    showPricingSection: true,
    showCtaBuyButton: true,
    showChangelogNav: false,
    heroBadgeLabel: "🚀 Early access",
    heroCtaLabel: "Get early access",
    ctaHeadline: "Ready to record?",
    ctaSubtitle:
      "Early access is live. Say it in a quick video message instead of another meeting.",
    ctaButtonLabel: "Get early access",
    price: 9,
    originalPrice: null,
    discountBadge: null,
    pricingHeading: "Early access pricing",
    pricingSubheading:
      "Self-host for free. The managed plan hosts CaptureFlow for you, no Cloudflare setup.",
    pricingButtonLabel: "Get started",
    priceFootnote: "Cancel anytime.",
  },
  launch: {
    showHeroBadge: true,
    showHeroBuyCta: true,
    showPricingSection: true,
    showCtaBuyButton: true,
    showChangelogNav: false,
    heroBadgeLabel: "✨ Now available",
    heroCtaLabel: "Get started",
    ctaHeadline: "Ready to record?",
    ctaSubtitle: "Say it in a quick video message instead of another meeting.",
    ctaButtonLabel: "Get started",
    price: 9,
    originalPrice: null,
    discountBadge: null,
    pricingHeading: "Start free, pay for more storage",
    pricingSubheading:
      "Start with free storage and upgrade only when you need more space.",
    pricingButtonLabel: "Get started",
    priceFootnote: "Cancel anytime.",
  },
};

export const CURRENT_STAGE: StageConfig = STAGE_CONFIG[LAUNCH_STAGE];

export const PRO_PRICE: number = CURRENT_STAGE.price;

/*
 * The FAQ text has one home: the message catalogue the section renders from.
 * A second copy lived here and drifted — it still carried a comparison answer
 * naming other products that the catalogue had already replaced, and
 * FAQ_SCHEMA was publishing that stale version into the homepage's structured
 * data where nothing on screen would ever have shown it.
 */
export const FAQ_ITEMS: { question: string; answer: string }[] = [
  ...MESSAGES.faq.items,
];

export const FEATURE_HIGHLIGHTS = [
  {
    label: "Three capture modes",
    description:
      "Grab the whole screen, a single window, or a dragged region — Record, Share, and Screenshot all live in one menu bar app.",
  },
  {
    label: "Instant share links",
    description:
      "Your screen uploads while you record, so the share URL is on your clipboard the second you stop — no render wait.",
  },
  {
    label: "A viewer for feedback",
    description:
      "Every link opens to reactions, threaded comments, and a live view count, so your team reacts without leaving the page.",
  },
  {
    label: "Annotated screenshots",
    description:
      "Capture a region, window, or full screen, mark it up with arrows, text, and blur, and share it as a hosted link.",
  },
  {
    label: "Workspaces & visibility",
    description:
      "Keep links private, share them inside a workspace, or flip them public — visibility is per artifact and revocable anytime.",
  },
  {
    label: "Open source & self-hostable",
    description:
      "Run the whole thing on your own Cloudflare account — Workers, R2, and D1. AGPL-licensed, free, and yours to control.",
  },
] as const;

export const FEATURE_CATEGORIES = [
  "Performance",
  "UI / Design",
  "Sharing",
  "Self-hosting",
  "Recording",
  "Other",
] as const;

const ALL_NAV_LINKS: { href: string; label: string }[] = [
  { href: "#modes", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

// No dedicated X/Telegram presence yet — these point at GitHub and docs.
export const X_URL = "https://github.com/sardorml/captureflow";
export const TELEGRAM_URL = "https://docs.captureflow.dev";
export const DISCORD_URL = "https://discord.gg/qzeBCaEeNq";

const WAITLIST_EXTRA_LINKS: { href: string; label: string }[] = [
  { href: "/changelog", label: "Changelog" },
];

const baseLinks = CURRENT_STAGE.showPricingSection
  ? ALL_NAV_LINKS
  : ALL_NAV_LINKS.filter((link) => link.href !== "#pricing");

export const NAV_LINKS: { href: string; label: string }[] =
  CURRENT_STAGE.showChangelogNav
    ? [...baseLinks, ...WAITLIST_EXTRA_LINKS]
    : baseLinks;

export const APP_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  applicationCategory: "MultimediaApplication",
  operatingSystem: "macOS",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  offers: [
    {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      name: "Self-Hosted",
      description:
        "Open-source recording, instant share links, screenshots, and workspaces. Run it on your own Cloudflare account, no watermark",
    },
    ...MANAGED_TIERS.map((tier) => ({
      "@type": "Offer",
      price: tier.price,
      priceCurrency: "USD",
      name: `Managed ${tier.label}`,
      description: `Fully managed hosting with ${tier.label} of cloud storage for your whole team: instant share links, screenshots, and workspaces, no Cloudflare setup`,
    })),
  ],
};

// sameAs is how Google ties the properties we publish under to one brand
// entity — it is the signal that decides which site owns the name.
export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  email: SUPPORT_EMAIL,
  logo: `${SITE_URL}/logo.png`,
  sameAs: [
    "https://github.com/sardorml/captureflow",
    CHROME_WEBSTORE_URL,
  ].filter((url): url is string => url !== null),
};

// Google's "site name" reads specifically from WebSite.name; Organization
// schema is not enough.
// See: https://developers.google.com/search/docs/appearance/site-names
export const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  alternateName: "captureflow.dev",
  url: SITE_URL,
};

export const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export const SITE_URL = "https://captureflow.xyz";
export const SITE_NAME = "CaptureFlow";
export const SITE_TITLE =
  "Open-Source Loom Alternative & Screen Recorder — CaptureFlow";
export const SITE_DESCRIPTION =
  "CaptureFlow is an open-source, self-hostable macOS screen recorder with instant share links and annotated screenshots — record, share, and screenshot from one menu bar app. Free and self-hostable on your own Cloudflare account.";
export const SUPPORT_EMAIL = "captureflow.support@gmail.com";
export const APP_VERSION = "0.9.2-beta";
export const DOWNLOAD_URL =
  "https://github.com/sardorml/captureflow/releases/latest";
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

export const MONTHLY_PRICE = 9;

const IS_DEV_LS_CHECKOUT = process.env.NODE_ENV !== "production";

const MONTHLY_SUBSCRIPTION_LIVE_URL = "https://captureflow.xyz/signup";
const MONTHLY_SUBSCRIPTION_TEST_URL = "https://captureflow.xyz/signup";

export const MONTHLY_SUBSCRIPTION_CHECKOUT_URL = IS_DEV_LS_CHECKOUT
  ? MONTHLY_SUBSCRIPTION_TEST_URL
  : MONTHLY_SUBSCRIPTION_LIVE_URL;

// A boolean cell renders as ✓ / —; a string renders verbatim.
export type CompareCell = boolean | string;
export type CompareRow = {
  label: string;
  free: CompareCell;
  monthly: CompareCell;
};
export type CompareSection = { title: string; rows: ReadonlyArray<CompareRow> };

export const COMPARE_SECTIONS: ReadonlyArray<CompareSection> = [
  {
    title: "Desktop app",
    rows: [
      {
        label: "Installation",
        free: "Build it yourself",
        monthly: "Download & run",
      },
      {
        label: "Code signing",
        free: "Self-sign (Apple ID)",
        monthly: "Signed & notarized",
      },
    ],
  },
  {
    title: "Cloud & hosting",
    rows: [
      { label: "Hosting", free: "Your Cloudflare", monthly: "Fully managed" },
      { label: "Setup", free: "You deploy it", monthly: "Zero setup" },
      { label: "Cloud storage", free: "Your R2 bucket", monthly: "200 GB" },
      { label: "Backups & monitoring", free: false, monthly: true },
    ],
  },
  {
    title: "Recording & sharing",
    rows: [
      {
        label: "Screen recording & instant links",
        free: true,
        monthly: true,
      },
      { label: "Annotated Screenshots", free: true, monthly: true },
      { label: "Workspaces & teammate invites", free: true, monthly: true },
      { label: "Commercial usage", free: true, monthly: true },
    ],
  },
  {
    title: "Support",
    rows: [
      { label: "Community support", free: true, monthly: true },
      { label: "Priority support", free: false, monthly: true },
    ],
  },
];

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
    heroBadgeLabel: "🎉 Open source — free to run",
    heroCtaLabel: "Try captureflow for free",
    ctaHeadline: "Ready to record?",
    ctaSubtitle:
      "Free download. No credit card. Self-host on your own Cloudflare account, or let us run it for you with the managed plan.",
    ctaButtonLabel: "Try captureflow for free",
    price: 9,
    originalPrice: null,
    discountBadge: null,
    pricingHeading: "Pricing",
    pricingSubheading:
      "Self-host for free — it is open source. Or let us host it for you with the managed plan.",
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
      "Early access is live. Self-host for free, or let us run the managed plan for you.",
    ctaButtonLabel: "Get early access",
    price: 9,
    originalPrice: null,
    discountBadge: null,
    pricingHeading: "Early access pricing",
    pricingSubheading:
      "Self-host for free. The managed plan hosts CaptureFlow for you — no Cloudflare setup.",
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
    ctaSubtitle:
      "Self-host for free on your own Cloudflare account, or let us run it for you with the managed plan.",
    ctaButtonLabel: "Get started",
    price: 9,
    originalPrice: null,
    discountBadge: null,
    pricingHeading: "Pricing",
    pricingSubheading:
      "Self-host for free — it is open source. Or let us host it for you with the managed plan.",
    pricingButtonLabel: "Get started",
    priceFootnote: "Cancel anytime.",
  },
};

export const CURRENT_STAGE: StageConfig = STAGE_CONFIG[LAUNCH_STAGE];

export const PRO_PRICE: number = CURRENT_STAGE.price;

const STATIC_FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "How does CaptureFlow compare to other screen recorders?",
    answer:
      "CaptureFlow is three tools in one. Record captures your screen straight to a shareable link — the upload happens while you record, so there is no waiting around. Share is a Loom-style flow: hit stop and the link is already in your clipboard, with workspaces for team sharing and a viewer that has reactions, comments, and view counts. Screenshot is a screenshot tool with markup and instant share links built in.\n\nMost competitors do one of these well. QuickTime and OBS capture the screen and leave everything else to a separate tool. Loom nails fast sharing but is closed-source and runs only on their cloud. CaptureFlow covers all three — and it is open source, so you can run the whole thing on your own Cloudflare account.",
  },
  {
    question: "How do the instant share links work?",
    answer:
      "CaptureFlow uploads your recording as you record it, not after. By the time you stop, the file is already in the cloud and the share link is on your clipboard — ready to paste anywhere. Recipients open the link to a viewer with reactions, comments, and a live view count, no app install required.",
  },
  {
    question: "Is my data private?",
    answer:
      "Yes — and with CaptureFlow you control where it lives. When you self-host, recordings and Screenshots upload to your own Cloudflare account (R2 storage, D1 database) — nothing touches our servers at all.\n\nWhen you create a share link, that artifact is stored so the recipient can open it from a URL. You control visibility per artifact (public, workspace-only, or private), and you can revoke or delete a link from your dashboard at any time.",
  },
  {
    question: "Which macOS versions does CaptureFlow support?",
    answer:
      "CaptureFlow runs on macOS 14 (Sonoma) or later, on Apple Silicon Macs. Intel Mac support is not tested yet but is being worked on. Older macOS versions may work but are unsupported — newer versions get the smoothest experience.",
  },
  {
    question: "Can I self-host CaptureFlow?",
    answer:
      "Yes — that's the whole point. CaptureFlow is open source under the AGPL and runs entirely on Cloudflare: Workers for the API, R2 for storage, and D1 for the database. Deploy it to your own account and you own every recording, Screenshot, and share link end to end. The repo and deploy guide live on GitHub and docs.captureflow.xyz.",
  },
  {
    question: "What's free and what's the managed plan?",
    answer:
      "Everything is free when you self-host. CaptureFlow is open source under the AGPL — deploy it to your own Cloudflare account and use recording, instant share links, Screenshots, and workspaces with no limits and no watermark.\n\nThe managed plan is for teams who would rather not run their own infrastructure: we host CaptureFlow for you, handle storage and updates, and you skip the Cloudflare setup entirely.",
  },
  {
    question: "CaptureFlow is in beta — is it stable?",
    answer:
      "Beta means CaptureFlow is young and improving fast, not that it's fragile — recording, sharing, and Screenshots are stable and in daily use. Updates ship frequently, and a few rough edges remain (Intel Macs aren't supported yet, for example). It's open source, so you can read the code, file issues, or send a pull request — feedback directly shapes the roadmap.",
  },
  {
    question: "Does CaptureFlow add a watermark?",
    answer:
      "No. CaptureFlow never watermarks your recordings, Screenshots, or exports — self-hosted or managed. It's open source, so there are no artificial limits baked in: record at up to 4K, for as long as you want.",
  },
];

export const FAQ_ITEMS: { question: string; answer: string }[] = [
  ...STATIC_FAQ_ITEMS,
];

export const ROADMAP_GROUPS = [
  {
    title: "Backlog",
    subtitle: "On the radar — not scheduled yet.",
    items: [
      {
        label: "AI summaries & chapters",
        description:
          "Auto-generate a title, summary, and chapters from every recording.",
        category: "Share",
      },
      {
        label: "Filler-word & silence removal",
        description:
          "Automatically cut 'ums', 'uhs', and dead air from your recording.",
        category: "Record",
      },
      {
        label: "Transcripts & translations",
        description:
          "AI transcripts with one-click translation into other languages.",
        category: "Share",
      },
    ],
    badgeLabel: "Backlog",
    badgeClass: "text-neutral-400",
    markerIcon: "bookmark",
    markerClass: "text-neutral-400",
  },
  {
    title: "To Do",
    subtitle: "The next few months, by priority.",
    items: [
      {
        label: "Windows support",
        description:
          "Bring CaptureFlow's recording and instant share links to Windows.",
        category: "Core",
      },
    ],
    badgeLabel: "To Do",
    badgeClass: "text-neutral-500",
    markerIcon: "bolt",
    markerClass: "text-neutral-500",
  },
  {
    title: "In Progress",
    subtitle: "Features I'm actively working on.",
    items: [
      {
        label: "Chrome extension",
        description:
          "Record and share straight from the browser — no desktop install.",
        category: "Core",
      },
      {
        label: "Firefox extension",
        description:
          "Record and share straight from the browser — no desktop install.",
        category: "Core",
      },
    ],
    badgeLabel: "In progress",
    badgeClass: "text-neutral-500",
    markerIcon: "check_circle",
    markerClass: "text-neutral-500",
  },
] as const;

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
    label: "Annotated Screenshots",
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
  { href: "#roadmap", label: "Roadmap" },
];

// No dedicated X/Telegram presence yet — these point at GitHub and docs.
export const X_URL = "https://github.com/sardorml/captureflow";
export const TELEGRAM_URL = "https://docs.captureflow.xyz";

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
        "Open-source recording, instant share links, Screenshots, and workspaces — run it on your own Cloudflare account, no watermark",
    },
    {
      "@type": "Offer",
      price: String(MONTHLY_PRICE),
      priceCurrency: "USD",
      name: "Managed",
      description:
        "Fully managed hosting — instant share links, Screenshots, team workspaces, and 200 GB cloud storage we run for you, no Cloudflare setup",
    },
  ],
};

export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  email: SUPPORT_EMAIL,
  logo: `${SITE_URL}/logo.png`,
  sameAs: ["https://github.com/sardorml/captureflow"],
};

// Google's "site name" reads specifically from WebSite.name; Organization
// schema is not enough.
// See: https://developers.google.com/search/docs/appearance/site-names
export const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  alternateName: "captureflow.xyz",
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

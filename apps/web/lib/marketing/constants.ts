// ─── Site ────────────────────────────────────────────────────────────────────

// Canonical production host. Used for canonical URLs, the sitemap, robots, and
// OG/JSON-LD absolute URLs — these must always point at production (never a
// staging/dev host), so this is intentionally hardcoded rather than env-driven.
export const SITE_URL = 'https://captureflow.xyz';
export const SITE_NAME = 'CaptureFlow';
export const SITE_TITLE =
  'Open-Source Screen Recorder for Mac with Instant Share Links — CaptureFlow';
export const SITE_DESCRIPTION =
  'CaptureFlow is an open-source, self-hostable macOS screen recorder with instant share links and annotated Snaps — record, share, and snap from one menu bar app. Free and self-hostable on your own Cloudflare account.';
export const SUPPORT_EMAIL = 'captureflow.support@gmail.com';
// Current shipped app version — single source for the download line on
// /download. The actual binary is the latest GitHub release. Bump on each
// release.
export const APP_VERSION = '0.9.2-beta';
// Download points at the latest published GitHub release rather than a
// self-hosted DMG host — CaptureFlow is open source and ships every build
// through GitHub Releases.
export const DOWNLOAD_URL =
  'https://github.com/sardorml/captureflow/releases/latest';
// Approximate installer size shown on /download, from the published DMG's
// Content-Length. Update alongside APP_VERSION.
export const DOWNLOAD_DMG_SIZE_MB = 48;
export const MIN_MACOS_VERSION = 'macOS 14 (Sonoma)';

// ─── Modes ───────────────────────────────────────────────────────────────────
// Top-level pitch above the demo reels: CaptureFlow is three tools in one menu
// bar app — full-screen recording (Record), instant-link recording (Share), and
// annotated screenshots (Snap). The intro band uses these as anchor cards.

export type Mode = {
  id: string;
  label: string;
  icon: string;
  anchor: string;
  description: string;
};

export const MODES: readonly Mode[] = [
  {
    id: 'studio',
    label: 'Record',
    icon: 'screen_record',
    anchor: '#features',
    description:
      'Capture your whole screen, a window, or a region — system audio, mic, and webcam together, all from the menu bar.',
  },
  {
    id: 'share',
    label: 'Share',
    icon: 'link',
    anchor: '#share',
    description:
      'Record straight to a copyable link. It uploads while you record, so the URL is on your clipboard the moment you stop.',
  },
  {
    id: 'snap',
    label: 'Snap',
    icon: 'screenshot_keyboard',
    anchor: '#snap',
    description:
      'Capture a region, window, or whole screen. Annotate with arrows, text, and blur — share a hosted link.',
  },
] as const;

// ─── Features ────────────────────────────────────────────────────────────────

// The features section reels. The ids are kept stable (they key the copy
// catalog + deep-link anchors). Every feature has its own footage in /public
// (feature-<id>.webm + -poster.jpg, VP9 CRF 32 at native 60fps).
// Display copy (heading / description) is catalog-driven (see messages.ts
// features.items); the strings here mirror the English source.
export const FEATURES = [
  {
    id: 'feature-timeline',
    heading: 'A share viewer built for feedback',
    description:
      'Every link opens to reactions, comments, and view counts — so your team can react to a recording without leaving the page.',
    video: '/feature-timeline.webm',
    poster: '/feature-timeline-poster.jpg',
  },
  {
    id: 'feature-backgrounds',
    heading: 'Snaps — annotated screenshots',
    description:
      'Grab a region, window, or full screen, mark it up with arrows, text, and blur, and share it as an instant link.',
    video: '/feature-backgrounds.webm',
    poster: '/feature-backgrounds-poster.jpg',
  },
  {
    id: 'feature-zoom',
    heading: 'Stop recording, link is ready',
    description:
      'Your screen uploads while you record, so the share link is on your clipboard the moment you stop — no export queue, no render wait.',
    video: '/feature-zoom.webm',
    poster: '/feature-zoom-poster.jpg',
  },
  {
    id: 'feature-export',
    heading: 'Open source and self-hostable',
    description:
      'Run CaptureFlow on your own Cloudflare account — Workers, R2, and D1. AGPL-licensed, free, and yours to control.',
    video: '/feature-export.webm',
    poster: '/feature-export-poster.jpg',
  },
] as const;

// ─── Pricing ─────────────────────────────────────────────────────────────────

// Two-tier model: Self-Hosted (free, open source, run it on your own
// Cloudflare account) and Managed (we host it for you, no Cloudflare setup).
// The Monthly + Annual cards both list what the Managed plan covers; the
// compare table draws Self-Hosted vs Managed across the same rows.

// Managed card highlights — a deliberately short list shared by both the
// Monthly and Annual cards (the cycle changes price/cadence, not what's
// covered). The full capability breakdown lives in the compare table below
// the cards.
export const PRO_CARD_HIGHLIGHTS: ReadonlyArray<string> = [
  'Fully managed hosting — no Cloudflare setup required',
  'Instant share links, Snaps, workspaces & cloud storage we run for you',
];

export const MONTHLY_PRICE = 9;
// Annual subscription priced per-month for display; billed once per year.
// 12 * ANNUAL_PRICE_PER_MONTH is the annual charge; savings against the
// monthly cycle compute as 1 - (ANNUAL_PRICE_PER_MONTH / MONTHLY_PRICE).
export const ANNUAL_PRICE_PER_MONTH = 6;
export const ANNUAL_SAVINGS_PERCENT = Math.round(
  (1 - ANNUAL_PRICE_PER_MONTH / MONTHLY_PRICE) * 100,
);

// Managed-plan checkout. CaptureFlow itself is free and open source — these
// URLs send the visitor to the hosted-plan signup. Both the monthly and annual
// CTAs flow into the same managed entitlement; the variant chosen dictates the
// cadence.
//
// Dev / preview builds reuse the same signup URL so the flow can be exercised
// end-to-end. Next inlines NODE_ENV at build time, so this selection happens
// once at compile, not at request time.
const IS_DEV_LS_CHECKOUT = process.env.NODE_ENV !== 'production';

const MONTHLY_SUBSCRIPTION_LIVE_URL = 'https://captureflow.xyz/signup';
const ANNUAL_SUBSCRIPTION_LIVE_URL = 'https://captureflow.xyz/signup';
const MONTHLY_SUBSCRIPTION_TEST_URL = 'https://captureflow.xyz/signup';
const ANNUAL_SUBSCRIPTION_TEST_URL = 'https://captureflow.xyz/signup';

export const MONTHLY_SUBSCRIPTION_CHECKOUT_URL = IS_DEV_LS_CHECKOUT
  ? MONTHLY_SUBSCRIPTION_TEST_URL
  : MONTHLY_SUBSCRIPTION_LIVE_URL;
export const ANNUAL_SUBSCRIPTION_CHECKOUT_URL = IS_DEV_LS_CHECKOUT
  ? ANNUAL_SUBSCRIPTION_TEST_URL
  : ANNUAL_SUBSCRIPTION_LIVE_URL;

// Compare-plans matrix. Each row is one capability spanning both plans.
// A boolean renders as ✓ / —; a string renders verbatim (used for rows
// where the answer is a quantity or detail, not yes/no). Grouped into sections
// so the table can show category labels in the leftmost column.
export type CompareCell = boolean | string;
export type CompareRow = {
  label: string;
  free: CompareCell;
  monthly: CompareCell;
};
export type CompareSection = { title: string; rows: ReadonlyArray<CompareRow> };

export const COMPARE_SECTIONS: ReadonlyArray<CompareSection> = [
  {
    // The macOS app. Self-Hosted ships as SOURCE only: you build it and sign it
    // with your own Apple ID, so you also self-manage updates. Managed hands you
    // a signed, notarized build that just runs — and updates itself.
    title: 'Desktop app',
    rows: [
      {
        label: 'Installation',
        free: 'Build it yourself',
        monthly: 'Download & run',
      },
      {
        label: 'Code signing',
        free: 'Self-sign (Apple ID)',
        monthly: 'Signed & notarized',
      },
    ],
  },
  {
    // The Cloudflare backend (Workers / R2 / D1). Self-Hosted runs on YOUR
    // Cloudflare account — you deploy it, store on your own R2, and keep it
    // running. Managed is fully hosted, backed up, and monitored by us.
    title: 'Cloud & hosting',
    rows: [
      { label: 'Hosting', free: 'Your Cloudflare', monthly: 'Fully managed' },
      { label: 'Setup', free: 'You deploy it', monthly: 'Zero setup' },
      { label: 'Cloud storage', free: 'Your R2 bucket', monthly: 'Included' },
      { label: 'Backups & monitoring', free: false, monthly: true },
    ],
  },
  {
    // The product is identical on both plans — same open-source app, same
    // capabilities. These rows show that parity (the difference is who signs the
    // app and runs the cloud, above — not what you can do).
    title: 'Recording & sharing',
    rows: [
      {
        label: 'Screen recording & instant links',
        free: true,
        monthly: true,
      },
      { label: 'Recording quality', free: 'Up to 4K', monthly: 'Up to 4K' },
      {
        label: 'Export formats',
        free: 'MP4, GIF, WebM',
        monthly: 'MP4, GIF, WebM',
      },
      { label: 'Annotated Snaps', free: true, monthly: true },
      { label: 'Workspaces & teammate invites', free: true, monthly: true },
      { label: 'Commercial usage', free: true, monthly: true },
    ],
  },
  {
    title: 'Support',
    rows: [
      { label: 'Community support', free: true, monthly: true },
      { label: 'Priority support', free: false, monthly: true },
    ],
  },
];

// ─── Launch Stage ────────────────────────────────────────────────────────────
// Single toggle for the landing page's funnel state.
// Change LAUNCH_STAGE to flip all stage-dependent copy, pricing, and visibility.

export type LaunchStage =
  | 'waitlist'
  | 'public-beta'
  | 'early-access'
  | 'launch';

export const LAUNCH_STAGE: LaunchStage = 'public-beta';

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
    heroBadgeLabel: '',
    heroCtaLabel: '',
    ctaHeadline: 'Be first when CaptureFlow launches',
    ctaSubtitle: "I'll email you when CaptureFlow is ready.",
    ctaButtonLabel: '',
    price: 9,
    originalPrice: null,
    discountBadge: null,
    pricingHeading: '',
    pricingSubheading: '',
    pricingButtonLabel: '',
    priceFootnote: '',
  },
  'public-beta': {
    // Badge surfaces the open-source framing; the hero leads with a free
    // download. The pricing section below still surfaces the managed plan for
    // teams who'd rather not self-host.
    showHeroBadge: false,
    showHeroBuyCta: true,
    showPricingSection: true,
    showCtaBuyButton: true,
    showChangelogNav: false,
    heroBadgeLabel: '🎉 Open source — free to run',
    heroCtaLabel: 'Try CaptureFlow for free',
    ctaHeadline: 'Ready to record?',
    ctaSubtitle:
      'Free download. No credit card. Self-host on your own Cloudflare account, or let us run it for you with the managed plan.',
    ctaButtonLabel: 'Try CaptureFlow for free',
    price: 9,
    originalPrice: null,
    discountBadge: null,
    pricingHeading: 'Pricing',
    pricingSubheading:
      'Self-host for free — it is open source. Or let us host it for you with the managed plan.',
    pricingButtonLabel: 'Get started',
    priceFootnote: 'Cancel anytime.',
  },
  'early-access': {
    showHeroBadge: true,
    showHeroBuyCta: true,
    showPricingSection: true,
    showCtaBuyButton: true,
    showChangelogNav: false,
    heroBadgeLabel: '🚀 Early access',
    heroCtaLabel: 'Get early access',
    ctaHeadline: 'Ready to record?',
    ctaSubtitle:
      'Early access is live. Self-host for free, or let us run the managed plan for you.',
    ctaButtonLabel: 'Get early access',
    price: 9,
    originalPrice: null,
    discountBadge: null,
    pricingHeading: 'Early access pricing',
    pricingSubheading:
      'Self-host for free. The managed plan hosts CaptureFlow for you — no Cloudflare setup.',
    pricingButtonLabel: 'Get started',
    priceFootnote: 'Cancel anytime.',
  },
  launch: {
    showHeroBadge: true,
    showHeroBuyCta: true,
    showPricingSection: true,
    showCtaBuyButton: true,
    showChangelogNav: false,
    heroBadgeLabel: '✨ Now available',
    heroCtaLabel: 'Get started',
    ctaHeadline: 'Ready to record?',
    ctaSubtitle:
      'Self-host for free on your own Cloudflare account, or let us run it for you with the managed plan.',
    ctaButtonLabel: 'Get started',
    price: 9,
    originalPrice: null,
    discountBadge: null,
    pricingHeading: 'Pricing',
    pricingSubheading:
      'Self-host for free — it is open source. Or let us host it for you with the managed plan.',
    pricingButtonLabel: 'Get started',
    priceFootnote: 'Cancel anytime.',
  },
};

export const CURRENT_STAGE: StageConfig = STAGE_CONFIG[LAUNCH_STAGE];

// ─── Pricing (derived from current stage) ────────────────────────────────────

export const PRO_PRICE: number = CURRENT_STAGE.price;

// ─── Testimonials ────────────────────────────────────────────────────────────
// Removed: placeholder testimonials with randomuser.me avatars.
// Add real testimonials here once available.

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const STATIC_FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: 'How does CaptureFlow compare to other screen recorders?',
    answer:
      'CaptureFlow is three tools in one. Record captures your screen straight to a shareable link — the upload happens while you record, so there is no waiting around. Share is a Loom-style flow: hit stop and the link is already in your clipboard, with workspaces for team sharing and a viewer that has reactions, comments, and view counts. Snap is a screenshot tool with markup and instant share links built in.\n\nMost competitors do one of these well. QuickTime and OBS capture the screen and leave everything else to a separate tool. Loom nails fast sharing but is closed-source and runs only on their cloud. CaptureFlow covers all three — and it is open source, so you can run the whole thing on your own Cloudflare account.',
  },
  {
    question: 'How do the instant share links work?',
    answer:
      'CaptureFlow uploads your recording as you record it, not after. By the time you stop, the file is already in the cloud and the share link is on your clipboard — ready to paste anywhere. Recipients open the link to a viewer with reactions, comments, and a live view count, no app install required.',
  },
  {
    question: 'Is my data private?',
    answer:
      "Yes — and with CaptureFlow you control where it lives. When you self-host, recordings and Snaps upload to your own Cloudflare account (R2 storage, D1 database) — nothing touches our servers at all.\n\nWhen you create a share link, that artifact is stored so the recipient can open it from a URL. You control visibility per artifact (public, workspace-only, or private), and you can revoke or delete a link from your dashboard at any time.",
  },
  {
    question: 'Which macOS versions does CaptureFlow support?',
    answer:
      'CaptureFlow runs on macOS 14 (Sonoma) or later, on Apple Silicon Macs. Intel Mac support is not tested yet but is being worked on. Older macOS versions may work but are unsupported — newer versions get the smoothest experience.',
  },
  {
    question: 'Can I self-host CaptureFlow?',
    answer:
      "Yes — that's the whole point. CaptureFlow is open source under the AGPL and runs entirely on Cloudflare: Workers for the API, R2 for storage, and D1 for the database. Deploy it to your own account and you own every recording, Snap, and share link end to end. The repo and deploy guide live on GitHub and docs.captureflow.xyz.",
  },
  {
    question: "What's free and what's the managed plan?",
    answer:
      'Everything is free when you self-host. CaptureFlow is open source under the AGPL — deploy it to your own Cloudflare account and use recording, instant share links, Snaps, and workspaces with no limits and no watermark.\n\nThe managed plan is for teams who would rather not run their own infrastructure: we host CaptureFlow for you, handle storage and updates, and you skip the Cloudflare setup entirely.',
  },
  {
    question: 'CaptureFlow is in beta — is it stable?',
    answer:
      "Beta means CaptureFlow is young and improving fast, not that it's fragile — recording, sharing, and Snaps are stable and in daily use. Updates ship frequently, and a few rough edges remain (Intel Macs aren't supported yet, for example). It's open source, so you can read the code, file issues, or send a pull request — feedback directly shapes the roadmap.",
  },
  {
    question: 'Does CaptureFlow add a watermark?',
    answer:
      "No. CaptureFlow never watermarks your recordings, Snaps, or exports — self-hosted or managed. It's open source, so there are no artificial limits baked in: record at up to 4K, for as long as you want.",
  },
];

export const FAQ_ITEMS: { question: string; answer: string }[] = [
  ...STATIC_FAQ_ITEMS,
];

// ─── Roadmap ─────────────────────────────────────────────────────────────────

export const ROADMAP_GROUPS = [
  {
    title: 'To Do',
    subtitle: 'The next few months, by priority.',
    items: [
      {
        label: 'One-click Cloudflare deploy',
        description:
          'Spin up your own self-hosted instance from a single button.',
        category: 'Core',
      },
      {
        label: 'Trim before you share',
        description:
          'Clip the start and end of a recording without leaving the app.',
        category: 'Record',
      },
      {
        label: 'Auto-redact sensitive content',
        description:
          'Finds API keys, emails, and secrets on screen and blurs them.',
        category: 'Core',
      },
      {
        label: 'Password-protected links',
        description:
          'Gate any share behind a password for extra-private clips.',
        category: 'Share',
      },
    ],
    badgeLabel: 'To Do',
    badgeClass: 'text-neutral-400',
    markerIcon: 'bookmark',
    markerClass: 'text-neutral-400',
  },
  {
    title: 'In Progress',
    subtitle: "Features I'm actively working on.",
    items: [
      {
        label: 'Comment threads on the viewer',
        description:
          'Threaded, timestamped comments right on the shared recording.',
        category: 'Share',
      },
      {
        label: 'Auto captions',
        description:
          'Generated from your mic audio, with style and timing controls.',
        category: 'Record',
      },
      {
        label: 'Custom domains for shares',
        description: 'Serve your share links from your own domain.',
        category: 'Share',
      },
    ],
    badgeLabel: 'In progress',
    badgeClass: 'text-neutral-500',
    markerIcon: 'bolt',
    markerClass: 'text-neutral-500',
  },
  {
    title: 'Done',
    subtitle: 'Shipped and live.',
    items: [
      {
        label: 'Instant share links',
        description: 'Record straight to a link you can share anywhere.',
        category: 'Share',
      },
      {
        label: 'Reactions & view counts',
        description:
          'Viewers can react to a share and see how many have watched.',
        category: 'Share',
      },
    ],
    badgeLabel: 'Done',
    badgeClass: 'text-neutral-500',
    markerIcon: 'check_circle',
    markerClass: 'text-neutral-500',
  },
] as const;

// ─── Feature Highlights (bottom grid) ────────────────────────────────────────

export const FEATURE_HIGHLIGHTS = [
  {
    label: 'Three capture modes',
    description:
      'Grab the whole screen, a single window, or a dragged region — Record, Share, and Snap all live in one menu bar app.',
  },
  {
    label: 'Instant share links',
    description:
      'Your screen uploads while you record, so the share URL is on your clipboard the second you stop — no render wait.',
  },
  {
    label: 'A viewer for feedback',
    description:
      'Every link opens to reactions, threaded comments, and a live view count, so your team reacts without leaving the page.',
  },
  {
    label: 'Annotated Snaps',
    description:
      'Capture a region, window, or full screen, mark it up with arrows, text, and blur, and share it as a hosted link.',
  },
  {
    label: 'Workspaces & visibility',
    description:
      'Keep links private, share them inside a workspace, or flip them public — visibility is per artifact and revocable anytime.',
  },
  {
    label: 'Open source & self-hostable',
    description:
      'Run the whole thing on your own Cloudflare account — Workers, R2, and D1. AGPL-licensed, free, and yours to control.',
  },
] as const;

// ─── Feature Categories ─────────────────────────────────────────────────────

export const FEATURE_CATEGORIES = [
  'Performance',
  'UI / Design',
  'Sharing',
  'Self-hosting',
  'Recording',
  'Other',
] as const;

// ─── Nav ─────────────────────────────────────────────────────────────────────

const ALL_NAV_LINKS: { href: string; label: string }[] = [
  { href: '#modes', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
  { href: '#roadmap', label: 'Roadmap' },
];

// No dedicated X/Telegram presence yet — point the social exports at the
// public GitHub repo and docs so footer/socials still resolve to a real URL.
export const X_URL = 'https://github.com/sardorml/captureflow';
export const TELEGRAM_URL = 'https://docs.captureflow.xyz';

// Waitlist stage swaps the homepage anchors for a single Changelog link
// — there's no pricing section live yet and the changelog gives early
// visitors something to scan while they wait.
const WAITLIST_EXTRA_LINKS: { href: string; label: string }[] = [
  { href: '/changelog', label: 'Changelog' },
];

const baseLinks = CURRENT_STAGE.showPricingSection
  ? ALL_NAV_LINKS
  : ALL_NAV_LINKS.filter((link) => link.href !== '#pricing');

export const NAV_LINKS: { href: string; label: string }[] =
  CURRENT_STAGE.showChangelogNav
    ? [...baseLinks, ...WAITLIST_EXTRA_LINKS]
    : baseLinks;

// ─── JSON-LD Schemas ─────────────────────────────────────────────────────────

export const APP_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'macOS',
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  // One Offer per plan/cycle: the free self-hosted tier plus both managed
  // billing cycles. The annual offer's price is the yearly charge
  // (12 × $6 = $72).
  offers: [
    {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      name: 'Self-Hosted',
      description:
        'Open-source recording, instant share links, Snaps, and workspaces — run it on your own Cloudflare account, no watermark',
    },
    {
      '@type': 'Offer',
      price: String(MONTHLY_PRICE),
      priceCurrency: 'USD',
      name: 'Managed (monthly)',
      description:
        'Fully managed hosting — instant share links, Snaps, team workspaces, and cloud storage we run for you, no Cloudflare setup',
    },
    {
      '@type': 'Offer',
      price: String(ANNUAL_PRICE_PER_MONTH * 12),
      priceCurrency: 'USD',
      name: 'Managed (annual)',
      description: 'All managed features, billed annually at $6/month ($72/year)',
    },
  ],
};

export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  email: SUPPORT_EMAIL,
  logo: `${SITE_URL}/logo.png`,
  // Keep in sync with the footer socials. No X/Telegram presence yet, so the
  // canonical off-site profile is the GitHub repo.
  sameAs: ['https://github.com/sardorml/captureflow'],
};

// Google's "site name" in search results (the bit above the link) is driven by
// WebSite JSON-LD on the home page. Organization schema isn't enough — Google's
// site-name algorithm pulls specifically from `WebSite.name`, falling back to
// og:site_name → application-name → <title> → host. Without this block Google
// has no WebSite signal and defaults to the host name. The `alternateName`
// covers searches that match the bare host.
//   See: https://developers.google.com/search/docs/appearance/site-names
export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  alternateName: 'captureflow.xyz',
  url: SITE_URL,
};

export const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

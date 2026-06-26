/*
 * `{n}`, `{total}`, `{amount}` (and other `{…}`) are runtime placeholders filled
 * via `.replace()` — keep them verbatim. Arrays here keep the SAME length and
 * order as their counterparts in lib/marketing/constants.ts so components can zip
 * them by index.
 */
export const MESSAGES = {
  meta: {
    title: "Open-Source Loom Alternative & Screen Recorder — CaptureFlow",
    description:
      "CaptureFlow is an open-source, self-hostable macOS screen recorder with instant share links and annotated screenshots — record, share, and screenshot from one menu bar app. Free and self-hostable on your own Cloudflare account.",
  },
  nav: {
    features: "Features",
    discover: "Discover",
    pricing: "Pricing",
    faq: "FAQ",
    roadmap: "Roadmap",
    changelog: "Changelog",
    login: "Log in",
    download: "Download",
    languageAria: "Change language",
  },
  languagePicker: {
    title: "Select your language",
    close: "Close",
    loading: "Loading…",
  },
  auth: {
    title: "Log in or sign up",
    subtitle: "Record, share, and screenshot — all from one menu bar app.",
    continueWithGoogle: "Continue with Google",
    continueWithEmail: "Continue with email",
    emailStepTitle: "Continue with email",
    emailLabel: "Email",
    emailPlaceholder: "Enter email",
    continue: "Continue",
    welcomeBack: "Welcome back",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter password",
    signIn: "Sign in",
    forgotPassword: "Forgot password?",
    signupTitle: "Create your account",
    nameLabel: "Name",
    namePlaceholder: "Enter your name",
    passwordHint: "At least 12 characters",
    back: "Back",
    close: "Close",
    showPassword: "Show password",
    hidePassword: "Hide password",
    newHere: "New to CaptureFlow?",
    createAccount: "Create an account",
    haveAccount: "Already have an account?",
    showcaseTitle: "Share and review with your team",
    showcaseSubtitle: "Record, share, and react in real time.",
    emailRequired: "Enter your email address.",
    passwordRequired: "Enter your password.",
    nameRequired: "Enter your name.",
    passwordTooShort: "Use a password of at least 12 characters.",
    invalidCredentials: "Invalid email or password.",
    genericError: "Something went wrong. Please try again.",
  },
  hero: {
    aiWord: "Open-Source",
    titleMain: "Screen recorder",
    titleSuffix: "for everyone",
    subtitleLine1: "Easily record and share video messages with your",
    subtitleLine2: "teammates and customers to supercharge productivity.",
    ctaLabel: "Try captureflow for free",
    secondaryCta: "See pricing",
    badge: "🎉 Open source — free to run",
    noCreditCard: "No credit card required",
    teaser: {
      title: "Self-hostable",
      body: "Run it on your own Cloudflare account.",
      cta: "Try captureflow",
    },
    demo: {
      prevAria: "Previous demo",
      nextAria: "Next demo",
      dotAria: "Show demo {n} of {total}",
    },
  },
  modes: {
    headingLine1: "Recordings and screenshots",
    headingLine2: "— one toolbar.",
    subtitleLine1: "Share a screen recording when it needs to go out now,",
    subtitleLine2:
      "Screenshot when a picture says it. One toolbar, two outputs.",
    tabs: {
      share: { label: "Share", caption: "Instant share link" },
      screenshot: { label: "Screenshot", caption: "Annotated screenshots" },
    },
  },
  features: {
    titleLine1: "Open Recorder &",
    titleLine2: "Sharing",
    subtitle:
      "From quick bug reports to polished demos — record, share, and screenshot in one app.",
    // `feature-camera` is no longer in FEATURES; its key is retained so locale
    // catalogs typed `Messages = typeof MESSAGES` still type-check.
    tags: {
      "feature-zoom": "Instant links",
      "feature-export": "Self-hosted",
      "feature-timeline": "Recording viewer",
      "feature-backgrounds": "Screenshots",
      "feature-camera": "Camera",
    },
    items: {
      "feature-zoom": {
        heading: "Stop recording, link is ready",
        description:
          "Your screen uploads while you record, so the share link is on your clipboard the moment you stop — no export queue, no render wait.",
      },
      "feature-export": {
        heading: "Open source and self-hostable",
        description:
          "Run CaptureFlow on your own Cloudflare account — Workers, R2, and D1. AGPL-licensed, free, and yours to control.",
      },
      "feature-timeline": {
        heading: "A recording viewer built for feedback",
        description:
          "Every link opens to reactions, comments, and view counts — so your team can react to a recording without leaving the page.",
      },
      "feature-backgrounds": {
        heading: "Screenshots — annotate and share",
        description:
          "Grab a region, window, or full screen, mark it up with arrows, text, and blur, and share it as an instant link.",
      },
      // Retained for locale type-compat only (not in FEATURES — never rendered).
      "feature-camera": {
        heading: "Camera and audio capture",
        description:
          "Drop a webcam bubble in any corner and capture system audio and mic alongside your screen.",
      },
    },
  },
  collaboration: {
    header: {
      title: "Capture it. Share it. Done.",
      subtitle:
        "Recordings and screenshots become instant links — react, comment, and keep everything inside your team's workspace.",
    },
    categories: {
      share: {
        title: "Shareable recordings",
        features: {
          editor: {
            title: "Edit recording",
            linkText: "Recolor and choose who can react",
            body: "— polish your recording on the web, no re-record.",
          },
          viewer: {
            title: "Share, react and comment",
            linkText: "Drop reactions and threaded comments",
            body: "— feedback lands right on the recording, no re-record.",
          },
          dashboard: {
            title: "Your recordings, your dashboard",
            linkText: "Track views, search your library, revoke access",
            body: "— every link organized in one place.",
          },
        },
      },
      screenshot: {
        title: "Capture screenshots",
        features: {
          capture: {
            title: "Region, window, or full screen",
            linkText: "One shortcut, three ways to grab",
            body: "— drag a region, click a window, or take the whole display.",
          },
          markup: {
            title: "Annotate before you share",
            linkText: "Add arrows, text, or blur",
            body: "over any capture — every annotation stays on the Screenshot.",
          },
          share: {
            title: "One link, ready to share",
            linkText: "The link hits your clipboard",
            body: "— Screenshots and recordings together in one dashboard.",
          },
        },
      },
      workspaces: {
        title: "Team workspaces",
        features: {
          workspace: {
            title: "Share with your team",
            linkText: "Keep links inside your workspace",
            body: "so only teammates can open them — private by default.",
          },
          public: {
            title: "Public when you want",
            linkText: "Flip a recording public",
            body: "and anyone with the link can watch — great for changelogs and demos.",
          },
          private: {
            title: "Keep it to yourself",
            linkText: "Lock a recording to just you",
            body: "while you draft, then share it the moment it's ready.",
          },
        },
      },
    },
    editorMockup: {
      micLabel: "Mic",
      systemLabel: "System",
      backgroundAria: "Background {n}",
      cameraPositionAria: "Camera position {n}",
      audioToggleAria: "{label} audio",
    },
    captureMockup: {
      dimensions: "1280 × 720",
      toolbar: {
        studio: "Record",
        share: "Share",
        screenshot: "Screenshot",
      },
    },
    workspaceMockup: {
      visibility: {
        public: {
          label: "Public",
          description: "Anyone with the link can open this share",
        },
        workspace: {
          label: "Workspace",
          description: "Only teammates can open this share",
        },
        private: {
          label: "Private",
          description: "Only you can open this share",
        },
      },
      teamName: "CaptureFlow team",
      teamMeta: "Workspace · {count} members",
      inviteButton: "Invite",
      membersLabel: "Members",
      roleAdmin: "Admin",
      roleMember: "Member",
      linkVisibilityLabel: "Link visibility",
    },
  },
  pricing: {
    heading: "Pricing",
    subheading:
      "Self-host for free — it is open source. Or let us host it for you with the managed plan.",
    guarantee: "Open source under the AGPL — run it yourself.",
    free: {
      name: "Self-Hosted",
      badge: "Open source",
      badgeFree: "Free",
      price: "$0",
      period: "forever",
      tagline: "Run it on your own Cloudflare account.",
      note: "No account, no limits, no watermark.",
      features: [
        "Unlimited recording & share links",
        "Annotated screenshots",
        "Open source (AGPL), no watermark",
        "macOS menu bar app",
      ],
      cta: "Build from source",
    },
    highlights: {
      allFeatures: "Fully managed — no Cloudflare setup",
      shareableLinks:
        "Shareable recordings, screenshots & 200 GB cloud storage",
      teamSeats: "Whole team included — no per-seat fees",
    },
    monthly: {
      badgePro: "Managed",
      badgeCycle: "Monthly",
      title: "Managed hosting",
      subtitle: "Fully hosted, billed monthly.",
      period: "/month",
      note: "Cancel anytime.",
      cta: "Get started",
    },
    annual: {
      badgePro: "Managed",
      badgeCycle: "Annual",
      title: "Managed hosting",
      subtitle: "Fully hosted, billed annually.",
      period: "/month",
      note: "Billed {amount}/year. Cancel anytime.",
      cta: "Get started",
    },
    compare: {
      heading: "Compare plans",
      subtitle: "What you get on each plan.",
      featureColumn: "Feature",
      freeColumn: "Self-Hosted",
      proColumn: "Managed hosting",
      includedAria: "included",
      notIncludedAria: "not included",
      // Boolean cells render a check/dash from COMPARE_SECTIONS, so '' here is fine.
      sections: [
        {
          title: "Desktop app",
          rows: [
            {
              label: "Installation",
              free: "Build it yourself",
              pro: "Download & run",
            },
            {
              label: "Code signing",
              free: "Self-sign (Apple ID)",
              pro: "Signed & notarized",
            },
          ],
        },
        {
          title: "Cloud & hosting",
          rows: [
            { label: "Hosting", free: "Your Cloudflare", pro: "Fully managed" },
            { label: "Setup", free: "You deploy it", pro: "Zero setup" },
            { label: "Cloud storage", free: "Your R2 bucket", pro: "Included" },
            { label: "Backups & monitoring", free: "", pro: "" },
          ],
        },
        {
          title: "Recording & sharing",
          rows: [
            { label: "Screen recording & instant links", free: "", pro: "" },
            { label: "Annotated Screenshots", free: "", pro: "" },
            { label: "Workspaces & teammate invites", free: "", pro: "" },
            { label: "Commercial usage", free: "", pro: "" },
          ],
        },
        {
          title: "Support",
          rows: [
            { label: "Community support", free: "", pro: "" },
            { label: "Priority support", free: "", pro: "" },
          ],
        },
      ],
    },
  },
  faq: {
    heading: "Frequently Asked Questions",
    waitlistLink: "Join the waitlist",
    items: [
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
    ],
  },
  roadmap: {
    heading: "What's next",
    subtitle: "Updated as features ship.",
    suggestFeature: "Suggest a feature",
    closeAria: "Close",
    categories: {
      ai: "Core",
      studio: "Record",
      share: "Share",
    },
    groups: [
      {
        title: "Backlog",
        subtitle: "On the radar — not scheduled yet.",
        badge: "Backlog",
        items: [
          {
            label: "AI summaries & chapters",
            description:
              "Auto-generate a title, summary, and chapters from every recording.",
          },
          {
            label: "Filler-word & silence removal",
            description:
              "Automatically cut 'ums', 'uhs', and dead air from your recording.",
          },
          {
            label: "Transcripts & translations",
            description:
              "AI transcripts with one-click translation into other languages.",
          },
        ],
      },
      {
        title: "To Do",
        subtitle: "The next few months, by priority.",
        badge: "To Do",
        items: [
          {
            label: "Windows support",
            description:
              "Bring CaptureFlow's recording and instant share links to Windows.",
          },
        ],
      },
      {
        title: "In Progress",
        subtitle: "Features I'm actively working on.",
        badge: "In progress",
        items: [
          {
            label: "Chrome extension",
            description:
              "Record and share straight from the browser — no desktop install.",
          },
          {
            label: "Firefox extension",
            description:
              "Record and share straight from the browser — no desktop install.",
          },
        ],
      },
    ],
  },
  cta: {
    headline: "Ready to record?",
    subtitle:
      "Free download. No credit card. Self-host on your own Cloudflare account, or let us run it for you with the managed plan.",
    button: "Try captureflow for free",
  },
  sectionHeader: {
    cta: "Try captureflow",
  },
  footer: {
    brand: "CaptureFlow",
    columns: {
      brand: {
        title: "CaptureFlow",
        download: "Download",
        pricing: "Pricing",
        contact: "Contact",
        about: "About",
      },
      features: {
        title: "Use cases",
        zoom: "Async updates",
        timeline: "Product demos",
        backgrounds: "Bug reports",
        camera: "Camera",
        export: "Quick screenshots",
      },
      resources: {
        title: "Resources",
        changelog: "Changelog",
        blog: "Blog",
        faq: "FAQ",
        roadmap: "Roadmap",
      },
      legal: {
        title: "Legal",
        terms: "Terms",
        privacy: "Privacy",
        refund: "Refund Policy",
      },
      social: {
        title: "Social",
        telegram: "Telegram",
        twitter: "X / Twitter",
      },
    },
  },
  floatingCta: {
    tagline: "Record. Share. Done.",
    button: "Try captureflow",
  },
  pageShell: {
    logoAlt: "CaptureFlow",
    backToHome: "Back to home",
  },
  waitlist: {
    errors: {
      joinFailed: "Could not join waitlist. Please try again.",
      network: "Network error. Please try again.",
    },
    success: "You're on the list. I'll email you when CaptureFlow is ready.",
    emailPlaceholder: "you@example.com",
    buttonLoading: "Joining...",
    buttonDefault: "Join Waitlist",
    earlyAccessPrompt: "Want early access?",
    earlyAccessLink: "Become a beta tester",
  },
  forms: {
    name: "Name",
    email: "Email",
    namePlaceholder: "Your name",
    emailPlaceholder: "you@example.com",
    sending: "Sending...",
    submitting: "Submitting...",
  },
  contact: {
    title: "Get in touch",
    subtitle:
      "Questions, feedback, or just want to say hi? I'd love to hear from you.",
    successTitle: "Message sent",
    successBody: "Thanks for reaching out. I'll get back to you soon.",
    subjectLabel: "Subject",
    subjectPlaceholder: "What's this about?",
    messageLabel: "Message",
    messagePlaceholder: "Tell us what's on your mind...",
    send: "Send Message",
    errorBody:
      "Your message couldn't be sent. Please try again, or email me directly at {email}.",
    deliveredVia: "Delivered via FormSubmit.",
  },
  suggestFeature: {
    title: "Suggest a feature",
    subtitle: "Got an idea that would make CaptureFlow better? I'm all ears.",
    successTitle: "Idea received!",
    successBody: "Thanks for sharing your idea. I read every suggestion.",
    categoryLabel: "Category",
    categoryOptions: [
      "Performance",
      "UI / Design",
      "Sharing",
      "Self-hosting",
      "Recording",
      "Other",
    ],
    featureTitleLabel: "Feature title",
    featureTitlePlaceholder: "A short title for your idea",
    descriptionLabel: "Description",
    descriptionPlaceholder:
      "Describe the feature and why it would be useful...",
    submit: "Submit Idea",
    errorBody:
      "Your idea couldn't be sent. Please try again, or email me directly at {email}.",
    deliveredVia: "Delivered via FormSubmit.",
  },
  betaTester: {
    title: "Try out the beta",
    subtitle:
      "Want early access? Tell me a bit about how you record and I'll get you in.",
    successTitle: "You're on the list!",
    successBody:
      "Thanks for signing up. I'll reach out by email when the next beta wave goes out.",
    macLabel: "Mac model and macOS version",
    macPlaceholder: "e.g. MacBook Pro M2, macOS 14.5",
    recordLabel: "What do you record?",
    pickAny: "(pick any)",
    recordingTypes: [
      "Product demos",
      "Tutorials",
      "Bug reports",
      "Marketing clips",
      "Course content",
      "Internal walkthroughs",
      "Other",
    ],
    frequencyLabel: "How often do you record?",
    frequencyOptions: [
      "A few times a week",
      "A few times a month",
      "A few times a year",
      "First time recording",
    ],
    currentToolLabel: "What do you currently use?",
    currentToolPlaceholder: "e.g. QuickTime, Loom, CleanShot, nothing yet",
    motivationLabel: "What made you want to try CaptureFlow?",
    motivationPlaceholder:
      "What are you hoping it does well? Any features that would make it a no-brainer for you?",
    submit: "Join beta",
    errorJoin: "Could not join the beta. Please try again.",
    errorNetwork: "Network error. Please try again.",
  },
  download: {
    heading: "Download CaptureFlow",
    subtitle:
      "Record your screen and get an instant share link — free and open source. Self-host on your own Cloudflare account, with Screenshots and workspaces included.",
    button: "Download for Apple Silicon Macs (Beta)",
    requires: "Requires {version} or later on Apple Silicon.",
    requirements: "Requires macOS 14 or later on Apple Silicon.",
    versionLabel: "Version {version}",
    sizeLabel: "{size} MB DMG",
    notarized: "Signed & notarized by Apple",
    afterTitle: "After downloading",
    afterSteps: [
      "Open the downloaded DMG.",
      "Drag CaptureFlow into your Applications folder.",
      "Launch it — CaptureFlow lives in your menu bar.",
    ],
  },
  plan: {
    heading: "Pick your plan",
    subtitle:
      "Self-host CaptureFlow for free on your own Cloudflare account. Prefer not to run infrastructure? The managed plan hosts it for you, with Screenshots and cloud workspaces included.",
  },
  about: {
    title: "About",
    subtitle: "The story behind CaptureFlow.",
    story: [
      "Hi — I'm the solo developer behind CaptureFlow. I built it because recording my screen always meant juggling apps: one to record, one to share, and one to mark up a screenshot. None of them talked to each other, and the good ones were closed-source clouds I couldn't host myself.",
      "CaptureFlow is my fix: one open-source macOS menu bar app with three tools. Record captures your screen and uploads as you go, so the share link is on your clipboard the moment you stop. Share opens to a viewer with reactions, comments, and view counts. Screenshot does the same for annotated screenshots. The whole thing runs on your own Cloudflare account — Workers, R2, and D1 — or on our managed service if you would rather not.",
      "CaptureFlow is in public beta, which means it's young and improving quickly. It's open source under the AGPL, so updates ship often and the roadmap is shaped by the people using it. If something breaks or you wish it worked differently, open an issue or write to me — every message lands in my inbox, and I reply myself.",
    ],
    reachUs: "Reach me anytime at {email}.",
  },
  blog: {
    title: "Blog",
    subtitle: "Tips, guides, and updates on screen recording.",
    readArticle: "Read article",
    empty: "No posts yet. Check back soon.",
  },
} as const;

export type Messages = typeof MESSAGES;

/*
 * `{n}`, `{total}`, `{amount}` (and other `{…}`) are runtime placeholders filled
 * via `.replace()` — keep them verbatim. Arrays here keep the SAME length and
 * order as their counterparts in lib/marketing/constants.ts so components can zip
 * them by index.
 */
export const MESSAGES = {
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
  banner: {
    label: "Beta",
    aria: "CaptureFlow is in public beta",
    title: "You're early 🎉",
    strip:
      "CaptureFlow is still in beta, so it changes often and you may hit the odd rough edge while it settles.",
    body: "CaptureFlow is in public beta. Something new lands most weeks, and the things people ask for are the things that get built first.",
    cta: "Tell me what to build next",
    close: "Close",
  },
  languagePicker: {
    title: "Select your language",
    close: "Close",
    loading: "Loading…",
  },
  auth: {
    title: "Log in or sign up",
    subtitle: "Record, share, and screenshot from one menu bar app.",
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
    titleLead: "Open-source screen recorder",
    titleSuffix: "with shareable links",
    subtitleLine1:
      "Record your screen and share it with your team, clients, or customers.",
    subtitleLine2: "Self-hostable on your Cloudflare account.",
    ctaLabel: "Try CaptureFlow for free",
    installChrome: "Install Chrome extension",
    installMac: "Download for free",
    installSoon: "Soon",
    macSoon: "macOS app coming soon",
    installOr: "or",
    secondaryCta: "See pricing",
    badge: "Open source, free to run",
    noCreditCard: "No credit card required",
    teaser: {
      title: "Self-hostable",
      body: "Run it on your own Cloudflare account.",
      cta: "Try CaptureFlow",
    },
    demo: {
      prevAria: "Previous demo",
      nextAria: "Next demo",
      dotAria: "Show demo {n} of {total}",
    },
  },
  useCases: {
    heading: "Video messages for every team",
    cards: {
      engineering: {
        title: "Engineering",
        body: "Walk through a PR or a bug repro so reviewers see the code run.",
      },
      design: {
        title: "Design",
        body: "Talk through a mockup and collect feedback without booking a review.",
      },
      support: {
        title: "Customer support",
        body: "Answer the ticket with a short walkthrough instead of ten steps of text.",
      },
      updates: {
        title: "Team updates",
        body: "Record the weekly update once and let everyone watch it when they can.",
      },
    },
    engineeringFile: "checkout.ts",
    engineeringPr: "PR #482",
    designCardTitle: "Plan your trip",
    designComment: "Bigger CTA?",
    supportQuestion: "How do I invite my team to the workspace?",
    supportReply: "Here's a quick walkthrough:",
    supportLink: "captureflow.dev/r/8kx2pnq4",
    supportResolved: "Resolved in one reply",
    updatesTitle: "Week 41 update",
    updatesRange: "Oct 6–10",
    updatesSignups: "Signups",
    updatesShipped: "Shipped",
    updatesFeatures: "features",
  },
  modes: {
    heading: "The simplest screen recorder you'll ever use",
    subtitle:
      "Record in two clicks. Share with a link. Get feedback on the video.",
    tabs: {
      share: { label: "Share", caption: "Instant share link" },
      screenshot: { label: "Screenshot", caption: "Annotated screenshots" },
    },
    panel: {
      sourceAria: "Capture source",
      source: "Full screen",
      sourceHint: "Pick at start",
      camera: "Camera",
      microphone: "Microphone",
      on: "On",
      startRecording: "Start Recording",
      more: "More",
    },
    scene: {
      title: "Walkthrough: the new checkout flow",
      author: "Sam",
      age: "2 min ago",
      timer: "0:42",
      duration: "1:12",
      url: "captureflow.dev/r/8kx2pnq4",
      comments: [
        { author: "Maya", text: "Love the new flow" },
        { author: "Alex", text: "Ship it 🚀" },
      ],
    },
  },
  features: {
    titleLine1: "Open Recorder &",
    titleLine2: "Sharing",
    subtitle:
      "Record, share, and screenshot in one app, from quick bug reports to polished demos.",
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
          "Your screen uploads while you record, so the share link is on your clipboard the moment you stop. No export queue, no render wait.",
      },
      "feature-export": {
        heading: "Open source and self-hostable",
        description:
          "Run CaptureFlow on your own Cloudflare account: Workers, R2, and D1. AGPL-licensed, free, and yours to control.",
      },
      "feature-timeline": {
        heading: "A recording viewer built for feedback",
        description:
          "Every link opens to reactions, comments, and view counts, so your team can respond without leaving the page.",
      },
      "feature-backgrounds": {
        heading: "Annotate a screenshot and share it",
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
    heading: "More than just a screen recorder",
    subtitle:
      "Some things are quicker to show than to type. Record it, send the link, and your team watches when they're free.",
    categories: {
      share: {
        feature: {
          title: "Polish it before you send it",
          body: "Add a background, move or resize your camera, and mute audio you don't want. Your link stays the same, so everyone sees the new version straight away.",
        },
      },
      feedback: {
        feature: {
          title: "Get feedback right on the video",
          body: "Viewers react with emojis and leave comments right on the timeline, at the exact moment they mean. Every reply stays with the video, so the conversation moves forward without another meeting.",
        },
      },
      workspaces: {
        feature: {
          title: "Workspaces for your whole team",
          body: "Invite your teammates to a workspace and everyone's recordings live in one place. Share a video with anyone, keep it inside the workspace, or keep it to yourself until it's ready.",
        },
      },
    },
  },
  pricing: {
    heading: "Start free, pay for storage",
    subheading:
      "Self-host for free, or let us host it and only pay when you need more space.",
    guarantee: "Open source under the AGPL. Run it yourself.",
    managedGuarantee: "The same open-source app. We run it for you.",
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
      allFeatures: "Fully managed, no Cloudflare setup",
      shareableLinks: "Shareable recordings, screenshots & {storage} storage",
      teamSeats: "Whole team included, no per-seat fees",
    },
    monthly: {
      badgePro: "Managed",
      badgeCycle: "Monthly",
      title: "Managed hosting",
      subtitle: "Start free, upgrade for more space.",
      period: "/month",
      note: "Cancel anytime.",
      cta: "Get started",
      freeLabel: "Free",
      freeNote: "No card needed.",
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
  },
  faq: {
    heading: "Frequently Asked Questions",
    waitlistLink: "Join the waitlist",
    items: [
      {
        question: "Can I self-host CaptureFlow?",
        answer:
          "Yes. CaptureFlow is open source under the AGPL, and the whole backend runs on Cloudflare: Workers for the app and API, R2 for recordings, and D1 for everything else. Create a D1 database and an R2 bucket, apply the migrations, set one secret, and deploy. There's also a Deploy to Cloudflare button. The guide is at docs.captureflow.dev.",
      },
      {
        question: "What does it cost to run on Cloudflare?",
        answer:
          "For light use, nothing. Cloudflare's free tiers cover Workers, D1, and the first 10 GB of R2 storage, though R2 asks for a card on file even on the free tier. Storage is usually the first limit you'll hit as recordings pile up.\n\nR2 doesn't charge for egress, so a video that gets watched a hundred times costs no more to serve than one that's watched once.",
      },
      {
        question: "Where do my recordings live?",
        answer:
          "When you self-host, in your own Cloudflare account. Videos go to your R2 bucket and everything else to your D1 database, so nothing touches our servers. On managed hosting we run that same setup for you. Either way, you choose who can open each recording: anyone with the link, just your workspace, or only you.",
      },
      {
        question: "What if I don't want to run it myself?",
        answer:
          "Use managed hosting. It's the same open-source app, running on Cloudflare, and we handle the setup, storage, and updates. It's free to start with 200 MB, and you pay only when you need more space: 50, 100, or 200 GB a month. Your whole team is included, with no per-seat fees.",
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
        subtitle: "On the radar, not scheduled yet.",
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
          {
            label: "Repo-wide code refactor",
            description:
              "A pass over the whole codebase to tighten the structure and cut duplication before the next wave of features.",
          },
        ],
      },
      {
        title: "To Do",
        subtitle: "The next few months, by priority.",
        items: [
          {
            label: "Windows support",
            description:
              "Bring CaptureFlow's recording and instant share links to Windows.",
          },
          {
            label: "Firefox extension",
            description:
              "The same in-page recorder and instant share links, packaged for Firefox.",
          },
        ],
      },
      {
        title: "In Progress",
        subtitle: "Features I'm working on.",
        items: [
          {
            label: "macOS app",
            description:
              "A menu bar app with the same recorder and the same instant share link, for anything outside the browser.",
          },
        ],
      },
    ],
  },
  cta: {
    headline: "Ready to record?",
    subtitle:
      "Free download. No credit card. Self-host on your own Cloudflare account, or let us run it for you with the managed plan.",
    button: "Try CaptureFlow for free",
  },
  sectionHeader: {
    cta: "Try CaptureFlow",
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
    buttonLoading: "Joining…",
    buttonDefault: "Join waitlist",
    earlyAccessPrompt: "Want early access?",
    earlyAccessLink: "Become a beta tester",
  },
  forms: {
    name: "Name",
    email: "Email",
    namePlaceholder: "Your name",
    emailPlaceholder: "you@example.com",
    sending: "Sending…",
    submitting: "Submitting…",
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
    messagePlaceholder: "Tell me what's on your mind…",
    send: "Send message",
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
    descriptionPlaceholder: "Describe the feature and why it would be useful…",
    submit: "Submit idea",
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
    currentToolPlaceholder:
      "e.g. a screen recorder, a screenshot tool, nothing yet",
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
      "Record your screen and get an instant share link, free and open source. Self-host on your own Cloudflare account, with screenshots and workspaces included.",
    button: "Download for macOS",
    requires: "Requires {version} or later on Apple Silicon.",
    requirements: "Requires macOS 14 or later on Apple Silicon.",
    versionLabel: "Version {version}",
    sizeLabel: "{size} MB DMG",
    notarized: "Signed & notarized by Apple",
  },
  plan: {
    heading: "Pick your plan",
    subtitle:
      "Self-host CaptureFlow for free on your own Cloudflare account, or let the managed plan host it for you, with screenshots and cloud workspaces included.",
  },
  about: {
    title: "About",
    subtitle: "The story behind CaptureFlow.",
    story: [
      "Hi, I'm the solo developer behind CaptureFlow. I built it because recording my screen always meant juggling apps: one to record, one to share, and one to mark up a screenshot. None of them talked to each other, and the good ones were closed-source clouds I couldn't host myself.",
      "CaptureFlow is my fix: one open-source macOS menu bar app with three tools. Record captures your screen and uploads as you go, so the share link is on your clipboard the moment you stop. Share opens to a viewer with reactions, comments, and view counts. Screenshot does the same for annotated screenshots. The whole thing runs on your own Cloudflare account (Workers, R2, and D1), or on our managed service if you would rather not.",
      "CaptureFlow is in public beta, which means it's young and improving quickly. It's open source under the AGPL, so updates ship often and the roadmap is shaped by the people using it. If something breaks or you wish it worked differently, open an issue or write to me. Every message lands in my inbox, and I reply myself.",
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

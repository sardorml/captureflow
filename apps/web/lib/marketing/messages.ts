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
    installChrome: "Add to Chrome",
    installMac: "Download for free",
    installOr: "or",
    installSignup: "Sign up free",
    installNote: "no credit card required",
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
  modes: {
    eyebrow: "Capture modes",
    heading: "The recorder",
    subtitle: "Pick a source, add camera and mic, and hit record.",
    tabs: {
      share: { label: "Share", caption: "Instant share link" },
      screenshot: { label: "Screenshot", caption: "Annotated screenshots" },
    },
    points: {
      source: {
        title: "Tab, window, or full screen",
        body: "Pick the source in the panel and record without leaving the page.",
      },
      devices: {
        title: "Camera and mic in one tap",
        body: "Turn your webcam and microphone on right before you record.",
      },
      link: {
        title: "Ready the moment you stop",
        body: "It uploads while you record, so the link is on your clipboard when you stop.",
      },
      screenshot: {
        title: "Screenshots from here too",
        body: "Switch to the photo tab to grab the page and share it as a link.",
      },
    },
    panel: {
      sourceAria: "Capture source",
      source: "Full screen",
      sourceHint: "Pick at start",
      camera: "Camera",
      microphone: "Microphone",
      on: "On",
      off: "Off",
      startRecording: "Start Recording",
      more: "More",
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
    carousel: {
      previous: "Previous demo",
      next: "Next demo",
      slide: "{n} of {total}",
    },
    // Two per feature key, in the order the chips are drawn; they name the
    // action the slide is showing, not the feature it belongs to.
    chips: {
      editor: ["Trim", "Backgrounds"],
      viewer: ["Comment", "React"],
      dashboard: ["Copy link", "Views"],
      capture: ["Region", "Window"],
      markup: ["Text", "Blur"],
      share: ["One link", "One library"],
      workspace: ["Your team", "Nobody else"],
      public: ["Anyone", "Link only"],
      private: ["Only you", "Locked"],
    },
    categories: {
      share: {
        title: "Shareable recordings",
        subtitle:
          "Change the background, trim what you don't need, and place the camera where you want it.",
        features: {
          editor: {
            title: "Edit it in the browser",
            body: "Pick a background, trim what you don't need, move the camera bubble into a corner, and mute the mic or system sound. You never have to record it twice.",
          },
          viewer: {
            title: "Reactions and comments",
            body: "Viewers leave reactions and threaded comments on the recording itself, so feedback arrives in context.",
          },
          dashboard: {
            title: "Everything in one dashboard",
            body: "Every link you have shared sits in one place, with view counts, search, and a switch to revoke access.",
          },
        },
      },
      screenshot: {
        title: "Capture screenshots",
        subtitle:
          "Grab a region, a window, or the whole display, mark it up, and share it.",
        features: {
          capture: {
            title: "Region, window, or whole screen",
            body: "One shortcut covers all three. Drag out a region, click a single window, or take the whole display.",
          },
          markup: {
            title: "Mark it up first",
            body: "Add arrows, text, and blur over anything you capture, and every mark stays on the screenshot you send.",
          },
          share: {
            title: "Saved with your recordings",
            body: "A screenshot goes to the same library as your recordings, so there is one place to search and one set of links to manage.",
          },
        },
      },
      workspaces: {
        title: "Team workspaces",
        subtitle:
          "Share a recording with your whole workspace, or lock it down to just you.",
        features: {
          workspace: {
            title: "Only your teammates",
            body: "The link stays inside your workspace, so nobody outside it can open the recording.",
          },
          public: {
            title: "Anyone with the link",
            body: "Flip a recording to public and anyone with the link can watch, which suits changelogs and demos.",
          },
          private: {
            title: "Only you",
            body: "Lock a recording to just you while you draft it, then open it up the moment it is ready.",
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
    eyebrow: "Plans",
    heading: "Pricing",
    subheading: "Self-host for free, or let us host it for you.",
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
      shareableLinks:
        "Shareable recordings, screenshots & {storage} GB storage",
      teamSeats: "Whole team included, no per-seat fees",
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
  },
  faq: {
    heading: "Frequently Asked Questions",
    waitlistLink: "Join the waitlist",
    items: [
      {
        question: "How does CaptureFlow compare to other screen recorders?",
        answer:
          "CaptureFlow records your screen straight to a shareable link. The upload runs while you record, so the moment you hit stop the link is already on your clipboard. No exporting, uploading, or waiting. You also get annotated screenshots that share the same way, plus team workspaces and a viewer with reactions, comments, and view counts.\n\nMost screen recorders stop at the recording and leave hosting, sharing, and screenshots to other apps. CaptureFlow handles the whole flow in one place, and it is fully open source: use our managed hosting, or run it yourself on your own Cloudflare account and keep your data.",
      },
      {
        question: "How do the instant share links work?",
        answer:
          "CaptureFlow uploads your recording as you record it, not after. By the time you stop, the file is already in the cloud and the share link is on your clipboard, ready to paste anywhere. Recipients open the link to a viewer with reactions, comments, and a live view count, no app install required.",
      },
      {
        question: "Is my data private?",
        answer:
          "Yes, and with CaptureFlow you control where it lives. When you self-host, recordings and screenshots upload to your own Cloudflare account (R2 storage, D1 database). Nothing touches our servers at all.\n\nWhen you create a share link, that artifact is stored so the recipient can open it from a URL. You control visibility per artifact (public, workspace-only, or private), and you can revoke or delete a link from your dashboard at any time.",
      },
      {
        question: "Can I self-host CaptureFlow?",
        answer:
          "Yes, that's the whole point. CaptureFlow is open source under the AGPL and runs entirely on Cloudflare: Workers for the API, R2 for storage, and D1 for the database. Deploy it to your own account and you own every recording, screenshot, and share link end to end. The repo and deploy guide live on GitHub and docs.captureflow.dev.",
      },
      {
        question: "What's free and what's the managed plan?",
        answer:
          "Everything is free when you self-host. CaptureFlow is open source under the AGPL: deploy it to your own Cloudflare account and use recording, instant share links, screenshots, and workspaces with no limits and no watermark.\n\nThe managed plan is for teams who would rather not run their own infrastructure: we host CaptureFlow for you, handle storage and updates, and you skip the Cloudflare setup entirely.",
      },
      {
        question: "Is CaptureFlow stable while it's in beta?",
        answer:
          "Beta means CaptureFlow is young and improving fast, not that it's fragile. Recording, sharing, and screenshots are stable and in daily use. Updates ship frequently, and a few rough edges remain (Intel Macs aren't supported yet, for example). It's open source, so you can read the code, file issues, or send a pull request. Feedback shapes the roadmap.",
      },
      {
        question: "Does CaptureFlow add a watermark?",
        answer:
          "No. CaptureFlow never watermarks your recordings, screenshots, or exports, self-hosted or managed. It's open source, so there are no artificial limits baked in: record at up to 4K, for as long as you want.",
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
    eyebrow: "Get started",
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

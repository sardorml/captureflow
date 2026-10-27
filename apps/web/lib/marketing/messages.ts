/*
 * `{n}`, `{total}`, `{amount}` (and other `{…}`) are runtime placeholders filled
 * via `.replace()` — keep them verbatim. Arrays here keep the SAME length and
 * order as their counterparts in lib/marketing/constants.ts so components can zip
 * them by index.
 */
import { getSeatPlan } from "@captureflow/quota";

const LIGHT = getSeatPlan("light").name;
const PRO = getSeatPlan("pro").name;

export const MESSAGES = {
  nav: {
    features: "Features",
    discover: "Discover",
    pricing: "Pricing",
    faq: "FAQ",
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
    title: "Skip the meeting,\nsend a recording instead.",
    subtitle:
      "Open-source, AI-powered screen recordings you can share with your team as a link.",
    ctaLabel: "Try CaptureFlow for free",
    installChrome: "Install Chrome extension",
    installMac: "Download for macOS",
    installSoon: "Soon",
    macSoon: "macOS app coming soon",
    installOr: "or",
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
  highlights: {
    heading: "Everything you need, built in",
    items: [
      "Screen and camera recording",
      "AI transcripts in 99 languages",
      "Edit the video from its transcript",
      "Camera backgrounds and filters",
      "Infinite canvas while you record",
      "Annotated screenshots",
      "Comments and emoji reactions",
      "Open source and self-hostable",
    ],
    cta: "See all features",
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
    designApp: "trip-app",
    designBadge: "Checkout v3",
    designCardTitle: "Plan your trip",
    designColors: "Colors",
    designComment: "Bigger CTA?",
    supportQuestion: "How do I invite my team to the workspace?",
    supportReply: "Here's a quick walkthrough:",
    supportLink: "captureflow.dev/r/8kx2pnq4",
    updatesTitle: "Weekly update",
    updatesRange: "Oct 6–10",
    updatesSignups: "Signups",
    updatesShipped: "Shipped",
    updatesFeatures: "features",
  },
  modes: {
    heading: "Screen recording, made simple",
    subtitle:
      "Record in two clicks. Share with a link. Get feedback on the video.",
    tabs: {
      share: { label: "Share", caption: "Instant share link" },
      screenshot: { label: "Screenshot", caption: "Annotated screenshots" },
    },
    panel: {
      sourceAria: "Capture source",
      source: "Full screen",
      camera: "Camera",
      microphone: "Microphone",
      startRecording: "Start Recording",
      public: "Public",
      more: "More",
    },
    scene: {
      timer: "0:42",
      heading: "How a refund works",
      steps: ["Request", "Approve", "Pay out"],
      captions: [
        "Quick walkthrough of how a refund works.",
        "First, the customer sends in a request.",
        "Support approves it the same day.",
        "Then the money goes out automatically.",
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
    heading: "Recording is just the start",
    subtitle:
      "Some things are quicker to show than to type. Record it, send the link, and your team watches when they're free.",
    categories: {
      share: {
        feature: {
          tag: "new",
          title: "Clean it up before you share",
          cta: "Record now",
          body: "Every recording gets an AI transcript, and you edit the video from it: cut a sentence, strip the filler words, add a background, move or resize your camera. Your link stays the same, so everyone sees the new version straight away.",
        },
        scene: {
          app: "Launch plan",
          nav: ["Overview", "Roadmap", "Tasks", "Docs"],
          columns: [
            { name: "To do", tasks: ["Pricing page copy", "Onboarding email"] },
            {
              name: "In progress",
              tasks: ["Checkout redesign", "Team invites"],
            },
            { name: "Done", tasks: ["Beta signup form"] },
          ],
          background: "Background",
          camera: "Camera",
          shapes: ["Circle", "Square"],
          fillers: "Filler words",
          remove: "Remove",
          transcript: {
            before: "Click here to",
            fillers: ["uh,", "wait,", "sorry,"],
            after: "share the link.",
          },
          saved: "Saved · same link",
        },
      },
      embed: {
        feature: {
          title: "Share or embed it anywhere you work",
          cta: "Start sharing",
          body: "Paste the link into Slack, GitHub, Notion or an email and it shows up with a preview. Embed the player in your docs or site, and with the extension it plays right inside GitHub issues and pull requests.",
        },
        scene: {
          question: "Can you show me how to invite my team to the workspace?",
          reply: "Of course! Here's a short walkthrough of the steps:",
          url: "captureflow.dev/r/8kx2pnq4",
          app: "Settings",
          nav: ["General", "Members", "Billing"],
          members: "Members",
          invite: "Invite",
          people: [
            { initials: "AR", name: "Alex Rivera", role: "Owner" },
            { initials: "CK", name: "Chris Kim", role: "Member" },
            { initials: "JB", name: "Jordan Bell", role: "Member" },
          ],
          duration: "0:48",
        },
      },
      feedback: {
        feature: {
          title: "Get feedback right on the video",
          cta: "Start collecting feedback",
          body: "Viewers react with emojis and leave comments right on the timeline, at the exact moment they mean. Every reply stays with the video, so the conversation moves forward without another meeting.",
        },
        scene: {
          title: "Launch plan walkthrough",
          author: "Alex",
          age: "just now",
          duration: "1:12",
          activity: "Activity",
          events: [
            { initials: "CK", name: "Chris", at: "0:09", emoji: "👍" },
            { initials: "JB", name: "Jordan", at: "0:17", emoji: "🔥" },
            {
              initials: "MC",
              name: "Maya",
              at: "0:27",
              text: "Love the new board view",
            },
            { initials: "SL", name: "Sam", at: "0:37", emoji: "❤️" },
            {
              initials: "JB",
              name: "Jordan",
              at: "0:48",
              text: "Can we ship this Friday?",
            },
            {
              initials: "AR",
              name: "Alex",
              at: "0:56",
              text: "Yes, right after QA ✅",
            },
            { initials: "MC", name: "Maya", at: "1:05", emoji: "👏" },
          ],
        },
      },
      workspaces: {
        feature: {
          title: "Workspaces for your whole team",
          cta: "Create a workspace",
          body: "Invite your teammates to a workspace and everyone's recordings live in one place. Share a video with anyone, keep it inside the workspace, or keep it to yourself until it's ready.",
        },
        scene: {
          newWorkspace: "New workspace",
          nameLabel: "Workspace name",
          create: "Create workspace",
          created: "Created",
          team: "CaptureFlow team",
          members: ["1 member", "2 members", "3 members"],
          memberInitials: ["AR", "CK", "JB"],
          invitePlaceholder: "Invite by email",
          inviteEmail: "chris@acme.co, jordan@acme.co",
          invite: "Invite",
          invited: "Sent",
          joined: "Chris and Jordan joined 🎉",
          recordings: "Recordings",
          videos: [
            {
              title: "Launch plan walkthrough",
              author: "Alex",
              initials: "AR",
              duration: "1:12",
            },
            {
              title: "Bug: promo code check",
              author: "Chris",
              initials: "CK",
              duration: "0:48",
            },
            {
              title: "Weekly update",
              author: "Jordan",
              initials: "JB",
              duration: "2:05",
            },
          ],
          whoCanWatch: "Who can watch:",
          visibility: [
            { label: "Public", detail: "Anyone with the link" },
            { label: "Workspace", detail: "Only your team" },
            { label: "Private", detail: "Only you" },
          ],
        },
      },
    },
  },
  selfHosting: {
    heading: "Run it on your own",
    subheading:
      "Host CaptureFlow as your company's internal screen recorder. Every recording, comment, and workspace stays private on infrastructure you own.",
    account: "Your Cloudflare account",
    deployed: "Uploaded captureflow-web",
    pieces: {
      workers: {
        kind: "Worker",
        title: "App",
        body: "Serves the app and every share link.",
      },
      r2: {
        kind: "R2",
        title: "Recordings",
        body: "Holds your videos and screenshots.",
      },
      d1: {
        kind: "D1",
        title: "Database",
        body: "Keeps workspaces and comments.",
      },
    },
    guide: "Read the self-hosting guide",
    source: "View the source",
    setup: {
      title: "Let us set it up for you",
      body: "We set up the app, the Chrome extension, the macOS app, and all the infrastructure for your company, ready for your team to use.",
      cta: "Get setup help",
    },
  },
  setupService: {
    title: "We'll set it up",
    titleHighlight: "for you",
    subtitle:
      "Tell us about your company. We set up the app, the Chrome extension, the macOS app, and all the infrastructure behind it, ready for your team to use.",
    includedHeading: "Everything we set up",
    included: {
      infra: {
        title: "The app, on your infrastructure",
        body: "Deployed to your own Cloudflare account and served from your domain. You own all of it.",
      },
      storage: {
        title: "Storage and database",
        body: "Recordings in your own R2 bucket; workspaces and comments in your own database.",
      },
      signin: {
        title: "Company-only sign-in",
        body: "Google Workspace or GitHub sign-in, limited to your company's email domain.",
      },
      apps: {
        title: "Chrome extension and Mac app",
        body: "Both built for your instance, with the extension published privately for your team.",
      },
      ready: {
        title: "Ready to record",
        body: "Workspaces created and your team invited, so people can start sharing right away.",
      },
      handover: {
        title: "Handover",
        body: "We walk whoever maintains it through running and updating it.",
      },
    },
    nextHeading: "Contact us",
    nextSubheading: "Tell us what you need and we'll get back to you.",
    form: {
      company: "Company",
      companyPlaceholder: "Acme Inc.",
      name: "Your name",
      namePlaceholder: "Jane Doe",
      email: "Work email",
      emailPlaceholder: "jane@acme.com",
      topic: "What can we help with?",
      topics: ["Self-hosting setup", "More than 1 TB", "Something else"],
      teamSize: "Team size",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      cloudflare: "Do you have a Cloudflare account?",
      cloudflareOptions: ["Yes", "No", "Not sure"],
      notes: "Anything else we should know?",
      notesPlaceholder: "Your team size, your domain, your timeline…",
      submit: "Send message",
      error:
        "Your request couldn't be sent. Please try again, or email us at {email}.",
      sentTitle: "Message sent",
      sentBody: "Thanks. We'll get back to you at {email}.",
      back: "Back to home",
    },
  },
  enterprise: {
    title: "CaptureFlow for",
    titleHighlight: "your company",
    subtitle:
      "The managed plan for companies that want seats for everyone on terms agreed once, with a single invoice.",
    includedHeading: "What Enterprise adds",
    included: {
      storage: {
        title: "Storage sized to you",
        body: "A pool sized to how much your company records, not a per-seat allowance.",
      },
      seats: {
        title: "Seats for everyone",
        body: "One agreement covers the whole company, however many people record.",
      },
      roadmap: {
        title: "Your requests first",
        body: "Features your team asks for move to the top of our list.",
      },
      managed: {
        title: "Fully managed",
        body: "We host it and ship updates, so there's nothing for you to run.",
      },
      billing: {
        title: "Annual billing",
        body: "Pay once a year, at a price agreed for your company.",
      },
      support: {
        title: "A direct line to us",
        body: "Questions go straight to the people who build CaptureFlow.",
      },
    },
    everythingHeading: "Everything your team gets",
    comingSoon: "Coming soon",
    everything: {
      extension: {
        title: "Chrome extension",
        body: "Record any tab or screen, with a link ready when you stop.",
      },
      mac: {
        title: "Mac app",
        body: "A native recorder for macOS, with the same instant share links.",
      },
      workspaces: {
        title: "Team workspaces",
        body: "Everyone's recordings in one place, shared or kept private.",
      },
      feedback: {
        title: "Comments and reactions",
        body: "Viewers reply right on the timeline, at the exact moment they mean.",
      },
      edit: {
        title: "Edit after sharing",
        body: "Change the background, camera or audio, and the link stays the same.",
      },
      screenshots: {
        title: "Annotated screenshots",
        body: "Mark up a screenshot with arrows, text and blur, and share it as a link.",
      },
    },
    formHeading: "Contact us",
    formSubheading: "Tell us about your team and we'll reply by email.",
    form: {
      company: "Company",
      companyPlaceholder: "Acme Inc.",
      name: "Your name",
      namePlaceholder: "Jane Doe",
      email: "Work email",
      emailPlaceholder: "jane@acme.com",
      need: "What do you need?",
      needs: [
        "Seats for a large team",
        "Custom terms or a single invoice",
        "Something else",
      ],
      teamSize: "Team size",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      storage: "How much storage?",
      storageOptions: ["1–5 TB", "5–20 TB", "20 TB+", "Not sure"],
      notes: "Anything else we should know?",
      notesPlaceholder:
        "How much your team records, your timeline, billing needs…",
      submit: "Send message",
      error:
        "Your message couldn't be sent. Please try again, or email us at {email}.",
      sentTitle: "Message sent",
      sentBody: "Thanks. We'll get back to you at {email}.",
      back: "Back to home",
    },
  },
  pricing: {
    heading: "Choose the plan that fits your team",
    subheading:
      "Free covers your first recordings. Paid plans are one price per member, and viewers are always free.",
    controls: {
      teamSize: "Team size",
      members: "members",
      billing: "Bill me",
      monthly: "Monthly",
      annually: "Annually",
      save: "Save {percent}%",
    },
    whyUs: {
      heading: "Why choose us",
      subtitle:
        "A leading competitor's plans beside ours, priced for your team size.",
      rows: {
        perMember: "Per member, a month",
        team: "Your team of {seats}",
        monthly: "{amount} a month",
        members: "Members",
        upTo: "Up to {n}",
        unlimited: "Unlimited",
        recordings: "Recordings per person",
        length: "Recording length",
        minutes: "{n} min per video",
        transcripts: "Transcripts and captions",
        transcript: "Edit the video from its transcript",
        ai: "AI chapters and filler word removal",
        openSource: "Open source, self-host any time",
        viewers: "Viewers and commenters",
        free: "Free",
      },
      cta: "See the full comparison",
    },
    compare: {
      loomRow: "Loom {plan}",
      loomDetail: "{seats} people × {perSeat} each",
      caption: "Monthly prices. People who only watch and comment are free.",
      captureflowRow: "CaptureFlow {ourPlan}",
      captureflowDetail: "{seats} members × {ourPerSeat} each",
      saveLabel: "Your team saves",
      saveValue: "{savings} a year",
    },
    plans: {
      free: {
        name: "Free",
        description: "Get started with screen recordings you share as a link.",
        featuresHeading: "Key features",
        features: [
          "{recordings} recordings per person",
          "{minutes} minute recordings",
          "Data saver quality",
          "AI transcripts and captions",
          "Comments and emoji reactions",
        ],
        cta: "Sign up",
      },
      light: {
        name: LIGHT,
        badge: "Best value",
        description:
          "Record as much as you like, as long as you like, in data saver quality.",
        period: "per member / month",
        periodAnnual: "per year",
        rateAnnual:
          "${perSeat} per member a month for {seats} {members}, billed yearly",
        member: "member",
        members: "members",
        featuresHeading: "Everything in Free, and",
        features: [
          "Unlimited recordings",
          "Unlimited recording time",
          "Upload existing videos (coming soon)",
        ],
        cta: "Try for free",
      },
      pro: {
        name: PRO,
        description:
          "Full quality, AI chapters, titles and clean-up, with your own branding on every share page.",
        period: "per member / month",
        periodAnnual: "per year",
        rateAnnual:
          "${perSeat} per member a month for {seats} {members}, billed yearly",
        member: "member",
        members: "members",
        featuresHeading: `Everything in ${LIGHT}, and`,
        features: [
          "Full quality, up to 1080p",
          "AI chapters, titles and filler removal",
          "Custom branding",
          "Viewer insights (coming soon)",
          "Slack, Notion and Zapier integrations (coming soon)",
        ],
        cta: "Try for free",
      },
      enterprise: {
        name: "Enterprise",
        description:
          "Manage recordings for your whole company, on terms agreed with you.",
        price: "Let’s talk",
        featuresHeading: `Everything in ${PRO}, and`,
        features: [
          "Custom terms and a single annual invoice",
          "Storage sized to your company",
          "Your feature requests first",
          "A direct line to the team",
        ],
        cta: "Contact us",
      },
    },
    table: {
      heading: "Every feature, plan by plan",
      groups: [
        {
          title: "Recording",
          rows: [
            {
              label: "Members",
              free: "Unlimited",
              light: "Unlimited",
              pro: "Unlimited",
              enterprise: "Unlimited",
            },
            {
              label: "Viewers and commenters",
              free: "Free",
              light: "Free",
              pro: "Free",
              enterprise: "Free",
            },
            {
              label: "Recordings per person",
              free: "Up to {recordings}",
              light: "Unlimited",
              pro: "Unlimited",
              enterprise: "Unlimited",
            },
            {
              label: "Recording length",
              free: "{minutes} min per video",
              light: "Unlimited",
              pro: "Unlimited",
              enterprise: "Unlimited",
            },
            {
              label: "Video quality",
              free: "Data saver",
              light: "Data saver",
              pro: "Up to 1080p",
              enterprise: "Up to 1080p",
            },
            {
              label: "Screenshots",
              free: "Unlimited",
              light: "Unlimited",
              pro: "Unlimited",
              enterprise: "Unlimited",
            },
            {
              label: "Recordings kept",
              free: "30 days without a view",
              light: "Until you delete them",
              pro: "Until you delete them",
              enterprise: "Until you delete them",
            },
            {
              label: "Full screen, window or tab capture",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
            {
              label: "Camera bubble and camera effects",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
            {
              label: "Microphone and system audio",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
            {
              label: "Smooth cursor",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
            {
              label: "Chrome extension and Mac app",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
          ],
        },
        {
          title: "AI",
          rows: [
            {
              label: "Transcripts",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
            {
              label: "Closed captions",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
            {
              label: "Summary chapters",
              free: false,
              light: false,
              pro: true,
              enterprise: true,
            },
            {
              label: "Auto-suggested titles",
              free: false,
              light: false,
              pro: true,
              enterprise: true,
            },
            {
              label: "Edit the video from its transcript",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
            {
              label: "Filler word removal",
              free: false,
              light: false,
              pro: true,
              enterprise: true,
            },
          ],
        },
        {
          title: "Editing",
          rows: [
            {
              label: "Edit after sharing, same link",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
            {
              label: "Backgrounds",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
            {
              label: "Move or resize the camera bubble",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
            {
              label: "Cut parts of the video",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
            {
              label: "Annotated screenshots with arrows, text and blur",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
            {
              label: "Infinite canvas",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
          ],
        },
        {
          title: "Sharing and feedback",
          rows: [
            {
              label: "Share link ready when you stop",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
            {
              label: "Public, workspace or private links",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
            {
              label: "Request access on restricted links",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
            {
              label: "Link previews in chat and email",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
            {
              label: "Embed the player anywhere",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
            {
              label: "Plays inside GitHub issues and pull requests",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
            {
              label: "Comments on the timeline",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
            {
              label: "Emoji reactions",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
            {
              label: "View counts",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
            {
              label: "Download the original file",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
          ],
        },
        {
          title: "Workspace and admin",
          rows: [
            {
              label: "Team workspace",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
            {
              label: "Owner, member and viewer roles",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
            {
              label: "Default visibility and upload permissions",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
            {
              label: "Search across recordings and screenshots",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
            {
              label: "Custom branding",
              free: false,
              light: false,
              pro: true,
              enterprise: true,
            },
            {
              label: "Single annual invoice",
              free: false,
              light: false,
              pro: false,
              enterprise: true,
            },
            {
              label: "Custom terms",
              free: false,
              light: false,
              pro: false,
              enterprise: true,
            },
          ],
        },
        {
          title: "Hosting and support",
          rows: [
            {
              label: "Open source under the AGPL",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
            {
              label: "Self-host on your own Cloudflare account",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
            {
              label: "Managed hosting and updates",
              free: true,
              light: true,
              pro: true,
              enterprise: true,
            },
            {
              label: "Your feature requests first",
              free: false,
              light: false,
              pro: false,
              enterprise: true,
            },
          ],
        },
      ],
    },
    includes: {
      heading: "Every plan includes",
      items: [
        "Your own workspace, invite anyone",
        "Free viewers and commenters",
        "Camera effects",
        "AI transcripts & captions",
        "Edit the video from its transcript",
        "Public, workspace or private share links",
        "Comments & emoji reactions",
        "Annotated screenshots",
        "Infinite canvas",
      ],
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
  activity: {
    heading: "Built in the open",
    subtitle: "Recent pull requests and open issues from GitHub.",
    shippedHeading: "Recently merged",
    openHeading: "Open issues and pull requests",
    emptyOpen: "Nothing open right now.",
    newIssue: "Report a bug or request a feature",
    viewAll: "See everything on GitHub",
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
        question: "Why does CaptureFlow run on Cloudflare?",
        answer:
          "Because video gets expensive in the wrong places. Most clouds charge every time someone watches a file, and Cloudflare R2 doesn't, so a recording watched a hundred times costs no more than one watched once. That's what lets viewers stay free.\n\nIt also makes self-hosting cheap. Cloudflare's free tiers cover the app, the database, and the first 10 GB of storage, so a small team can run CaptureFlow for nothing. R2 does ask for a card on file.",
      },
      {
        question: "How does paid pricing work?",
        answer: `${LIGHT} and ${PRO} are one price per member a month, less when billed yearly. A member is someone who records. People you invite as viewers watch, comment and react for free, so the whole company can be in the workspace while you pay only for the people making recordings.\n\nWhen someone joins or leaves, the seat count follows on the next invoice.`,
      },
      {
        question: "How long are my recordings kept?",
        answer:
          "On paid plans, until you delete them. On the free plan, a recording is removed after 30 days without a view, so idle accounts don't hold on to space. If you self-host, you set the rules.",
      },
      {
        question: "What is managed hosting?",
        answer: `It's CaptureFlow run by us, for teams that don't want to set up Cloudflare themselves. You get the same open-source app, and we take care of the hosting, storage, and updates. Sign up, install the Chrome extension, and start recording.\n\nYou can start free with 25 recordings per person, up to 5 minutes each, which are removed after 30 days without a view. ${LIGHT} removes the limits for one price per member, keeps recordings until you delete them, and viewers are always free.`,
      },
    ],
  },
  cta: {
    headline: "Ready to record?",
    subtitle:
      "Free download. No credit card. Say it in a quick video message instead of another meeting.",
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

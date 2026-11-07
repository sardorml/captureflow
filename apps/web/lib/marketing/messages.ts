/*
 * `{n}`, `{total}`, `{amount}` (and other `{…}`) are runtime placeholders filled
 * via `.replace()` — keep them verbatim. Arrays here keep the SAME length and
 * order as their counterparts in lib/marketing/constants.ts so components can zip
 * them by index. This is the English catalog; each file in ./locales is the
 * same shape in another language.
 */
import {
  FREE_AGENT_MIN,
  FREE_RECORDINGS,
  LIGHT,
  LIGHT_AGENT_MIN,
  PRO,
  PRO_AGENT_MIN,
  PRO_VOICEOVER_MIN,
} from "./message-values";
import type { Widen } from "@/lib/i18n/widen";

export const MESSAGES = {
  // The home title leads with the brand: the name is a contested search term.
  meta: {
    home: {
      title: "CaptureFlow - Screen Recorder with Shareable Links",
      description:
        "Record your screen and share a link with your team or customers. An open-source screen recorder with AI transcripts and annotated screenshots, self-hostable on Cloudflare.",
    },
    features: {
      title: "Screen recorder features",
      description:
        "Record a tab, window or your whole screen with camera and mic, take annotated screenshots, and share each capture as a link your team can comment on.",
    },
    pricing: {
      title: "Pricing: free to start, one price per member",
      description: `Start free with ${FREE_RECORDINGS} recordings. ${LIGHT} and ${PRO} are one price per member with unlimited recordings and AI. Or self-host CaptureFlow free.`,
    },
    faq: {
      title: "FAQ: sharing, storage and self-hosting",
      description:
        "Common questions about CaptureFlow: how share links work, what self-hosting on Cloudflare involves, storage limits, and how recordings stay private.",
    },
    download: {
      title: "Download the screen recorder for Chrome",
      description:
        "Install the CaptureFlow Chrome extension to record your screen and share it with a link.",
    },
    enterprise: {
      title: "Enterprise",
      description:
        "Managed CaptureFlow for larger companies: seats for everyone, custom terms and a single invoice. Tell us what you need.",
    },
    selfHostSetup: {
      title: "Self-hosting setup",
      description:
        "Have CaptureFlow set up on your company's own Cloudflare account: your domain, company-only sign-in, and a private Chrome extension for your team.",
    },
    swarmDemo: {
      title: "Swarm demo: agents rebuild any website on video",
      description:
        "Type a website address and watch a swarm of agent cursors rebuild it element by element, to music. You get a video with a link to share.",
    },
    chromeExtension: {
      title: "Chrome extension: record your screen and share a link",
      description:
        "Record your screen, a tab or your camera from Chrome. When you finish, you get a link anyone can watch, with a transcript, summary and chapters.",
    },
    agentRecorder: {
      title: "MCP server: your AI agent records videos",
      description:
        "Connect Claude Code, Codex, Cursor or ChatGPT to CaptureFlow over MCP. Your agent records a web app, your screen or one window and hands you a link to share.",
    },
  },
  nav: {
    features: "Features",
    discover: "Discover",
    pricing: "Pricing",
    faq: "FAQ",
    changelog: "Changelog",
    login: "Log in",
    library: "My recordings",
    download: "Download",
    language: "Language",
    openMenu: "Open menu",
    menu: "Menu",
    main: "Main",
    docs: "Docs",
    resources: "Resources",
    faqDescription: "Common questions, answered",
    blog: "Blog",
    blogDescription: "Guides and updates",
    selfHosting: "Self-hosting",
    selfHostingDescription: "Run it on your own Cloudflare",
    community: "Community",
    communityDescription: "Get help and chat on Discord",
    products: "Products",
    swarmDemo: "Swarm demo",
    swarmDemoDescription: "Agents rebuild any website on video",
    extension: "Chrome extension",
    extensionDescription: "Record your screen and share a link",
    agentRecorder: "Recorder for agents",
    agentRecorderDescription: "Videos your AI agent makes over MCP",
    star: "Star on GitHub",
    starCount: "Star on GitHub ({stars})",
    themeToLight: "Switch to light theme",
    themeToDark: "Switch to dark theme",
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
  announcement: {
    badge: "New",
    lead: "Your AI agent can now record for you.",
    rest: "Connect it once, ask for a video, and get back a link.",
    cta: "Connect",
  },
  hero: {
    title: "Screen recorder for\nyou and your AI agents",
    subtitle:
      "Record demos, how-tos, walkthroughs and presentations yourself, or have your AI record them for you. Share each one as a link anyone can watch.",
    ctaLabel: "Try CaptureFlow for free",
    installChrome: "Install Chrome extension",
    installMac: "Download for macOS",
    installSoon: "Soon",
    connectMcp: "Connect to MCP",
    macSoon: "macOS app coming soon",
    installOr: "or",
    mcpCopy: "Copy",
    mcpCopied: "Copied",
    mcpAddToCursor: "Add to Cursor",
    badge: "Open source, free to run on {github}",
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
    heading: "All features",
    subtitle: "Record, edit and share. It all lives in one place.",
    items: {
      recording: { title: "Screen and camera", body: "Record both at once" },
      transcripts: { title: "Transcripts", body: "In 99 languages", tag: "AI" },
      editing: {
        title: "Transcript editing",
        body: "Delete text to cut the video",
        tag: "AI",
      },
      camera: {
        title: "Camera effects",
        body: "Backgrounds and filters",
      },
      canvas: { title: "Infinite canvas", body: "Sketch while you record" },
      screenshots: {
        title: "Annotated screenshots",
        body: "Arrows, text and blur",
      },
      feedback: {
        title: "Comments and reactions",
        body: "Feedback on the video",
      },
      summary: {
        title: "Summaries and chapters",
        body: "With a title for each video",
        tag: "AI",
      },
      filler: {
        title: "Auto filler removal",
        body: "Cuts out ums and uhs",
        tag: "AI",
      },
    },
    cta: "See all features",
    // Text inside the small illustrations. In `filler`, the [bracketed] word
    // is the filler shown struck out.
    previews: {
      app: "Launch plan",
      columns: ["To do", "Doing", "Done"],
      lines: [
        "Here is the new flow.",
        "First, pick a workspace.",
        "Then share the link.",
      ],
      retake: "Um, let me start again.",
      filler: [
        "[Um,] here is the new flow.",
        "First, [uh,] pick a workspace.",
        "Then, [um,] share the link.",
      ],
      step: "Step 1",
      note: "Move this",
      comment: "Love this flow",
      summaryTitle: "How to invite your team",
      summaryBody: "Pick a workspace, then share the link.",
      chapters: ["Intro", "Pick a workspace"],
    },
  },
  mcpFeatures: {
    heading: "MCP features",
    subtitle:
      "What your AI agent can do once it's connected. It records on your own computer, with Claude Code, Codex, Cursor or any MCP client.",
    cta: "Read the guide",
    items: {
      webApp: { title: "Record a web app", body: "Including localhost" },
      screen: { title: "Record your screen", body: "A whole display" },
      window: {
        title: "Record one window",
        body: "Terminal, VS Code or Figma",
      },
      slides: { title: "Add slides", body: "Titles, steps and closing lines" },
      voiceover: { title: "Add a voiceover", body: "Runs on your computer" },
      report: { title: "Write a report", body: "What it did and what failed" },
      search: { title: "Search recordings", body: "Videos and transcripts" },
      save: { title: "Save MP4 files", body: "No upload or sign-in" },
    },
  },
  useCases: {
    heading: "How teams use it",
    subtitle:
      "Examples of what teams record. Each video is a link that plays in any browser.",
    cta: "See how it works",
    cards: {
      engineering: {
        title: "Engineering",
        body: "Record a walkthrough of a PR or a bug repro.",
      },
      design: {
        title: "Design",
        body: "Record a walkthrough of a mockup and collect comments.",
      },
      support: {
        title: "Customer support",
        body: "Answer a ticket with a short walkthrough.",
      },
      updates: {
        title: "Team updates",
        body: "Record the weekly update and share the link.",
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
  agents: {
    heading: "Or ask your AI agent to record your demos and how-tos",
    worksWith: "Works with {claude}, {openai} and {cursor}.",
    cta: "Read the guide",
    subtitle:
      "Ask in plain words. It records a browser, your screen or an app on your own computer, adds slides and a voiceover if you want, and hands you a link.",
    steps: [
      {
        title: "Connect your agent",
        body: "Add CaptureFlow to Claude Code, Codex or Cursor with one line. You need Node.js 20 or newer, and your agent signs in once. In Claude or ChatGPT, add it by URL.",
      },
      {
        title: "Ask for a video",
        body: "A feature demo, a how-to, a bug report or a narrated deck.",
      },
      {
        title: "It records for you",
        body: "On your computer, even an app on localhost.",
      },
      {
        title: "Adds slides and a voice",
        body: "Title slides and a voiceover, if you want them.",
      },
      {
        title: "Gives you a link to share",
        body: "Attach it to a pull request, post it in Slack or send it to a customer.",
      },
    ],
    scenes: {
      ask: {
        name: "terminal",
        badge: "agent",
        prompt: "Record a checkout demo",
        steps: ["Opening the app", "Clicking through", "Your link is ready"],
      },
      record: {
        url: "localhost:3000",
        badge: "demo",
        title: "Checkout",
        fields: ["Your name", "Card number"],
        pay: "Pay now",
        paid: "Paid",
      },
      voice: {
        title: "Checkout demo",
        subtitle: "How to pay in three steps",
      },
      share: {
        title: "Checkout demo",
        link: "captureflow.dev/r/checkout",
        places: ["PR", "Slack", "Email"],
      },
    },
    chats: {
      claude:
        "In Claude, open Customize, then Connectors, and choose Add custom connector. Name it CaptureFlow, paste this URL, then sign in.",
      chatgpt:
        "In ChatGPT on the web, open Plugins, press +, and choose Add custom MCP server. Name it CaptureFlow, paste this URL, choose OAuth, then install the plugin and sign in. Needs a Business, Enterprise or Edu plan.",
      limits:
        "Chats build presentation and how-to videos from slides on our servers, not recordings of your computer, and use your plan's cloud agent minutes.",
    },
  },
  modes: {
    cta: "Start recording",
    heading: "Record your screen with the Chrome extension",
    subtitle:
      "Install it and press record. When you finish, you get a link anyone can watch, with a title, summary, chapters and transcript.",
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
  pageHeroes: {
    home: "Home",
    features: {
      label: "Features",
      word: "FEATURES",
      title: "Record, edit and share your screen",
      subtitle:
        "Record your screen and camera. Share each recording as a link your team can comment on.",
    },
    pricing: {
      label: "Pricing",
      word: "PRICING",
      title: "Start free. Pay one price per member.",
      subtitle:
        "Free covers your first 25 recordings. Light and Pro remove the limit. You can also self-host CaptureFlow for free.",
    },
    faq: {
      label: "FAQ",
      word: "FAQ",
      title: "Frequently Asked Questions",
      subtitle:
        "Answers on recording, pricing, storage and self-hosting. Read the docs for everything else.",
    },
    chromeExtension: {
      label: "Chrome extension",
      word: "CHROME",
      title: "Record your screen from Chrome",
      subtitle:
        "Record your screen, a tab or your camera. When you finish, you get a link anyone can watch, with a transcript, summary and chapters.",
    },
    agentRecorder: {
      label: "Recorder for agents",
      word: "MCP",
      title: "Let your AI agent record your videos",
      subtitle:
        "Connect it over MCP and ask in plain words. It records a web app, your screen or one window, adds slides and a voice if you want, and hands you a link.",
    },
  },
  collaboration: {
    heading: "What you can do after recording",
    cta: "Try it free",
    subtitle:
      "Edit it, then share or embed it. Invite your team to watch, react and comment on each other's videos.",
    categories: {
      share: {
        feature: {
          tag: "new",
          title: "Edit your video",
          cta: "Install the extension",
          body: "Delete words from the transcript to cut them from the video, or trim clips on the timeline. Change the background, move, resize or hide your camera, and mute the mic or system sound.",
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
          title: "Share or embed your video",
          cta: "Install the extension",
          body: "Paste the link into Slack, GitHub, Notion or an email and it shows a preview. You can also embed the player in your docs or site. With the extension installed, it plays inside GitHub issues and pull requests.",
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
          title: "Collaborate on your videos",
          cta: "Sign in",
          body: "Work together without a meeting, across time zones. Your team can react with emojis, comment at any moment in the video, and follow along with transcripts and captions.",
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
          title: "Invite your team to a workspace",
          cta: "Create a workspace",
          body: "Everyone's recordings are kept in one workspace. Each video can be public, visible to the workspace, or private.",
        },
        scene: {
          team: "CaptureFlow team",
          members: ["1 member", "2 members", "3 members"],
          memberInitials: ["AR", "CK", "JB"],
          invitePlaceholder: "Invite by email",
          inviteEmail: "chris@acme.co, jordan@acme.co",
          invite: "Invite",
          invited: "Sent",
          joined: "Chris and Jordan joined 🎉",
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
  swarmDemo: {
    title: "Watch agents rebuild",
    titleHighlight: "any website",
    subtitle:
      "Type a website address. A swarm of agent cursors draws it back element by element, to music, and you get a video link to share.",
    url: "Website address",
    urlPlaceholder: "https://example.com",
    generate: "Generate demo",
    generating: "Starting a cloud browser…",
    check: "Check website",
    checking: "Checking the website…",
    previewNote:
      "This is the page the agents will rebuild. Generate the demo when it looks right.",
    change: "Change address",
    note: "Sign in to generate for free. Each demo lands in your library.",
    noteSignedIn: "Generate for free. Each demo lands in your library.",
    howHeading: "How it works",
    how: {
      type: {
        title: "Type an address",
        body: "Any public website. The page is loaded in a cloud browser and every heading, picture, button and card is found.",
      },
      build: {
        title: "Agents build it back",
        body: "The request is typed into a chat box, then a swarm of cursors places each element while the music speeds up.",
      },
      share: {
        title: "Get a link",
        body: "The video opens in your library as soon as it's done. Share the link, download the file or post it.",
      },
    },
    errors: {
      invalidUrl: "Enter a website address like example.com.",
      unreachable:
        "That website couldn't be reached. Check the address and try again.",
      unavailable: "Demos aren't available on this server.",
      running:
        "A recording of yours is still running. Wait for it to finish, then try again.",
      limit:
        "This workspace has used its cloud agent minutes for this month. They reset on the 1st.",
      recordings:
        "You've reached the free plan's recording limit. Delete a recording or upgrade, then try again.",
      busy: "All cloud browsers are busy right now. Try again in a few minutes.",
      failed: "The demo couldn't be started. Please try again.",
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
    heading: "Pricing",
    cta: "Compare all plans",
    subheading:
      "Free covers your first recordings. Paid plans are one price per member.",
    controls: {
      shownIn: "Prices are shown in {currency}. You are charged in US dollars.",
      teamSize: "Team size",
      members: "members",
      title: "Billing",
      note: "One price per member.",
      billing: "Bill me",
      monthly: "Monthly",
      annually: "Annually",
      save: "Save {percent}%",
    },
    compare: {
      loomRow: "Loom {plan}",
      loomDetail: "{seats} people × {perSeat} each",
      caption: "Monthly prices.",
      captureflowRow: "CaptureFlow {ourPlan}",
      captureflowDetail: "{seats} members × {ourPerSeat} each",
      saveLabel: "Your team saves",
      saveValue: "{savings} a year",
    },
    plans: {
      chargedInUsd: "Charged in US dollars.",
      member: "member",
      members: "members",
      included: "Included",
      notIncluded: "Not included",
      free: {
        name: "Free",
        description: "Screen recordings you share as a link.",
        cta: "Sign up",
      },
      light: {
        name: LIGHT,
        featuresHeading: "Everything in Free, and",
        features: [
          "Unlimited recordings",
          "Unlimited recording time",
          `${LIGHT_AGENT_MIN} min a month of cloud agent recordings, up to 10 min each`,
        ],
        description: "Unlimited recordings in data saver quality.",
        period: "/mo",
        noteMonthly: "Per member, billed monthly",
        noteAnnual:
          "Per member, billed yearly. {yearly} a year for {seats} {members}",
        cta: "Try for free",
      },
      pro: {
        badge: "Recommended",
        name: PRO,
        featuresHeading: `Everything in ${LIGHT}, and`,
        features: [
          "Full quality, up to 1080p",
          "AI chapters, titles and filler removal",
          "Custom branding",
          `${PRO_AGENT_MIN} min a month of cloud agent recordings, with ${PRO_VOICEOVER_MIN} min of AI voiceover`,
          "Viewer insights (coming soon)",
          "Slack, Notion and Zapier integrations (coming soon)",
        ],
        description: "Full quality, AI clean-up and your own branding.",
        period: "/mo",
        noteMonthly: "Per member, billed monthly",
        noteAnnual:
          "Per member, billed yearly. {yearly} a year for {seats} {members}",
        cta: "Try for free",
      },
      rows: {
        recordings: {
          label: "Recordings per person",
          free: "Up to {recordings}",
          light: "Unlimited",
          pro: "Unlimited",
        },
        length: {
          label: "Recording length",
          free: "{minutes} min per video",
          light: "Unlimited",
          pro: "Unlimited",
        },
        quality: {
          label: "Video quality",
          free: "Data saver",
          light: "Data saver",
          pro: "Up to 1080p",
        },
        transcripts: {
          label: "Transcripts and captions",
          free: true,
          light: true,
          pro: true,
        },
        editing: {
          label: "Edit from the transcript",
          free: true,
          light: true,
          pro: true,
        },
        chapters: {
          label: "AI chapters and titles",
          free: false,
          light: false,
          pro: true,
        },
        filler: {
          label: "Filler word removal",
          free: false,
          light: false,
          pro: true,
        },
        feedback: {
          label: "Comments and reactions",
          free: true,
          light: true,
          pro: true,
        },
        agents: {
          label: "Local agent recordings",
          free: true,
          light: true,
          pro: true,
        },
        cloudAgents: {
          label: "Cloud agent recordings",
          free: `${FREE_AGENT_MIN} min a month`,
          light: `${LIGHT_AGENT_MIN} min a month`,
          pro: `${PRO_AGENT_MIN} min a month`,
        },
        voiceover: {
          label: "Local AI voiceover",
          free: true,
          light: true,
          pro: true,
        },
        cloudVoiceover: {
          label: "Cloud AI voiceover",
          free: false,
          light: false,
          pro: `${PRO_VOICEOVER_MIN} min a month`,
        },
        branding: {
          label: "Custom branding",
          free: false,
          light: false,
          pro: true,
        },
      },
    },
    table: {
      heading: "Every feature, plan by plan",
      subtitle: "Free, Light and Pro, side by side.",
      groups: [
        {
          title: "Recording",
          rows: [
            {
              label: "Members",
              free: "Unlimited",
              light: "Unlimited",
              pro: "Unlimited",
            },
            {
              label: "Recordings per person",
              free: "Up to {recordings}",
              light: "Unlimited",
              pro: "Unlimited",
            },
            {
              label: "Recording length",
              free: "{minutes} min per video",
              light: "Unlimited",
              pro: "Unlimited",
            },
            {
              label: "Video quality",
              free: "Data saver",
              light: "Data saver",
              pro: "Up to 1080p",
            },
            {
              label: "Screenshots",
              free: "Unlimited",
              light: "Unlimited",
              pro: "Unlimited",
            },
            {
              label: "Recordings kept",
              free: "30 days without a view",
              light: "Until you delete them",
              pro: "Until you delete them",
            },
            {
              label: "Full screen, window or tab capture",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Camera bubble and camera effects",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Microphone and system audio",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Smooth cursor",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Chrome extension and Mac app",
              free: true,
              light: true,
              pro: true,
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
            },
            {
              label: "Closed captions",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Summary chapters",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "Auto-suggested titles",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "Edit the video from its transcript",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Filler word removal",
              free: false,
              light: false,
              pro: true,
            },
          ],
        },
        {
          title: "Agents",
          rows: [
            {
              label: "Agent recordings on your computer",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Agent presentations made in the cloud",
              free: `${FREE_AGENT_MIN} min a month per person`,
              light: `${LIGHT_AGENT_MIN} min a month per member`,
              pro: `${PRO_AGENT_MIN} min a month per member`,
            },
            {
              label: "Slides in agent recordings",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "AI voiceover on your computer",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "AI voiceover in cloud presentations",
              free: false,
              light: false,
              pro: `${PRO_VOICEOVER_MIN} min a month per member`,
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
            },
            {
              label: "Backgrounds",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Move or resize the camera bubble",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Cut parts of the video",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Annotated screenshots with arrows, text and blur",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Infinite canvas",
              free: true,
              light: true,
              pro: true,
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
            },
            {
              label: "Public, workspace or private links",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Request access on restricted links",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Link previews in chat and email",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Embed the player anywhere",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Plays inside GitHub issues and pull requests",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Comments on the timeline",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Emoji reactions",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "View counts",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Download the original file",
              free: true,
              light: true,
              pro: true,
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
            },
            {
              label: "Owner, member and viewer roles",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Default visibility and upload permissions",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Search across recordings and screenshots",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Custom branding",
              free: false,
              light: false,
              pro: true,
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
            },
            {
              label: "Self-host on your own Cloudflare account",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Managed hosting and updates",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
      ],
    },
    includes: {
      heading: "Every plan includes",
      items: [
        "Your own workspace, invite anyone",
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
    heading: "Latest changes on GitHub",
    subtitle:
      "Every change is public. These are the latest pull requests and open issues on GitHub.",
    cta: "View on GitHub",
    shippedHeading: "Recently merged",
    openHeading: "Open issues and pull requests",
    emptyOpen: "Nothing open right now.",
    newIssue: "Report a bug or request a feature",
    viewAll: "See everything on GitHub",
  },
  faq: {
    heading: "Frequently Asked Questions",
    subtitle:
      "Answers on recording, pricing, storage and self-hosting. Read the docs for everything else.",
    cta: "Read the docs",
    waitlistLink: "Join the waitlist",
    items: [
      {
        question: "How do I make a recording?",
        answer:
          "There are two ways, and the difference is who does the recording.\n\nWith the Chrome extension, you record it yourself. You click through your screen and can talk over it with your own voice and camera. Use it for quick updates, feedback or anything that needs you in it.\n\nWith an AI agent, you describe the video and the agent clicks through and records it for you, so you can keep working. It can add slides and an AI voiceover. Use it for product demos, how-tos and bug reports.\n\nTo record it yourself:\n1. Install the CaptureFlow extension from the Chrome Web Store.\n2. Click its icon in your browser's toolbar and sign in.\n3. Click the icon again. Choose This tab, Window or Full screen, and turn on your camera and microphone if you want them.\n4. Press Start Recording. A bar on the page lets you pause or stop.\n5. Press stop. Your recording's page opens, with a link you can share with anyone.\n\nTo have an agent record it:\n1. Connect CaptureFlow to the AI app you use. The Agents section of the home page has the steps for Claude, ChatGPT, Claude Code, Codex and Cursor.\n2. Sign in when a browser tab opens. You only do this once.\n3. Ask for the video in plain words, such as: Record a demo of how to sign up on our website, with a voiceover.\n4. The agent records it and gives you a link you can share with anyone.",
      },
      {
        question: "Can I self-host CaptureFlow?",
        answer:
          "Yes. CaptureFlow is open source under the AGPL, and the whole backend runs on Cloudflare: Workers for the app and API, R2 for recordings, and D1 for everything else. Create a D1 database and an R2 bucket, apply the migrations, set one secret, and deploy. There's also a Deploy to Cloudflare button. The guide is at docs.captureflow.dev.",
      },
      {
        question: "Can my AI agent record videos for me?",
        answer:
          "Yes. Add CaptureFlow to Claude Code, Codex or Cursor with one line, or add it in Claude or ChatGPT, then ask for a video in plain words. It records a browser, your screen or an app on your own computer, adds slides and a voiceover if you want, and gives you a link to share.\n\nLocal agent recordings are included on every plan. Cloud agent recordings come with a monthly allowance that depends on your plan.",
      },
      {
        question: "How does paid pricing work?",
        answer: `${LIGHT} and ${PRO} are one price per member a month, less when billed yearly. A member is someone who records, so you pay only for the people making recordings.\n\nWhen someone joins or leaves, the seat count follows on the next invoice.`,
      },
      {
        question: "How long are my recordings kept?",
        answer:
          "On paid plans, until you delete them. On the free plan, a recording is removed after 30 days without a view, so idle accounts don't hold on to space. If you self-host, you set the rules.",
      },
      {
        question: "What does the free plan include?",
        answer: `You get 25 recordings per person, up to 5 minutes each, in data saver quality, with transcripts and captions. Recordings are removed after 30 days without a view. Sign up, install the Chrome extension, and start recording.\n\n${LIGHT} removes the limits for one price per member and keeps recordings until you delete them.`,
      },
    ],
  },
  cta: {
    headline: "Start recording",
    subtitle:
      "Free download. No credit card. Say it in a quick video message instead of another meeting.",
    button: "Try CaptureFlow for free",
  },
  footer: {
    tagline: "Open-source screen recording with instant share links.",
    lights: "Lights",
    lightsOn: "On · pull the cord",
    lightsOff: "Off · pull the cord",
    product: {
      title: "Product",
      features: "Features",
      pricing: "Pricing",
      compare: "Compare",
      download: "Download",
      suggest: "Suggest a feature",
    },
    resources: {
      title: "Resources",
      docs: "Docs",
      selfHosting: "Self-hosting",
      blog: "Blog",
      releases: "Releases",
      faq: "FAQ",
      security: "Security",
    },
    community: {
      title: "Community",
    },
    legal: {
      title: "Legal",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      refund: "Refund Policy",
      license: "License (AGPL-3.0)",
    },
    rights: "© {year} CaptureFlow. All rights reserved.",
    openSource: "Open source under AGPL-3.0",
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
  download: {
    heading: "Download CaptureFlow",
    subtitle:
      "Available for Chrome, with a macOS app coming soon. Each recording gets a link you can share.",
    button: "Download for macOS",
    requires: "Requires {version} or later on Apple Silicon.",
    requirements: "Requires macOS 14 or later on Apple Silicon.",
    versionLabel: "Version {version}",
    sizeLabel: "{size} MB DMG",
    notarized: "Signed & notarized by Apple",
  },
  downloadPage: {
    otherWays: "Other ways to get it",
    buildTitle: "Build from source",
    buildBody: "Clone the repo and run the recorder locally with pnpm.",
    releasesTitle: "All releases",
    releasesBody: "Browse every published build and changelog on GitHub.",
    cloud: "Prefer the cloud? {link} and view recordings in your browser.",
    cloudLink: "Create an account",
  },
  blog: {
    title: "Blog",
    subtitle: "Tips, guides, and updates on screen recording.",
    readArticle: "Read article",
    empty: "No posts yet. Check back soon.",
  },
} as const;

export type Messages = Widen<typeof MESSAGES>;

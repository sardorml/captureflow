export const SCREENSHOT_VIEW = {
  page: {
    defaultTitle: "{product} screenshot",
    description: "A screenshot shared from {product}.",
    madeWith: "Made with {product}",
    loading: "Loading screenshot…",
  },
  authPrompt: {
    pricing: "Pricing",
    logIn: "Log in",
    getStarted: "Get started",
    getFree: "Get {product} free",
  },
  actions: {
    edit: "Edit screenshot",
    share: "Share",
    shareTitle: "Share screenshot",
    copyLink: "Copy link",
    linkCopied: "Link copied",
    more: "More actions",
    delete: "Delete screenshot",
    deleteTitle: "Delete this screenshot?",
    deleteDescription:
      "The image and its link stop working immediately. This cannot be undone.",
    visibilityFailed: "Could not update visibility",
    deleteFailed: "Could not delete the screenshot",
  },
  zoom: {
    expand: "Expand image",
    minimize: "Minimize image",
  },
  requestAccess: {
    title: "Request access to view this screenshot",
    notSharedBy: "{name} hasn't shared this screenshot with you yet.",
    notSharedByOwner: "The owner hasn't shared this screenshot with you yet.",
    signInHint:
      "Sign in with your work email — if you're already on the owner's team you'll be let straight in.",
    signIn: "Sign in to continue",
    sentTitle: "Request sent",
    sentDescription:
      "We let the owner know. You'll get an email if they grant access.",
    askingAs: "Asking as {email}",
    noteLabel: "Add a note {optional}",
    noteOptional: "(optional)",
    notePlaceholder:
      "Hi — I'd like a copy of this screenshot from the design review.",
    sending: "Sending…",
    submit: "Request access",
    failed: "Something went wrong. Try again in a moment.",
  },
  notFound: {
    title: "Screenshot not found",
    description:
      "This link has expired or never existed. Screenshots on free accounts are kept for 30 days from the last time they were viewed.",
  },
} as const;

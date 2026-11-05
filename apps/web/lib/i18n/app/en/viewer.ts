export const VIEWER = {
  meta: {
    defaultTitle: "{product} recording",
    defaultDescription: "A screen recording shared from {product}.",
    preparingTitle: "Preparing recording… — {product}",
    notFoundTitle: "Not found",
    description:
      "A screen recording shared from {product}. Watch it in your browser, no sign-up needed.",
    descriptionTimed:
      "A {duration} screen recording shared from {product}. Watch it in your browser, no sign-up needed.",
  },
  loading: "Loading recording…",
  nav: {
    download: "Download",
  },
  authPrompt: {
    pricing: "Pricing",
    logIn: "Log in",
    getStarted: "Get started",
    getFree: "Get {product} free",
  },
  postedBy: {
    label: "Posted by",
    someone: "Someone",
  },
  views: {
    count: "one:{count} view|other:{count} views",
    showWhoWatched: "{views}, show who watched",
    viewers: "Viewers",
    emptyTitle: "No views yet",
    emptyDescription: "Share the link and the people who watch show up here.",
    signedInViewer: "Signed-in viewer",
    anonymous: "Anonymous",
  },
  actions: {
    share: "Share",
    visibilityFailed: "Could not update visibility",
    deleteFailed: "Could not delete the recording",
  },
  requestAccess: {
    title: "Request access to view this video",
    notSharedBy: "{name} hasn't shared this recording with you yet.",
    notSharedByOwner: "The owner hasn't shared this recording with you yet.",
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
      "Hi — I'd like to watch this recording from yesterday's review.",
    sending: "Sending…",
    submit: "Request access",
    failed: "Something went wrong. Try again in a moment.",
  },
  pending: {
    preparingTitle: "Preparing your recording…",
    preparingDescription:
      "The upload is still finishing. This page refreshes on its own once it's ready.",
    failedTitle: "This recording didn't finish uploading",
    failedDescription:
      "The link was created but the video never arrived. Try the link again in a minute, or record a fresh one.",
    comment: "Comment",
    activityTab: "Activity",
    transcriptTab: "Transcript",
    emptyTitle: "No activity yet",
    emptyDescription:
      "Reactions and comments from viewers will show up here once the recording is ready.",
  },
  upgradeBanner: {
    message:
      "{usage} on the Free plan. Upgrade for unlimited recordings in full quality.",
    usage: "other:{used} of {n} recordings used",
  },
  editPanel: {
    makeEdits: "Make edits",
    status: {
      idle: "Saved automatically",
      saved: "Saved",
      error: "Couldn't save",
    },
    trimTitle: "Trim and cut",
    trimDescription:
      "Split the timeline, cut sections out and fix the transcript.",
    background: "Background",
    camera: "Camera",
    audio: "Audio",
    takeAction: "Take action",
    downloadTitle: "Download video",
    downloadDescription: "The full recording as an MP4.",
    copyEmbed: "Copy embed code",
    embedCopied: "Embed code copied",
    embedDescription: "Paste the player into any web page.",
  },
  notFound: {
    title: "Recording not found",
    description:
      "This link has expired or never existed. Recordings on free accounts are kept for 30 days from the last time they were viewed.",
    madeWith: "Made with {product}",
  },
} as const;

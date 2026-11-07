export const LIBRARY = {
  dashboard: {
    welcome: "Welcome back",
    welcomeName: "Welcome back, {name}",
    openCanvas: "Open the canvas",
    newRecording: "New recording",
    stats: {
      recordings: "Recordings",
      plusScreenshots:
        "one:Plus {count} screenshot|other:Plus {count} screenshots",
      noScreenshots: "No screenshots yet",
      views: "Views",
      viewsAverage: "{count} per recording on average",
      noViews: "No views yet",
      recorded: "Recorded",
      recordedAverage: "{duration} per recording on average",
      nothingRecorded: "Nothing recorded yet",
      recordingsLeft: "Recordings left",
      leftOfAllowance: "{left} of {allowance}",
      freePlanLimit: "Free plan, up to {minutes} min each",
    },
    recordedTime: {
      minutes: "{minutes} min",
      hours: "{hours} h",
      hoursMinutes: "{hours} h {minutes} min",
    },
    recent: {
      title: "Recent recordings",
      all: "All recordings",
      empty: "Nothing has been shared in this workspace yet.",
      views: "one:{n} view|other:{n} views",
      comments: "one:{n} comment|other:{n} comments",
      reactions: "one:{n} reaction|other:{n} reactions",
    },
    start: {
      title: "Start recording with {product}",
      surfacesLabel: "Where to record",
      surfaces: {
        extension: "Extension",
        desktop: "Desktop app",
        canvas: "Canvas",
      },
      extension: {
        description:
          "Record any tab, window or your whole screen from the toolbar, and get a link you can share with anyone.",
        record: "Record now",
        addToChrome: "Add to Chrome",
      },
      desktop: {
        description:
          "A native Mac app that records your screen and camera with system audio is on its way. Until then, the extension records any tab, window or your whole screen.",
        download: "Download for Mac",
        comingSoon: "Coming soon",
      },
      canvas: {
        description:
          "A blank board with pens, shapes and text to draw on while you record, when there is no page to show.",
      },
    },
  },
  recording: {
    pageTitle: "Recordings",
    count: "one:{n} recording|other:{n} recordings",
    untitled: "Untitled recording",
    aiGenerated: "AI generated",
    processing: "Processing",
    noMatches: "No recordings match these filters.",
    empty:
      "You haven’t created any recording links yet. Record in the CaptureFlow desktop app and your recordings will show up here.",
    selectAll: "Select all recordings",
    selected: "one:{n} recording selected|other:{n} recordings selected",
    open: "Open recording",
    edit: "Edit recording",
    share: "Share recording",
    delete: "Delete recording",
    deleteTitle: "Delete this recording?",
    deleteDescription:
      "The video and its link stop working immediately. This cannot be undone.",
    deleteSelectedTitle:
      "one:Delete {n} recording?|other:Delete {n} recordings?",
  },
  screenshot: {
    pageTitle: "Screenshots",
    count: "one:{n} screenshot|other:{n} screenshots",
    untitled: "Untitled screenshot",
    numbered: "Screenshot {id}",
    noMatches: "No screenshots match these filters.",
    empty:
      "No screenshots yet. Open CaptureFlow → Screenshot tab → pick a Display, Window, or Area to capture. Your screenshot appears here automatically.",
    selectAll: "Select all screenshots",
    selected: "one:{n} screenshot selected|other:{n} screenshots selected",
    open: "Open screenshot",
    edit: "Edit screenshot",
    share: "Share screenshot",
    delete: "Delete screenshot",
    deleteTitle: "Delete this screenshot?",
    deleteDescription:
      "The image and its link stop working immediately. This cannot be undone.",
    deleteSelectedTitle:
      "one:Delete {n} screenshot?|other:Delete {n} screenshots?",
  },
  filters: {
    access: "Access",
    sort: "Sort",
    current: "{label}: {value}",
    accessOptions: {
      all: "Any access",
      public: "Public",
      workspace: "Workspace",
      private: "Private",
    },
    sortOptions: {
      newest: "Newest to oldest",
      oldest: "Oldest to newest",
      views: "Most viewed",
    },
  },
  card: {
    select: "Select {title}",
    moreActions: "More actions",
    rename: "Rename",
    unknownAuthor: "Unknown",
  },
  selection: {
    deleteDescription: "Their links stop working immediately.",
    deleteFailed: "{failed} of {count} couldn't be deleted. The rest are gone.",
    clear: "Clear",
  },
  pager: {
    label: "Pages",
    previous: "Previous page",
    next: "Next page",
  },
  visibility: {
    label: "Visibility",
    labels: {
      public: "Public",
      workspace: "Workspace",
      private: "Private",
    },
    descriptions: {
      public: "Anyone with the link can view",
      workspace: "Only signed-in workspace members can view",
      private: "Only you can view",
    },
    workspaceNamed: "Workspace · {name}",
  },
  share: {
    title: "Share",
    embed: "Embed",
    embedPublic: "Plays wherever the snippet is pasted.",
    embedRestricted: "Plays only for people who can already open the link.",
    copyCode: "Copy code",
    generalAccess: "General access",
    generalAccessCurrent: "General access: {access}",
    copyLink: "Copy link",
    linkCopied: "Link copied",
    shareAt: "Share at {time}",
    socialHeading: "Share to",
    socialText: "Check out “{title}”",
    email: "Email",
  },
  editableTitle: {
    label: "Recording title",
    rename: "Rename recording",
  },
} as const;

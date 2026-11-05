export const SETTINGS = {
  saved: "Saved",
  errors: {
    ownerOnly: "Only the workspace owner can change this",
    databaseUnavailable: "Database unavailable",
    saveFailed: "Couldn’t save — try again",
  },
  upload: {
    uploading: "Uploading…",
    missing: "Pick an image file",
    failed: "Upload failed",
    failedReason: "Upload failed: {reason}",
  },
  personal: {
    title: "Personal Settings",
    account: {
      title: "Account",
      description:
        "How you appear to teammates and to the people who watch your recordings.",
    },
    preferences: {
      title: "Preferences",
      description: "How CaptureFlow looks and reads for you.",
    },
    languageDescription: "The language CaptureFlow shows you.",
  },
  avatar: {
    label: "Avatar",
    change: "Change avatar",
    removing: "Removing…",
    hint: "JPG, PNG, WebP or GIF. 2 MB max.",
    tooLarge: "Avatar must be 2 MB or smaller",
    badType: "Avatar must be PNG, JPEG, WebP, or GIF",
  },
  account: {
    name: {
      label: "Full name",
      placeholder: "Your name",
      description: "Shown on recordings, screenshots, and activity rows.",
      required: "Name is required.",
      updateFailed: "Could not update name.",
    },
    email: {
      label: "Email address",
      description: "Used to sign in. Contact support to change.",
    },
    userId: {
      label: "User ID",
      copy: "Copy user ID",
      description: "Quote this when contacting support.",
    },
    saveChanges: "Save changes",
  },
  workspace: {
    title: "Workspace Settings",
    tabs: {
      label: "Settings sections",
      general: "General",
      security: "Security",
    },
    general: {
      title: "General",
      description:
        "The name and logo that identify this workspace in the switcher, on the members page and on share previews.",
    },
    name: {
      title: "Workspace name",
      description: "The name that appears for your workspace.",
      empty: "Workspace name can’t be empty",
      tooLong: "Workspace name is too long (max {max} chars)",
    },
    logo: {
      title: "Workspace logo",
      description:
        "Shown next to your workspace name. PNG, JPEG, WebP, GIF or SVG, 2 MB max.",
      upload: "Upload logo",
      replace: "Replace logo",
      tooLarge: "Logo must be 2 MB or smaller",
      badType: "Logo must be PNG, JPEG, WebP, GIF, or SVG",
    },
    permissions: {
      title: "Default permissions",
      description:
        "Settings applied to every new recording and screenshot in the workspace.",
    },
    recordingAccess: {
      title: "Recording access",
      description:
        "Decide whether teammates can post recordings and screenshots into this workspace.",
      allow: {
        title: "Allow teammates to post here",
        body: "Members can record into this workspace.",
      },
      ownerOnly: {
        title: "Only the workspace owner",
        body: "Teammate uploads go to their personal workspace.",
      },
    },
  },
  devices: {
    title: "Connected devices",
    count: "one:{n} device signed in|other:{n} devices signed in",
    empty:
      "No connected devices. Open the CaptureFlow desktop app and click Sign in on the record bar to link this account.",
    unlabelled: "Unlabelled device",
    added: "Added {date}",
    addedLastUsed: "Added {date} · last used {lastUsed}",
    neverUsed: "Never used",
    revoke: {
      action: "Revoke",
      title: "Sign this device out?",
      description: "It will need to sign in again to manage recordings.",
    },
  },
} as const;

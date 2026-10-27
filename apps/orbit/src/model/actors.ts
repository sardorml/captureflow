import type { Actor } from "./types";

export const ACTORS: Actor[] = [
  {
    id: "visitor",
    name: "Visitor",
    kind: "person",
    isExternal: true,
    description:
      "Someone not signed in: following a share link, reading the landing page, or about to sign up.",
    enters: ["website", "share-page", "login"],
  },
  {
    id: "user",
    name: "User",
    kind: "person",
    isExternal: true,
    description:
      "A person with a CaptureFlow account. Owns exactly one home workspace and may be a member of others.",
    enters: ["dashboard", "extension", "desktop", "share-page"],
  },
  {
    id: "owner",
    name: "Workspace owner",
    kind: "person",
    isExternal: true,
    description:
      "A user acting on their home workspace: invites, removes, sets policies and pays for seats.",
    enters: ["dashboard"],
  },
  {
    id: "member",
    name: "Workspace member",
    kind: "person",
    isExternal: true,
    description:
      "A user inside someone else's workspace. Records into it and is a seat once it is on Team.",
    enters: ["dashboard", "extension", "desktop"],
  },
  {
    id: "viewer",
    name: "Workspace viewer",
    kind: "person",
    isExternal: true,
    description:
      "A user invited into a workspace to watch, comment and react on its library. Cannot record there and is never a seat.",
    enters: ["dashboard", "share-page"],
  },
  {
    id: "instance-owner",
    name: "Instance owner",
    kind: "person",
    isExternal: true,
    description:
      "The operator who set the deployment up, with every power in the admin console including inviting admins.",
    enters: ["admin-console"],
  },
  {
    id: "instance-admin",
    name: "Instance admin",
    kind: "person",
    isExternal: true,
    description:
      "An operator who views users and workspaces. Not a CaptureFlow user.",
    enters: ["admin-console"],
  },
  {
    id: "instance-viewer",
    name: "Instance viewer",
    kind: "person",
    isExternal: true,
    description:
      "An operator with read-only access to users, workspaces and the audit log.",
    enters: ["admin-console"],
  },
  {
    id: "lemon-squeezy",
    name: "Lemon Squeezy",
    kind: "system",
    isExternal: true,
    description:
      "The payment provider. Sells Team seats and reports every subscription change back by webhook.",
    enters: ["lemon-webhook"],
  },
  {
    id: "scheduler",
    name: "Cloudflare scheduler",
    kind: "system",
    isExternal: false,
    description: "Fires the hourly and daily cron triggers on the web worker.",
    enters: ["cron"],
  },
  {
    id: "workers-ai",
    name: "Workers AI",
    kind: "system",
    isExternal: true,
    description:
      "Whisper for transcripts and a text model for chapter summaries, called from the queue consumer.",
    enters: ["transcription-queue"],
  },
];

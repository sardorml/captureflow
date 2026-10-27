import type { Interface } from "./types";

export const INTERFACES: Interface[] = [
  {
    id: "website",
    name: "Website",
    kind: "web page",
    description:
      "Landing, pricing, features, blog, legal pages and the download page.",
    path: "apps/web/app/page.tsx",
  },
  {
    id: "login",
    name: "Login page",
    kind: "web page",
    description:
      "One form for log in and sign up, email or Google, with invite context when present.",
    path: "apps/web/app/AuthForm.tsx",
  },
  {
    id: "dashboard",
    name: "Dashboard",
    kind: "web app",
    description:
      "Recordings, screenshots, members, workspaces, billing, devices and settings for a signed-in user.",
    path: "apps/web/app/(dashboard)",
  },
  {
    id: "share-page",
    name: "Share page",
    kind: "web page",
    description:
      "The public face of a recording or screenshot, plus the embed route.",
    path: "apps/web/app/r/[id]",
  },
  {
    id: "extension",
    name: "Chrome extension",
    kind: "browser extension",
    description:
      "WXT MV3 recorder: tab, window or screen with a camera bubble and mic.",
    path: "apps/extension",
  },
  {
    id: "desktop",
    name: "macOS app",
    kind: "desktop app",
    description:
      "Electron recorder with a Swift sidecar. Shares the capture engine with the extension.",
    path: "apps/desktop",
  },
  {
    id: "recording-api",
    name: "Recording API",
    kind: "http api",
    description:
      "Device-token routes the clients call: init, parts, finalize, poster, transcript, usage.",
    path: "apps/web/app/api/r",
  },
  {
    id: "screenshot-api",
    name: "Screenshot API",
    kind: "http api",
    description:
      "Upload, visibility and download for screenshots. Deliberately forked from the recording API.",
    path: "apps/web/app/api/s",
  },
  {
    id: "lemon-webhook",
    name: "Lemon Squeezy webhook",
    kind: "webhook",
    description: "HMAC-verified subscription events for workspace seats.",
    path: "apps/web/app/api/lemon-webhook/route.ts",
  },
  {
    id: "cron",
    name: "Scheduled jobs",
    kind: "scheduled job",
    description:
      "Hourly multipart cleanup and poster backfill, daily retention sweep.",
    path: "apps/web/worker.ts",
  },
  {
    id: "transcription-queue",
    name: "Transcription queue",
    kind: "queue",
    description:
      "One message per mic chunk; the consumer runs Whisper and assembles the transcript.",
    path: "apps/web/worker.ts",
  },
  {
    id: "admin-console",
    name: "Admin console",
    kind: "console",
    description:
      "Separate worker on its own host with its own accounts: users, workspaces, audit, emails.",
    path: "apps/admin",
  },
  {
    id: "mailer",
    name: "Mailer",
    kind: "email",
    description:
      "Sends admin-written campaigns off a queue through Resend and serves unsubscribe.",
    path: "apps/mailer",
  },
];

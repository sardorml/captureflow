import type { Domain } from "./types";

export const DOMAINS: Domain[] = [
  {
    id: "accounts",
    name: "Accounts",
    summary:
      "Who a person is to CaptureFlow: sign-in, sessions and paired devices.",
    hue: 250,
  },
  {
    id: "workspaces",
    name: "Workspaces",
    summary: "The home workspace, its members, invitations and policies.",
    hue: 160,
  },
  {
    id: "recordings",
    name: "Recordings",
    summary: "A video from first byte to transcript, poster and share link.",
    hue: 25,
  },
  {
    id: "screenshots",
    name: "Screenshots",
    summary:
      "Still captures with annotation, kept apart from recordings on purpose.",
    hue: 45,
  },
  {
    id: "sharing",
    name: "Sharing",
    summary:
      "Watching, commenting, reacting and asking for access. Always free.",
    hue: 200,
  },
  {
    id: "billing",
    name: "Billing",
    summary:
      "Seats, storage pools, subscriptions and what a workspace is entitled to.",
    hue: 320,
  },
  {
    id: "capture",
    name: "Capture clients",
    summary: "The Chrome extension and the macOS app that produce recordings.",
    hue: 100,
  },
  {
    id: "operations",
    name: "Operations",
    summary: "The admin console, scheduled jobs and product email.",
    hue: 0,
  },
];

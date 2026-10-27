import type { Journey } from "./types";

export const JOURNEYS: Journey[] = [
  {
    id: "first-recording",
    name: "A visitor records their first video",
    actor: "visitor",
    description:
      "From the landing page to a share link in someone else's inbox, on the free plan.",
    steps: [
      { capability: "sign-up", note: "Home workspace appears on first load" },
      {
        capability: "pair-device",
        note: "Extension picks up the website session",
      },
      { capability: "choose-quality", note: "Data saver by default" },
      { capability: "start-recording", note: "Free caps apply" },
      { capability: "upload-parts" },
      { capability: "finish-recording" },
      { capability: "make-poster" },
      { capability: "transcribe" },
      { capability: "change-visibility", note: "Public by default" },
    ],
    status: "draft",
  },
  {
    id: "someone-watches",
    name: "Someone watches and reacts",
    actor: "visitor",
    description:
      "The free side. No account needed to watch; an account to comment.",
    steps: [
      { capability: "watch", note: "View recorded, idle clock reset" },
      { capability: "react" },
      { capability: "sign-up", note: "Only if they want to comment" },
      { capability: "comment", note: "Owner notified" },
    ],
    status: "live",
  },
  {
    id: "build-a-team",
    name: "An owner builds a team",
    actor: "owner",
    description:
      "Invite people into the home workspace and set how it behaves.",
    steps: [
      { capability: "set-uploads-policy" },
      { capability: "invite-member", note: "Seat cost shown once on Team" },
      { capability: "accept-invite", note: "Member lands in the team" },
      { capability: "sync-seats", note: "No-op on a free workspace" },
    ],
    status: "live",
  },
  {
    id: "join-and-record",
    name: "A member joins and records into the team",
    actor: "member",
    description:
      "What an invited person experiences, from the email to their recording in the team library.",
    steps: [
      { capability: "accept-invite" },
      { capability: "switch-workspace", note: "Automatic under Orbit" },
      { capability: "start-recording", note: "Team entitlement, no caps" },
      { capability: "finish-recording" },
      { capability: "leave-workspace", note: "Recordings stay behind" },
    ],
    status: "live",
  },
  {
    id: "add-a-viewer",
    name: "An owner adds a viewer who later becomes a recorder",
    actor: "owner",
    description:
      "A stakeholder who only needs to watch joins free; when they need to record, one role change makes them a seat.",
    steps: [
      { capability: "invite-member", note: "As viewer, no seat" },
      {
        capability: "accept-invite",
        note: "Library appears in their dashboard",
      },
      { capability: "watch", note: "Workspace-visibility recordings open" },
      { capability: "comment", note: "Owner notified" },
      { capability: "change-member-role", note: "Viewer → member adds a seat" },
      { capability: "start-recording", note: "Now allowed" },
    ],
    status: "live",
  },
  {
    id: "upgrade",
    name: "An owner upgrades to Team",
    actor: "owner",
    description:
      "Seats for everyone in the workspace, pooled storage, caps lifted.",
    steps: [
      { capability: "view-billing" },
      { capability: "upgrade-workspace", note: "Total for current members" },
      {
        capability: "record-subscription-change",
        note: "Webhook writes the subscription",
      },
      { capability: "resolve-entitlement", note: "Tier flips to team" },
      { capability: "invite-member", note: "Each one adds a seat" },
    ],
    status: "live",
  },
  {
    id: "cancel-and-lapse",
    name: "An owner cancels and the workspace lapses",
    actor: "owner",
    description: "Nothing is deleted by billing; the free rules return.",
    steps: [
      { capability: "manage-subscription", note: "Cancel in the portal" },
      {
        capability: "record-subscription-change",
        note: "Access until period end",
      },
      { capability: "lapse", note: "Free rules, uploads blocked over pool" },
      { capability: "remove-idle-captures", note: "Idle sweep applies again" },
    ],
    status: "live",
  },
  {
    id: "support-a-user",
    name: "An instance admin supports a user",
    actor: "instance-admin",
    description: "Find out what happened to a recording and make it right.",
    steps: [
      {
        capability: "view-user",
        note: "Client, source, quality per recording",
      },
      { capability: "view-workspace-admin", note: "Seats and pool" },
    ],
    status: "draft",
  },
];

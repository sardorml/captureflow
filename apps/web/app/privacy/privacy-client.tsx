"use client";

import {
  LegalPage,
  type LegalSection,
} from "@/components/marketing/legal-page";

const LAST_UPDATED = "5 August 2026";

const SECTIONS: LegalSection[] = [
  {
    heading: "Who this covers",
    body: [
      `This policy covers the CaptureFlow website, the browser extension, and the desktop app, together "CaptureFlow". CaptureFlow is open source and self-hostable — if you use someone else's instance, or your own, this policy describes the software's behaviour but the operator of that instance controls the data.`,
    ],
  },
  {
    heading: "What we collect",
    body: [
      "We collect only what is needed to record, store, and share your captures.",
    ],
    bullets: [
      "Account details — your name and email address, so you can sign in and so recordings can belong to you.",
      "Session details — a session token, your IP address, and your browser's user-agent string, used to keep you signed in and to protect your account against session abuse.",
      "Your captures — the screen recordings and screenshots you create, including their audio and camera track when you enable them. For a screenshot, we also store the title of the tab you captured, so the capture is recognisable in your library.",
      "Website analytics — on the CaptureFlow website only, we record page views and basic product usage through PostHog to understand which features are used.",
    ],
  },
  {
    heading: "What we do not collect",
    body: [
      "The browser extension contains no analytics or tracking of any kind. It runs a small script on pages so the recording controls and camera bubble can be drawn on top of whatever you are recording — a screen recorder cannot know in advance which page you will choose. That script draws the interface only. It does not read page content, does not log clicks or keystrokes, and does not record which sites you visit.",
      "Recording never starts on its own. Capture begins only when you start it, and screen and tab capture always go through the browser's own permission flow.",
    ],
  },
  {
    heading: "How your captures are stored",
    body: [
      "Recordings and screenshots are stored as files in Cloudflare R2, with their metadata in Cloudflare D1. Every capture gets a link with an unguessable address. You control who can open it, and you can change a capture's visibility or delete it at any time from your library.",
      "Deleting a capture removes both the file and its metadata. Deleting your account removes your captures along with it.",
    ],
  },
  {
    heading: "Who we share it with",
    body: [
      "We do not sell your data, and we do not share it for advertising. Your captures are shared only with the people you send a link to, according to the visibility you set.",
      "We rely on a small number of providers to run the service: Cloudflare for hosting and storage, and PostHog for website analytics. They process data on our behalf so that CaptureFlow can function.",
    ],
  },
  {
    heading: "Your choices",
    body: [
      "You can delete any capture at any time, change who can view it, or delete your account entirely. If you would rather no third party held your recordings at all, CaptureFlow is licensed under AGPL-3.0 and every feature ships in the open-source build — you can run the whole service on infrastructure you control.",
    ],
  },
  {
    heading: "Changes to this policy",
    body: [
      "If this policy changes in a way that affects what we collect or how it is used, we will update the date at the top of this page.",
    ],
  },
];

export function PrivacyClient() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated={LAST_UPDATED}
      sections={SECTIONS}
      contact="Questions about this policy, or a request to access or delete your data, can go to"
    />
  );
}

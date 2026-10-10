import type { Metadata } from "next";
import {
  LegalPage,
  type LegalSection,
} from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms for using CaptureFlow: your account, your content, the managed plan, and the open-source license.",
  alternates: { canonical: "/terms" },
};

const LAST_UPDATED = "10 October 2026";

const SECTIONS: LegalSection[] = [
  {
    heading: "Agreeing to these terms",
    body: [
      `These terms cover the CaptureFlow website, the browser extension, the desktop app, and the hosted service, together "CaptureFlow". By creating an account or using the hosted service, you agree to them. If you are using CaptureFlow on behalf of a team or company, you are agreeing for them too.`,
      "If you run your own instance, the open-source license governs your use of the software, and these terms apply only to the parts of CaptureFlow we host for you.",
    ],
  },
  {
    heading: "Your account",
    body: [
      "You need an account to record, store, and share captures on the hosted service. Keep your sign-in details to yourself; you are responsible for what happens under your account. If you think someone else has access to it, contact us and we will help you lock it down.",
    ],
  },
  {
    heading: "Your content",
    body: [
      "You own the recordings and screenshots you create. We store them and show them to the people you share them with, according to the visibility you set, and we do nothing else with them.",
      "You can delete any capture or your whole account at any time. Deleting removes the file and its metadata from the hosted service.",
    ],
  },
  {
    heading: "Acceptable use",
    body: [
      "Don't use CaptureFlow to share anything illegal, or anything you don't have the right to share. In particular, don't use it to:",
    ],
    bullets: [
      "record or share people without the consent the law requires where you and they are",
      "distribute malware, spam, or content that infringes someone else's rights",
      "harass, threaten, or exploit anyone",
      "probe, overload, or get around the limits and security of the hosted service",
    ],
  },
  {
    heading: "The managed plan",
    body: [
      "The managed plan is a subscription billed monthly or yearly through Lemon Squeezy, our payment provider and merchant of record. It renews automatically until you cancel, and you can cancel at any time from your billing page. Refunds follow our Refund Policy.",
      "We will give notice before changing the price of a plan you are on.",
    ],
  },
  {
    heading: "Open source",
    body: [
      "CaptureFlow's source code is licensed under AGPL-3.0, with the exceptions noted in the repository's LICENSE file. That license, not these terms, decides what you can do with the code itself.",
    ],
  },
  {
    heading: "Ending your use",
    body: [
      "You can stop using CaptureFlow and delete your account whenever you like. We may suspend or close an account that breaks these terms, and where we can, we will tell you why first.",
    ],
  },
  {
    heading: "No warranty",
    body: [
      `CaptureFlow is provided "as is". We work to keep the hosted service available and your captures safe, but we can't promise it will never be interrupted or lose data, so keep your own copy of anything you can't afford to lose. To the extent the law allows, we are not liable for indirect or consequential losses, and our total liability is limited to what you paid us in the twelve months before the claim.`,
    ],
  },
  {
    heading: "Changes to these terms",
    body: [
      "If we change these terms in a way that matters, we will update the date at the top of this page and, for changes that affect paying customers, email you before they take effect.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      lastUpdated={LAST_UPDATED}
      sections={SECTIONS}
      contact="Questions about these terms can go to"
    />
  );
}

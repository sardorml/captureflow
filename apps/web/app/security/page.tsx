import type { Metadata } from "next";
import {
  LegalPage,
  type LegalSection,
} from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Security",
  description:
    "How CaptureFlow protects your recordings, and how to report a security vulnerability.",
  alternates: { canonical: "/security" },
};

const LAST_UPDATED = "10 October 2026";

const SECTIONS: LegalSection[] = [
  {
    heading: "How your captures are protected",
    bullets: [
      "Everything is served over HTTPS, and recordings and screenshots are stored in Cloudflare R2.",
      "Every capture gets a link with an unguessable address, and you choose who can open it: anyone with the link, your workspace, or only you.",
      "The browser extension draws its controls on the page you're recording, but doesn't read page content or log what you type or where you browse.",
      "CaptureFlow is open source, so anyone can read the code that handles your data.",
    ],
    body: [],
  },
  {
    heading: "Reporting a vulnerability",
    body: [
      "If you've found a security issue in CaptureFlow, the website, the extension, the desktop app, or the hosted service, please email us before telling anyone else. Include what you found, how to reproduce it, and what an attacker could do with it. We'll confirm we've received it and keep you updated while we fix it.",
      "Please report privately rather than opening a public GitHub issue, so the fix can ship before the details are public.",
    ],
  },
  {
    heading: "Testing guidelines",
    body: ["We won't take action against good-faith research that:"],
    bullets: [
      "only uses accounts and data you own, or that you have permission to use",
      "doesn't access, change, or delete other people's recordings beyond what's needed to show the issue",
      "doesn't degrade the service, for example through denial-of-service or heavy automated scanning",
      "doesn't involve social engineering, phishing, or physical attacks",
      "gives us reasonable time to fix the issue before it's disclosed",
    ],
  },
  {
    heading: "Self-hosted instances",
    body: [
      "Vulnerabilities in the CaptureFlow code affect self-hosted instances too, so we want to hear about them. Issues specific to how someone has configured their own instance should go to that instance's operator.",
    ],
  },
];

export default function SecurityPage() {
  return (
    <LegalPage
      title="Security"
      lastUpdated={LAST_UPDATED}
      sections={SECTIONS}
      contact="Report a vulnerability, or ask a security question, at"
    />
  );
}

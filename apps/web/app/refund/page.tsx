import type { Metadata } from "next";
import {
  LegalPage,
  type LegalSection,
} from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "How refunds and cancellations work for the CaptureFlow managed plan.",
  alternates: { canonical: "/refund" },
};

const LAST_UPDATED = "10 October 2026";

const SECTIONS: LegalSection[] = [
  {
    heading: "14-day refunds",
    body: [
      "If the managed plan isn't right for you, ask for a refund within 14 days of a charge and you'll get the full amount back. This applies to the first payment and to every renewal, monthly or yearly.",
    ],
  },
  {
    heading: "How to ask",
    body: [
      "Email us from the address on your account and tell us which charge it's for. You don't need to give a reason. Refunds are issued through Lemon Squeezy, our payment provider, to the card or account you paid with, and usually show up within 5 to 10 business days depending on your bank.",
    ],
  },
  {
    heading: "Cancelling",
    body: [
      "You can cancel at any time from your billing page. Cancelling stops the next renewal, and you keep the managed plan until the end of the period you've paid for. After 14 days, we don't refund the unused part of a period.",
    ],
  },
  {
    heading: "Self-hosting is free",
    body: [
      "Running CaptureFlow on your own Cloudflare account costs nothing from us, so there is nothing to refund. Any charges from Cloudflare are between you and Cloudflare.",
    ],
  },
];

export default function RefundPage() {
  return (
    <LegalPage
      title="Refund Policy"
      lastUpdated={LAST_UPDATED}
      sections={SECTIONS}
      contact="To ask for a refund, or with any billing question, email"
    />
  );
}

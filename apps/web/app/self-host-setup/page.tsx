import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing/marketing-page";
import { SetupRequestSection } from "@/components/marketing/setup-request-section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Self-hosting setup",
  description:
    "Have CaptureFlow set up on your company's own Cloudflare account: your domain, company-only sign-in, and a private Chrome extension for your team.",
  alternates: { canonical: "/self-host-setup" },
};

export default function SelfHostSetupPage() {
  return (
    <MarketingPage>
      <SetupRequestSection />
    </MarketingPage>
  );
}

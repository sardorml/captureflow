"use client";

import { Server } from "lucide-react";
import { X_URL } from "@/lib/marketing/constants";
import { track } from "@/lib/marketing/track";
import { useMessages } from "./i18n-provider";
import { PlanCard } from "./plan-card";

// X_URL is the repo URL despite the legacy name; the self-hosted plan ships no binary.
const GITHUB_REPO_URL = X_URL;

export function FreeCard() {
  const m = useMessages();
  const f = m.pricing.free;

  return (
    <PlanCard
      badges={[
        { label: f.badge, icon: <Server size={14} /> },
        { label: f.badgeFree },
      ]}
      name={f.name}
      tagline={f.tagline}
      price={f.price}
      period={f.period}
      note={f.note}
      cta={{
        label: f.cta,
        href: GITHUB_REPO_URL,
        target: "_blank",
        onClick: () => track("source_opened", { from: "pricing_free" }),
      }}
      guarantee={m.pricing.guarantee}
      features={[...f.features]}
    />
  );
}

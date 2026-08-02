"use client";

import { Apple, Image as ImageIcon, Scale, Server, Video } from "lucide-react";
import { X_URL } from "@/lib/marketing/constants";
import { track } from "@/lib/marketing/track";
import { useMessages } from "./i18n-provider";
import { PlanCard } from "./plan-card";

// X_URL is the repo URL despite the legacy name; the self-hosted plan ships no binary.
const GITHUB_REPO_URL = X_URL;

// One icon per feature, in the order the copy lists them.
const FEATURE_ICONS = [Video, ImageIcon, Scale, Apple];

export function FreeCard() {
  const m = useMessages();
  const f = m.pricing.free;

  return (
    <PlanCard
      panelClassName="bg-[radial-gradient(120%_100%_at_15%_0%,#1f4d55_0%,#16262e_55%,#111a20_100%)]"
      icon={<Server size={15} />}
      eyebrow={f.badge}
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
      footnote={m.pricing.guarantee}
      features={f.features.map((label, i) => {
        const Icon = FEATURE_ICONS[i] ?? Video;
        return { icon: <Icon size={16} />, label };
      })}
    />
  );
}

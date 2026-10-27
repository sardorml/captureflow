"use client";

import { MarketingSection, SectionHeading, WIDE_RAIL } from "./_shared";
import type { ComponentType } from "react";
import { EditorScene } from "./editor-scene";
import { EmbedScene } from "./embed-scene";
import { FeedbackScene } from "./feedback-scene";
import { TeamsScene } from "./teams-scene";
import NextLink from "next/link";
import { ArrowRight } from "lucide-react";
import { CHROME_WEBSTORE_URL } from "@/lib/marketing/constants";
import { track } from "@/lib/marketing/track";
import { cn } from "@/lib/utils";
import { useLocalizedHref, useMessages } from "./i18n-provider";

type CategoryKind = "share" | "embed" | "feedback" | "workspaces";

// `id` is the anchor each row can be linked to: #share / #embed / #feedback /
// #workspaces.
const CATEGORIES = [
  { id: "share", kind: "share", Scene: EditorScene, href: "install" },
  { id: "embed", kind: "embed", Scene: EmbedScene, href: "install" },
  { id: "feedback", kind: "feedback", Scene: FeedbackScene, href: "/login" },
  {
    id: "workspaces",
    kind: "workspaces",
    Scene: TeamsScene,
    href: "/login?mode=signup",
  },
] as const satisfies readonly {
  id: string;
  kind: CategoryKind;
  Scene: ComponentType;
  href: string;
}[];

export function CollaborationSection() {
  const m = useMessages();

  return (
    <MarketingSection id="capabilities" style={{ scrollMarginTop: 96 }}>
      <SectionHeading
        title={m.collaboration.heading}
        subtitle={m.collaboration.subtitle}
      />
      <div className={cn(WIDE_RAIL, "grid gap-5 lg:grid-cols-2")}>
        {CATEGORIES.map((cat) => (
          <CategoryCard key={cat.id} cat={cat} />
        ))}
      </div>
    </MarketingSection>
  );
}

// One card per capability under the shared heading, each keeping its #anchor:
// the scene on top, then an optional tag, the title and the body.
function CategoryCard({ cat }: { cat: (typeof CATEGORIES)[number] }) {
  const m = useMessages();
  const lh = useLocalizedHref();
  const { feature } = m.collaboration.categories[cat.kind];
  const tag = "tag" in feature ? feature.tag : undefined;
  const href =
    cat.href === "install"
      ? (CHROME_WEBSTORE_URL ?? lh("/download"))
      : lh(cat.href);

  return (
    <article
      id={cat.id}
      className="flex flex-col rounded-[40px] bg-stage p-6 sm:p-8 lg:p-10"
      style={{ scrollMarginTop: 96 }}
    >
      <cat.Scene />
      <div className="mt-7 flex flex-col items-start">
        {/* The tag row is always there, so every card's title sits on the
            same line. */}
        <div className="flex h-9 items-end">
          {tag && (
            <span className="-ml-1.5 inline-block rounded-md bg-[#fde047] px-1.5 text-[20px] leading-tight font-semibold text-[#111]">
              {tag}
            </span>
          )}
        </div>
        <h3 className="-ml-2 mt-2 inline-block rounded-md bg-canvas px-2 py-1 text-[24px] leading-tight font-semibold tracking-[-0.02em] text-fg-strong">
          {feature.title}
        </h3>
        <p className="mt-4 max-w-[560px] text-[17px] leading-[1.55] text-fg-muted">
          {feature.body}
        </p>
        <FeatureLink
          href={href}
          label={feature.cta}
          location={`feature_${cat.id}`}
        />
      </div>
    </article>
  );
}

function FeatureLink({
  href,
  label,
  location,
}: {
  href: string;
  label: string;
  location: string;
}) {
  const className =
    "group mt-5 inline-flex items-center gap-2 text-[16px] font-semibold text-[#1184f7] transition-colors hover:text-[#0071e2] dark:text-[#6ea8ff] dark:hover:text-[#9cc3ff]";
  const onClick = () => track("marketing_cta_clicked", { location });
  const content = (
    <>
      {label}
      <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
    </>
  );

  return /^https?:/.test(href) ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={onClick}
    >
      {content}
    </a>
  ) : (
    <NextLink href={href} className={className} onClick={onClick}>
      {content}
    </NextLink>
  );
}

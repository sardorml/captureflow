"use client";

import {
  CARD_GRAY,
  CARD_ZOOM,
  FRAME_CARD,
  FRAME_CELL,
  FRAME_CELLS,
  FrameHeader,
  FrameSection,
  PillLink,
} from "./frame";
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
  const lh = useLocalizedHref();

  return (
    <FrameSection id="capabilities">
      <FrameHeader
        title={m.collaboration.heading}
        subtitle={m.collaboration.subtitle}
        action={
          <PillLink href={lh("/login?mode=signup")}>
            {m.collaboration.cta}
          </PillLink>
        }
      />
      <div className={FRAME_CELLS}>
        {CATEGORIES.map((cat) => (
          <CategoryCard key={cat.id} cat={cat} />
        ))}
      </div>
    </FrameSection>
  );
}

// One row per capability under the shared heading, each keeping its #anchor:
// the copy beside a scene that stays gray until the row is hovered.
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
      className={cn(
        FRAME_CELL,
        FRAME_CARD,
        "grid items-center gap-8 p-6 md:grid-cols-2 md:gap-12 md:px-12 md:py-10",
      )}
      style={{ scrollMarginTop: 72 }}
    >
      <div className={cn(CARD_ZOOM, CARD_GRAY, "md:order-last")}>
        <cat.Scene />
      </div>
      <div className="flex flex-col items-start">
        <h3 className="flex flex-wrap items-center gap-2 text-2xl font-medium tracking-[-0.03em] text-fg-strong">
          {feature.title}
          {tag && (
            <span className="rounded-full bg-tint-strong px-2.5 py-0.5 text-xs font-medium tracking-normal text-fg">
              {tag}
            </span>
          )}
        </h3>
        <p className="mt-3 text-lg leading-7 text-fg-muted">{feature.body}</p>
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
    "group mt-5 inline-flex items-center gap-1.5 text-base font-medium text-fg transition-colors hover:text-fg/70 motion-reduce:transition-none";
  const onClick = () => track("marketing_cta_clicked", { location });
  const content = (
    <>
      {label}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
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

import {
  ArrowRight,
  CircleDot,
  GitMerge,
  GitPullRequest,
  GitPullRequestDraft,
  GitPullRequestClosed,
  type LucideIcon,
} from "lucide-react";
import type { RepoActivity, RepoItem } from "@/lib/github";
import { formatRelativeShort } from "@/lib/format";
import { MESSAGES } from "@/lib/marketing/messages";
import { SOURCE_REPO_URL } from "@/lib/site";
import { cn } from "@/lib/utils";
import { MarketingSection, SectionHeading } from "./_shared";
import { CARD_SURFACE } from "./tokens";

const copy = MESSAGES.activity;

// GitHub's own state colours (Primer), dark by default and its light-mode
// shades under data-theme=light, so each item reads the way it does there.
const STATE_COLOR: Record<RepoItem["state"], string> = {
  merged: "text-[#ab7df8] [[data-theme=light]_&]:text-[#8250df]",
  open: "text-[#3fb950] [[data-theme=light]_&]:text-[#1a7f37]",
  draft: "text-[#9198a1] [[data-theme=light]_&]:text-[#59636e]",
  closed: "text-[#f85149] [[data-theme=light]_&]:text-[#d1242f]",
};

function stateIcon(item: RepoItem): LucideIcon {
  if (item.kind === "issue") return CircleDot;
  if (item.state === "merged") return GitMerge;
  if (item.state === "draft") return GitPullRequestDraft;
  return item.state === "closed" ? GitPullRequestClosed : GitPullRequest;
}

// Rendered on the server so relative dates can't drift between server and client.
export function RepoActivitySection({
  activity,
}: {
  activity: RepoActivity | null;
}) {
  if (!activity || activity.shipped.length === 0) return null;

  return (
    <MarketingSection id="activity">
      <SectionHeading title={copy.heading} subtitle={copy.subtitle} />
      <div className="grid gap-4 md:grid-cols-2">
        <ActivityList
          heading={copy.shippedHeading}
          items={activity.shipped}
          link={{
            label: copy.viewAll,
            href: `${SOURCE_REPO_URL}/pulls?q=is%3Amerged`,
          }}
        />
        <ActivityList
          heading={copy.openHeading}
          items={activity.open}
          empty={copy.emptyOpen}
          link={{ label: copy.newIssue, href: `${SOURCE_REPO_URL}/issues/new` }}
        />
      </div>
    </MarketingSection>
  );
}

function ActivityList({
  heading,
  items,
  empty,
  link,
}: {
  heading: string;
  items: RepoItem[];
  empty?: string;
  link: { label: string; href: string };
}) {
  return (
    <div className={cn(CARD_SURFACE, "flex flex-col rounded-3xl p-6")}>
      <p className="text-sm font-medium text-fg">{heading}</p>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-fg-muted">{empty}</p>
      ) : (
        <ul className="mt-3 flex list-none flex-col">
          {items.map((item) => {
            const Icon = stateIcon(item);
            return (
              <li key={item.number}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="-mx-2 flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-canvas motion-reduce:transition-none"
                >
                  <Icon
                    size={16}
                    aria-label={item.state}
                    className={cn("mt-0.5 shrink-0", STATE_COLOR[item.state])}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-sm text-fg">
                      {item.title}
                    </span>
                    <span className="text-xs text-fg-subtle tabular-nums">
                      #{item.number} ·{" "}
                      {formatRelativeShort(Date.parse(item.date))}
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-auto inline-flex w-fit items-center gap-1.5 pt-4 text-sm font-semibold text-fg underline-offset-4 hover:underline"
      >
        {link.label}
        <ArrowRight
          size={15}
          className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
        />
      </a>
    </div>
  );
}

import { ArrowRight, CircleDot, GitMerge } from "lucide-react";
import type { RepoActivity, RepoItem } from "@/lib/github";
import { formatRelativeShort } from "@/lib/format";
import { MESSAGES } from "@/lib/marketing/messages";
import { SOURCE_REPO_URL } from "@/lib/site";
import { MarketingSection, SectionHeading } from "./_shared";

const copy = MESSAGES.activity;

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
    <div className="flex flex-col rounded-2xl bg-panel p-5">
      <p className="text-sm font-medium text-fg">{heading}</p>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-fg-muted">{empty}</p>
      ) : (
        <ul className="mt-3 flex list-none flex-col">
          {items.map((item) => {
            const Icon = item.kind === "pr" ? GitMerge : CircleDot;
            return (
              <li key={item.number}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="-mx-2 flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-panel-2 motion-reduce:transition-none"
                >
                  <Icon
                    size={16}
                    className={
                      item.state === "merged"
                        ? "mt-0.5 shrink-0 text-success"
                        : "mt-0.5 shrink-0 text-fg-subtle"
                    }
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

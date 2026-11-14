import { randomBytes } from "node:crypto";
import type { Chapter } from "@captureflow/agent-recorder";
import type { Credentials } from "./config";

// Matches the site's share ids (lib/recording/slug.ts).
const SLUG = /^[a-zA-Z2-9]{8,16}$/;

// A share link (`…/r/<id>`) or the id alone.
export function slugFromLink(link: string): string | null {
  const raw = link.trim();
  if (SLUG.test(raw)) return raw;
  try {
    const m = /\/r\/([a-zA-Z2-9]+)\/?$/.exec(new URL(raw).pathname);
    return m && SLUG.test(m[1]!) ? m[1]! : null;
  } catch {
    return null;
  }
}

export function formatAt(ms: number): string {
  const s = Math.round(ms / 1000);
  const h = Math.floor(s / 3600);
  const mm = String(Math.floor((s % 3600) / 60));
  const ss = String(s % 60).padStart(2, "0");
  return h ? `${h}:${mm.padStart(2, "0")}:${ss}` : `${mm}:${ss}`;
}

export type ReportContext = {
  source?: {
    url?: string;
    branch?: string;
    sha?: string;
    dirty?: boolean;
    issueUrl?: string;
    reproUrl?: string;
  };
  changes?: { title: string; detail?: string }[];
  checks?: {
    name: string;
    status: "passed" | "failed" | "skipped";
    detail?: string;
  }[];
  notShown?: string[];
};

function section(heading: string, items: string[]): string[] {
  return items.length ? ["", heading, ...items.map((i) => `- ${i}`)] : [];
}

// The site shows a summary as plain text and keeps line breaks and "- " lists.
export function summaryWithContext(
  summary: string,
  context?: ReportContext,
): string {
  if (!context) return summary.trim();
  const { source = {}, changes = [], checks = [], notShown = [] } = context;
  const revision = [
    source.sha &&
      `Commit: ${source.sha}${source.dirty ? " (uncommitted changes)" : ""}`,
    source.branch && `Branch: ${source.branch}`,
    source.url && `Link: ${source.url}`,
    source.issueUrl && `Issue: ${source.issueUrl}`,
    source.reproUrl && `Bug recording: ${source.reproUrl}`,
  ].filter((line): line is string => !!line);
  return [
    summary.trim(),
    ...(revision.length ? ["", ...revision] : []),
    ...section(
      "Changes",
      changes.map((c) => `${c.title}${c.detail ? `: ${c.detail}` : ""}`),
    ),
    ...section(
      "Checks",
      checks.map(
        (c) => `${c.name}: ${c.status}${c.detail ? ` (${c.detail})` : ""}`,
      ),
    ),
    ...section("Not shown", notShown),
  ].join("\n");
}

export function reportMarkdown(
  title: string,
  video: string,
  summary: string,
  chapters: Chapter[],
): string {
  const lines = [`# ${title}`, "", `Video: ${video}`, "", summary.trim(), ""];
  if (chapters.length) {
    lines.push(
      "## Chapters",
      "",
      ...chapters.map((c) => `- ${formatAt(c.ms)} ${c.title}`),
      "",
    );
  }
  return lines.join("\n");
}

export async function putReport(
  base: string,
  creds: Credentials,
  slug: string,
  summary: string,
  chapters: Chapter[],
): Promise<void> {
  const res = await fetch(`${base}/api/r/summary-chapters/${slug}`, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${creds.token}`,
    },
    body: JSON.stringify({
      summary,
      chapters: chapters.map((c) => ({
        id: randomBytes(4).toString("hex"),
        ms: Math.round(c.ms),
        title: c.title,
      })),
    }),
  });
  if (res.status === 403) throw new Error("That recording isn't yours.");
  if (res.status === 404)
    throw new Error(
      "No finished recording has that link. Stop the recording first.",
    );
  if (!res.ok) throw new Error(`Saving the report failed (${res.status}).`);
}

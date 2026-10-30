/// <reference types="@cloudflare/workers-types" />

import {
  listWorkspacesForUser,
  type WorkspaceMembership,
} from "@captureflow/quota";
import { resolveCurrentWorkspace } from "../current-workspace";
import { searchLibrary, type SearchHit } from "../library-search";
import { DEFAULT_LIST_FILTERS, type SortOrder } from "../list-filters";
import { getRecording, getTranscript } from "../recording/db";
import { parseSummaryChaptersJson } from "../recording/summary-chapters";
import { parseRecordingConfigJson } from "../recording-config";
import {
  isSegmentCut,
  resolveTranscript,
  transcriptToVtt,
} from "../recording/transcript";
import type { RecordingCut } from "../recording/cuts";
import type {
  RecordingTranscript,
  RecordingVisibility,
} from "../recording/types";
import {
  listRecordingsForWorkspace,
  updateRecordingVisibilityForAdmin,
} from "../recordings-db";
import { viewUrlFor } from "../site";
import { canViewResource } from "../visibility";

export type McpUser = {
  userId: string;
  memberships: WorkspaceMembership[];
};

export type LibraryRecording = {
  id: string;
  title: string;
  url: string;
  createdAt: string;
  durationSeconds: number | null;
  visibility: RecordingVisibility;
  state: string;
  views: number;
};

export class LibraryError extends Error {}

export const LIST_PAGE_SIZE = 20;

export async function loadMcpUser(
  db: D1Database,
  userId: string,
): Promise<McpUser> {
  return { userId, memberships: await listWorkspacesForUser(db, userId) };
}

function summarize(row: {
  slug: string;
  title: string | null;
  createdAt: number;
  durationMs: number | null;
  visibility: RecordingVisibility;
  state: string;
  viewCount: number;
}): LibraryRecording {
  return {
    id: row.slug,
    title: row.title ?? "Untitled recording",
    url: viewUrlFor(row.slug),
    createdAt: new Date(row.createdAt).toISOString(),
    durationSeconds:
      row.durationMs === null ? null : Math.round(row.durationMs / 1000),
    visibility: row.visibility,
    state: row.state,
    views: row.viewCount,
  };
}

export function listWorkspaces(user: McpUser) {
  return user.memberships.map((m) => ({
    id: m.workspace_id,
    name: m.workspace_name,
    kind: m.workspace_kind,
    role: m.role,
  }));
}

// The workspace a tool acts in: the one asked for if the user belongs to it, else their current one.
export async function resolveWorkspaceId(
  user: McpUser,
  requested: string | undefined,
): Promise<string> {
  if (requested) {
    if (!user.memberships.some((m) => m.workspace_id === requested)) {
      throw new LibraryError("You are not a member of that workspace.");
    }
    return requested;
  }
  return (await resolveCurrentWorkspace(user.userId, null)).workspace.id;
}

export async function listRecordings(
  user: McpUser,
  args: { workspaceId?: string; page?: number; sort?: SortOrder },
): Promise<{
  workspaceId: string;
  page: number;
  recordings: LibraryRecording[];
}> {
  const workspaceId = await resolveWorkspaceId(user, args.workspaceId);
  const page = Math.max(1, args.page ?? 1);
  const rows = await listRecordingsForWorkspace(
    workspaceId,
    user.userId,
    { limit: LIST_PAGE_SIZE, offset: (page - 1) * LIST_PAGE_SIZE },
    { ...DEFAULT_LIST_FILTERS, sort: args.sort ?? "newest" },
  );
  return { workspaceId, page, recordings: rows.map(summarize) };
}

export async function searchRecordings(
  db: D1Database,
  user: McpUser,
  query: string,
  cdnBase: string,
): Promise<SearchHit[]> {
  return (await searchLibrary(db, user.userId, query, cdnBase)).filter(
    (hit) => hit.kind === "recording",
  );
}

// A recording this user may watch, or an error that doesn't say whether it exists.
async function viewableRecording(user: McpUser, slug: string) {
  const row = await getRecording(slug);
  const visitor = {
    userId: user.userId,
    workspaceIds: user.memberships.map((m) => m.workspace_id),
  };
  if (!row || row.state !== "ready" || !canViewResource(visitor, row)) {
    throw new LibraryError("No recording you can see has that id.");
  }
  return row;
}

export async function getRecordingDetails(user: McpUser, slug: string) {
  const row = await viewableRecording(user, slug);
  const { summary, chapters } = parseSummaryChaptersJson(
    row.summaryChaptersJson,
  );
  return {
    ...summarize(row),
    summary: summary || null,
    chapters,
  };
}

function timestamp(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const m = Math.floor(seconds / 60);
  return `${m}:${String(seconds % 60).padStart(2, "0")}`;
}

// What the player says aloud: segments the owner cut out are left out.
export function transcriptToText(
  transcript: RecordingTranscript,
  cuts: readonly RecordingCut[] = [],
): string {
  return transcript.segments
    .filter((s) => !isSegmentCut(s, cuts))
    .map((s) => `[${timestamp(s.startMs)}] ${s.text.trim()}`)
    .join("\n");
}

export async function getRecordingTranscript(
  user: McpUser,
  slug: string,
  format: "text" | "vtt",
): Promise<{ status: string; transcript: string | null }> {
  const row = await viewableRecording(user, slug);
  const { cuts } = parseRecordingConfigJson(row.configJson);
  const resolved = resolveTranscript(await getTranscript(slug));
  if (!resolved.transcript) {
    return { status: resolved.status, transcript: null };
  }
  return {
    status: resolved.status,
    transcript:
      format === "vtt"
        ? transcriptToVtt(resolved.transcript, cuts)
        : transcriptToText(resolved.transcript, cuts),
  };
}

// The uploader or the owner of the recording's workspace, as on the dashboard.
export async function setRecordingVisibility(
  user: McpUser,
  slug: string,
  visibility: RecordingVisibility,
): Promise<{ id: string; visibility: RecordingVisibility; url: string }> {
  const changed = await updateRecordingVisibilityForAdmin(
    user.userId,
    slug,
    visibility,
  );
  if (!changed) {
    throw new LibraryError(
      "Only the person who recorded it or the workspace owner can change who sees it.",
    );
  }
  return { id: slug, visibility, url: viewUrlFor(slug) };
}

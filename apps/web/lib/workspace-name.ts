import { fmt } from "./i18n/format";

export const WORKSPACE_NAME_MAX = 80;

export type WorkspaceNameResult =
  | { ok: true; name: string }
  | { ok: false; error: string };

export type WorkspaceNameCopy = { empty: string; tooLong: string };

// `copy.tooLong` carries a {max} placeholder for the length limit.
export function hydrateWorkspaceName(
  raw: unknown,
  copy: WorkspaceNameCopy,
): WorkspaceNameResult {
  const name = typeof raw === "string" ? raw.trim() : "";
  if (!name) return { ok: false, error: copy.empty };
  if (name.length > WORKSPACE_NAME_MAX) {
    return {
      ok: false,
      error: fmt(copy.tooLong, { max: WORKSPACE_NAME_MAX }),
    };
  }
  return { ok: true, name };
}

export const WORKSPACE_NAME_MAX = 80;

export type WorkspaceNameResult =
  | { ok: true; name: string }
  | { ok: false; error: string };

export function hydrateWorkspaceName(raw: unknown): WorkspaceNameResult {
  const name = typeof raw === "string" ? raw.trim() : "";
  if (!name) return { ok: false, error: "Workspace name can’t be empty" };
  if (name.length > WORKSPACE_NAME_MAX) {
    return {
      ok: false,
      error: `Workspace name is too long (max ${WORKSPACE_NAME_MAX} chars)`,
    };
  }
  return { ok: true, name };
}

// A workspace the signed-in user can save recordings to, as the auth probe
// last listed them. isDefault marks the one the dashboard currently points at.
export type UserWorkspace = {
  id: string;
  name: string;
  kind: "personal" | "team";
  role: "owner" | "member";
  isDefault: boolean;
};

const str = (v: unknown): string | null =>
  typeof v === "string" && v.length > 0 ? v : null;

export function hydrateUserWorkspaces(raw: unknown): UserWorkspace[] {
  if (!Array.isArray(raw)) return [];
  const out: UserWorkspace[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;
    const id = str(r.id);
    const name = str(r.name);
    if (!id || !name) continue;
    out.push({
      id,
      name,
      kind: r.kind === "team" ? "team" : "personal",
      role: r.role === "member" ? "member" : "owner",
      isDefault: r.isDefault === true,
    });
  }
  return out;
}

// The workspace a recording goes to: the picked one while it is still listed,
// otherwise the default, so a workspace left or deleted never strands uploads.
export function resolveUploadWorkspace(
  workspaces: UserWorkspace[],
  pickedId: string | undefined,
): UserWorkspace | null {
  return (
    workspaces.find((w) => w.id === pickedId) ??
    workspaces.find((w) => w.isDefault) ??
    workspaces[0] ??
    null
  );
}

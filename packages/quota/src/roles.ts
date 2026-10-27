/*
 * Workspace roles and what each may do. Every role check in the product goes
 * through `can`, so a new role or permission is one row here, not a sweep of
 * string comparisons.
 */

export type WorkspaceRole = "owner" | "member" | "viewer";

export const WORKSPACE_ROLES: readonly WorkspaceRole[] = [
  "owner",
  "member",
  "viewer",
];

// What an invite or a role change may hand out; ownership is never assigned.
export type AssignableRole = Exclude<WorkspaceRole, "owner">;

export type WorkspaceAction =
  | "view"
  | "comment"
  | "record"
  | "invite"
  | "manage-members"
  | "manage-workspace"
  | "leave";

const PERMISSIONS: Record<WorkspaceRole, ReadonlySet<WorkspaceAction>> = {
  owner: new Set([
    "view",
    "comment",
    "record",
    "invite",
    "manage-members",
    "manage-workspace",
  ]),
  member: new Set(["view", "comment", "record", "leave"]),
  viewer: new Set(["view", "comment", "leave"]),
};

export function can(
  role: WorkspaceRole | null | undefined,
  action: WorkspaceAction,
): boolean {
  return role != null && PERMISSIONS[role].has(action);
}

// Seats are the people who record; viewers are free on every plan.
export function isSeatRole(role: WorkspaceRole): boolean {
  return can(role, "record");
}

export function isWorkspaceRole(value: unknown): value is WorkspaceRole {
  return (
    typeof value === "string" &&
    (WORKSPACE_ROLES as readonly string[]).includes(value)
  );
}

export function isAssignableRole(value: unknown): value is AssignableRole {
  return value === "member" || value === "viewer";
}

// A stored role the code no longer knows reads as the least privileged one.
export function hydrateWorkspaceRole(raw: unknown): WorkspaceRole {
  return isWorkspaceRole(raw) ? raw : "viewer";
}

// A form that names no role, or an unknown one, grants a member: the role
// every invite granted before viewers existed.
export function hydrateAssignableRole(raw: unknown): AssignableRole {
  return isAssignableRole(raw) ? raw : "member";
}

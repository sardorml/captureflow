export type AdminRole = "owner" | "admin" | "viewer";

export type AdminStatus = "active" | "disabled";

export type AdminPermission =
  | "users.read"
  | "users.write"
  | "audit.read"
  | "admins.manage"
  | "mail.send";

export const ADMIN_ROLES = ["owner", "admin", "viewer"] as const;

const ROLE_PERMISSIONS: Record<AdminRole, readonly AdminPermission[]> = {
  owner: [
    "users.read",
    "users.write",
    "audit.read",
    "admins.manage",
    "mail.send",
  ],
  admin: ["users.read", "users.write", "audit.read"],
  viewer: ["users.read", "audit.read"],
};

export const ROLE_SUMMARY: Record<AdminRole, string> = {
  owner: "Everything, including managing admins.",
  admin: "View users and workspaces, and change storage and plans.",
  viewer: "Read-only access to users, workspaces and the audit log.",
};

export function can(role: AdminRole, permission: AdminPermission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export type AdminRole = "owner" | "admin" | "viewer";

export type AdminStatus = "active" | "disabled";

export type AdminPermission =
  | "users.read"
  | "users.write"
  | "audit.read"
  | "admins.manage";

export const ADMIN_ROLES = ["owner", "admin", "viewer"] as const;

const ROLE_PERMISSIONS: Record<AdminRole, readonly AdminPermission[]> = {
  owner: ["users.read", "users.write", "audit.read", "admins.manage"],
  admin: ["users.read", "users.write", "audit.read"],
  viewer: ["users.read", "audit.read"],
};

export const ROLE_SUMMARY: Record<AdminRole, string> = {
  owner: "Everything, including managing admins.",
  admin: "View users and change their quotas.",
  viewer: "Read-only access to users and the audit log.",
};

export function can(role: AdminRole, permission: AdminPermission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

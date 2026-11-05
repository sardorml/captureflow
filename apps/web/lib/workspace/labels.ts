import { type AssignableRole, type WorkspaceRole } from "@captureflow/quota";

export const ROLE_LABEL: Record<WorkspaceRole, string> = {
  owner: "Admin",
  member: "Member",
  viewer: "Viewer",
};

export type AssignableRoleOption = {
  id: AssignableRole;
  label: string;
  hint: string;
};

const ASSIGNABLE_ROLES: {
  id: AssignableRole;
  label: string;
  does: string;
  costs: string;
}[] = [
  {
    id: "member",
    label: "Member",
    does: "Records into this workspace.",
    costs: "A paid seat on Light and Pro.",
  },
  {
    id: "viewer",
    label: "Viewer",
    does: "Watches and comments.",
    costs: "Always free.",
  },
];

// A self-hosted instance has no plans, so its hints leave the price out.
export function assignableRoles(selfHosted: boolean): AssignableRoleOption[] {
  return ASSIGNABLE_ROLES.map(({ id, label, does, costs }) => ({
    id,
    label,
    hint: selfHosted ? does : `${does} ${costs}`,
  }));
}

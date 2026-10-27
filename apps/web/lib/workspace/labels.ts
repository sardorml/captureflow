import {
  SEAT_PLAN,
  type AssignableRole,
  type WorkspaceRole,
} from "@captureflow/quota";

export const ROLE_LABEL: Record<WorkspaceRole, string> = {
  owner: "Admin",
  member: "Member",
  viewer: "Viewer",
};

export const ASSIGNABLE_ROLES: {
  id: AssignableRole;
  label: string;
  hint: string;
}[] = [
  {
    id: "member",
    label: "Member",
    hint: `Records into this workspace. A paid seat on the ${SEAT_PLAN.name} plan.`,
  },
  {
    id: "viewer",
    label: "Viewer",
    hint: "Watches and comments. Always free.",
  },
];

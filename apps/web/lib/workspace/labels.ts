import type { AssignableRole } from "@captureflow/quota";
import type { AppMessages } from "@/lib/i18n/app/messages";

export type AssignableRoleOption = {
  id: AssignableRole;
  label: string;
  hint: string;
};

const ASSIGNABLE_ROLES: AssignableRole[] = ["member", "viewer"];

// A self-hosted instance has no plans, so its hints leave the price out.
export function assignableRoles(
  selfHosted: boolean,
  copy: Pick<AppMessages["members"], "roles" | "roleHints">,
): AssignableRoleOption[] {
  return ASSIGNABLE_ROLES.map((id) => {
    const { does, costs } = copy.roleHints[id];
    return {
      id,
      label: copy.roles[id],
      hint: selfHosted ? does : `${does} ${costs}`,
    };
  });
}

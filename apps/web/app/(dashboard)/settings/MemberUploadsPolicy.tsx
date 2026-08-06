"use client";

import { Users, UserX } from "lucide-react";
import { setMemberUploadsPolicyAction } from "./actions";
import { PolicyCardButton } from "./PolicyCardButton";

export function MemberUploadsPolicy({
  allowMemberUploads,
}: {
  allowMemberUploads: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <form action={setMemberUploadsPolicyAction}>
        <input type="hidden" name="allow_member_uploads" value="1" />
        <PolicyCardButton
          active={allowMemberUploads}
          icon={<Users size={20} />}
          title="Allow teammates to post here"
          body="Members can record into this workspace."
        />
      </form>
      <form action={setMemberUploadsPolicyAction}>
        <input type="hidden" name="allow_member_uploads" value="0" />
        <PolicyCardButton
          active={!allowMemberUploads}
          icon={<UserX size={20} />}
          title="Only the workspace owner"
          body="Teammate uploads go to their personal workspace."
        />
      </form>
    </div>
  );
}

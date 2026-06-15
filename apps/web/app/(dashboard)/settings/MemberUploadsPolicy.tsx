'use client';

import { Users, UserX } from 'lucide-react';
import { setMemberUploadsPolicyAction } from './actions';
import { PolicyCardButton } from './PolicyCardButton';

// Mirrors AccessPolicy's two-card pattern. Pending state lives in the
// shared PolicyCardButton so both policies read identically.

export function MemberUploadsPolicy({
  allowMemberUploads,
}: {
  allowMemberUploads: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <form action={setMemberUploadsPolicyAction}>
        <input type="hidden" name="allow_member_uploads" value="1" />
        <PolicyCardButton
          active={allowMemberUploads}
          icon={<Users className="h-5 w-5" />}
          title="Allow teammates to post here"
          body="Members can pick this workspace in the desktop chip and record into it."
        />
      </form>
      <form action={setMemberUploadsPolicyAction}>
        <input type="hidden" name="allow_member_uploads" value="0" />
        <PolicyCardButton
          active={!allowMemberUploads}
          icon={<UserX className="h-5 w-5" />}
          title="Only the workspace owner"
          body="Teammate uploads fall back to their personal workspace."
        />
      </form>
    </div>
  );
}

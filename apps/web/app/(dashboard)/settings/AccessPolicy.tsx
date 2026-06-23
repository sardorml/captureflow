'use client';

import { Globe, Lock } from 'lucide-react';
import { setPublicLinksPolicyAction } from './actions';
import { PolicyCardButton } from './PolicyCardButton';

// Two-card radio for the public-links policy. Picking a card immediately
// submits a hidden form — no "Save" button. Pending state lives inside
// PolicyCardButton via useFormStatus so the clicked card shows a spinner
// while the server action runs.

export function AccessPolicy({
  allowPublicLinks,
}: {
  allowPublicLinks: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <form action={setPublicLinksPolicyAction}>
        <input type="hidden" name="allow_public_links" value="1" />
        <PolicyCardButton
          active={allowPublicLinks}
          icon={<Globe className="h-5 w-5" />}
          title="Allow public links"
          body="Members can share recordings + snaps to anyone with the URL."
        />
      </form>
      <form action={setPublicLinksPolicyAction}>
        <input type="hidden" name="allow_public_links" value="0" />
        <PolicyCardButton
          active={!allowPublicLinks}
          icon={<Lock className="h-5 w-5" />}
          title="Only workspace members can view"
          body="Public visibility is hidden; new uploads default to workspace-only."
        />
      </form>
    </div>
  );
}

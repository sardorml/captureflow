'use client';

import {
  AvatarGroup,
  AvatarInviteSlot,
  type AvatarGroupItem,
} from '@captureflow/ui';
import { InviteModal } from './InviteModal';

// Loom-style avatar stack rendered under the workspace switcher. Shows
// up to N member initials with a dashed "+" placeholder at the tail
// that opens the InviteModal. Owner-only: members can see the roster
// on /members but the invite affordance lives behind the same gate as
// the server-side invite action.

type Props = {
  items: AvatarGroupItem[];
  canInvite: boolean;
};

export function WorkspaceMembersStack({ items, canInvite }: Props) {
  if (items.length === 0 && !canInvite) return null;
  return (
    <AvatarGroup
      items={items}
      max={4}
      inviteSlot={
        canInvite ? <InviteModal trigger={<AvatarInviteSlot />} /> : undefined
      }
    />
  );
}

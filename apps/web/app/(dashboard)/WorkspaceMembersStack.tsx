'use client';

import {
  AvatarGroup,
  AvatarInviteSlot,
  type AvatarGroupItem,
} from '@captureflow/ui';
import { InviteModal } from './InviteModal';

// Member avatar stack with a trailing "+" slot that opens the InviteModal.
// The invite slot is gated to owners, matching the server-side invite action.

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

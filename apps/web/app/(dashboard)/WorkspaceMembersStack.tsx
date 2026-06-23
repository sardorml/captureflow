'use client';

import {
  AvatarGroup,
  AvatarInviteSlot,
  type AvatarGroupItem,
} from '@captureflow/ui';
import { InviteModal } from './InviteModal';

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

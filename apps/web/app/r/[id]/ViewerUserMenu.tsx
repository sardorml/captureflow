'use client';

import { useRouter } from 'next/navigation';
import { initials } from '@/lib/format';
import { useState } from 'react';
import { LayoutDashboard, LogOut, Settings } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  SmoothDropdownMenu,
  SmoothDropdownMenuContent,
  SmoothDropdownMenuItem,
  SmoothDropdownMenuSeparator,
  SmoothDropdownMenuTrigger,
} from '@captureflow/ui';

type Props = {
  userId: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
  appWebUrl: string;
  signOutReturnUrl?: string;
};

export function ViewerUserMenu({
  userId,
  name,
  email,
  imageUrl,
  appWebUrl,
  signOutReturnUrl,
}: Props) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const displayName = name?.trim() || email;
  const dashboardUrl = `${appWebUrl}/shares`;
  const settingsUrl = `${appWebUrl}/settings`;

  const onSignOut = () => {
    if (signingOut) return;
    setSigningOut(true);
    const back =
      signOutReturnUrl ??
      (typeof window !== 'undefined' ? window.location.href : '/');
    window.location.href = `${appWebUrl}/auth/clear?next=${encodeURIComponent(
      back
    )}`;
    router.refresh();
  };

  return (
    <SmoothDropdownMenu>
      <SmoothDropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
        >
          <Avatar className="h-9 w-9">
            {imageUrl ? <AvatarImage src={imageUrl} alt="" /> : null}
            <AvatarFallback seed={userId}>
              {initials(displayName)}
            </AvatarFallback>
          </Avatar>
        </button>
      </SmoothDropdownMenuTrigger>
      <SmoothDropdownMenuContent align="end" className="min-w-[16rem]">
        <div className="flex items-center gap-3 px-2.5 py-2">
          <Avatar className="h-9 w-9">
            {imageUrl ? <AvatarImage src={imageUrl} alt="" /> : null}
            <AvatarFallback seed={userId}>
              {initials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-100">
              {displayName}
            </p>
            <p className="truncate text-xs text-neutral-500">{email}</p>
          </div>
        </div>
        <SmoothDropdownMenuSeparator />
        <SmoothDropdownMenuItem asChild>
          <a href={dashboardUrl}>
            <LayoutDashboard className="h-4 w-4 text-neutral-500" />
            Dashboard
          </a>
        </SmoothDropdownMenuItem>
        <SmoothDropdownMenuItem asChild>
          <a href={settingsUrl}>
            <Settings className="h-4 w-4 text-neutral-500" />
            Workspace settings
          </a>
        </SmoothDropdownMenuItem>
        <SmoothDropdownMenuSeparator />
        <SmoothDropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            onSignOut();
          }}
          disabled={signingOut}
        >
          <LogOut className="h-4 w-4 text-neutral-500" />
          {signingOut ? 'Signing out…' : 'Sign out'}
        </SmoothDropdownMenuItem>
      </SmoothDropdownMenuContent>
    </SmoothDropdownMenu>
  );
}


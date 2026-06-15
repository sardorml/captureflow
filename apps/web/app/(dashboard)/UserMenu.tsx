'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import {
  HardDrive,
  LogOut,
  Settings,
  Sparkles,
  UserCircle,
} from 'lucide-react';
import { signOut } from '@/lib/auth-client';
import { Avatar, AvatarFallback, AvatarImage } from '@captureflow/ui';
import {
  SmoothDropdownMenu,
  SmoothDropdownMenuContent,
  SmoothDropdownMenuItem,
  SmoothDropdownMenuSeparator,
  SmoothDropdownMenuTrigger,
} from '@captureflow/ui';

type ProInfo = {
  cycle: 'monthly' | 'annual';
  status: string;
};

type Props = {
  userId: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
  pro: ProInfo | null;
};

function initials(name: string | null, email: string): string {
  const source = (name ?? '').trim() || email;
  return source
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function UserMenu({ userId, name, email, imageUrl, pro }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const displayName = name?.trim() || email;

  const onSignOut = async () => {
    if (pending) return;
    setPending(true);
    await signOut();
    router.replace('/login');
  };

  return (
    <SmoothDropdownMenu>
      <SmoothDropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
        >
          <Avatar className="h-9 w-9">
            {imageUrl ? <AvatarImage src={imageUrl} alt="" /> : null}
            <AvatarFallback seed={userId}>
              {initials(name, email)}
            </AvatarFallback>
          </Avatar>
        </button>
      </SmoothDropdownMenuTrigger>
      <SmoothDropdownMenuContent align="end" className="min-w-[16rem]">
        <div className="flex items-center gap-3 px-2.5 py-2">
          <Avatar className="h-9 w-9">
            {imageUrl ? <AvatarImage src={imageUrl} alt="" /> : null}
            <AvatarFallback seed={userId}>
              {initials(name, email)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-medium text-neutral-100">
                {displayName}
              </p>
              {pro && (
                <span
                  className="inline-flex items-center gap-0.5 rounded-full bg-overlay px-1.5 text-[10px] font-semibold text-neutral-200 ring-1 ring-line-strong"
                  title={`Pro · ${
                    pro.cycle === 'annual' ? 'Annual' : 'Monthly'
                  }`}
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  Pro
                </span>
              )}
            </div>
            <p className="truncate text-xs text-neutral-500">{email}</p>
          </div>
        </div>
        <SmoothDropdownMenuSeparator />
        <SmoothDropdownMenuItem asChild>
          <Link href="/profile">
            <UserCircle className="h-4 w-4 text-neutral-500" />
            Profile settings
          </Link>
        </SmoothDropdownMenuItem>
        <SmoothDropdownMenuItem asChild>
          <Link href="/devices">
            <HardDrive className="h-4 w-4 text-neutral-500" />
            Connected devices
          </Link>
        </SmoothDropdownMenuItem>
        <SmoothDropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="h-4 w-4 text-neutral-500" />
            Workspace settings
          </Link>
        </SmoothDropdownMenuItem>
        <SmoothDropdownMenuSeparator />
        <SmoothDropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            onSignOut();
          }}
          disabled={pending}
        >
          <LogOut className="h-4 w-4 text-neutral-500" />
          {pending ? 'Signing out…' : 'Sign out'}
        </SmoothDropdownMenuItem>
      </SmoothDropdownMenuContent>
    </SmoothDropdownMenu>
  );
}

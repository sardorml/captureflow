'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, Link2, Settings, Users } from 'lucide-react';

// Loom-style grouped sidebar nav. Primary nav (content the viewer
// owns + a quick invite shortcut) at the top, then an "Admin tools"
// section below the divider that's only rendered for workspace
// owners.

type NavItem = {
  href: string;
  label: string;
  icon: typeof Link2;
};

const PRIMARY: NavItem[] = [
  { href: '/shares', label: 'Shares', icon: Link2 },
  { href: '/snaps', label: 'Snaps', icon: Camera },
];

const ADMIN: NavItem[] = [
  { href: '/members', label: 'Members', icon: Users },
  { href: '/settings', label: 'Workspace', icon: Settings },
];

export function SidebarNav({ isOwner }: { isOwner: boolean }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-4">
      <div className="flex flex-col gap-0.5 px-2">
        {PRIMARY.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </div>

      {isOwner && (
        <div className="flex flex-col gap-0.5 px-2">
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            Admin tools
          </p>
          {ADMIN.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>
      )}
    </nav>
  );
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active =
    pathname === item.href ||
    (item.href !== '/' && pathname.startsWith(item.href + '/'));
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={
        'group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ' +
        (active
          ? 'bg-accent-soft text-accent'
          : 'text-fg-muted hover:bg-overlay hover:text-fg')
      }
    >
      <Icon
        className={
          'h-4 w-4 transition-colors ' +
          (active ? 'text-accent' : 'text-fg-subtle group-hover:text-fg')
        }
      />
      <span>{item.label}</span>
    </Link>
  );
}

import { Bell, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getActiveProSubscription } from '@captureflow/quota';
import { getAppWebEnv } from '@/lib/cf-env';
import { requireSession } from '@/lib/session-guard';
import {
  Button,
  SmoothButton,
  ThemeToggle,
  readThemeFromCookieHeader,
} from '@captureflow/ui';
import { SearchTrigger } from './SearchTrigger';
import { UpgradeModal } from './UpgradeModal';
import { UserMenu } from './UserMenu';

// Dashboard topbar. Server component — fetches the subscription here so
// the dropdown can surface the Pro chip without an extra client round-trip.

export async function TopBar() {
  const session = await requireSession();
  const env = await getAppWebEnv();
  const [subscription, userRow] = env?.DB
    ? await Promise.all([
        getActiveProSubscription(env.DB, session.user.id),
        env.DB.prepare(`SELECT image FROM users WHERE id = ?1 LIMIT 1`)
          .bind(session.user.id)
          .first<{ image: string | null }>(),
      ])
    : [null, null];
  const userImage = userRow?.image ?? null;
  const cookieHeader = (await headers()).get('cookie');
  const theme = readThemeFromCookieHeader(cookieHeader);

  // Hide the Upgrade CTA for active Pro subscribers; free and lifetime
  // users still see it.
  const isPro = subscription?.status === 'active';

  return (
    <div className="flex items-center justify-between gap-4 border-b border-line bg-canvas-2 px-6 py-3">
      <div className="flex min-w-0 flex-1 justify-center">
        <SearchTrigger />
      </div>
      <div className="flex items-center gap-2">
        {!isPro && (
          <UpgradeModal
            email={session.user.email}
            trigger={
              <SmoothButton variant="candy" size="sm" className="gap-1.5">
                <Sparkles className="h-4 w-4" />
                Upgrade
              </SmoothButton>
            }
          />
        )}
        <ThemeToggle initialTheme={theme} />
        <Button
          asChild
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          title="Notifications"
          className="relative h-10 w-10"
        >
          <Link href="/notifications">
            <Bell className="h-5 w-5" />
          </Link>
        </Button>
        <UserMenu
          userId={session.user.id}
          name={session.user.name ?? null}
          email={session.user.email}
          imageUrl={userImage}
          pro={
            subscription
              ? {
                  cycle: subscription.cycle,
                  status: subscription.status,
                }
              : null
          }
        />
      </div>
    </div>
  );
}

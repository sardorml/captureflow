import { Suspense } from "react";
import { headers } from "next/headers";
import { Button, Skeleton } from "@heroui/react";
import {
  getActiveGrantedPlan,
  getActiveProSubscription,
  isSelfHosted,
} from "@captureflow/quota";
import { getAppWebEnv } from "@/lib/cf-env";
import type { requireSession } from "@/lib/session-guard";
import { readThemePreferenceFromCookieHeader } from "@captureflow/ui/theme";
import { NotificationsMenu } from "@/app/_components/NotificationsMenu";
import { SplitLoaded } from "@/components/dev/split-loaded";
import { SearchTrigger } from "./SearchTrigger";
import { UpgradeModal } from "./UpgradeModal";
import { UserMenu } from "./UserMenu";

type Session = Awaited<ReturnType<typeof requireSession>>;

// The search field paints with the shell; only the account menu waits for
// its plan and avatar queries, behind a stand-in of the same size.
export async function TopBar({ session }: { session: Session }) {
  const selfHosted = isSelfHosted(await getAppWebEnv());
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <SplitLoaded name="top-bar" />
      {/* Below md the drawer toggle takes this slot instead — see DashboardShell. */}
      <div className="hidden min-w-0 flex-1 justify-center md:flex">
        <SearchTrigger />
      </div>
      {/* ml-auto because below md the search slot is display:none, which leaves
          justify-between a single child to push around. */}
      <div className="ml-auto flex items-center gap-2">
        <Suspense fallback={<AccountSkeleton withUpgrade={!selfHosted} />}>
          <Account session={session} selfHosted={selfHosted} />
        </Suspense>
      </div>
    </div>
  );
}

function AccountSkeleton({ withUpgrade }: { withUpgrade: boolean }) {
  return (
    <>
      {withUpgrade && <Skeleton className="h-10 w-[109px] rounded-xl md:h-9" />}
      <Skeleton className="h-10 w-10 rounded-xl md:h-9 md:w-9" />
      <Skeleton className="h-9 w-9 rounded-full" />
    </>
  );
}

async function Account({
  session,
  selfHosted,
}: {
  session: Session;
  selfHosted: boolean;
}) {
  const env = await getAppWebEnv();
  const [subscription, grant, userRow] = env?.DB
    ? await Promise.all([
        getActiveProSubscription(env.DB, session.user.id),
        getActiveGrantedPlan(env.DB, session.user.id),
        env.DB.prepare(`SELECT image FROM users WHERE id = ?1 LIMIT 1`)
          .bind(session.user.id)
          .first<{ image: string | null }>(),
      ])
    : [null, null, null];
  const themePreference = readThemePreferenceFromCookieHeader(
    (await headers()).get("cookie"),
  );

  const isPro = subscription?.status === "active" || grant !== null;

  return (
    <>
      {!isPro && !selfHosted && (
        <UpgradeModal
          email={session.user.email}
          userId={session.user.id}
          trigger={<Button variant="primary">Upgrade</Button>}
        />
      )}
      <NotificationsMenu />
      <UserMenu
        themePreference={themePreference}
        userId={session.user.id}
        name={session.user.name ?? null}
        email={session.user.email}
        imageUrl={userRow?.image ?? null}
        selfHosted={selfHosted}
        pro={
          subscription
            ? { status: subscription.status }
            : grant
              ? { status: "granted" }
              : null
        }
      />
    </>
  );
}

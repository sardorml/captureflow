import { Suspense } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { Sparkle } from "lucide-react";
import { Button, Skeleton, buttonVariants } from "@heroui/react";
import {
  DEFAULT_SEAT_PLAN_ID,
  getSeatPlan,
  hasSeatRequest,
  isSeatRole,
  isSelfHosted,
} from "@captureflow/quota";
import { getAppWebEnv } from "@/lib/cf-env";
import { resolveCurrentWorkspace } from "@/lib/current-workspace";
import { getWorkspaceSeatContext } from "@/lib/billing/seats";
import { loadNotificationFeed } from "@/lib/notification-feed";
import type { requireSession } from "@/lib/session-guard";
import { readThemePreferenceFromCookieHeader } from "@captureflow/ui/theme";
import { NotificationsMenu } from "@/app/_components/NotificationsMenu";
import { SplitLoaded } from "@/components/dev/split-loaded";
import { SearchTrigger } from "./SearchTrigger";
import { RequestSeatButton } from "./RequestSeatButton";
import { UpgradeModal } from "./UpgradeModal";
import { UserMenu } from "./UserMenu";

type Session = Awaited<ReturnType<typeof requireSession>>;

const NOTIFICATION_MENU_LIMIT = 6;

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
  const current = await resolveCurrentWorkspace(
    session.user.id,
    session.user.name ?? null,
  );
  const isViewer = current.role === "viewer";
  const [userRow, seat, seatRequested, feed] = env?.DB
    ? await Promise.all([
        env.DB.prepare(`SELECT image FROM users WHERE id = ?1 LIMIT 1`)
          .bind(session.user.id)
          .first<{ image: string | null }>(),
        getWorkspaceSeatContext(current.workspace),
        isViewer
          ? hasSeatRequest(env.DB, current.workspace.id, session.user.id)
          : false,
        loadNotificationFeed(session.user, NOTIFICATION_MENU_LIMIT),
      ])
    : [null, null, false, null];
  const themePreference = readThemePreferenceFromCookieHeader(
    (await headers()).get("cookie"),
  );

  // The upgrade is the workspace's, so only its owner is offered one.
  const offer = current.role === "owner" ? (seat?.offer ?? null) : null;
  const isOwner = current.role === "owner";
  const plan =
    seat?.entitlement.tier === "team"
      ? (seat.entitlement.plan ?? DEFAULT_SEAT_PLAN_ID)
      : "free";
  // A viewer holds no seat, so the workspace's plan isn't theirs to show.
  const showPlan = plan !== "free" && isSeatRole(current.role) && !selfHosted;

  return (
    <>
      {offer && !selfHosted && (
        <UpgradeModal
          email={session.user.email}
          userId={session.user.id}
          seat={offer}
          trigger={<Button variant="primary">Upgrade</Button>}
        />
      )}
      {showPlan &&
        (isOwner ? (
          <Link
            href="/billing"
            className={buttonVariants({ variant: "secondary" })}
          >
            <Sparkle size={14} className="fill-current" />
            {getSeatPlan(plan).name}
          </Link>
        ) : (
          <span className={buttonVariants({ variant: "secondary" })}>
            <Sparkle size={14} className="fill-current" />
            {getSeatPlan(plan).name}
          </span>
        ))}
      {isViewer && !selfHosted && (
        <RequestSeatButton requested={seatRequested} />
      )}
      <NotificationsMenu feed={feed} />
      <UserMenu
        themePreference={themePreference}
        userId={session.user.id}
        name={session.user.name ?? null}
        email={session.user.email}
        imageUrl={userRow?.image ?? null}
        selfHosted={selfHosted}
        plan={plan}
        billing={isOwner}
      />
    </>
  );
}

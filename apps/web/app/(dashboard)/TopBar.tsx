import { Sparkles } from "lucide-react";
import { headers } from "next/headers";
import { Button } from "@heroui/react";
import {
  getActiveGrantedPlan,
  getActiveProSubscription,
  isSelfHosted,
} from "@captureflow/quota";
import { getAppWebEnv } from "@/lib/cf-env";
import { requireSession } from "@/lib/session-guard";
import { readThemePreferenceFromCookieHeader } from "@captureflow/ui";
import { NotificationsMenu } from "@/app/_components/NotificationsMenu";
import { SearchTrigger } from "./SearchTrigger";
import { UpgradeModal } from "./UpgradeModal";
import { UserMenu } from "./UserMenu";

export async function TopBar() {
  const session = await requireSession();
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
  const userImage = userRow?.image ?? null;
  const cookieHeader = (await headers()).get("cookie");
  const themePreference = readThemePreferenceFromCookieHeader(cookieHeader);

  const isPro = subscription?.status === "active" || grant !== null;
  const selfHosted = isSelfHosted(env);

  return (
    <div className="flex w-full items-center justify-between gap-4">
      {/* Below md the drawer toggle takes this slot instead — see DashboardShell. */}
      <div className="hidden min-w-0 flex-1 justify-center md:flex">
        <SearchTrigger />
      </div>
      {/* ml-auto because below md the search slot is display:none, which leaves
          justify-between a single child to push around. */}
      <div className="ml-auto flex items-center gap-2">
        {!isPro && !selfHosted && (
          <UpgradeModal
            email={session.user.email}
            userId={session.user.id}
            openOnUpgradeParam
            trigger={
              <Button variant="primary">
                <Sparkles size={16} />
                Upgrade
              </Button>
            }
          />
        )}
        <NotificationsMenu />
        <UserMenu
          themePreference={themePreference}
          userId={session.user.id}
          name={session.user.name ?? null}
          email={session.user.email}
          imageUrl={userImage}
          selfHosted={selfHosted}
          pro={
            subscription
              ? { status: subscription.status }
              : grant
                ? { status: "granted" }
                : null
          }
        />
      </div>
    </div>
  );
}

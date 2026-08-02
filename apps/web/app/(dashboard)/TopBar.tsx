import { Bell, Sparkles } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { Button } from "@heroui/react";
import { getActiveProSubscription } from "@captureflow/quota";
import { getAppWebEnv } from "@/lib/cf-env";
import { requireSession } from "@/lib/session-guard";
import { ThemeToggle, readThemeFromCookieHeader } from "@captureflow/ui";
import { SearchTrigger } from "./SearchTrigger";
import { UpgradeModal } from "./UpgradeModal";
import { UserMenu } from "./UserMenu";

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
  const cookieHeader = (await headers()).get("cookie");
  const theme = readThemeFromCookieHeader(cookieHeader);

  const isPro = subscription?.status === "active";

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex min-w-0 flex-1 justify-center">
        <SearchTrigger />
      </div>
      <div className="flex items-center gap-2">
        {!isPro && (
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
        <ThemeToggle initialTheme={theme} className="h-8 w-8" />
        <Link
          href="/notifications"
          title="Notifications"
          className="inline-flex"
        >
          <Button variant="ghost" isIconOnly aria-label="Notifications">
            <Bell size={18} />
          </Button>
        </Link>
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

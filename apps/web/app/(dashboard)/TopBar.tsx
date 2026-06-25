import { Bell, Sparkles } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { Button, Flex } from "antd";
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
    <Flex
      align="center"
      justify="space-between"
      gap={16}
      style={{ width: "100%" }}
    >
      <Flex flex={1} justify="center" style={{ minWidth: 0 }}>
        <SearchTrigger />
      </Flex>
      <Flex align="center" gap={8}>
        {!isPro && (
          <UpgradeModal
            email={session.user.email}
            trigger={
              <Button type="primary" icon={<Sparkles size={16} />}>
                Upgrade
              </Button>
            }
          />
        )}
        <ThemeToggle initialTheme={theme} className="h-8 w-8" />
        <Link
          href="/notifications"
          title="Notifications"
          style={{ display: "inline-flex" }}
        >
          <Button
            type="text"
            icon={<Bell size={18} />}
            aria-label="Notifications"
          />
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
      </Flex>
    </Flex>
  );
}

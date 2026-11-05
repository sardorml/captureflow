import { requireSession } from "@/lib/session-guard";
import { getAppWebEnv } from "@/lib/cf-env";
import { getAppI18n } from "@/lib/i18n/app/server";
import { PageHeader } from "../../PageHeader";
import { SettingsCard } from "../../WorkspacePageHeader";
import { AccountForm } from "../AccountForm";
import { LanguageSetting } from "../LanguageSetting";

export const dynamic = "force-dynamic";

export default async function PersonalSettingsPage() {
  const session = await requireSession();
  const user = session.user;
  const env = await getAppWebEnv();
  const { messages: m } = await getAppI18n();

  // Read the image column directly: the better-auth session payload doesn't
  // always carry it.
  let imageUrl: string | null = null;
  if (env?.DB) {
    const row = await env.DB.prepare(
      `SELECT image FROM users WHERE id = ?1 LIMIT 1`,
    )
      .bind(user.id)
      .first<{ image: string | null }>();
    imageUrl = row?.image ?? null;
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={m.settings.personal.title} showRecord={false} />
      <SettingsCard
        title={m.settings.personal.account.title}
        description={m.settings.personal.account.description}
      >
        <AccountForm
          userId={user.id}
          initialName={user.name ?? ""}
          email={user.email}
          imageUrl={imageUrl}
        />
      </SettingsCard>
      <SettingsCard
        title={m.settings.personal.preferences.title}
        description={m.settings.personal.preferences.description}
      >
        <LanguageSetting />
      </SettingsCard>
    </div>
  );
}

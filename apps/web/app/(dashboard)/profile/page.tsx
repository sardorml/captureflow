import { Card, Typography } from "@heroui/react";
import { requireSession } from "@/lib/session-guard";
import { getAppWebEnv } from "@/lib/cf-env";
import { PageHeader } from "../PageHeader";
import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfileSettingsPage() {
  const session = await requireSession();
  const user = session.user;
  const env = await getAppWebEnv();

  // Read the image column directly: the better-auth session payload doesn't always carry it.
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
    <>
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences."
        showRecord={false}
      />
      {/* Section label sits above its card, not inside it, so the page reads
          as labelled groups rather than a stack of titled boxes. */}
      <section className="mt-6">
        <Typography type="body-sm" weight="medium" className="mb-2 block">
          Account
        </Typography>
        <Card className="p-6">
          <ProfileForm
            userId={user.id}
            initialName={user.name ?? ""}
            email={user.email}
            imageUrl={imageUrl}
          />
        </Card>
      </section>
    </>
  );
}

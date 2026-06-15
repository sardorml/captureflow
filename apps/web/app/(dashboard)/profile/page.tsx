import { requireSession } from '@/lib/session-guard';
import { getAppWebEnv } from '@/lib/cf-env';
import { PageHeader } from '../PageHeader';
import { ProfileForm } from './ProfileForm';

export const dynamic = 'force-dynamic';

export default async function ProfileSettingsPage() {
  const session = await requireSession();
  const user = session.user;
  const env = await getAppWebEnv();

  // Pull the image column directly — better-auth's typed session payload
  // doesn't always carry it through, and we want the latest URL right
  // after an upload-and-revalidate without waiting on the cookie refresh.
  let imageUrl: string | null = null;
  if (env?.DB) {
    const row = await env.DB.prepare(
      `SELECT image FROM users WHERE id = ?1 LIMIT 1`
    )
      .bind(user.id)
      .first<{ image: string | null }>();
    imageUrl = row?.image ?? null;
  }

  return (
    <>
      <PageHeader
        title="Profile settings"
        subtitle="The name and avatar teammates see across CaptureFlow."
        showRecord={false}
      />
      <div className="mt-6 space-y-8">
        <section className="rounded-2xl border border-line bg-canvas-2 p-6">
          <ProfileForm
            userId={user.id}
            initialName={user.name ?? ''}
            email={user.email}
            imageUrl={imageUrl}
          />
        </section>
      </div>
    </>
  );
}

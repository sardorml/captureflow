import { redirect } from 'next/navigation';
import { loadSession } from '@/lib/session-guard';
import { AuthForm } from '@/app/AuthForm';

export const dynamic = 'force-dynamic';

// Full-page sign-in. Direct links / bookmarks / the desktop app's "Log in"
// deep link all land here. `loadSession` swallows throws (stale cookie /
// rotated secret) so a broken cookie never crashes the page.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next ?? '/shares';
  // Only same-origin path redirects — strip a forged "?next=https://evil".
  const safeNext = next.startsWith('/') ? next : '/shares';
  const session = await loadSession();
  if (session) redirect(safeNext);

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <AuthForm next={safeNext} initialMode="signin" />
    </main>
  );
}

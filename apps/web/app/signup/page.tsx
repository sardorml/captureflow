import { redirect } from 'next/navigation';
import { loadSession } from '@/lib/session-guard';
import { AuthForm } from '@/app/AuthForm';

export const dynamic = 'force-dynamic';

// Full-page sign-up. Same form as /login, opened in signup mode.
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next ?? '/shares';
  const safeNext = next.startsWith('/') ? next : '/shares';
  const session = await loadSession();
  if (session) redirect(safeNext);

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <AuthForm next={safeNext} initialMode="signup" />
    </main>
  );
}

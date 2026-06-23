import Link from 'next/link';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle, readThemeFromCookieHeader } from '@captureflow/ui';
import { loadSession } from '@/lib/session-guard';
import { AuthForm } from '@/app/AuthForm';

export const dynamic = 'force-dynamic';

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

  const theme = readThemeFromCookieHeader((await headers()).get('cookie'));

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <Link
        href="/"
        className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-fg-muted transition-colors hover:bg-overlay hover:text-fg sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <ThemeToggle initialTheme={theme} className="absolute right-4 top-4 sm:right-6 sm:top-6" />
      <AuthForm next={safeNext} initialMode="signup" />
    </main>
  );
}

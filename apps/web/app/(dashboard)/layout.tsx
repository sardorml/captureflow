import { requireSession } from '@/lib/session-guard';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { PostHogIdentify } from '../posthog-identify';

export const dynamic = 'force-dynamic';
// Prevents serving a cached HTML shell that points at chunk URLs from a previous deploy.
export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-100">
      <PostHogIdentify email={session.user.email} />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-30">
          <TopBar />
        </div>
        <main className="min-w-0 flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

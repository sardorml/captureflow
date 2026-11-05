import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { readEnv } from "@/lib/env";
import { currentUser } from "@/lib/session";
import { AdminNav } from "@/app/_nav";

// The shell renders at once; the signed-in name and each page stream in after.
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const appUrl = readEnv()?.APP_URL ?? "";
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="flex flex-col border-b border-line bg-panel lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="flex h-14 items-center gap-2 px-5">
          <Link href="/" className="font-semibold text-fg-strong">
            CaptureFlow
          </Link>
          <span className="rounded-full bg-tint px-2 py-0.5 text-xs font-medium text-fg-muted">
            Admin
          </span>
          <a
            href={`${appUrl}/dashboard`}
            className="ml-auto text-sm text-fg-muted hover:text-fg lg:hidden"
          >
            Back to the app
          </a>
        </div>
        <AdminNav />
        <div className="hidden flex-col gap-3 border-t border-line p-4 lg:flex">
          <Suspense fallback={<div className="h-10" />}>
            <SignedInAs />
          </Suspense>
          <a
            href={`${appUrl}/dashboard`}
            className="flex items-center gap-2 text-sm text-fg-muted hover:text-fg"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to the app
          </a>
        </div>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col gap-8 px-6 py-8 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}

async function SignedInAs() {
  const user = await currentUser();
  if (!user) return null;
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-medium text-fg-strong">
        {user.name || user.email}
      </p>
      <p className="truncate text-xs text-fg-muted">{user.email}</p>
    </div>
  );
}

import { Suspense } from "react";
import { requireSession } from "@/lib/session-guard";
import { DashboardShell } from "./DashboardShell";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { SidebarSkeleton } from "./_skeletons";
import { PostHogIdentify } from "../posthog-identify";

export const dynamic = "force-dynamic";
// Prevents serving a cached HTML shell that points at chunk URLs from a previous deploy.
export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  // The shell streams ahead of the sidebar's and top bar's workspace queries.
  return (
    <DashboardShell
      sidebar={
        <Suspense fallback={<SidebarSkeleton />}>
          <Sidebar />
        </Suspense>
      }
      header={
        <Suspense fallback={null}>
          <TopBar />
        </Suspense>
      }
    >
      <PostHogIdentify email={session.user.email} />
      {children}
    </DashboardShell>
  );
}

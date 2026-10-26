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
  // The shell streams ahead of the sidebar's and the account cluster's queries.
  return (
    <DashboardShell
      sidebar={
        <div data-split="sidebar" className="contents">
          <Suspense fallback={<SidebarSkeleton />}>
            <Sidebar />
          </Suspense>
        </div>
      }
      header={
        <div data-split="top-bar" className="contents">
          <TopBar />
        </div>
      }
    >
      <PostHogIdentify email={session.user.email} />
      <div data-split="page" className="contents">
        {children}
      </div>
    </DashboardShell>
  );
}

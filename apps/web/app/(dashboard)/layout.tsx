import { Suspense } from "react";
import { cookies } from "next/headers";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { requireSession } from "@/lib/session-guard";
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
  const sidebarOpen = (await cookies()).get("sidebar_state")?.value !== "false";
  /*
   * The inset owns scrolling rather than the document: modals scroll-lock
   * <body>, which would turn it into a scroll container mid-scroll. The shell
   * streams ahead of the sidebar's and the account cluster's queries.
   */
  return (
    <SidebarProvider
      defaultOpen={sidebarOpen}
      className="h-svh overflow-hidden"
    >
      <div data-split="sidebar" className="contents">
        <Suspense fallback={<SidebarSkeleton />}>
          <Sidebar />
        </Suspense>
      </div>
      <SidebarInset className="min-w-0 overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 md:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />
          <div data-split="top-bar" className="contents">
            <TopBar session={session} />
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <PostHogIdentify email={session.user.email} />
          <div data-split="page" className="mx-auto max-w-[1184px] p-8">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

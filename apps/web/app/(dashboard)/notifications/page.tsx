import { Bell } from "lucide-react";
import { PageHeader } from "../PageHeader";

export const dynamic = "force-dynamic";

export default function NotificationsPage() {
  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Activity from your workspaces will show up here."
        showRecord={false}
      />
      <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-neutral-900/40 px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-overlay text-neutral-400 ring-1 ring-line-strong">
          <Bell className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-base font-semibold text-neutral-100">
          You&rsquo;re all caught up
        </h2>
        <p className="mt-1 max-w-sm text-sm text-neutral-500">
          When teammates view your shares, leave feedback, or join your
          workspace, you&rsquo;ll see it here.
        </p>
      </div>
    </>
  );
}

import { NotificationsMenu } from "@/app/_components/NotificationsMenu";
import { SplitLoaded } from "@/components/dev/split-loaded";
import { SearchTrigger } from "./SearchTrigger";

// The account cluster lives at the foot of the sidebar; the bar is search
// and notifications, and it paints with the shell.
export function TopBar() {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <SplitLoaded name="top-bar" />
      {/* Below md the drawer toggle takes this slot instead — see DashboardShell. */}
      <div className="hidden min-w-0 flex-1 justify-center md:flex">
        <SearchTrigger />
      </div>
      {/* ml-auto because below md the search slot is display:none, which leaves
          justify-between a single child to push around. */}
      <div className="ml-auto flex items-center gap-2">
        <NotificationsMenu />
      </div>
    </div>
  );
}

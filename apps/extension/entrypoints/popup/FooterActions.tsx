import { Dropdown, Menu, buttonVariants } from "@heroui/react";
import { sendMessage } from "@/lib/messaging";
import { WEB_BASE } from "@/lib/config";
import { closeSurface } from "@/lib/surface";

const MORE_ICON = (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
    <circle cx="5" cy="12" r="1.9" fill="currentColor" />
    <circle cx="12" cy="12" r="1.9" fill="currentColor" />
    <circle cx="19" cy="12" r="1.9" fill="currentColor" />
  </svg>
);

/*
 * The bangs are load-bearing. buttonVariants puts `.button` on the trigger, and
 * `.button svg` sizes any icon inside one to 20px with a vertical margin below
 * the sm breakpoint — it outranks a plain utility, and the icon comes out a
 * size larger with the label pushed off its line.
 */
const TOOL_CLASS =
  "h-auto px-2 py-1.5 text-[11px] [&_svg]:m-0! [&_svg]:size-4!";

export function FooterActions() {
  const openDashboard = () => {
    void chrome.tabs.create({ url: `${WEB_BASE}/recordings` });
    closeSurface();
  };
  const onSignOut = () => {
    void sendMessage("signOut", undefined);
    closeSurface();
  };

  return (
    <footer className="flex justify-end">
      <Dropdown>
        {/* Dropdown.Trigger wraps React Aria's unstyled Button, so the ghost
            look is applied by hand. */}
        <Dropdown.Trigger
          className={buttonVariants({
            variant: "ghost",
            className: TOOL_CLASS,
          })}
        >
          <span className="flex flex-col items-center gap-1">
            {MORE_ICON}
            <span className="leading-4">More</span>
          </span>
        </Dropdown.Trigger>
        <Dropdown.Popover placement="top end">
          <Menu>
            <Menu.Item onAction={openDashboard}>Open dashboard</Menu.Item>
            <Menu.Item onAction={onSignOut}>Sign out</Menu.Item>
          </Menu>
        </Dropdown.Popover>
      </Dropdown>
    </footer>
  );
}

import { Dropdown, buttonVariants } from "@heroui/react";
import { sendMessage } from "@/lib/messaging";
import { WEB_BASE } from "@/lib/config";
import { closeSurface } from "@/lib/surface";

// Points up because the menu opens up: the footer is the bottom of the panel.
const CHEVRON_ICON = (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
    <path
      d="m7 14 5-5 5 5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
    <footer>
      <Dropdown>
        {/* Dropdown.Trigger wraps React Aria's unstyled Button, so the outline
            look is applied by hand — and `.dropdown__trigger` is inline-block,
            which outranks the flex `.button` lays out its label and icon with. */}
        <Dropdown.Trigger
          className={buttonVariants({
            variant: "outline",
            className: "flex w-full",
          })}
        >
          More
          {CHEVRON_ICON}
        </Dropdown.Trigger>
        <Dropdown.Popover placement="top">
          <Dropdown.Menu>
            <Dropdown.Item onAction={openDashboard}>
              Open dashboard
            </Dropdown.Item>
            <Dropdown.Item onAction={onSignOut}>Sign out</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </footer>
  );
}

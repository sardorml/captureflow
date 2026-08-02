import { Button, Dropdown, Menu, Tooltip, buttonVariants } from "@heroui/react";
import { sendMessage } from "@/lib/messaging";
import { WEB_BASE } from "@/lib/config";
import { closeSurface } from "@/lib/surface";

const EFFECTS_ICON = (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
    <path
      d="M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 2-.9 2-2 0-.6-.2-1-.6-1.4-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.3c1.8 0 3.3-1.5 3.3-3.3C20.5 6.6 16.7 3.5 12 3.5z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <circle cx="8" cy="10" r="1.2" fill="currentColor" />
    <circle cx="12" cy="7.5" r="1.2" fill="currentColor" />
    <circle cx="16" cy="10" r="1.2" fill="currentColor" />
  </svg>
);

const BLUR_ICON = (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
    <path
      d="M12 3.5s6 6.2 6 10.5a6 6 0 0 1-12 0C6 9.7 12 3.5 12 3.5z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

const MORE_ICON = (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
    <circle cx="5.5" cy="12" r="1.6" fill="currentColor" />
    <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    <circle cx="18.5" cy="12" r="1.6" fill="currentColor" />
  </svg>
);

const TOOL_CLASS = "h-auto w-full flex-col gap-1 px-2 py-1.5 text-[11px]";

function ComingSoon({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Tooltip>
      {/* A disabled button emits no pointer events, so the tooltip anchors to a
          wrapper instead of the control itself. */}
      <Tooltip.Trigger>
        <span className="inline-flex w-full">
          <Button variant="ghost" isDisabled className={TOOL_CLASS}>
            {icon}
            {label}
          </Button>
        </span>
      </Tooltip.Trigger>
      <Tooltip.Content>Coming soon</Tooltip.Content>
    </Tooltip>
  );
}

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
    <footer className="grid grid-cols-3 items-start gap-1">
      <ComingSoon icon={EFFECTS_ICON} label="Effects" />
      <ComingSoon icon={BLUR_ICON} label="Blur" />
      <Dropdown>
        {/* Dropdown.Trigger wraps React Aria's unstyled Button, so the ghost
            look its two siblings get from <Button> is applied by hand. */}
        <Dropdown.Trigger
          className={buttonVariants({
            variant: "ghost",
            className: TOOL_CLASS,
          })}
        >
          {MORE_ICON}
          More
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

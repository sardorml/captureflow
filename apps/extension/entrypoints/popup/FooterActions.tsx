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
    <circle cx="5" cy="12" r="1.9" fill="currentColor" />
    <circle cx="12" cy="12" r="1.9" fill="currentColor" />
    <circle cx="19" cy="12" r="1.9" fill="currentColor" />
  </svg>
);

/*
 * The bangs are load-bearing. `.button svg` sizes any icon inside a Button to
 * 20px with a vertical margin below the sm breakpoint, and it outranks a plain
 * utility — but the third tool is a Dropdown.Trigger, which carries none of it.
 * Two icons came out 20px and one 16px, and the odd label sat a row higher.
 */
const TOOL_CLASS =
  "h-auto w-full px-2 py-1.5 text-[11px] [&_svg]:m-0! [&_svg]:size-4!";

/*
 * Two of the three tools are a <Button> and the third is a Dropdown.Trigger,
 * which composes its own button styles — the stack, the gap and the label's
 * line box have to come from markup both share, or the label under one sits a
 * few pixels off the other two.
 */
function ToolFace({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex w-full flex-col items-center gap-1">
      {icon}
      <span className="leading-4">{label}</span>
    </span>
  );
}

function ComingSoon({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Tooltip>
      {/* A disabled button emits no pointer events, so the tooltip anchors to a
          wrapper instead of the control itself. */}
      <Tooltip.Trigger>
        <span className="inline-flex w-full">
          <Button variant="ghost" isDisabled className={TOOL_CLASS}>
            <ToolFace icon={icon} label={label} />
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
          <ToolFace icon={MORE_ICON} label="More" />
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

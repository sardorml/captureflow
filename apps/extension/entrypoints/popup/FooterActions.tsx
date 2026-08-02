import { useState } from "react";
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

export function FooterActions() {
  const [menuOpen, setMenuOpen] = useState(false);

  const openDashboard = () => {
    void chrome.tabs.create({ url: `${WEB_BASE}/recordings` });
    closeSurface();
  };
  const onSignOut = () => {
    void sendMessage("signOut", undefined);
    closeSurface();
  };

  return (
    <footer className="cf-tools">
      <button type="button" className="cf-tool" disabled title="Coming soon">
        {EFFECTS_ICON}
        <span>Effects</span>
      </button>
      <button type="button" className="cf-tool" disabled title="Coming soon">
        {BLUR_ICON}
        <span>Blur</span>
      </button>
      <div className="cf-tool-menu-anchor">
        <button
          type="button"
          className="cf-tool"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {MORE_ICON}
          <span>More</span>
        </button>
        {menuOpen && (
          <div className="cf-menu" role="menu">
            <button
              type="button"
              className="cf-menu-item"
              role="menuitem"
              onClick={openDashboard}
            >
              Open dashboard
            </button>
            <button
              type="button"
              className="cf-menu-item"
              role="menuitem"
              onClick={onSignOut}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </footer>
  );
}

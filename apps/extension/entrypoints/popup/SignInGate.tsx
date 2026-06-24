import { sendMessage } from "@/lib/messaging";

// Fallback view: when signed out the action has no popup, so clicking the icon
// opens the web sign-in tab directly. This only renders in the brief window
// before the service worker clears the popup; the button opens that same tab.
export function SignInGate() {
  const onSignIn = () => {
    void sendMessage("openSignIn", undefined);
    window.close();
  };

  return (
    <div className="cf-panel">
      <header className="cf-header">
        <div className="cf-brand">
          <span className="cf-logo" aria-hidden />
          CaptureFlow
        </div>
      </header>

      <section className="cf-section">
        <p className="cf-source">
          Sign in to record your screen and get an instant share link.
        </p>
      </section>

      <button type="button" className="cf-start" onClick={onSignIn}>
        Sign in
      </button>
    </div>
  );
}

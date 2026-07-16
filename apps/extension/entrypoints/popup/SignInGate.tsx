import { sendMessage } from "@/lib/messaging";

// Only renders in the brief window before the service worker clears the popup
// for the signed-out action; the button opens the web sign-in tab.
export function SignInGate() {
  const onSignIn = () => {
    void sendMessage("openSignIn", undefined);
    window.close();
  };

  return (
    <div className="cf-panel">
      <header className="cf-header">
        <div className="cf-brand">
          <img className="cf-logo" src="/icon/32.png" alt="" />
          CaptureFlow
        </div>
      </header>

      <section className="cf-section">
        <p className="cf-source">
          Sign in to record your screen and get an instant recording link.
        </p>
      </section>

      <button type="button" className="cf-start" onClick={onSignIn}>
        Sign in
      </button>
    </div>
  );
}

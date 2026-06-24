import { useState } from "react";
import { sendMessage } from "@/lib/messaging";

// Sign-in runs in the service worker. The auth window steals focus and closes
// this popup, so the happy path completes out of band: App watches the auth
// session and swaps in the recorder when the SW stores a token. The awaited
// result only surfaces if the popup survives (e.g. an instant re-auth).
export function SignInGate() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSignIn = async () => {
    setBusy(true);
    setError(null);
    const res = await sendMessage("startSignIn", undefined);
    setBusy(false);
    if (!res.ok) setError(res.error);
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

      <button
        type="button"
        className="cf-start"
        onClick={onSignIn}
        disabled={busy}
      >
        {busy ? "Opening sign-in…" : "Sign in"}
      </button>

      {error && <p className="cf-status cf-status--error">{error}</p>}
    </div>
  );
}

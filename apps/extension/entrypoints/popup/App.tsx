import { useEffect, useState } from "react";
import { sendMessage } from "@/lib/messaging";
import {
  getAuthSession,
  watchAuthSession,
  type AuthSession,
} from "@/lib/auth/session";
import {
  getSpikeResult,
  getSpikeStatus,
  watchSpikeResult,
  watchSpikeStatus,
  type SpikeResult,
  type SpikeStatus,
} from "@/lib/storage";
import { RecorderPanel } from "./RecorderPanel";
import { SignInGate } from "./SignInGate";

// "loading" until storage resolves, to avoid flashing the sign-in gate.
type AuthState = AuthSession | null | "loading";

export function App() {
  const [auth, setAuth] = useState<AuthState>("loading");
  const [status, setStatus] = useState<SpikeStatus>({ kind: "idle" });
  const [result, setResult] = useState<SpikeResult | null>(null);

  useEffect(() => {
    void getAuthSession().then(setAuth);
    void getSpikeStatus().then(setStatus);
    void getSpikeResult().then(setResult);
    const unwatchAuth = watchAuthSession(setAuth);
    const unwatchStatus = watchSpikeStatus(setStatus);
    const unwatchResult = watchSpikeResult(setResult);
    return () => {
      unwatchAuth();
      unwatchStatus();
      unwatchResult();
    };
  }, []);

  if (auth === "loading") return null;
  if (!auth) return <SignInGate />;

  // The popup closes as soon as the OS picker takes focus, so the result is
  // read back from storage when the popup is reopened.
  const onStart = () => sendMessage("startSpike", undefined);
  const onSignOut = () => sendMessage("signOut", undefined);

  return (
    <RecorderPanel
      status={status}
      result={result}
      onStart={onStart}
      onSignOut={onSignOut}
    />
  );
}

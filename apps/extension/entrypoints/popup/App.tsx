import { useEffect, useState } from "react";
import { sendMessage } from "@/lib/messaging";
import {
  getAuthSession,
  watchAuthSession,
  type AuthSession,
} from "@/lib/auth/session";
import {
  getRecordingResult,
  getRecordingStatus,
  watchRecordingResult,
  watchRecordingStatus,
  type RecordingResult,
  type RecordingStatus,
} from "@/lib/storage";
import { RecorderPanel } from "./RecorderPanel";
import { SignInGate } from "./SignInGate";

// "loading" until storage resolves, to avoid flashing the sign-in gate.
type AuthState = AuthSession | null | "loading";

export function App() {
  const [auth, setAuth] = useState<AuthState>("loading");
  const [status, setStatus] = useState<RecordingStatus>({ kind: "idle" });
  const [result, setResult] = useState<RecordingResult | null>(null);

  useEffect(() => {
    void getAuthSession().then(setAuth);
    void getRecordingStatus().then(setStatus);
    void getRecordingResult().then(setResult);
    const unwatchAuth = watchAuthSession(setAuth);
    const unwatchStatus = watchRecordingStatus(setStatus);
    const unwatchResult = watchRecordingResult(setResult);
    return () => {
      unwatchAuth();
      unwatchStatus();
      unwatchResult();
    };
  }, []);

  if (auth === "loading") return null;
  if (!auth) return <SignInGate />;

  // The popup closes as soon as the OS picker takes focus, so recording state
  // is read back from storage when the popup is reopened.
  const onStart = () => sendMessage("startRecording", undefined);
  const onStop = () => sendMessage("stopRecording", undefined);
  const onSignOut = () => sendMessage("signOut", undefined);

  return (
    <RecorderPanel
      status={status}
      result={result}
      onStart={onStart}
      onStop={onStop}
      onSignOut={onSignOut}
    />
  );
}

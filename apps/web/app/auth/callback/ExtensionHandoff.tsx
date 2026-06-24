"use client";

import { useEffect, useState } from "react";

type ExtensionHandoffProps = {
  extId: string;
  token: string;
  tokenId: string;
  email: string;
};

// chrome.runtime is injected only on pages the extension lists in
// externally_connectable; @types/chrome isn't a web dependency, so type the one
// method we call. lastError is set (inside the callback) when no matching
// extension received the message.
type RuntimeBridge = {
  sendMessage: (
    extensionId: string,
    message: unknown,
    callback?: (response: unknown) => void,
  ) => void;
  lastError?: { message?: string };
};

function getRuntime(): RuntimeBridge | null {
  const g = globalThis as { chrome?: { runtime?: RuntimeBridge } };
  return g.chrome?.runtime ?? null;
}

type State = "sending" | "done" | "error";

export function ExtensionHandoff({
  extId,
  token,
  tokenId,
  email,
}: ExtensionHandoffProps) {
  const [state, setState] = useState<State>("sending");

  useEffect(() => {
    const runtime = getRuntime();
    if (!runtime?.sendMessage) {
      setState("error");
      return;
    }
    runtime.sendMessage(
      extId,
      { kind: "captureflow-auth", token, id: tokenId },
      (response) => {
        const ok =
          !!response &&
          typeof response === "object" &&
          (response as { ok?: unknown }).ok === true;
        setState(runtime.lastError || !ok ? "error" : "done");
      },
    );
  }, [extId, token, tokenId]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4 text-center">
      <div className="max-w-sm">
        {state === "error" ? (
          <p className="text-fg">
            Couldn’t reach the CaptureFlow extension. Make sure it’s installed,
            then click its icon to try again.
          </p>
        ) : (
          <p className="text-fg">
            Signed in as {email}. You can close this tab.
          </p>
        )}
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { getRuntime, rememberExtensionId } from "@/lib/extension-bridge";

type ExtensionHandoffProps = {
  extId: string;
  token: string;
  tokenId: string;
  email: string;
};

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
    /*
     * Remember the id BEFORE handing over the token, not in the response
     * callback: the extension closes this tab as soon as it has the token, so
     * a callback-time write loses the race and every later push — sign-out, and
     * the session sync — silently no-ops for want of an id to send to.
     */
    rememberExtensionId(extId);
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

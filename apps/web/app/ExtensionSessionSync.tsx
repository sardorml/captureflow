"use client";

import { useEffect } from "react";
import { notifyExtensionSession } from "@/lib/extension-bridge";

// Mounted wherever the browser's session state is known for certain — signed in
// on the dashboard, signed out on the login page.
export function ExtensionSessionSync({ userId }: { userId: string | null }) {
  useEffect(() => {
    notifyExtensionSession(userId);
  }, [userId]);
  return null;
}

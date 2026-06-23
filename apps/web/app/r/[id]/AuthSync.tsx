"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const VERIFY_URL = "/api/verify-session";

type Props = {
  initialUserId: string | null;
};

export function AuthSync({ initialUserId }: Props) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    let lastCheck = 0;

    const check = async () => {
      const now = Date.now();
      if (now - lastCheck < 2000) return;
      lastCheck = now;

      try {
        const res = await fetch(VERIFY_URL, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        if (cancelled) return;

        let currentUserId: string | null = null;
        if (res.ok) {
          const json = (await res.json()) as { userId?: unknown };
          if (typeof json.userId === "string") currentUserId = json.userId;
        }
        if (currentUserId !== initialUserId) {
          router.refresh();
        }
      } catch {
        // Don't refresh on failure — it would cycle a stale page through itself.
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") void check();
    };

    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [initialUserId, router]);

  return null;
}

"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "captureflow_signed_in";
let lookup: Promise<boolean> | null = null;

// Marketing pages are cached for everyone, so who is signed in is asked once per page load, after it renders.
function fetchSignedIn(): Promise<boolean> {
  lookup ??= fetch("/api/auth/get-session", { credentials: "same-origin" })
    .then((res) => (res.ok ? (res.json() as Promise<unknown>) : null))
    .then(
      (body) =>
        typeof body === "object" &&
        body !== null &&
        "user" in body &&
        Boolean(body.user),
    )
    .catch(() => false);
  return lookup;
}

function remembered(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function useSignedIn(): boolean {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    if (remembered()) setSignedIn(true);
    let live = true;
    void fetchSignedIn().then((value) => {
      if (!live) return;
      setSignedIn(value);
      try {
        sessionStorage.setItem(STORAGE_KEY, value ? "1" : "0");
      } catch {}
    });
    return () => {
      live = false;
    };
  }, []);
  return signedIn;
}

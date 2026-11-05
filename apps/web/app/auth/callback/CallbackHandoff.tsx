"use client";

import { useEffect, useRef, useState } from "react";
import { useAppMessages } from "@/components/app-i18n-provider";
import { fill } from "@/lib/i18n/fill";

type CallbackHandoffProps = {
  deepLink: string;
  email: string;
};

/*
 * Safari suppresses unsolicited custom-scheme navigation as a popup; the
 * visible button is the real trigger and the effect only auto-clicks it after
 * mount so the browser registers this page as the originator.
 */
export function CallbackHandoff({ deepLink, email }: CallbackHandoffProps) {
  const m = useAppMessages();
  const [opened, setOpened] = useState(false);
  const anchorRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    // 250ms is a safe floor for Safari to register this page as the originator.
    const id = setTimeout(() => {
      anchorRef.current?.click();
      setOpened(true);
    }, 250);
    return () => clearTimeout(id);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-100">
          {opened ? m.auth.handoff.returning : m.auth.handoff.signingIn}
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          {fill(m.auth.signedInAs, {
            email: <span className="text-neutral-200">{email}</span>,
          })}
        </p>
        <a
          ref={anchorRef}
          className="mt-8 inline-block rounded-lg bg-white px-4 py-2 text-sm font-medium text-neutral-950 transition-opacity hover:opacity-90"
          href={deepLink}
        >
          {m.auth.handoff.open}
        </a>
        <p className="mt-6 text-xs text-neutral-500">{m.auth.handoff.hint}</p>
      </div>
    </main>
  );
}

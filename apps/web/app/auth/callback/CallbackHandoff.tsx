'use client';

import { useEffect, useRef, useState } from 'react';

type CallbackHandoffProps = {
  deepLink: string;
  email: string;
};

// "Open CaptureFlow" deep-link handoff. The visible button is the real
// trigger: Safari treats an unsolicited `location.href = 'custom-scheme:'`
// as a popup-class action and may suppress the prompt, so we don't navigate
// during SSR or on first paint. The useEffect only primes a one-shot
// auto-redirect shortly after mount so the happy path needs no clicks.

export function CallbackHandoff({ deepLink, email }: CallbackHandoffProps) {
  const [opened, setOpened] = useState(false);
  const anchorRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    // Delay lets the browser register this page as the originator;
    // 250ms is a safe floor in Safari.
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
          {opened ? 'Returning to CaptureFlow…' : 'Signing you in…'}
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          Signed in as <span className="text-neutral-200">{email}</span>.
        </p>
        <a
          ref={anchorRef}
          className="mt-8 inline-block rounded-lg bg-white px-4 py-2 text-sm font-medium text-neutral-950 transition-opacity hover:opacity-90"
          href={deepLink}
        >
          Open CaptureFlow
        </a>
        <p className="mt-6 text-xs text-neutral-500">
          If nothing happens, click the button above. You can close this tab
          once the desktop app reopens.
        </p>
      </div>
    </main>
  );
}

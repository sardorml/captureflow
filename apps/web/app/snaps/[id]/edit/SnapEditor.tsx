'use client';

import dynamic from 'next/dynamic';

// Konva touches `window` at import time, so the editor impl has to
// load on the client only. `next/dynamic` with ssr:false works inside
// a client component (server components can't disable ssr on Next 13+
// App Router) — this wrapper exists purely to flip the flag.

export type SnapEditorProps = {
  snapId: string;
  initialTitle: string | null;
  imageUrl: string;
  width: number;
  height: number;
  viewUrl: string;
  createdAt: number;
  ownerName: string | null;
  ownerEmail: string | null;
  // Persisted editor state restored from R2 sidecar JSON. `null`
  // means the user has never saved (first edit) — defaults are
  // applied by the impl in that case.
  initialBackground: string | null;
  initialAnnotations: unknown[] | null;
};

const SnapEditorImpl = dynamic(
  () => import('./SnapEditorImpl').then((m) => m.SnapEditorImpl),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-sm text-neutral-400">
        Loading editor…
      </div>
    ),
  }
);

export function SnapEditor(props: SnapEditorProps) {
  return <SnapEditorImpl {...props} />;
}

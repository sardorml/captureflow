'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { GridLoader, type Theme } from '@captureflow/ui';
import { useRouter } from 'next/navigation';
import type { ShareConfig } from '@/lib/share-config';
import type { ShareState, ShareVisibility } from '@/lib/shares-db';

export type ShareEditorProps = {
  slug: string;
  initialTitle: string | null;
  videoUrl: string;
  webcamUrl: string | null;
  viewUrl: string;
  width: number | null;
  height: number | null;
  durationMs: number | null;
  sizeBytes: number;
  viewCount: number;
  createdAt: number;
  initialVisibility: ShareVisibility;
  initialConfig: ShareConfig;
  initialState: ShareState;
  // Workspace context for the visibility dialog.
  workspaceName: string | null;
  allowPublicLinks: boolean;
  // Server-resolved theme (from the cookie) so the editor's theme toggle
  // renders the right glyph on first paint and can flip the app theme from
  // within the editor.
  initialTheme: Theme;
};

// Share APIs are served by this same app, so the editor polls them
// same-origin with a relative base.
const SHARE_API = '/r';

const ShareEditorImpl = dynamic(
  () => import('./ShareEditorImpl').then((m) => m.ShareEditorImpl),
  {
    ssr: false,
    loading: () => <PreparingShare />,
  }
);

// Desktop can open the edit URL the instant /api/init returns a slug, well
// before /api/finalize lands. While the share is still uploading, show a
// "Preparing share" affordance and poll /api/state; once it flips to 'ready',
// router.refresh() re-runs the server component and renders the real editor.
export function ShareEditor(props: ShareEditorProps) {
  const router = useRouter();
  const [state, setState] = useState<ShareState>(props.initialState);

  useEffect(() => {
    if (state !== 'pending') return;
    let cancelled = false;
    const tick = async (): Promise<void> => {
      try {
        const res = await fetch(
          `${SHARE_API}/api/state?slug=${encodeURIComponent(props.slug)}`,
          { cache: 'no-store' }
        );
        if (!res.ok) return;
        const data = (await res.json()) as { state?: string };
        if (cancelled) return;
        if (data.state === 'ready' || data.state === 'failed') {
          setState(data.state);
          router.refresh();
        }
      } catch {
        /* transient — retry on the next tick */
      }
    };
    void tick();
    const interval = window.setInterval(tick, 1500);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [state, props.slug, router]);

  if (state === 'pending') return <PreparingShare />;
  if (state === 'failed') return <ShareFailed />;
  return <ShareEditorImpl {...props} />;
}

function PreparingShare() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-sm text-neutral-300">
      <GridLoader size={9} className="text-blue-300" />
      <p className="font-medium">Preparing share…</p>
      <p className="text-xs text-neutral-500">
        The recording is still uploading. This page will refresh automatically
        when it&apos;s ready.
      </p>
    </div>
  );
}

function ShareFailed() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-sm text-neutral-300">
      <p className="font-medium text-red-300">Share upload failed.</p>
      <p className="text-xs text-neutral-500">
        Try recording again from the desktop app.
      </p>
    </div>
  );
}

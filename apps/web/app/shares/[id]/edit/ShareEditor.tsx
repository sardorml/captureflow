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
  // Workspace context for the visibility dialog. Mirrors the
  // dashboard cards + share viewer modal so the picker reads
  // identically across surfaces.
  workspaceName: string | null;
  allowPublicLinks: boolean;
  // Server-resolved theme (from the cookie) so the editor's own theme
  // toggle renders the right glyph on first paint and can flip the app
  // theme from within the editor — otherwise the only way to change
  // theme is from the dashboard/viewers, leaving the editor stranded on
  // whatever the cookie last held.
  initialTheme: Theme;
};

// Share APIs are served by this same app under `/api/r/*`,
// so the editor polls them same-origin with a relative base.
const SHARE_API = '/r';

const ShareEditorImpl = dynamic(
  () => import('./ShareEditorImpl').then((m) => m.ShareEditorImpl),
  {
    ssr: false,
    loading: () => <PreparingShare />,
  }
);

// While a share is still uploading (desktop opened the edit URL the
// instant /api/init returned a slug — well before /api/finalize
// landed), show a clear "Preparing share" affordance and poll
// /api/state until the worker flips state to 'ready'. The moment it
// does, router.refresh() re-runs the server component, which now
// returns 'ready' and renders the real editor in the same paint.
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

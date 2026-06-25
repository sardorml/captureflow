"use client";

import dynamic from "next/dynamic";

// Konva touches `window` at import time, so the impl must load client-only;
// `ssr:false` only works inside a client component on the App Router.

export type ScreenshotEditorProps = {
  screenshotId: string;
  initialTitle: string | null;
  imageUrl: string;
  width: number;
  height: number;
  viewUrl: string;
  createdAt: number;
  ownerName: string | null;
  ownerEmail: string | null;
  // Persisted editor state from the R2 sidecar JSON; `null` = never saved.
  initialBackground: string | null;
  initialAnnotations: unknown[] | null;
};

const ScreenshotEditorImpl = dynamic(
  () => import("./ScreenshotEditorImpl").then((m) => m.ScreenshotEditorImpl),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-sm text-neutral-400">
        Loading editor…
      </div>
    ),
  },
);

export function ScreenshotEditor(props: ScreenshotEditorProps) {
  return <ScreenshotEditorImpl {...props} />;
}

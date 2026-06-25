"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Spin } from "antd";
import { type Theme } from "@captureflow/ui";
import { useRouter } from "next/navigation";
import type { RecordingConfig } from "@/lib/recording-config";
import type { RecordingState, RecordingVisibility } from "@/lib/recordings-db";

export type RecordingEditorProps = {
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
  initialVisibility: RecordingVisibility;
  initialConfig: RecordingConfig;
  initialState: RecordingState;
  workspaceName: string | null;
  allowPublicLinks: boolean;
  initialTheme: Theme;
};

const RECORDING_API = "/r";

const RecordingEditorImpl = dynamic(
  () => import("./RecordingEditorImpl").then((m) => m.RecordingEditorImpl),
  {
    ssr: false,
    loading: () => <PreparingRecording />,
  },
);

// Desktop can open the edit URL before /api/finalize lands; poll until the
// recording state flips, then router.refresh() renders the real editor.
export function RecordingEditor(props: RecordingEditorProps) {
  const router = useRouter();
  const [state, setState] = useState<RecordingState>(props.initialState);

  useEffect(() => {
    if (state !== "pending") return;
    let cancelled = false;
    const tick = async (): Promise<void> => {
      try {
        const res = await fetch(
          `${RECORDING_API}/api/state?slug=${encodeURIComponent(props.slug)}`,
          { cache: "no-store" },
        );
        if (!res.ok) return;
        const data = (await res.json()) as { state?: string };
        if (cancelled) return;
        if (data.state === "ready" || data.state === "failed") {
          setState(data.state);
          router.refresh();
        }
      } catch {
        // retry on the next tick
      }
    };
    void tick();
    const interval = window.setInterval(tick, 1500);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [state, props.slug, router]);

  if (state === "pending") return <PreparingRecording />;
  if (state === "failed") return <RecordingFailed />;
  return <RecordingEditorImpl {...props} />;
}

function PreparingRecording() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-sm text-neutral-300">
      <Spin size="large" />
      <p className="font-medium">Preparing recording…</p>
      <p className="text-xs text-neutral-500">
        The recording is still uploading. This page will refresh automatically
        when it&apos;s ready.
      </p>
    </div>
  );
}

function RecordingFailed() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-sm text-neutral-300">
      <p className="font-medium text-red-300">Recording upload failed.</p>
      <p className="text-xs text-neutral-500">
        Try recording again from the desktop app.
      </p>
    </div>
  );
}

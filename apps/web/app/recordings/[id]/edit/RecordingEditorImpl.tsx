"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  RecordingPlayer,
  type RecordingPlayerHandle,
} from "@/app/_components/recording";
import { renameRecordingAction } from "@/app/actions";
import type { RecordingEditorProps } from "./RecordingEditor";
import { useEditorConfig } from "./use-editor-config";
import { EditorTopBar } from "./EditorTopBar";
import { EditorTranscriptPanel } from "./EditorTranscriptPanel";
import { EditorToolRail } from "./EditorToolRail";
import { EditorTimeline } from "./EditorTimeline";

// The recording editor. The preview uses the same RecordingPlayer as the
// public viewer, so it matches what /r/[id] renders pixel for pixel.
export function RecordingEditorImpl(props: RecordingEditorProps) {
  const router = useRouter();
  const {
    slug,
    initialTitle,
    videoUrl,
    webcamUrl,
    viewUrl,
    width,
    height,
    durationMs,
    sizeBytes,
    viewCount,
    createdAt,
    initialConfig,
  } = props;

  const [title, setTitle] = useState<string>(initialTitle ?? "");
  const playerRef = useRef<RecordingPlayerHandle | null>(null);

  const {
    config,
    update,
    undo,
    redo,
    canUndo,
    canRedo,
    status,
    error,
    flushNow,
  } = useEditorConfig(slug, initialConfig);

  // Warn before leaving while a save is unfinished or failed — the only safety
  // net in an autosave-only model with no manual Save button.
  useEffect(() => {
    if (status !== "saving" && status !== "error") return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status]);

  const onRename = async (next: string): Promise<string | null> => {
    const fd = new FormData();
    fd.set("slug", slug);
    fd.set("title", next);
    const res = await renameRecordingAction({ error: null, slug: null }, fd);
    if (res.error) return res.error;
    setTitle(next);
    return null;
  };

  const onFinish = (): void => {
    void (async () => {
      const res = await flushNow();
      // Keep the user here if the final save failed; the error shows in the bar.
      if (res.error) return;
      router.push(viewUrl);
    })();
  };

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-canvas text-fg">
      <EditorTopBar
        title={title}
        onRename={onRename}
        onBack={() => router.push(viewUrl)}
        onFinish={onFinish}
        status={status}
        saveError={error}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
      />

      <div className="flex min-h-0 flex-1">
        <section className="flex min-w-0 flex-1 items-center justify-center p-6">
          {/* Width box: the player sizes off 100% of its parent, so it needs a
              concrete width to resolve against (else it collapses to nothing). */}
          <div className="w-full max-w-5xl">
            <RecordingPlayer
              ref={playerRef}
              videoUrl={videoUrl}
              webcamUrl={webcamUrl ?? undefined}
              serverDurationMs={durationMs}
              serverWidth={width}
              serverHeight={height}
              config={config}
              // 16rem ≈ top bar (h-14) + timeline + this section's p-6; keep in
              // sync if those chrome heights change.
              landscapeMaxHeightCss="calc(100vh - 16rem)"
            />
          </div>
        </section>

        <EditorTranscriptPanel />
        <EditorToolRail
          config={config}
          onConfig={update}
          hasWebcam={!!webcamUrl}
          details={{ slug, sizeBytes, durationMs, viewCount, createdAt }}
        />
      </div>

      <EditorTimeline playerRef={playerRef} durationMs={durationMs} />
    </main>
  );
}

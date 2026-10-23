"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  RecordingPlayer,
  type RecordingPlayerHandle,
} from "@/app/_components/recording";
import { renameRecordingAction } from "@/app/actions";
import { addCut, cutsEqual, type RecordingCut } from "@/lib/recording/cuts";
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
    initialTranscript,
    transcriptStatus,
    transcriptHasEdits,
  } = props;

  const [title, setTitle] = useState<string>(initialTitle ?? "");
  const [selectionSpan, setSelectionSpan] = useState<RecordingCut | null>(null);
  // Bumped whenever the server's captions may differ (a transcript edit or
  // a saved config, since cut lines are dropped from the captions), so the
  // track refetches.
  const [captionsVersion, setCaptionsVersion] = useState(0);
  const refreshCaptions = useCallback(
    () => setCaptionsVersion((v) => v + 1),
    [],
  );
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

  const captionedCutsRef = useRef(config.cuts);
  useEffect(() => {
    if (
      status !== "saved" ||
      cutsEqual(config.cuts, captionedCutsRef.current)
    ) {
      return;
    }
    captionedCutsRef.current = config.cuts;
    refreshCaptions();
  }, [status, config.cuts, refreshCaptions]);

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

  const seekToMs = useCallback((ms: number) => {
    playerRef.current?.seek(ms / 1000);
  }, []);

  const getCurrentMs = useCallback(() => {
    const seconds = playerRef.current?.getCurrentTime() ?? 0;
    return Math.max(0, Math.floor(seconds * 1000));
  }, []);

  // Escape anywhere outside a text field drops the selection, whichever
  // panel made it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key !== "Escape") return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      setSelectionSpan(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onCutsChange = useCallback(
    (cuts: RecordingCut[]) => update({ cuts }),
    [update],
  );

  const deleteSelection = selectionSpan
    ? () => update({ cuts: addCut(config.cuts, selectionSpan) })
    : undefined;

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
              captionsUrl={
                initialTranscript
                  ? `/api/r/transcript/${slug}/captions?v=${captionsVersion}`
                  : undefined
              }
              captionsLang={initialTranscript?.language ?? undefined}
              selection={selectionSpan}
              showCuts
              // 16rem ≈ top bar (h-14) + timeline + this section's p-6; keep in
              // sync if those chrome heights change.
              landscapeMaxHeightCss="calc(100vh - 16rem)"
            />
          </div>
        </section>

        <EditorTranscriptPanel
          slug={slug}
          initialTranscript={initialTranscript}
          transcriptStatus={transcriptStatus}
          initialHasEdits={transcriptHasEdits}
          cuts={config.cuts}
          onCutsChange={onCutsChange}
          onSeek={seekToMs}
          getCurrentMs={getCurrentMs}
          selection={selectionSpan}
          onSelectionChange={setSelectionSpan}
          onTranscriptSaved={refreshCaptions}
        />
        <EditorToolRail
          config={config}
          onConfig={update}
          hasWebcam={!!webcamUrl}
          details={{ slug, sizeBytes, durationMs, viewCount, createdAt }}
        />
      </div>

      <EditorTimeline
        playerRef={playerRef}
        durationMs={durationMs}
        cuts={config.cuts}
        selection={selectionSpan}
        onSelectSpan={setSelectionSpan}
        onDeleteSelection={deleteSelection}
      />
    </main>
  );
}

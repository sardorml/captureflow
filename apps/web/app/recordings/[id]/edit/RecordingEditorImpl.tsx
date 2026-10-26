"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  RecordingPlayer,
  type RecordingPlayerHandle,
} from "@/app/_components/recording";
import { addCut, cutsEqual, type RecordingCut } from "@/lib/recording/cuts";
import type { RecordingEditorProps } from "./RecordingEditor";
import { aspectFromPlaceholder } from "@/app/_components/recording/layout";
import { useEditorConfig } from "./use-editor-config";
import { EditorInspector } from "./EditorInspector";
import { EditorTimeline } from "./EditorTimeline";
import { EditorTopBar } from "./EditorTopBar";

// The recording editor. The preview uses the same RecordingPlayer as the
// public viewer, so it matches what /r/[id] renders pixel for pixel.
export function RecordingEditorImpl(props: RecordingEditorProps) {
  const router = useRouter();
  const {
    slug,
    initialTitle,
    videoUrl,
    posterUrl,
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
        slug={slug}
        title={initialTitle ?? ""}
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
        <section className="min-h-0 min-w-0 flex-1 bg-canvas">
          <RecordingPlayer
            ref={playerRef}
            videoUrl={videoUrl}
            posterUrl={posterUrl}
            webcamUrl={webcamUrl ?? undefined}
            serverDurationMs={durationMs}
            serverWidth={width}
            serverHeight={height}
            config={config}
            className="rounded-none"
            captionsUrl={
              initialTranscript
                ? `/api/r/transcript/${slug}/captions?v=${captionsVersion}`
                : undefined
            }
            captionsLang={initialTranscript?.language ?? undefined}
            selection={selectionSpan}
            showCuts
            framePreview={false}
            fill
          />
        </section>

        <EditorInspector
          config={config}
          onConfig={update}
          hasWebcam={!!webcamUrl}
          aspect={aspectFromPlaceholder(width, height)}
          details={{ slug, sizeBytes, durationMs, viewCount, createdAt }}
          transcript={{
            slug,
            initialTranscript,
            transcriptStatus,
            initialHasEdits: transcriptHasEdits,
            cuts: config.cuts,
            onCutsChange,
            onSeek: seekToMs,
            getCurrentMs,
            selection: selectionSpan,
            onSelectionChange: setSelectionSpan,
            onTranscriptSaved: refreshCaptions,
          }}
        />
      </div>

      <EditorTimeline
        playerRef={playerRef}
        videoUrl={videoUrl}
        webcamUrl={webcamUrl}
        durationMs={durationMs}
        sizeBytes={sizeBytes}
        cuts={config.cuts}
        selection={selectionSpan}
        onSelectSpan={setSelectionSpan}
        onDeleteSelection={deleteSelection}
      />
    </main>
  );
}

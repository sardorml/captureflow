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
import { useSpaceTogglesPlayback } from "@/app/_components/recording/use-space-toggle";
import { useEditorConfig } from "./use-editor-config";
import { EditorInspector } from "./EditorInspector";
import { EditorTimeline, type TrimPreview } from "./EditorTimeline";
import { EditorTopBar } from "./EditorTopBar";

const TEXT_FIELD =
  "input:not([type=range],[type=checkbox],[type=radio],[type=color]), textarea, [contenteditable]:not([contenteditable=false])";

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

  // Picked in the transcript or on the timeline, and only the side that picked
  // it shows it: a clip's words stay plain while the clip is selected.
  const [selected, setSelected] = useState<{
    span: RecordingCut;
    from: "words" | "clip";
  } | null>(null);
  const selectionSpan = selected?.span ?? null;
  const selectWords = useCallback((span: RecordingCut | null) => {
    setSelected(span && { span, from: "words" });
  }, []);
  const selectClip = useCallback((span: RecordingCut | null) => {
    setSelected(span && { span, from: "clip" });
  }, []);
  const [trimPreview, setTrimPreview] = useState<TrimPreview | null>(null);
  // Bumped whenever the server's captions may differ (a transcript edit or
  // a saved config, since cut lines are dropped from the captions), so the
  // track refetches.
  const [captionsVersion, setCaptionsVersion] = useState(0);
  const refreshCaptions = useCallback(
    () => setCaptionsVersion((v) => v + 1),
    [],
  );
  const playerRef = useRef<RecordingPlayerHandle | null>(null);
  // Set by the transcript panel. A ref, because a state here would re-render
  // the player for every pixel the pointer moves over the timeline.
  const hoverWordAtRef = useRef<((ms: number | null) => void) | null>(null);
  const onTimelineHover = useCallback((ms: number | null) => {
    hoverWordAtRef.current?.(ms);
  }, []);
  useSpaceTogglesPlayback(playerRef);

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

  const isPlaying = useCallback(
    () => playerRef.current?.isPlaying() ?? false,
    [],
  );

  const seekToMs = useCallback((ms: number) => {
    playerRef.current?.seek(ms / 1000);
  }, []);

  const getCurrentMs = useCallback(() => {
    const seconds = playerRef.current?.getCurrentTime() ?? 0;
    return Math.max(0, Math.floor(seconds * 1000));
  }, []);

  // Outside a text field, which keeps its own undo: Escape drops the selection
  // whichever panel made it, and the undo shortcuts drive the editor's history.
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const target = e.target as Element | null;
      if (target?.closest(TEXT_FIELD)) return;
      if (e.key === "Escape") {
        setSelected(null);
        return;
      }
      if (!(e.metaKey || e.ctrlKey) || e.altKey) return;
      const key = e.key.toLowerCase();
      if (key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (key === "y" && e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const onCutsChange = useCallback(
    (cuts: RecordingCut[]) => update({ cuts }),
    [update],
  );

  const deleteSelection = selectionSpan
    ? () => {
        update({ cuts: addCut(config.cuts, selectionSpan) });
        setSelected(null);
      }
    : undefined;

  useEffect(() => {
    if (!selectionSpan) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      if ((e.target as Element | null)?.closest(TEXT_FIELD)) return;
      e.preventDefault();
      update({ cuts: addCut(config.cuts, selectionSpan) });
      setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectionSpan, config.cuts, update]);

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
          cuts: trimPreview?.cuts ?? config.cuts,
          focusMs: trimPreview?.edgeMs ?? null,
          hoverWordAtRef,
          onCutsChange,
          onSeek: seekToMs,
          getCurrentMs,
          isPlaying,
          selection: selected?.from === "words" ? selected.span : null,
          onSelectionChange: selectWords,
          onTranscriptSaved: refreshCaptions,
        }}
        stage={
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
            showCuts
            parkInCuts
            framePreview={false}
            fill
          />
        }
        timeline={
          <EditorTimeline
            playerRef={playerRef}
            slug={slug}
            hasWebcam={!!webcamUrl}
            durationMs={durationMs}
            sizeBytes={sizeBytes}
            cuts={config.cuts}
            selection={selected?.from === "clip" ? selected.span : null}
            onSelectSpan={selectClip}
            onDeleteSelection={deleteSelection}
            onCutsChange={onCutsChange}
            onTrimPreview={setTrimPreview}
            onHoverMs={onTimelineHover}
          />
        }
      />
    </main>
  );
}

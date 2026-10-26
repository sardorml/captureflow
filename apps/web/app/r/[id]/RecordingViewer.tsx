"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RecordingPlayerHandle } from "../../_components/recording";
import { useSpaceTogglesPlayback } from "../../_components/recording/use-space-toggle";
import { aspectFromPlaceholder } from "../../_components/recording/layout";
import type { RecordingConfig } from "@/lib/recording-config";
import type {
  RecordingComment,
  RecordingReaction,
  RecordingViewerEntry,
} from "@/lib/recording/types";
import type { RecordingChapter } from "@/lib/recording/summary-chapters";
import type {
  RecordingTranscript,
  TranscriptStatus,
} from "@/lib/recording/types";
import { ContentByline } from "../../_components/screenshot";
import { PoweredBy } from "../../_components/powered-by";
import { RecordingPlayer } from "./RecordingPlayer";
import { Avatar } from "@heroui/react";
import { initials } from "@/lib/format";
import { useEditorConfig } from "@/app/recordings/[id]/edit/use-editor-config";
import dynamic from "next/dynamic";
import { withSplitLoaded } from "@/components/dev/split-loaded";
import { ActivitySidebar } from "./ActivitySidebar";
import { EditableTitle } from "@/app/_components/EditableTitle";
import { SummaryChapters } from "./SummaryChapters";
import { ViewCount } from "./ViewCount";
import { TranscriptPanel } from "./TranscriptPanel";
import { registerPlayerClock } from "./player-clock";

// Owner-only, so viewers never download the editor's controls.
const EditPanel = dynamic(
  () =>
    import("./EditPanel").then((m) =>
      withSplitLoaded("edit-panel", m.EditPanel),
    ),
  { ssr: false },
);

type Props = {
  slug: string;
  // From a link shared at a moment; null opens at the start.
  startAtSeconds: number | null;
  videoUrl: string;
  posterUrl?: string;
  posterBlur?: string | null;
  webcamUrl?: string;
  serverDurationMs: number | null;
  serverWidth: number | null;
  serverHeight: number | null;
  config: RecordingConfig;
  initialReactions: RecordingReaction[];
  initialComments: RecordingComment[];
  viewer: {
    userId: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
  loginUrl: string;
  headlineText: string;
  ownerName: string | null;
  createdAt: number;
  viewCount: number;
  viewers: RecordingViewerEntry[] | null;
  isOwner: boolean;
  initialSummary: string;
  initialChapters: RecordingChapter[];
  initialTranscript: RecordingTranscript | null;
  initialTranscriptStatus: TranscriptStatus;
  editUrl: string;
};

export function RecordingViewer({
  slug,
  startAtSeconds,
  videoUrl,
  posterUrl,
  posterBlur,
  webcamUrl,
  serverDurationMs,
  serverWidth,
  serverHeight,
  config: initialConfig,
  initialReactions,
  initialComments,
  viewer,
  loginUrl,
  headlineText,
  ownerName,
  createdAt,
  viewCount,
  viewers,
  isOwner,
  initialSummary,
  initialChapters,
  initialTranscript,
  initialTranscriptStatus,
  editUrl,
}: Props) {
  const [liveReactions, setLiveReactions] = useState<RecordingReaction[]>([]);
  const [removedReactionIds, setRemovedReactionIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [chapters, setChapters] = useState<RecordingChapter[]>(initialChapters);
  const [comments, setComments] = useState<RecordingComment[]>(initialComments);
  // Held here rather than in the Transcript tab so the player's captions
  // track appears when a just-shared recording's transcript lands.
  const [transcript, setTranscript] = useState(initialTranscript);
  const [transcriptStatus, setTranscriptStatus] = useState(
    initialTranscriptStatus,
  );
  const onTranscriptSettled = useCallback(
    (next: RecordingTranscript | null, status: TranscriptStatus) => {
      setTranscript(next);
      setTranscriptStatus(status);
    },
    [],
  );
  // Only the owner's Edit tab ever changes it; for everyone else this is the
  // server's config as given.
  const {
    config,
    update: updateConfig,
    status: configStatus,
  } = useEditorConfig(slug, initialConfig);
  const playerRef = useRef<RecordingPlayerHandle | null>(null);
  useSpaceTogglesPlayback(playerRef);
  const commentInputRef = useRef<HTMLTextAreaElement | null>(null);

  const focusComment = useCallback(() => {
    commentInputRef.current?.focus({ preventScroll: false });
    commentInputRef.current?.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }, []);

  const onReactionAdded = useCallback((reaction: RecordingReaction) => {
    setLiveReactions((prev) => [...prev, reaction]);
  }, []);

  const onReactionDeleted = useCallback((id: number) => {
    setRemovedReactionIds((prev) => new Set(prev).add(id));
  }, []);

  const goToSignIn = useCallback(() => {
    window.location.href = loginUrl;
  }, [loginUrl]);

  const seekTo = useCallback((ms: number) => {
    playerRef.current?.seekTo(ms / 1000);
  }, []);

  const getCurrentMs = useCallback(() => {
    const s = playerRef.current?.getCurrentTime() ?? 0;
    return Math.max(0, Math.floor(s * 1000));
  }, []);
  useEffect(() => registerPlayerClock(getCurrentMs), [getCurrentMs]);

  // The player knows its length once the metadata is in; until then a seek
  // has nothing to land on, so poll briefly and give up after 20 s.
  useEffect(() => {
    if (startAtSeconds === null) return;
    let tries = 0;
    const id = window.setInterval(() => {
      const player = playerRef.current;
      if (player && player.getDuration() > 0) {
        player.seek(Math.min(startAtSeconds, player.getDuration()));
        window.clearInterval(id);
      } else if (++tries >= 200) {
        window.clearInterval(id);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [startAtSeconds]);

  const signedIn = viewer != null;
  const viewerName = viewer?.name?.trim() || viewer?.email || null;

  return (
    <div className="grid w-full grid-cols-1 bg-panel lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-1 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <main className="flex flex-col bg-stage lg:min-h-0 lg:overflow-y-auto">
        <header className="sticky top-0 z-20 bg-panel max-lg:static max-lg:order-2">
          {/* Padded like the nav (px-4 sm:px-6) plus the drawer button's icon
              inset, so the title's left edge sits under the drawer icon. */}
          <div className="px-6 py-5 sm:px-8">
            <div className="flex w-full gap-5 max-lg:flex-col max-lg:gap-3 lg:items-start">
              <div className="min-w-0 flex-1">
                <EditableTitle
                  slug={slug}
                  title={headlineText}
                  canEdit={isOwner}
                />
                <ContentByline
                  ownerName={ownerName}
                  createdAt={createdAt}
                  leading={
                    ownerName ? (
                      <Avatar className="size-9 lg:hidden">
                        <Avatar.Fallback className="text-sm">
                          {initials(ownerName)}
                        </Avatar.Fallback>
                      </Avatar>
                    ) : null
                  }
                />
              </div>
              <ViewCount
                count={viewCount}
                viewers={viewers}
                className="max-lg:self-start"
              />
            </div>
          </div>
        </header>
        <div className="mx-auto flex w-full max-w-5xl flex-col py-6 max-lg:contents">
          <RecordingPlayer
            videoUrl={videoUrl}
            posterUrl={posterUrl}
            posterBlur={posterBlur}
            webcamUrl={webcamUrl}
            slug={slug}
            initialReactions={initialReactions}
            serverDurationMs={serverDurationMs}
            serverWidth={serverWidth}
            serverHeight={serverHeight}
            config={config}
            captionsUrl={
              transcript ? `/api/r/transcript/${slug}/captions` : undefined
            }
            captionsLang={transcript?.language ?? undefined}
            chapters={chapters}
            comments={comments}
            viewerSignedIn={signedIn}
            onReactionAdded={onReactionAdded}
            removedReactionIds={removedReactionIds}
            onSignInRequested={goToSignIn}
            handleRef={playerRef}
            onCommentClick={signedIn ? focusComment : goToSignIn}
            className="max-lg:order-1 max-lg:w-full! max-lg:rounded-none"
          />
          <div className="px-6 max-lg:order-4 max-lg:pb-6 lg:px-12">
            <SummaryChapters
              slug={slug}
              isOwner={isOwner}
              initialSummary={initialSummary}
              initialChapters={initialChapters}
              onSeek={seekTo}
              getCurrentMs={getCurrentMs}
              onChaptersChange={setChapters}
            />
            <footer className="mt-8 flex justify-center border-t border-line pt-6">
              <PoweredBy />
            </footer>
          </div>
        </div>
      </main>
      <ActivitySidebar
        slug={slug}
        initialReactions={initialReactions}
        initialComments={initialComments}
        liveReactions={liveReactions}
        onReactionDeleted={onReactionDeleted}
        onCommentsChange={setComments}
        transcript={
          <TranscriptPanel
            slug={slug}
            transcript={transcript}
            status={transcriptStatus}
            onSettled={onTranscriptSettled}
            cuts={config.cuts}
            isOwner={isOwner}
            editUrl={editUrl}
            onSeek={seekTo}
            getCurrentMs={getCurrentMs}
          />
        }
        editPanel={
          isOwner ? (
            <EditPanel
              slug={slug}
              editUrl={editUrl}
              config={config}
              onConfig={updateConfig}
              status={configStatus}
              hasWebcam={!!webcamUrl}
              aspect={aspectFromPlaceholder(serverWidth, serverHeight)}
            />
          ) : null
        }
        viewerSignedIn={signedIn}
        viewerName={viewerName}
        viewerUserId={viewer?.userId ?? null}
        viewerImageUrl={viewer?.image ?? null}
        isOwner={isOwner}
        onSignIn={goToSignIn}
        onSeek={seekTo}
        getCurrentMs={getCurrentMs}
        commentInputRef={commentInputRef}
      />
    </div>
  );
}

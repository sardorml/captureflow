"use client";

import { useCallback, useRef, useState } from "react";
import type { RecordingPlayerHandle } from "../../_components/recording";
import type { RecordingConfig } from "@/lib/recording-config";
import type {
  RecordingComment,
  RecordingReaction,
} from "@/lib/recording/types";
import type { RecordingChapter } from "@/lib/recording/summary-chapters";
import { ContentByline } from "../../_components/screenshot";
import { PoweredBy } from "../../_components/powered-by";
import { RecordingPlayer } from "./RecordingPlayer";
import { ActivitySidebar } from "./ActivitySidebar";
import { SummaryChapters } from "./SummaryChapters";

type Props = {
  slug: string;
  videoUrl: string;
  posterUrl?: string;
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
  isOwner: boolean;
  initialSummary: string;
  initialChapters: RecordingChapter[];
};

export function RecordingViewer({
  slug,
  videoUrl,
  posterUrl,
  webcamUrl,
  serverDurationMs,
  serverWidth,
  serverHeight,
  config,
  initialReactions,
  initialComments,
  viewer,
  loginUrl,
  headlineText,
  ownerName,
  createdAt,
  viewCount,
  isOwner,
  initialSummary,
  initialChapters,
}: Props) {
  const [liveReactions, setLiveReactions] = useState<RecordingReaction[]>([]);
  const playerRef = useRef<RecordingPlayerHandle | null>(null);
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

  const signedIn = viewer != null;
  const viewerName = viewer?.name?.trim() || viewer?.email || null;

  return (
    <div className="grid w-full grid-cols-1 bg-canvas lg:h-[calc(100vh-64px)] lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-1 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <main className="flex flex-col lg:min-h-0 lg:overflow-y-auto">
        <header className="sticky top-0 z-20 border-b border-line bg-canvas-2">
          <div className="relative px-6 py-5 lg:px-12">
            <div className="mx-auto w-full max-w-5xl pr-32 sm:pr-36">
              <h1 className="truncate text-[22px] font-[600] tracking-tight text-neutral-100 sm:text-2xl">
                {headlineText}
              </h1>
              <ContentByline ownerName={ownerName} createdAt={createdAt} />
            </div>
            <span className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-overlay px-3 py-1 text-xs font-medium text-neutral-300 ring-1 ring-line lg:right-12">
              {viewCount.toLocaleString()} {viewCount === 1 ? "view" : "views"}
            </span>
          </div>
        </header>
        <div className="mx-auto flex w-full max-w-5xl flex-col px-6 py-6 lg:px-12">
          <RecordingPlayer
            videoUrl={videoUrl}
            posterUrl={posterUrl}
            webcamUrl={webcamUrl}
            slug={slug}
            initialReactions={initialReactions}
            serverDurationMs={serverDurationMs}
            serverWidth={serverWidth}
            serverHeight={serverHeight}
            config={config}
            viewerSignedIn={signedIn}
            onReactionAdded={onReactionAdded}
            onSignInRequested={goToSignIn}
            handleRef={playerRef}
            onCommentClick={signedIn ? focusComment : goToSignIn}
          />
          <SummaryChapters
            slug={slug}
            isOwner={isOwner}
            initialSummary={initialSummary}
            initialChapters={initialChapters}
            onSeek={seekTo}
            getCurrentMs={getCurrentMs}
          />
          <footer className="mt-8 flex justify-center border-t border-line pt-6">
            <PoweredBy />
          </footer>
        </div>
      </main>
      <ActivitySidebar
        slug={slug}
        initialReactions={initialReactions}
        initialComments={initialComments}
        liveReactions={liveReactions}
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

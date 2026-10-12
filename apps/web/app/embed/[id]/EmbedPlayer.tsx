"use client";

import type { ComponentProps } from "react";
import { RecordingPlayer } from "@/app/r/[id]/RecordingPlayer";

type Props = Omit<
  ComponentProps<typeof RecordingPlayer>,
  "viewerSignedIn" | "onSignInRequested" | "onCommentClick" | "handleRef"
> & {
  signedIn: boolean;
  shareUrl: string;
  loginUrl: string;
};

// Framed on another site, so anything needing the full page opens it in a tab.
export function EmbedPlayer({
  signedIn,
  shareUrl,
  loginUrl,
  ...player
}: Props) {
  const openTab = (url: string) => window.open(url, "_blank", "noopener");
  return (
    <main className="min-h-screen bg-black">
      <RecordingPlayer
        {...player}
        viewerSignedIn={signedIn}
        onSignInRequested={() => openTab(loginUrl)}
        onCommentClick={() => openTab(shareUrl)}
        landscapeMaxHeightCss="100vh"
        embedded
      />
    </main>
  );
}

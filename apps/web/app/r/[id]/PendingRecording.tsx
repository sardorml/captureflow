"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AtSign, MessageSquare, Smile, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { useAppMessages } from "@/components/app-i18n-provider";
import { fill } from "@/lib/i18n/fill";
import { fmt } from "@/lib/i18n/format";
import { initials } from "@/lib/format";
import { ContentByline } from "../../_components/screenshot";
import { PoweredBy } from "../../_components/powered-by";
import {
  aspectFromPlaceholder,
  sizeStyleForAspect,
} from "../../_components/recording/layout";
import { DEFAULT_REACTIONS } from "@/lib/recording/reactions";
import { ViewCount } from "./ViewCount";

type PendingViewer = {
  userId: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

type PendingRecordingProps = {
  slug: string;
  titleLine: string;
  ownerName: string | null;
  createdAt: number;
  viewCount: number;
  isOwner: boolean;
  viewer: PendingViewer | null;
  width: number | null;
  height: number | null;
  // Made by an agent: the wait is the video being generated, not an upload.
  generated: boolean;
};

const POLL_INTERVAL_MS = 1500;
/*
 * ~10 min cap: the extension lands viewers here right at stop, so a long tail
 * upload on a slow uplink is still in flight well past two minutes. A pending
 * row stuck past this means the client died mid-upload; the cron sweep GCs it
 * within the hour.
 */
const MAX_ATTEMPTS = 400;
const TAB_CLASS =
  "h-full flex-1 group-data-horizontal/tabs:after:bottom-[-1px]";

export function PendingRecording({
  slug,
  titleLine,
  ownerName,
  createdAt,
  viewCount,
  isOwner,
  viewer,
  width,
  height,
  generated,
}: PendingRecordingProps) {
  const m = useAppMessages();
  const copy = m.viewer.pending;
  const router = useRouter();
  const [exhausted, setExhausted] = useState(false);
  const [failed, setFailed] = useState(false);
  const attemptsRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const tick = async (): Promise<void> => {
      if (cancelled) return;
      attemptsRef.current += 1;
      try {
        const res = await fetch(
          `/api/r/state?slug=${encodeURIComponent(slug)}`,
          {
            cache: "no-store",
          },
        );
        if (cancelled) return;
        if (res.ok) {
          const body = (await res.json()) as {
            state: "pending" | "ready" | "failed" | "missing";
          };
          if (body.state === "ready") {
            router.refresh();
            return;
          }
          if (body.state === "failed" || body.state === "missing") {
            setFailed(true);
            return;
          }
        }
      } catch {
        // Fall through to the retry.
      }
      if (attemptsRef.current >= MAX_ATTEMPTS) {
        setExhausted(true);
        return;
      }
      setTimeout(tick, POLL_INTERVAL_MS);
    };
    const t = setTimeout(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [slug, router]);

  const showRetry = exhausted || failed;

  // Mirrors RecordingViewer, RecordingPlayer and ActivitySidebar so nothing
  // moves when the ready page swaps in.
  return (
    <div className="grid w-full grid-cols-1 bg-panel lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-1 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <main className="flex flex-col bg-stage lg:min-h-0 lg:overflow-y-auto">
        <header className="sticky top-0 z-20 bg-panel max-lg:static max-lg:order-2">
          <div className="px-6 py-3 sm:px-8">
            <div className="flex w-full gap-5 max-lg:flex-col max-lg:gap-3 lg:items-start">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-medium tracking-tight text-neutral-100 lg:truncate lg:text-xl">
                  {titleLine}
                </h1>
                <ContentByline
                  ownerName={ownerName}
                  createdAt={createdAt}
                  leading={
                    ownerName ? (
                      <Avatar className="size-9 lg:hidden">
                        <AvatarFallback className="text-sm">
                          {initials(ownerName)}
                        </AvatarFallback>
                      </Avatar>
                    ) : null
                  }
                />
              </div>
              <ViewCount
                count={viewCount}
                viewers={null}
                className="max-lg:self-start"
              />
            </div>
          </div>
        </header>
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center py-6 max-lg:contents">
          <div
            className="relative overflow-clip rounded-[var(--media-border-radius,16px)] bg-black/[0.06] max-lg:order-1 max-lg:w-full! max-lg:rounded-none dark:bg-white/[0.08]"
            style={sizeStyleForAspect(
              // Agent videos land at 16:9; the row has no size until they do.
              generated && !width
                ? 16 / 9
                : aspectFromPlaceholder(width, height),
              "calc(100vh - 19rem)",
            )}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
              {showRetry ? (
                <>
                  <p className="text-base font-semibold text-fg">
                    {copy.failedTitle}
                  </p>
                  <p className="max-w-sm text-sm text-fg-muted">
                    {copy.failedDescription}
                  </p>
                </>
              ) : generated ? (
                <>
                  <TextShimmer
                    as="p"
                    text={copy.generatingTitle}
                    className="text-xl font-semibold"
                  />
                  <p className="max-w-xs text-sm text-fg-muted">
                    {copy.generatingDescription}
                  </p>
                </>
              ) : (
                <>
                  <Spinner className="size-6" />
                  <p className="mt-1 text-base font-semibold text-fg">
                    {copy.preparingTitle}
                  </p>
                  <p className="max-w-xs text-sm text-fg-muted">
                    {copy.preparingDescription}
                  </p>
                </>
              )}
            </div>
          </div>
          <div
            aria-hidden="true"
            className="mt-8 flex items-center justify-center gap-2 opacity-50 max-lg:order-3 max-lg:mt-5 max-lg:px-4"
          >
            <div className="flex items-center gap-1 rounded-full bg-panel px-2 py-1.5 shadow-md">
              {DEFAULT_REACTIONS.map((r) => (
                <span
                  key={r.emoji}
                  className="flex h-12 w-12 items-center justify-center rounded-full text-[28px] leading-none max-sm:h-10 max-sm:w-10 max-sm:text-[22px]"
                >
                  {r.emoji}
                </span>
              ))}
            </div>
            <span className="flex h-[60px] items-center gap-2.5 rounded-full bg-panel px-6 text-base font-medium text-fg shadow-md max-sm:h-[52px] max-sm:px-4">
              <MessageSquare className="h-6 w-6" />
              <span className="hidden sm:inline">{copy.comment}</span>
            </span>
          </div>
          <div className="w-full px-6 max-lg:order-4 max-lg:pb-6 lg:px-12">
            <footer className="mt-8 flex justify-center border-t border-line pt-6">
              <PoweredBy />
            </footer>
          </div>
        </div>
      </main>
      <PendingSidebar viewer={viewer} isOwner={isOwner} />
    </div>
  );
}

// The activity sidebar as it will be once the recording is there, with nothing to do yet.
function PendingSidebar({
  viewer,
  isOwner,
}: {
  viewer: PendingViewer | null;
  isOwner: boolean;
}) {
  const m = useAppMessages();
  const name = viewer?.name?.trim() || viewer?.email || null;
  const firstName = (name ?? "").trim().split(/\s+/)[0] || null;

  return (
    <aside className="flex w-full flex-col border-black/[0.06] bg-panel max-lg:border-t lg:h-full lg:w-auto lg:overflow-hidden lg:border-l dark:border-white/[0.07]">
      <Tabs
        value="activity"
        aria-label={m.activity.sidebar.label}
        className="flex min-h-0 flex-1 flex-col gap-0"
      >
        <header className="sticky top-0 z-10 flex h-12 shrink-0 items-stretch border-b border-line bg-panel/90 backdrop-blur-md lg:static lg:bg-transparent lg:backdrop-blur-none">
          <TabsList
            variant="line"
            className="w-full gap-0 p-0 group-data-horizontal/tabs:h-full"
          >
            <TabsTrigger value="activity" className={TAB_CLASS}>
              {m.activity.sidebar.activityTab}
              <span className="rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground tabular-nums">
                0
              </span>
            </TabsTrigger>
            <TabsTrigger value="transcript" className={TAB_CLASS} disabled>
              {m.activity.sidebar.transcriptTab}
            </TabsTrigger>
            {isOwner ? (
              <TabsTrigger value="edit" className={TAB_CLASS} disabled>
                {m.activity.sidebar.toolsTab}
              </TabsTrigger>
            ) : null}
          </TabsList>
        </header>
        <TabsContent
          value="activity"
          className="flex min-h-0 flex-1 flex-col p-0"
        >
          <div className="flex-1 px-5 py-4 lg:min-h-0 lg:overflow-y-auto lg:px-6">
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-tint text-fg-muted ring-1 ring-line-strong">
                <MessageSquare className="h-5 w-5" />
              </div>
              <p className="mt-4 text-base font-semibold text-fg">
                {viewer
                  ? firstName
                    ? fmt(m.activity.empty.firstTitleNamed, { name: firstName })
                    : m.activity.empty.firstTitle
                  : m.activity.empty.title}
              </p>
              <p className="mt-1.5 max-w-[18rem] text-xs leading-relaxed text-fg-muted">
                {viewer
                  ? fill(m.activity.empty.hint, {
                      key: (
                        <span className="inline-flex items-center rounded border border-line-strong bg-tint px-1.5 py-0.5 font-mono text-[10px] font-semibold text-fg">
                          C
                        </span>
                      ),
                    })
                  : m.activity.empty.description}
              </p>
            </div>
          </div>
          <div className="sticky bottom-0 z-10 bg-canvas-2 p-4 backdrop-blur-md supports-[backdrop-filter]:bg-canvas-2/85 lg:bg-transparent lg:p-3 lg:backdrop-blur-none">
            {!viewer ? (
              <Button size="lg" className="w-full" disabled>
                <Sparkles size={16} />
                {m.activity.composer.signIn}
              </Button>
            ) : (
              <div
                aria-disabled="true"
                className="relative rounded-2xl border border-black/[0.15] bg-panel-2 p-3 dark:border-white/[0.16]"
              >
                <div className="flex items-start gap-2.5">
                  <Avatar className="mt-0.5 size-7 shrink-0">
                    {viewer.image && <AvatarImage src={viewer.image} alt="" />}
                    <AvatarFallback className="text-[11px] font-medium">
                      {initials(name ?? m.activity.you)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="min-h-[1.5rem] w-full text-sm text-muted-foreground">
                    {m.activity.composer.placeholder}
                  </p>
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled
                      aria-label={m.activity.composer.mention}
                    >
                      <AtSign className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled
                      aria-label={m.activity.composer.insertEmoji}
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button size="sm" disabled>
                    {fmt(m.activity.composer.submitAt, { time: "0:00" })}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
}

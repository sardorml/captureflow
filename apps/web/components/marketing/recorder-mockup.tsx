'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, Link2, Copy, Check, Share } from 'lucide-react';

// CaptureFlow's hero product demo — replaces Framely's video-editor mockup.
// It reads as a CaptureFlow share page (captureflow.xyz/r/…): a dark, rounded
// card whose slim top bar pairs macOS traffic lights with the instant-link
// payoff — a link/share HEADER (the URL + Copy link + share action) — over the
// clip itself (soft blue under-glow, a large white play control), with a live
// waveform scrubber along the bottom. The "Link copied" pill reinforces it.
//
// The stage embeds an actual demo clip (placeholder for now): it shows the
// poster frame until the visitor clicks play, then plays through — and the
// waveform scrubber tracks the clip's real currentTime/duration.
//
// Icons are lucide-react (not the Material Symbols <Icon>): the marketing icon
// font is a ligature SUBSET that doesn't include every glyph the mockup needs
// (content_copy/ios_share), and a missing ligature renders as raw literal
// text. lucide always renders.

// Deterministic waveform bar heights (percentages). Hand-tuned so the strip
// reads like a real audio waveform, and identical on server and client.
const WAVEFORM = [
  28, 42, 60, 38, 72, 88, 54, 34, 48, 66, 80, 92, 70, 46, 30, 52, 74, 90, 62,
  40, 26, 44, 68, 84, 96, 76, 50, 32, 58, 82, 94, 64, 42, 28, 46, 70, 86, 72,
  54, 36, 60, 78, 90, 66, 44, 30, 50, 74,
];

// The demo share link shown in the header pill + "Link copied" toast.
const SHARE_PATH = 'captureflow.xyz/r/8kx2pnq4';
// What the Copy link button writes to the clipboard — the bare site URL.
const SHARE_URL = 'https://captureflow.xyz';

// m:ss — clamps NaN/negatives (duration is NaN until metadata loads).
function fmt(s: number): string {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function RecorderMockup() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  // Tap feedback mirroring the /r share player: a dark icon "pop" on each
  // play/pause transition (the share-icon-pop keyframe lives in globals.css,
  // loaded globally by the root layout).
  const [overlayIcon, setOverlayIcon] = useState<'play' | 'pause' | null>(null);
  const [prevPlaying, setPrevPlaying] = useState(false);
  // "Copy link" feedback: clicking the header button writes the share URL to the
  // clipboard and bumps copyCount, which re-keys the toast so its entrance
  // animation replays; `copied` swaps the button label to a check for ~1.6s.
  const [copyCount, setCopyCount] = useState(0);
  const [copied, setCopied] = useState(false);

  // Media listeners are attached imperatively (not as React on* props) to dodge
  // a hydration race: `preload="metadata"` starts loading the clip the instant
  // the element exists, so `loadedmetadata`/`durationchange` — both one-shot —
  // can fire BEFORE React attaches its synthetic handlers, leaving `duration`
  // stuck at 0 (right-hand label "0:00", waveform never fills). `timeupdate`
  // fires repeatedly so it survives the race, which is why `current` advanced
  // but `duration` didn't. Attaching in an effect and immediately syncing
  // whatever state the element already reached closes the gap. The finite/`>0`
  // guard rejects the `Infinity`/NaN some clips report before they're buffered.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    let raf = 0;
    const syncDuration = () => {
      if (Number.isFinite(v.duration) && v.duration > 0) setDuration(v.duration);
    };
    const syncTime = () => setCurrent(v.currentTime);
    const syncPlaying = () => setPlaying(!v.paused);
    // While playing, sample currentTime every animation frame so the scrubber
    // advances continuously. `timeupdate` alone fires only ~4x/sec, which makes
    // the playhead + fill visibly jump in ~250ms steps; rAF tracks playback at
    // the display's refresh rate. React only re-touches the playhead's `left`
    // each frame — the bars change class only at bar boundaries — so it's cheap.
    const loop = () => {
      setCurrent(v.currentTime);
      raf = requestAnimationFrame(loop);
    };
    const startLoop = () => {
      syncPlaying();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    };
    const stopLoop = () => {
      syncPlaying();
      cancelAnimationFrame(raf);
      setCurrent(v.currentTime); // settle on the exact final position
    };
    // Catch up on anything that already happened before this effect ran.
    syncDuration();
    syncTime();
    syncPlaying();
    if (!v.paused) startLoop();
    v.addEventListener('loadedmetadata', syncDuration);
    v.addEventListener('durationchange', syncDuration);
    // Keeps `current` accurate while paused / after a seek (loop is idle then).
    v.addEventListener('timeupdate', syncTime);
    v.addEventListener('play', startLoop);
    v.addEventListener('playing', startLoop);
    v.addEventListener('pause', stopLoop);
    v.addEventListener('ended', stopLoop);
    return () => {
      cancelAnimationFrame(raf);
      v.removeEventListener('loadedmetadata', syncDuration);
      v.removeEventListener('durationchange', syncDuration);
      v.removeEventListener('timeupdate', syncTime);
      v.removeEventListener('play', startLoop);
      v.removeEventListener('playing', startLoop);
      v.removeEventListener('pause', stopLoop);
      v.removeEventListener('ended', stopLoop);
    };
  }, []);

  // Clear the pop overlay once its 750ms animation has run (same duration as
  // the share-icon-pop keyframe).
  useEffect(() => {
    if (overlayIcon === null) return;
    const t = setTimeout(() => setOverlayIcon(null), 750);
    return () => clearTimeout(t);
  }, [overlayIcon]);

  // Reset the button's "Copied" label ~1.6s after each copy (keyed on copyCount
  // so rapid re-clicks restart the timer instead of letting it lapse early).
  useEffect(() => {
    if (copyCount === 0) return;
    setCopied(true);
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copyCount]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      // Restart from the top once it's played through.
      if (v.ended || v.currentTime >= v.duration) v.currentTime = 0;
      void v.play();
    } else {
      v.pause();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard?.writeText(SHARE_URL);
    } catch {
      // Clipboard can be unavailable (insecure context / denied permission) —
      // still replay the toast so the interaction always feels responsive.
    }
    setCopyCount((c) => c + 1);
  };

  // Playback progress 0..1, driving the waveform fill + scrubber head.
  const progress = duration > 0 ? Math.min(1, current / duration) : 0;
  const playedCount = Math.round(progress * WAVEFORM.length);

  // Derive the pop icon from play/pause transitions during render — the same
  // pattern the /r share player uses. Shows a pause-pop as playback starts;
  // pausing brings the persistent play button back instead.
  if (prevPlaying !== playing) {
    setPrevPlaying(playing);
    setOverlayIcon(playing ? 'pause' : 'play');
  }

  return (
    <div className="relative mx-auto w-full max-w-5xl px-5 pb-24 pt-6 sm:px-8">
      {/* Soft blue wash bleeding out behind the window — ties the demo into the
          hero's halo and gives the dark glass something to float over. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-10 -z-10 mx-auto h-[70%] max-w-4xl rounded-[40px] bg-gradient-to-b from-blue-500/25 via-blue-400/10 to-transparent blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ type: 'spring', stiffness: 90, damping: 18, mass: 0.9 }}
        className="relative overflow-hidden rounded-[14px] bg-neutral-950 shadow-2xl shadow-blue-950/40 sm:rounded-[16px]"
      >
        {/* ── Link/share header — macOS traffic lights + the instant-link
            payoff (URL · Copy link · share), in place of full window chrome.
            One slim row. The parent's `overflow-hidden rounded` clips its top
            corners. ──────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] bg-gradient-to-b from-neutral-900 to-neutral-950 px-4 py-2 sm:px-5">
          {/* Traffic lights */}
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>

          {/* URL pill */}
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5">
            <Link2 className="size-3.5 shrink-0 text-blue-400" />
            <span className="truncate font-mono text-xs text-neutral-300">
              {SHARE_PATH}
            </span>
          </div>

          {/* Copy + share. Copy link is the live affordance: it writes the share
              URL to the clipboard and replays the "Link copied" toast. */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              aria-label="Copy share link"
              className="flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1.5 text-xs font-semibold text-blue-300 transition-colors hover:bg-blue-500/20 active:bg-blue-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
            >
              {copied ? (
                <Check className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}
              <span className="hidden sm:inline">
                {copied ? 'Copied' : 'Copy link'}
              </span>
            </button>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-neutral-400">
              <Share className="size-4" />
            </span>
          </div>
        </div>

        {/* ── Stage — embeds the demo clip. Poster shows until the visitor
            clicks play; the play control toggles playback. ──────────────── */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-900">
          <video
            ref={videoRef}
            src="/demo.mp4"
            poster="/demo-poster.jpg"
            playsInline
            preload="metadata"
            // Playback state (duration / currentTime / playing) is wired up via
            // imperative listeners in the effect above — see the note there for
            // why React on* props would miss the one-shot metadata events.
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Click target across the whole stage — toggles play/pause. While
              paused it dims the clip and shows the big play control + toast;
              once playing, those fade out so only the clip is visible. */}
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? 'Pause demo' : 'Play demo'}
            className="group absolute inset-0 flex items-center justify-center"
          >
            {/* Legibility veil while paused — a flat dim so the play control
                reads. No blue tint over the clip. */}
            <span
              aria-hidden
              className={`pointer-events-none absolute inset-0 bg-black/40 transition-opacity duration-300 ${
                playing ? 'opacity-0' : 'opacity-100'
              }`}
            />

            {/* Loom-style play control — a solid blue core inside a thick
                translucent ring, with a white play glyph. Static (no pulse).
                Fades + lifts in/out on play/pause; grows slightly on hover. */}
            <span
              className={`relative flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 shadow-2xl shadow-blue-950/40 ring-[10px] ring-blue-600/30 transition-[opacity,transform] duration-200 ease-out group-hover:scale-[1.06] sm:h-28 sm:w-28 ${
                playing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
              }`}
            >
              <Play className="size-10 translate-x-0.5 fill-white text-white sm:size-11" />
            </span>
          </button>

          {/* Play/pause tap feedback — the /r share player's dark icon "pop"
              (share-icon-pop). Shown only while playing so it never stacks with
              the persistent play button; keyed so back-to-back toggles restart
              the animation from frame 0. */}
          {overlayIcon && playing ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div
                key={overlayIcon}
                className="animate-share-icon-pop flex h-[116px] w-[116px] items-center justify-center rounded-full bg-[#171717]/90 sm:h-[132px] sm:w-[132px]"
              >
                {overlayIcon === 'pause' ? (
                  <Pause className="size-10 text-white sm:size-11" fill="currentColor" />
                ) : (
                  <Play className="size-10 translate-x-0.5 text-white sm:size-11" fill="currentColor" />
                )}
              </div>
            </div>
          ) : null}

          {/* "Link copied" toast — the instant-share moment, floating top-right.
              Hidden during playback (so it doesn't cover the clip) UNLESS the
              visitor just hit Copy link. The inner card is keyed by copyCount so
              each copy remounts it and replays the spring entrance. */}
          <div
            className={`pointer-events-none absolute right-4 top-4 transition-opacity duration-300 sm:right-5 sm:top-5 ${
              playing && !copied ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <motion.div
              key={copyCount}
              initial={{ opacity: 0, y: -8, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26, mass: 0.7 }}
              className="flex items-center gap-2.5 rounded-xl border border-black/5 bg-white/95 px-3 py-2 shadow-xl shadow-black/10 backdrop-blur-md"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
                <svg viewBox="0 0 24 24" className="size-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <div className="leading-tight">
                <p className="text-[11px] font-semibold text-neutral-900">Link copied</p>
                <p className="font-mono text-[10px] text-neutral-500">{SHARE_PATH}</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Waveform scrubber — tracks the clip's real playback position. */}
        <div className="flex items-center gap-4 border-t border-white/[0.06] bg-neutral-950 px-4 py-4 sm:px-6">
          <span className="font-mono text-[11px] tabular-nums text-neutral-400">
            {fmt(current)}
          </span>

          <div className="relative flex h-10 flex-1 items-center gap-[3px]">
            {WAVEFORM.map((h, i) => (
              <span
                key={i}
                className={`w-full shrink rounded-full transition-colors duration-150 ${
                  i < playedCount ? 'bg-blue-400' : 'bg-white/15'
                }`}
                style={{ height: `${h}%` }}
              />
            ))}
            {/* Scrubber head riding the current playback position. */}
            <span
              aria-hidden
              className="pointer-events-none absolute top-1/2 -translate-y-1/2"
              style={{ left: `${progress * 100}%` }}
            >
              <span className="block h-9 w-[2px] rounded-full bg-white shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
            </span>
          </div>

          <span className="font-mono text-[11px] tabular-nums text-neutral-500">
            {fmt(duration)}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

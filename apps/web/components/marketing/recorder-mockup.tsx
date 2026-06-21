'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Play, Link2, Copy, Share } from 'lucide-react';

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

  // Playback progress 0..1, driving the waveform fill + scrubber head.
  const progress = duration > 0 ? Math.min(1, current / duration) : 0;
  const playedCount = Math.round(progress * WAVEFORM.length);

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
        className="relative overflow-hidden rounded-[14px] border border-white/10 bg-neutral-950 shadow-2xl shadow-blue-950/40 ring-1 ring-black/5 sm:rounded-[16px]"
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
              captureflow.xyz/r/8kx2pnq4
            </span>
          </div>

          {/* Copy + share */}
          <div className="flex shrink-0 items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1.5 text-xs font-semibold text-blue-300">
              <Copy className="size-3.5" />
              <span className="hidden sm:inline">Copy link</span>
            </span>
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

            {/* Large white play control, centred — hidden during playback. */}
            <span
              className={`relative flex h-20 w-20 items-center justify-center rounded-full bg-white/95 shadow-2xl shadow-blue-500/30 ring-8 ring-white/10 backdrop-blur transition-all duration-300 group-hover:scale-105 sm:h-24 sm:w-24 ${
                playing ? 'scale-90 opacity-0' : 'opacity-100'
              }`}
            >
              <Play className="size-10 translate-x-0.5 fill-current text-neutral-900 sm:size-11" />
            </span>
          </button>

          {/* "Link copied" toast — the instant-share moment, floating top-right.
              Fades out during playback so it doesn't cover the clip. */}
          <div
            className={`pointer-events-none absolute right-4 top-4 transition-opacity duration-300 sm:right-5 sm:top-5 ${
              playing ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-neutral-900/80 px-3 py-2 shadow-xl shadow-black/40 backdrop-blur-md">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20">
                <svg viewBox="0 0 24 24" className="size-3.5 text-blue-400" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <div className="leading-tight">
                <p className="text-[11px] font-semibold text-white">Link copied</p>
                <p className="font-mono text-[10px] text-neutral-400">
                  captureflow.xyz/r/8kx2pnq4
                </p>
              </div>
            </div>
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

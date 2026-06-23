'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Play, Pause } from 'lucide-react';

// CaptureFlow's hero product demo — replaces Framely's video-editor mockup.
// The browser/share-viewer chrome is gone: this is now just the demo clip in a
// rounded card (soft blue under-glow, a large white play control), with the
// "Link copied" pill floating over it to land the instant-share payoff.
//
// The stage embeds an actual demo clip (placeholder for now): it shows the
// poster frame until the visitor clicks play, then plays through.
//
// Icons are lucide-react (not the Material Symbols <Icon>): the marketing icon
// font is a ligature SUBSET that doesn't include every glyph the mockup needs,
// and a missing ligature renders as raw literal text. lucide always renders.

// The demo share link shown in the "Link copied" toast.
const SHARE_PATH = 'captureflow.xyz/r/8kx2pnq4';

export function RecorderMockup() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  // Tap feedback mirroring the /r share player: a dark icon "pop" on each
  // play/pause transition (the share-icon-pop keyframe lives in globals.css,
  // loaded globally by the root layout).
  const [overlayIcon, setOverlayIcon] = useState<'play' | 'pause' | null>(null);
  const [prevPlaying, setPrevPlaying] = useState(false);

  // Keep `playing` in sync with the element. Attached imperatively (not as React
  // on* props) so the initial state is read straight off the element the moment
  // the effect runs, even if the clip autobuffered before hydration.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const syncPlaying = () => setPlaying(!v.paused);
    syncPlaying();
    v.addEventListener('play', syncPlaying);
    v.addEventListener('playing', syncPlaying);
    v.addEventListener('pause', syncPlaying);
    v.addEventListener('ended', syncPlaying);
    return () => {
      v.removeEventListener('play', syncPlaying);
      v.removeEventListener('playing', syncPlaying);
      v.removeEventListener('pause', syncPlaying);
      v.removeEventListener('ended', syncPlaying);
    };
  }, []);

  // Clear the pop overlay once its 750ms animation has run (same duration as
  // the share-icon-pop keyframe).
  useEffect(() => {
    if (overlayIcon === null) return;
    const t = setTimeout(() => setOverlayIcon(null), 750);
    return () => clearTimeout(t);
  }, [overlayIcon]);

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

  // Derive the pop icon from play/pause transitions during render — the same
  // pattern the /r share player uses. Shows a pause-pop as playback starts;
  // pausing brings the persistent play button back instead.
  if (prevPlaying !== playing) {
    setPrevPlaying(playing);
    setOverlayIcon(playing ? 'pause' : 'play');
  }

  return (
    <div className="relative mx-auto w-full max-w-5xl px-5 pb-24 pt-6 sm:px-8">
      {/* Soft blue wash bleeding out behind the clip — ties the demo into the
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
        className="relative aspect-[16/9] w-full overflow-hidden rounded-[14px] bg-neutral-900 shadow-2xl shadow-blue-950/40 sm:rounded-[16px]"
      >
        {/* The demo clip. Poster shows until the visitor clicks play; the play
            control toggles playback. */}
        <video
          ref={videoRef}
          src="/demo.mp4"
          poster="/demo-poster.jpg"
          playsInline
          preload="metadata"
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
            Hidden during playback so it doesn't cover the clip, and hidden
            entirely on phones where it crowds the small stage. */}
        <div
          className={`pointer-events-none absolute right-4 top-4 hidden transition-opacity duration-300 sm:right-5 sm:top-5 sm:block ${
            playing ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <motion.div
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
      </motion.div>
    </div>
  );
}

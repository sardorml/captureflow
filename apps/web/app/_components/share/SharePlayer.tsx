"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Check,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  isShareGradientKey,
  isShareHexColor,
  SHARE_GRADIENT_PRESETS,
  shareGradientCss,
  type ShareCameraCorner,
  type ShareCameraSize,
  type ShareConfig,
} from "@/lib/share-config";

/*
 * Imperative handle so wrapping components (e.g. the public viewer's
 * reactions layer) can read player state at click-time, bypassing
 * React's batched render cycle.
 */
export type SharePlayerHandle = {
  getCurrentTime(): number;
  getDuration(): number;
  // Seek and start playing, so clicking a timestamped reaction/comment lands at its moment without a second press-play.
  seekTo(seconds: number): void;
};

// Info handed to the progressOverlay slot so the public viewer can align
// reaction cluster bubbles to the progress bar without forking the player.
export type ProgressOverlayInfo = {
  // Player's known duration, falling back to serverDurationMs/1000 before metadata arrives.
  durationSeconds: number;
  // The overlay anchors to whichever progress indicator is active: the scrubber when controls show, the slim strip when collapsed.
  controlsVisible: boolean;
};

type Props = {
  videoUrl: string;
  posterUrl?: string;
  // Companion webcam video, rendered as a configurable PiP overlay and synced to the main player. Carries mic audio; the main video carries system audio (independently muteable). Absent when the recording had no camera (webcam_state='none') or the upload hasn't finalized.
  webcamUrl?: string;
  // Authoritative duration from the share record, used to size the scrubber before <video> knows its own duration — which can take seconds, or never resolve to a finite number for fragmented MP4s.
  serverDurationMs: number | null;
  // Server-known intrinsic dimensions, used to reserve the player box at the right aspect ratio on first paint. Without this the container collapses to 0 until metadata loads, then jumps and shoves the page.
  serverWidth: number | null;
  serverHeight: number | null;
  // Persisted presentation config (bg, cam PiP corner + size, per-track mute defaults). On the edit page this is the LIVE config the sidebar mutates — changes apply immediately so the user previews exactly what the public viewer renders after Save.
  config: ShareConfig;
  // Render slot above the progress bar; the public viewer uses it to plot reaction clusters.
  progressOverlay?: (info: ProgressOverlayInfo) => ReactNode;
  // Content below the player, inside the outer flex column. Hidden in fullscreen (only the player container goes fullscreen). The public viewer uses it for the reaction bar.
  belowPlayer?: ReactNode;
  // Viewport-aware max-height for LANDSCAPE sources, e.g. 'min(34rem, calc(100vh - 19rem))'. The public viewer passes this so the reaction bar below the player stays in view without scrolling; the editor omits it so the preview fills the available panel height. Without it, landscape players fill the column width uncapped.
  landscapeMaxHeightCss?: string;
};

const SKIP_SECONDS = 5;
const SPEED_CYCLE = [1, 1.25, 1.5, 2];

/*
 * Custom player with native HTML5 controls off: the bg is part of the
 * video composite, so a UA control bar painted over it would break the
 * look. The container hugs the video's natural aspect ratio (set once
 * metadata loads) so there are no letterbox bars.
 */
export const SharePlayer = forwardRef<SharePlayerHandle, Props>(
  function SharePlayer(
    {
      videoUrl,
      posterUrl,
      webcamUrl,
      serverDurationMs,
      serverWidth,
      serverHeight,
      config,
      progressOverlay,
      belowPlayer,
      landscapeMaxHeightCss,
    },
    handleRef,
  ) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    // Companion webcam <video>: mirrors play/pause/seek/playbackRate from
    // the main video, carries its own audio (mic). Null without webcamUrl.
    const webcamRef = useRef<HTMLVideoElement | null>(null);
    const hideTimerRef = useRef<number | null>(null);
    /*
     * Mirror of `scrubbing`, read inside the webcam-sync effect closures
     * so cam.currentTime writes can be skipped during a drag (each write
     * glitches mic audio).
     */
    const scrubbingRef = useRef(false);

    // The reaction handler needs the freshest currentTime at the click
    // instant; React state lags it (throttled ~10Hz via the rAF loop).
    useImperativeHandle(
      handleRef,
      () => ({
        getCurrentTime: () => videoRef.current?.currentTime ?? 0,
        getDuration: () => {
          const v = videoRef.current;
          if (!v) return 0;
          if (Number.isFinite(v.duration) && v.duration > 0) return v.duration;
          if (v.seekable.length > 0) {
            const end = v.seekable.end(v.seekable.length - 1);
            if (Number.isFinite(end) && end > 0) return end;
          }
          return 0;
        },
        seekTo: (seconds: number) => {
          const v = videoRef.current;
          if (!v) return;
          const clamped = Math.max(0, Math.min(seconds, v.duration || seconds));
          v.currentTime = clamped;
          void v.play().catch(() => {});
        },
      }),
      [],
    );

    const [isPlaying, setIsPlaying] = useState(false);
    const [overlayIcon, setOverlayIcon] = useState<"play" | "pause" | null>(
      null,
    );
    /*
     * Derive overlayIcon from isPlaying transitions so every toggle —
     * click, keyboard, controls bar — flashes the icon without scattering
     * setOverlayIcon calls.
     */
    const [prevPlaying, setPrevPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    /*
     * Seed mute from the persisted config so a deliberately-silent share
     * opens silent. The volume slider still defaults to 1.0; this only
     * sets the element's `muted` flag on first paint.
     */
    const [isMuted, setIsMuted] = useState(config.systemMuted);
    const [volume, setVolume] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [controlsVisible, setControlsVisible] = useState(true);
    const [scrubbing, setScrubbing] = useState(false);
    const [pip, setPip] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [ended, setEnded] = useState(false);
    // True once the video can paint its first frame; drives the loading
    // spinner so the player area is never visually empty during fetch.
    const [firstFrameReady, setFirstFrameReady] = useState(false);
    /*
     * Aspect ratio of the actually-encoded video, from metadata. The
     * server-known dim is only a placeholder for the SSR paint; once
     * metadata arrives we trust the video's intrinsic dimensions so the
     * container aspect matches exactly and object-contain shows no bars.
     */
    const [actualAspect, setActualAspect] = useState<number | null>(null);

    /*
     * If the browser already has the video buffered (304 from edge cache,
     * bfcache, etc.), loadeddata/canplay/loadedmetadata can fire before
     * React attaches handlers — leaving us stuck on the spinner and the
     * wrong container aspect. Poll on mount + 300ms later, pulling both
     * readyState and intrinsic dims so the container corrects from the
     * server placeholder to the actual encoded aspect.
     */
    useEffect(() => {
      if (firstFrameReady && actualAspect != null) return;
      const check = (): void => {
        const v = videoRef.current;
        if (!v) return;
        if (v.readyState >= 2) setFirstFrameReady(true);
        else if (v.readyState >= 1 && v.videoWidth > 0)
          setFirstFrameReady(true);
        if (actualAspect == null && v.videoWidth > 0 && v.videoHeight > 0) {
          setActualAspect(v.videoWidth / v.videoHeight);
        }
      };
      check();
      const t = window.setTimeout(check, 300);
      return () => window.clearTimeout(t);
    }, [firstFrameReady, actualAspect]);

    if (prevPlaying !== isPlaying) {
      setPrevPlaying(isPlaying);
      /*
       * Suppress the icon flash when the pause came from the video
       * ending — the "Watch again" overlay takes its place. Otherwise the
       * play icon flashes under the dim layer before that button paints.
       */
      if (!ended) {
        setOverlayIcon(isPlaying ? "pause" : "play");
      }
    }

    useEffect(() => {
      if (overlayIcon === null) return;
      const t = setTimeout(() => setOverlayIcon(null), 750);
      return () => clearTimeout(t);
    }, [overlayIcon]);

    useEffect(() => {
      type DocWithWebkit = Document & {
        webkitFullscreenElement?: Element | null;
      };
      type WithWebkitFullscreenVideo = HTMLVideoElement & {
        webkitDisplayingFullscreen?: boolean;
      };
      const onFs = (): void => {
        const doc = document as DocWithWebkit;
        const v = videoRef.current as WithWebkitFullscreenVideo | null;
        const active =
          doc.fullscreenElement !== null ||
          doc.webkitFullscreenElement != null ||
          v?.webkitDisplayingFullscreen === true;
        setIsFullscreen(active);
      };
      document.addEventListener("fullscreenchange", onFs);
      document.addEventListener("webkitfullscreenchange", onFs);
      const v = videoRef.current;
      v?.addEventListener("webkitbeginfullscreen", onFs);
      v?.addEventListener("webkitendfullscreen", onFs);
      return () => {
        document.removeEventListener("fullscreenchange", onFs);
        document.removeEventListener("webkitfullscreenchange", onFs);
        v?.removeEventListener("webkitbeginfullscreen", onFs);
        v?.removeEventListener("webkitendfullscreen", onFs);
      };
    }, []);

    // Apply the persisted mic-mute default to the webcam element.
    useEffect(() => {
      if (!webcamUrl) return;
      const cam = webcamRef.current;
      if (cam) cam.muted = config.micMuted;
    }, [webcamUrl, config.micMuted]);

    /*
     * Sync the screen video's mute to config.systemMuted whenever the
     * sidebar toggle flips. Without this the player reads systemMuted only
     * at mount and the toggle becomes a no-op. Push through both setIsMuted
     * and <video>.muted so the controls-bar mute icon stays in sync too.
     */
    useEffect(() => {
      const v = videoRef.current;
      if (!v) return;
      if (v.muted !== config.systemMuted) {
        v.muted = config.systemMuted;
        setIsMuted(config.systemMuted);
      }
    }, [config.systemMuted]);

    /*
     * Webcam sync — main is master, cam follows. Each cam.currentTime
     * write triggers a full audio-decoder flush in Chromium, audible as a
     * glitch, so we minimize writes:
     *   1. Skip redundant writes on play/seeked when cam is already
     *      within HARD_RESYNC_S of main.
     *   2. Close small drifts with playbackRate nudges (±NUDGE_RATE)
     *      instead of seeking — audio stays continuous.
     *   3. Hard seek only when drift exceeds HARD_RESYNC_S.
     * Cam stalls never touch main, preserving its audio.
     */
    useEffect(() => {
      if (!webcamUrl) return;
      const main = videoRef.current;
      const cam = webcamRef.current;
      if (!main || !cam) return;

      // Hard-resync only when drift is unmistakable (≥250ms); below that
      // a playbackRate nudge avoids seeking.
      const HARD_RESYNC_S = 0.25;
      // Below this drift, leave cam alone — within imperceptible AV sync.
      const NUDGE_DEAD_ZONE_S = 0.04;
      const NUDGE_RATE = 0.04; // ±4% rate adjustment to drift back into sync

      let rafId = 0;

      const playCam = (): void => {
        if (!cam.paused) return;
        cam.play().catch(() => {
          /* drift loop will retry */
        });
      };

      const seekCamIfFar = (): void => {
        if (Math.abs(cam.currentTime - main.currentTime) > HARD_RESYNC_S) {
          cam.currentTime = main.currentTime;
        }
      };

      const onMainPlay = (): void => {
        // seekCamIfFar skips the write when already in lockstep — that
        // redundant write is the top cause of audio glitches on unpause.
        seekCamIfFar();
        playCam();
      };
      const onMainPause = (): void => {
        if (!cam.paused) cam.pause();
      };
      const onMainSeeking = (): void => {
        if (scrubbingRef.current) return;
        seekCamIfFar();
      };
      const onMainSeeked = (): void => {
        if (scrubbingRef.current) return;
        seekCamIfFar();
        if (!main.paused) playCam();
      };
      const onMainRate = (): void => {
        cam.playbackRate = main.playbackRate;
      };
      const onMainEnded = (): void => {
        if (!cam.paused) cam.pause();
      };

      const tick = (): void => {
        if (!main.paused && !cam.paused && !scrubbingRef.current) {
          const drift = cam.currentTime - main.currentTime;
          const absDrift = Math.abs(drift);
          if (absDrift > HARD_RESYNC_S) {
            cam.currentTime = main.currentTime;
            cam.playbackRate = main.playbackRate;
          } else if (absDrift > NUDGE_DEAD_ZONE_S) {
            // Nudge: speed cam up when behind (drift < 0), slow it when
            // ahead (drift > 0). Audio glides without a seek glitch.
            const target =
              main.playbackRate + (drift < 0 ? NUDGE_RATE : -NUDGE_RATE);
            if (Math.abs(cam.playbackRate - target) > 0.001) {
              cam.playbackRate = target;
            }
          } else if (Math.abs(cam.playbackRate - main.playbackRate) > 0.001) {
            cam.playbackRate = main.playbackRate;
          }
        } else if (!main.paused && cam.paused && !scrubbingRef.current) {
          playCam();
        }
        rafId = window.requestAnimationFrame(tick);
      };
      rafId = window.requestAnimationFrame(tick);

      main.addEventListener("play", onMainPlay);
      main.addEventListener("pause", onMainPause);
      main.addEventListener("ended", onMainEnded);
      main.addEventListener("seeking", onMainSeeking);
      main.addEventListener("seeked", onMainSeeked);
      main.addEventListener("ratechange", onMainRate);

      return () => {
        window.cancelAnimationFrame(rafId);
        main.removeEventListener("play", onMainPlay);
        main.removeEventListener("pause", onMainPause);
        main.removeEventListener("ended", onMainEnded);
        main.removeEventListener("seeking", onMainSeeking);
        main.removeEventListener("seeked", onMainSeeked);
        main.removeEventListener("ratechange", onMainRate);
      };
    }, [webcamUrl]);

    /*
     * Mirror `scrubbing` into the ref the webcam-sync closures read. On
     * scrub-end, sync cam once if it's far enough off that a nudge can't
     * catch up; otherwise skip the write so cam audio doesn't glitch.
     */
    useEffect(() => {
      scrubbingRef.current = scrubbing;
      if (!scrubbing && webcamUrl) {
        const main = videoRef.current;
        const cam = webcamRef.current;
        if (main && cam && Math.abs(cam.currentTime - main.currentTime) > 0.1) {
          cam.currentTime = main.currentTime;
        }
      }
    }, [scrubbing, webcamUrl]);

    /*
     * Smooth scrubber: rAF reads video.currentTime each frame while
     * playing, since native `timeupdate` fires only ~200-250ms apart and
     * makes the bar visibly jump. Stops on pause/unmount, and while
     * dragging — otherwise the tick overwrites the user's optimistic drag
     * position with the video's lagging currentTime, jittering the bar
     * away from the pointer.
     */
    useEffect(() => {
      if (!isPlaying || scrubbing) return;
      let raf = 0;
      const tick = (): void => {
        const v = videoRef.current;
        if (v) {
          const t = v.currentTime;
          setCurrentTime(t);
        }
        raf = window.requestAnimationFrame(tick);
      };
      raf = window.requestAnimationFrame(tick);
      return () => window.cancelAnimationFrame(raf);
    }, [isPlaying, scrubbing]);

    /*
     * Auto-hide the control bar 2s after the cursor stops moving. Holds
     * open while scrubbing so the user can fine-tune; otherwise both
     * paused and playing collapse to the slim-progress-bar treatment when
     * the mouse isn't on the player.
     */
    const armHideTimer = (): void => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
      if (scrubbing) return;
      hideTimerRef.current = window.setTimeout(() => {
        setControlsVisible(false);
      }, 2000);
    };

    const showControls = (): void => {
      setControlsVisible(true);
      armHideTimer();
    };

    /*
     * Showing/holding the bar while scrubbing is done in the scrub-start
     * event handler (not here) so this effect never calls setState in its
     * body. Here we only (re)arm the auto-hide once scrubbing ends and on
     * play/pause changes.
     */
    useEffect(() => {
      if (scrubbing) return;
      armHideTimer();
      return () => {
        if (hideTimerRef.current !== null)
          window.clearTimeout(hideTimerRef.current);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPlaying, scrubbing]);

    const togglePlay = (): void => {
      const v = videoRef.current;
      if (!v) return;
      /*
       * Don't set isPlaying or overlayIcon here — the <video>'s play/pause
       * events update isPlaying and the prevPlaying derivation drives the
       * overlay, so keyboard, click, and controls-bar toggles stay
       * consistent.
       */
      if (v.paused) {
        void v.play();
      } else {
        v.pause();
      }
    };

    const handleVideoClick = (e: React.MouseEvent): void => {
      e.stopPropagation();
      togglePlay();
    };

    /*
     * Fragmented MP4s (and some share renders, depending on the muxer
     * path) report duration === Infinity. We can't divide currentTime by
     * that, so fall back to the last seekable end, which the browser keeps
     * current as bytes arrive.
     */
    const effectiveDuration = (v: HTMLVideoElement): number => {
      if (Number.isFinite(v.duration) && v.duration > 0) return v.duration;
      if (v.seekable.length > 0) {
        const end = v.seekable.end(v.seekable.length - 1);
        if (Number.isFinite(end) && end > 0) return end;
      }
      return 0;
    };

    const seekBy = (deltaSeconds: number): void => {
      const v = videoRef.current;
      if (!v) return;
      const max = effectiveDuration(v);
      v.currentTime = Math.max(
        0,
        Math.min(max || v.currentTime, v.currentTime + deltaSeconds),
      );
    };

    const seekTo = (fraction: number): void => {
      const v = videoRef.current;
      if (!v) return;
      const max = effectiveDuration(v);
      if (max <= 0) return;
      const next = Math.max(0, Math.min(max, fraction * max));
      v.currentTime = next;
      /*
       * Push to React state synchronously so the scrubber fill follows the
       * pointer in real time. Waiting on `timeupdate` (~250ms) makes
       * dragging feel laggy and snap to keyframes.
       */
      setCurrentTime(next);
    };

    const toggleMute = (): void => {
      const v = videoRef.current;
      if (!v) return;
      v.muted = !v.muted;
      setIsMuted(v.muted);
    };

    const setVolumeAndApply = (next: number): void => {
      const v = videoRef.current;
      if (!v) return;
      const clamped = Math.max(0, Math.min(1, next));
      v.volume = clamped;
      v.muted = clamped === 0;
      setVolume(clamped);
      setIsMuted(clamped === 0);
    };

    const cycleSpeed = (): void => {
      const idx = SPEED_CYCLE.indexOf(speed);
      const next = SPEED_CYCLE[(idx + 1) % SPEED_CYCLE.length];
      const v = videoRef.current;
      if (!v) return;
      v.playbackRate = next;
      setSpeed(next);
    };

    const toggleFullscreen = (): void => {
      const el = containerRef.current;
      const v = videoRef.current;

      /*
       * iOS Safari has only partial fullscreen support: the standard
       * requestFullscreen API may be absent or prefixed, and prefixed
       * versions work on <video> only, not the container div. Cascade
       * through every shape so the button works on every browser:
       *   1. Standard API on the container (desktop Chrome/Firefox/Safari)
       *   2. webkit-prefixed API on the container (older WebKit)
       *   3. webkitEnterFullscreen on the <video> (iOS Safari) — boots the
       *      native iOS player and loses our custom controls, but the
       *      alternative is a no-op button on every iPhone.
       */

      type WithWebkitFullscreenContainer = HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void> | void;
      };
      type WithWebkitFullscreenVideo = HTMLVideoElement & {
        webkitEnterFullscreen?: () => void;
        webkitExitFullscreen?: () => void;
        webkitDisplayingFullscreen?: boolean;
      };
      type DocWithWebkit = Document & {
        webkitFullscreenElement?: Element | null;
        webkitExitFullscreen?: () => Promise<void> | void;
      };

      const doc = document as DocWithWebkit;
      const elx = el as WithWebkitFullscreenContainer | null;
      const vx = v as WithWebkitFullscreenVideo | null;

      const inStandard = doc.fullscreenElement !== null;
      const inWebkit = doc.webkitFullscreenElement != null;
      const inVideoFs = vx?.webkitDisplayingFullscreen === true;

      if (inStandard || inWebkit || inVideoFs) {
        if (doc.exitFullscreen) void doc.exitFullscreen();
        else if (doc.webkitExitFullscreen) void doc.webkitExitFullscreen();
        else if (vx?.webkitExitFullscreen) vx.webkitExitFullscreen();
        return;
      }

      if (elx?.requestFullscreen) {
        void elx.requestFullscreen().catch(() => {
          if (vx?.webkitEnterFullscreen) vx.webkitEnterFullscreen();
        });
        return;
      }
      if (elx?.webkitRequestFullscreen) {
        void elx.webkitRequestFullscreen();
        return;
      }
      if (vx?.webkitEnterFullscreen) {
        vx.webkitEnterFullscreen();
      }
    };

    const togglePip = async (): Promise<void> => {
      const v = videoRef.current;
      if (!v) return;
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
          setPip(false);
        } else {
          // Older Safari + some browsers lack requestPictureInPicture.
          type WithPip = HTMLVideoElement & {
            requestPictureInPicture?: () => Promise<PictureInPictureWindow>;
          };
          const fn = (v as WithPip).requestPictureInPicture;
          if (fn) {
            await fn.call(v);
            setPip(true);
          }
        }
      } catch {
        // PiP can fail (autoplay-disallowed, source not yet loaded). Swallow.
      }
    };

    const setSpeedExact = (s: number): void => {
      const v = videoRef.current;
      if (!v) return;
      v.playbackRate = s;
      setSpeed(s);
    };

    const handleKey = (e: React.KeyboardEvent): void => {
      if (e.key === " " || e.key === "k") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowLeft" || e.key === "j") {
        e.preventDefault();
        seekBy(-SKIP_SECONDS);
      } else if (e.key === "ArrowRight" || e.key === "l") {
        e.preventDefault();
        seekBy(SKIP_SECONDS);
      } else if (e.key === "m") {
        e.preventDefault();
        toggleMute();
      } else if (e.key === "f") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    const fraction = duration > 0 ? currentTime / duration : 0;
    /*
     * Inset the video inside a visible bg frame when a background is set;
     * `transparent` keeps it edge-to-edge. inset-[%] preserves aspect:
     * top/bottom % is relative to container height, left/right % to width,
     * so a uniform 4% trim doesn't distort the box.
     */
    const hasFrame = config.background !== "transparent";

    return (
      <div className="flex flex-col items-center">
        <div
          ref={containerRef}
          /*
           * Container reserves its final size on first paint via the
           * server-known aspect ratio. Without this the box collapses to 0
           * height until <video> metadata loads, then jumps to its real
           * size (visible page-shove). Fullscreen overrides with fill +
           * black letterbox.
           * `@container` makes the inline-size queryable by descendants:
           * the controls bar hides Settings + PiP when the *player* is
           * narrow (not the viewport), so the player width can track the
           * source width without inflating to fit an 8-button bar.
           *
           * Mobile (max-sm): override the desktop width/height bounds so
           * the player fills the column at the source's aspect (no height
           * cap, page scrolls). The `!` prefix wins over the inline
           * width/height below.
           */
          className={
            "@container group relative overflow-hidden rounded-md bg-neutral-900 focus:outline-none max-sm:h-auto! max-sm:w-full! " +
            (isFullscreen
              ? "flex h-full w-full items-center justify-center rounded-none bg-black"
              : "block")
          }
          style={
            isFullscreen
              ? undefined
              : {
                  ...sizeStyleForAspect(
                    actualAspect != null
                      ? actualAspect
                      : aspectFromPlaceholder(serverWidth, serverHeight),
                    landscapeMaxHeightCss,
                  ),
                  ...shareBackgroundStyle(config.background),
                }
          }
          onMouseMove={showControls}
          onMouseLeave={() => !scrubbing && setControlsVisible(false)}
          onKeyDown={handleKey}
          tabIndex={0}
        >
          {/* Bg-frame wrapper. With a bg selected the video shrinks 4% per
            side so the bg paints as a visible frame; with bg=transparent
            the wrapper fills the container edge-to-edge. */}
          <div
            className={
              hasFrame
                ? "absolute inset-[4%] overflow-hidden rounded-lg shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)]"
                : "absolute inset-0"
            }
          >
            <video
              ref={videoRef}
              src={videoUrl}
              poster={posterUrl}
              /*
               * object-contain so an aspect mismatch (server row dim vs the
               * actual encoded video) shows as a small letterbox against
               * the container bg instead of cropping content.
               */
              className="block h-full w-full cursor-pointer object-contain"
              playsInline
              preload="auto"
              onClick={handleVideoClick}
              onLoadedData={() => setFirstFrameReady(true)}
              onCanPlay={() => setFirstFrameReady(true)}
              onPlaying={() => setFirstFrameReady(true)}
              onPlay={() => {
                /*
                 * iOS Safari (and some Android browsers) ignore
                 * preload="auto" and never fire loadeddata/canplay until the
                 * user taps play, leaving the spinner stuck over a ready
                 * video. The user-initiated play is a hard ready signal.
                 */
                setFirstFrameReady(true);
                setIsPlaying(true);
                setEnded(false);
              }}
              onPause={(e) => {
                /*
                 * Browsers fire `pause` then `ended` on natural completion.
                 * Detect end-by-time here too so React batches ended=true
                 * with isPlaying=false in one render; otherwise the
                 * prevPlaying derivation briefly flashes the play icon
                 * before the watch-again overlay appears.
                 */
                const v = e.currentTarget;
                if (v.duration > 0 && v.currentTime >= v.duration - 0.1) {
                  setEnded(true);
                }
                setIsPlaying(false);
              }}
              onEnded={() => setEnded(true)}
              onTimeUpdate={(e) => {
                /*
                 * Refresh duration even while scrubbing — fragmented MP4s
                 * expose it only as bytes arrive, and the user may scrub
                 * before the full duration is known.
                 */
                const d = effectiveDuration(e.currentTarget);
                if (d > 0 && d !== duration) setDuration(d);
                /*
                 * While dragging, don't sync scrubber state to currentTime
                 * — browsers snap seeks to keyframes, yanking the bar away
                 * from the pointer mid-drag.
                 */
                if (scrubbing) return;
                const t = e.currentTarget.currentTime;
                setCurrentTime(t);
              }}
              onDurationChange={(e) =>
                setDuration(effectiveDuration(e.currentTarget))
              }
              onLoadedMetadata={(e) => {
                const v = e.currentTarget;
                setDuration(effectiveDuration(v));
                if (v.videoWidth > 0 && v.videoHeight > 0) {
                  setActualAspect(v.videoWidth / v.videoHeight);
                }
                /*
                 * On mobile (especially iOS Safari) preload="auto" is only
                 * a suggestion: the browser fires loadedmetadata but never
                 * advances to loadeddata until the user taps. Treat
                 * loadedmetadata as ready enough to show the play
                 * affordance so the spinner doesn't stay forever.
                 */
                setFirstFrameReady(true);
              }}
              onProgress={(e) => {
                const d = effectiveDuration(e.currentTarget);
                if (d > 0 && d !== duration) setDuration(d);
              }}
              onVolumeChange={(e) => {
                setIsMuted(e.currentTarget.muted);
                setVolume(e.currentTarget.volume);
              }}
            />
          </div>

          {/* Webcam companion PiP. Position/size/initial-mute come from the
            persisted config. Plays its own mic audio, synced to the main
            video via the effect above. Pointer-none so clicks fall through
            to the main video's play/pause handlers. */}
          {webcamUrl ? (
            <video
              ref={webcamRef}
              src={webcamUrl}
              className={
                /*
                 * No z-index: natural stacking puts the later-sibling
                 * toolbar on top, so the bubble passes under it like a real
                 * PiP.
                 */
                "pointer-events-none absolute aspect-square rounded-full object-cover " +
                webcamCornerClass(config.cameraCorner) +
                " " +
                webcamSizeClass(config.cameraSize)
              }
              playsInline
              preload="auto"
            />
          ) : null}

          {/* Loading state, held until both the first frame and the real
          intrinsic dims are known. Gating on actualAspect means the
          container's aspect reservation has settled before the spinner
          hides; otherwise an old share with a stale row dim resizes behind
          the spinner and jumps on reveal. */}
          {!firstFrameReady || actualAspect == null ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-neutral-900">
              <span className="block h-10 w-10 animate-spin rounded-full border-2 border-neutral-700 border-t-neutral-200" />
            </div>
          ) : null}

          {/* Center play button whenever paused and not at the natural end
          (watch-again handles that). Serves as both the initial and the
          resume affordance. Hidden until the first frame is decoded and the
          aspect is locked, so it doesn't paint over an empty or
          about-to-resize box. */}
          {firstFrameReady && actualAspect != null && !isPlaying && !ended ? (
            <button
              type="button"
              onClick={togglePlay}
              className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30 focus:outline-none"
              aria-label="Play"
            >
              <span className="flex h-32 w-32 items-center justify-center rounded-full bg-[#171717]/85 shadow-lg transition-transform hover:scale-105">
                <Play className="h-16 w-16 text-white" fill="currentColor" />
              </span>
            </button>
          ) : null}

          {/* Toggle pop overlay — flashes on play only. We skip the pause
          flash because the play button above already paints then; stacking
          both reads as flicker. `key` forces remount so back-to-back
          toggles within the animation window restart from frame 0. */}
          {overlayIcon && isPlaying && !ended ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div
                key={overlayIcon}
                className="animate-share-icon-pop flex h-32 w-32 items-center justify-center rounded-full bg-[#171717]/90"
              >
                {overlayIcon === "pause" ? (
                  <Pause className="h-16 w-16 text-white" fill="currentColor" />
                ) : (
                  <Play className="h-16 w-16 text-white" fill="currentColor" />
                )}
              </div>
            </div>
          ) : null}

          {/* End-of-video overlay: dim the frame, surface a "Watch again"
          button that seeks to 0 and resumes. We deliberately do NOT
          autoplay-loop, so this overlay always shows on completion. */}
          {ended ? (
            <button
              type="button"
              onClick={() => {
                const v = videoRef.current;
                if (!v) return;
                v.currentTime = 0;
                void v.play();
                setEnded(false);
              }}
              className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/55 backdrop-blur-[1px] focus:outline-none"
              aria-label="Watch again"
            >
              <span className="flex items-center gap-3 text-white">
                <RotateCcw className="h-7 w-7" />
                <span className="text-xl font-semibold">Watch again</span>
              </span>
            </button>
          ) : null}

          {/* Collapsed progress strip — slim 3px bar shown only while the
          full controls are auto-hidden, so playback stays trackable at a
          glance. */}
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-overlay-strong transition-opacity duration-200 ${
              controlsVisible ? "opacity-0" : "opacity-100"
            }`}
          >
            <div
              className="h-full bg-white"
              style={{ width: `${fraction * 100}%` }}
            />
          </div>

          {/* Overlay above the progress bar (e.g. reaction clusters on the
            public viewer). Receives duration + controlsVisible so it can
            anchor to either the expanded scrubber or the collapsed
            slim-strip. */}
          {progressOverlay
            ? progressOverlay({
                durationSeconds:
                  duration > 0
                    ? duration
                    : serverDurationMs
                      ? serverDurationMs / 1000
                      : 0,
                controlsVisible,
              })
            : null}

          {/* Bottom control bar. Gradient backdrop so the bar reads on both
          light and dark content. */}
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-black/70 via-black/40 to-transparent px-4 pb-3 pt-10 transition-opacity duration-200 ${
              controlsVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Scrubber */}
            <Scrubber
              fraction={fraction}
              onSeek={seekTo}
              onScrubStart={() => {
                setScrubbing(true);
                // Hold the bar open for the duration of the scrub.
                setControlsVisible(true);
                if (hideTimerRef.current !== null) {
                  window.clearTimeout(hideTimerRef.current);
                }
              }}
              onScrubEnd={() => setScrubbing(false)}
            />

            <div className="pointer-events-auto flex items-center gap-2 text-white">
              <ControlButton
                onClick={togglePlay}
                label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" fill="currentColor" />
                ) : (
                  <Play className="h-5 w-5" fill="currentColor" />
                )}
              </ControlButton>
              <ControlButton
                onClick={() => seekBy(-SKIP_SECONDS)}
                label="Back 5s"
              >
                <SkipBadge dir="back" />
              </ControlButton>
              <ControlButton
                onClick={() => seekBy(SKIP_SECONDS)}
                label="Forward 5s"
              >
                <SkipBadge dir="forward" />
              </ControlButton>

              <VolumeControl
                muted={isMuted}
                volume={volume}
                onToggleMute={toggleMute}
                onVolume={setVolumeAndApply}
              />

              <span className="ml-1 select-none whitespace-nowrap text-[12px] tabular-nums text-white/85">
                {formatTime(currentTime)} /{" "}
                {formatTime(
                  duration > 0
                    ? duration
                    : serverDurationMs
                      ? serverDurationMs / 1000
                      : 0,
                )}
              </span>

              <div className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  onClick={cycleSpeed}
                  className="flex h-9 cursor-pointer items-center justify-center rounded-full px-3 text-[12px] font-medium tabular-nums text-white/90 transition-colors hover:bg-overlay-strong hover:text-white"
                  aria-label={`Playback speed ${speed}x`}
                  title="Playback speed"
                >
                  {speed}×
                </button>
                <div className="relative hidden @md:block">
                  <ControlButton
                    onClick={() => setSettingsOpen((v) => !v)}
                    label="Settings"
                  >
                    <Settings className="h-5 w-5" />
                  </ControlButton>
                  {settingsOpen ? (
                    <div
                      className="absolute right-0 bottom-full mb-2 min-w-[160px] rounded-lg bg-neutral-900/95 p-1 text-[12px] text-white shadow-xl backdrop-blur-sm"
                      onMouseLeave={() => setSettingsOpen(false)}
                    >
                      <div className="px-2 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wide text-white/50">
                        Playback speed
                      </div>
                      {SPEED_CYCLE.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setSpeedExact(s);
                            setSettingsOpen(false);
                          }}
                          className={`flex w-full cursor-pointer items-center justify-between rounded px-2 py-1.5 text-left transition-colors hover:bg-overlay-strong ${
                            speed === s ? "text-white" : "text-white/80"
                          }`}
                        >
                          <span>{s === 1 ? "Normal" : `${s}×`}</span>
                          {speed === s ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : null}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                {/* PiP isn't reliable on iOS Safari for inline videos, and
                  the gear gives the same controls — hide both when the
                  *player* is narrow (container query, not viewport) so a
                  small recording on a wide page still drops these. */}
                <span className="hidden @md:inline-flex">
                  <ControlButton
                    onClick={() => void togglePip()}
                    label={
                      pip ? "Exit picture-in-picture" : "Picture-in-picture"
                    }
                  >
                    <PictureInPicture2 className="h-5 w-5" />
                  </ControlButton>
                </span>
                <ControlButton
                  onClick={toggleFullscreen}
                  label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? (
                    <Minimize className="h-5 w-5" />
                  ) : (
                    <Maximize className="h-5 w-5" />
                  )}
                </ControlButton>
              </div>
            </div>
          </div>
        </div>

        {/* Content below the player (e.g. the reaction bar). Skipped in
          fullscreen — only the player container goes fullscreen, so we also
          unmount this to pause any slot side-effects. */}
        {belowPlayer && !isFullscreen ? belowPlayer : null}
      </div>
    );
  },
);

// "Back/forward 5s" badge: a lucide rotational arrow with a "5" overlaid.
// Lucide ships no single icon with the digit baked in, so we composite one.
function SkipBadge({ dir }: { dir: "back" | "forward" }) {
  const Arrow = dir === "back" ? RotateCcw : RotateCw;
  return (
    <span className="relative inline-flex h-5 w-5 items-center justify-center">
      <Arrow className="h-5 w-5" />
      <span className="absolute mt-[1px] text-[8px] font-bold leading-none">
        5
      </span>
    </span>
  );
}

function ControlButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white/90 transition-colors hover:bg-overlay-strong hover:text-white"
    >
      {children}
    </button>
  );
}

function Scrubber({
  fraction,
  onSeek,
  onScrubStart,
  onScrubEnd,
}: {
  fraction: number;
  onSeek: (f: number) => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  // Pointer-driven scrubbing — captures the pointer so dragging outside
  // the track still updates the seek position.
  const seekFromClientX = (clientX: number): void => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const f = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onSeek(f);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
    e.preventDefault();
    onScrubStart();
    seekFromClientX(e.clientX);
    const el = e.currentTarget;
    const pointerId = e.pointerId;
    el.setPointerCapture(pointerId);
    // Throttle seeks to ~12Hz (80ms). pointermove fires ~120Hz, and each
    // main.currentTime write flushes the system-audio decoder — the
    // stutter heard during a scrub. 80ms still gives visible feedback; the
    // final position lands on pointerup via the trailing seek below.
    let lastSeekMs = 0;
    let lastClientX = e.clientX;
    let pending = false;
    const move = (ev: PointerEvent): void => {
      lastClientX = ev.clientX;
      const now = performance.now();
      if (now - lastSeekMs >= 80) {
        lastSeekMs = now;
        seekFromClientX(lastClientX);
        pending = false;
      } else if (!pending) {
        pending = true;
        window.setTimeout(
          () => {
            if (!pending) return;
            pending = false;
            lastSeekMs = performance.now();
            seekFromClientX(lastClientX);
          },
          80 - (now - lastSeekMs),
        );
      }
    };
    const up = (): void => {
      // Final seek so the player lands where the user released, even if the
      // throttle window swallowed the last move.
      seekFromClientX(lastClientX);
      onScrubEnd();
      el.removeEventListener("pointermove", move as EventListener);
      el.removeEventListener("pointerup", up as EventListener);
      el.removeEventListener("pointercancel", up as EventListener);
    };
    el.addEventListener("pointermove", move as EventListener);
    el.addEventListener("pointerup", up as EventListener);
    el.addEventListener("pointercancel", up as EventListener);
  };

  return (
    <div
      ref={trackRef}
      onPointerDown={onPointerDown}
      className="pointer-events-auto group/scrub relative h-3 cursor-pointer touch-none"
    >
      <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/25" />
      <div
        className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white"
        style={{ width: `${fraction * 100}%` }}
      />
      <div
        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-md transition-opacity group-hover/scrub:opacity-100"
        style={{ left: `${fraction * 100}%` }}
      />
    </div>
  );
}

function VolumeControl({
  muted,
  volume,
  onToggleMute,
  onVolume,
}: {
  muted: boolean;
  volume: number;
  onToggleMute: () => void;
  onVolume: (v: number) => void;
}) {
  const effective = muted ? 0 : volume;
  return (
    <div className="group/vol flex items-center">
      <ControlButton onClick={onToggleMute} label={muted ? "Unmute" : "Mute"}>
        {effective === 0 ? (
          <VolumeX className="h-5 w-5" />
        ) : effective < 0.5 ? (
          <Volume1 className="h-5 w-5" />
        ) : (
          <Volume2 className="h-5 w-5" />
        )}
      </ControlButton>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={effective}
        onChange={(e) => onVolume(Number(e.target.value))}
        // Gradient paints the filled track up to the current value. The
        // default uniform <input range> track read as "empty" against our
        // solid thumb, looking like volume was off even at full.
        style={{
          backgroundImage: `linear-gradient(to right, rgb(255 255 255) 0%, rgb(255 255 255) ${
            effective * 100
          }%, rgb(255 255 255 / 0.3) ${
            effective * 100
          }%, rgb(255 255 255 / 0.3) 100%)`,
        }}
        className="ml-1 h-1 w-0 cursor-pointer appearance-none rounded-full opacity-0 transition-all duration-150 group-hover/vol:w-20 group-hover/vol:opacity-100 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
        aria-label="Volume"
      />
    </div>
  );
}

function formatTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const total = Math.floor(s);
  const m = Math.floor(total / 60);
  const sec = total % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// Reserved aspect for the loading state. Pre-fix uploads always sent
// 1280x720 regardless of the real encoded dim, so a 16:10 MacBook
// recording reserved 16:9, then jumped down when the 16:10 video loaded.
// Detect that exact suspicious value and fall back to 16:10; trust all
// other (post-fix) server rows.
function aspectFromPlaceholder(
  width: number | null,
  height: number | null,
): number {
  if (!width || !height) return 16 / 10;
  if (width === 1280 && height === 720) return 16 / 10;
  return width / height;
}

// Landscape sources (aspect ≥ LANDSCAPE_THRESHOLD) fill the column
// edge-to-edge, height from `aspect-ratio`. Squarish/portrait sources cap
// height and center within the column. The threshold counts 4:3 (1.33),
// 16:10 (1.6), 16:9 (1.78) and wider as landscape; 5:4 (1.25), square and
// portrait take the capped path.
const LANDSCAPE_THRESHOLD = 1.3;

function sizeStyleForAspect(
  aspect: number,
  landscapeMaxHeightCss?: string,
): React.CSSProperties {
  const a = aspectAsNumber(aspect);
  if (a >= LANDSCAPE_THRESHOLD) {
    // With a viewport-aware cap (public viewer), derive width from the
    // capped height so the aspect holds and the player never exceeds
    // landscapeMaxHeightCss or the column width. The outer flex column is
    // items-center, so a sub-100% width self-centers. Without a cap
    // (editor), fill the column.
    if (landscapeMaxHeightCss) {
      return {
        width: `min(100%, calc(${landscapeMaxHeightCss} * ${a}))`,
        aspectRatio: a,
      };
    }
    return { width: "100%", aspectRatio: a };
  }
  return {
    height: MAX_HEIGHT_CSS,
    width: `clamp(min(360px, 100%), calc(${MAX_HEIGHT_CSS} * ${a} + 120px), 100%)`,
    // Mobile (max-sm) drops the explicit height via !h-auto, so
    // aspect-ratio sizes the container instead. Without it the portrait
    // canvas collapses to 0px tall on mobile.
    aspectRatio: a,
  };
}

// Capped player height = 16:9 of the page-column width. Column is
// max-w-4xl (56rem) inside main with px-4 (2rem total). Wide viewports hit
// the 56rem cap → 31.5rem; narrow ones use (100vw - 2rem) * 9/16. min()
// picks whichever applies; source aspect drives WIDTH separately.
const MAX_HEIGHT_CSS = "min(31.5rem, calc((100vw - 2rem) * 9 / 16))";

function aspectAsNumber(aspect: number): number {
  if (!Number.isFinite(aspect) || aspect <= 0) return 16 / 9;
  return aspect;
}

// 24px inset (matching the studio editor's WebcamBubble margin) so the
// bubble breathes against the edge. Same inset for every corner.
function webcamCornerClass(corner: ShareCameraCorner): string {
  switch (corner) {
    case "bottom-right":
      return "bottom-6 right-6";
    case "bottom-left":
      return "bottom-6 left-6";
    case "top-right":
      return "top-6 right-6";
    case "top-left":
      return "top-6 left-6";
  }
}

// Sizes are tighter than a rectangular PiP since a square bubble reads
// larger at the same width. Targets ~14-18% of the canvas, matching the
// studio bubble.
function webcamSizeClass(size: ShareCameraSize): string {
  switch (size) {
    case "small":
      return "w-[12%] min-w-[80px] max-w-[140px]";
    case "medium":
      return "w-[16%] min-w-[110px] max-w-[200px]";
    case "large":
      return "w-[22%] min-w-[150px] max-w-[280px]";
  }
}

// Background paint on the player container. `transparent` falls through to
// the Tailwind bg-neutral-900 baseline. object-contain on the video means
// letterbox/pillarbox strips reveal this layer.
function shareBackgroundStyle(background: string): React.CSSProperties {
  if (background === "transparent") return {};
  if (isShareHexColor(background)) return { backgroundColor: background };
  if (isShareGradientKey(background)) {
    return {
      background: shareGradientCss(SHARE_GRADIENT_PRESETS[background].stops),
    };
  }
  return {};
}

'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from 'react';
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
} from 'lucide-react';
import {
  isShareGradientKey,
  isShareHexColor,
  SHARE_GRADIENT_PRESETS,
  shareGradientCss,
  type ShareCameraCorner,
  type ShareCameraSize,
  type ShareConfig,
} from './share-config';

// Imperative handle exposed via ref so wrapping components (e.g. the
// public viewer's reactions layer) can read the player's current state
// at click-time without coupling to React's batched render cycle.
export type SharePlayerHandle = {
  getCurrentTime(): number;
  getDuration(): number;
  // Jump to the given offset (seconds) and start playback so the
  // viewer doesn't have to manually press play after clicking a
  // timestamped reaction/comment in the activity sidebar.
  seekTo(seconds: number): void;
};

// Info handed to the progressOverlay slot. The slot lives in the
// shared player so the wrapping component (public viewer) can render
// reaction cluster bubbles aligned to the player's progress bar
// without forking the entire player.
export type ProgressOverlayInfo = {
  // Effective duration in seconds — the player's known duration, with
  // a fallback to serverDurationMs/1000 before metadata arrives.
  durationSeconds: number;
  // Whether the bottom controls bar is currently visible. The overlay
  // typically shifts its vertical position to stay anchored to the
  // active progress indicator (scrubber when expanded, slim strip
  // when collapsed).
  controlsVisible: boolean;
};

type Props = {
  videoUrl: string;
  posterUrl?: string;
  // Optional companion webcam video, rendered as a configurable PiP
  // overlay and synced to the main player. Carries mic audio; the
  // main video carries system audio (independently muteable). Absent
  // when the recording had no camera (server-side webcam_state='none')
  // or when the webcam upload hasn't finalized yet.
  webcamUrl?: string;
  // Authoritative duration from the share record. Used to size the
  // scrubber before the <video> element knows its duration (which
  // can take seconds, or never resolve to a finite number for
  // fragmented MP4s).
  serverDurationMs: number | null;
  // Server-known intrinsic dimensions. We use these to reserve the
  // player's box at the correct aspect ratio on first paint —
  // without this the container would collapse to 0 until metadata
  // loads, then jump to its real size and shove the page around.
  serverWidth: number | null;
  serverHeight: number | null;
  // Persisted presentation config (bg, cam PiP corner + size, per-track
  // mute defaults). On the edit page this is the LIVE config the
  // sidebar mutates — changes apply immediately so the user previews
  // exactly what the public viewer will render after Save.
  config: ShareConfig;
  // Optional render slot above the progress bar, inside the player
  // container. Used by the public viewer to plot reaction clusters.
  progressOverlay?: (info: ProgressOverlayInfo) => ReactNode;
  // Optional content rendered below the player (still inside the
  // shared component's outer flex column). Hidden in fullscreen so
  // the wrapping content stays off the screen. Used by the public
  // viewer for the reaction bar.
  belowPlayer?: ReactNode;
  // Optional viewport-aware max-height for LANDSCAPE sources, e.g.
  // 'min(34rem, calc(100vh - 19rem))'. Without it, landscape players
  // fill the column width with no height cap (the page just scrolls).
  // The public viewer passes this so the reaction bar directly below
  // the player stays in view without scrolling; the editor omits it so
  // the preview can fill the available panel height.
  landscapeMaxHeightCss?: string;
};

const SKIP_SECONDS = 5;
const SPEED_CYCLE = [1, 1.25, 1.5, 2];

// Loom-style custom player. Native HTML5 controls are off — the bg is
// part of the video's visual composite and a UA control bar painted
// over it would break the look. The container hugs the video's
// natural aspect ratio (set once metadata loads) so there are no
// letterbox bars on either side.
//
// Hover anywhere on the video to reveal the control bar; it auto-hides
// after 2s of inactivity while playing. Click the video body to toggle
// play/pause; same brief icon flash the editor's VideoPreview shows.
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
    // Companion webcam <video>. Mirrors play/pause/seek/playbackRate
    // from the main video; carries its own audio track (mic). Null when
    // webcamUrl is absent.
    const webcamRef = useRef<HTMLVideoElement | null>(null);
    const hideTimerRef = useRef<number | null>(null);
    // Mirror of `scrubbing` state, read inside the webcam-sync effect's
    // closures so cam.currentTime writes can be skipped during active
    // drag (each write glitches mic audio).
    const scrubbingRef = useRef(false);

    // Expose imperative reads for the public viewer's reaction layer.
    // React state is throttled (~10Hz via the rAF loop below); the
    // reaction handler needs the freshest currentTime at click instant.
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
          // Kick playback so the reaction/comment lands at its moment
          // without the visitor needing a second click.
          void v.play().catch(() => {});
        },
      }),
      [],
    );

    const [isPlaying, setIsPlaying] = useState(false);
    const [overlayIcon, setOverlayIcon] = useState<'play' | 'pause' | null>(
      null,
    );
    // Derive overlayIcon from isPlaying transitions (mirrors the editor's
    // VideoPreview pattern). This catches every toggle — click, keyboard,
    // controls bar — without scattering setOverlayIcon calls.
    const [prevPlaying, setPrevPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    // Seed the initial mute state from the persisted config. The volume
    // slider still defaults to 1.0 — config.systemMuted just sets the
    // element's `muted` flag on first paint so a deliberately-silent
    // share opens silent.
    const [isMuted, setIsMuted] = useState(config.systemMuted);
    const [volume, setVolume] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [controlsVisible, setControlsVisible] = useState(true);
    const [scrubbing, setScrubbing] = useState(false);
    const [pip, setPip] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [ended, setEnded] = useState(false);
    // True once the video has buffered enough to paint its first frame.
    // Drives the loading spinner overlay so the player area is never
    // visually empty during the initial fetch.
    const [firstFrameReady, setFirstFrameReady] = useState(false);
    // Aspect ratio of the actually-encoded video, populated from metadata.
    // The server-known dim is just a placeholder for the initial SSR
    // paint — once metadata arrives we trust the video's intrinsic
    // dimensions so the container's aspect-ratio matches exactly and
    // object-contain doesn't show stray letterbox bars.
    const [actualAspect, setActualAspect] = useState<number | null>(null);

    // Belt-and-suspenders: if the browser already has the video buffered
    // (304 from edge cache, bfcache, etc.), the loadeddata/canplay/
    // loadedmetadata events can fire before React attaches handlers and
    // we'd stay stuck on the spinner AND on the wrong container aspect
    // ratio. Poll on mount + 300ms later, pulling both readyState and
    // intrinsic dims so the container can correct from the server's
    // (possibly wrong) placeholder dim to the actual encoded aspect.
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
      // Suppress the icon flash when the pause came from the video
      // ending — the "Watch again" overlay takes its place. Without
      // this we'd briefly flash the play icon under the dim layer
      // before the watch-again button paints.
      if (!ended) {
        setOverlayIcon(isPlaying ? 'pause' : 'play');
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
      document.addEventListener('fullscreenchange', onFs);
      document.addEventListener('webkitfullscreenchange', onFs);
      const v = videoRef.current;
      v?.addEventListener('webkitbeginfullscreen', onFs);
      v?.addEventListener('webkitendfullscreen', onFs);
      return () => {
        document.removeEventListener('fullscreenchange', onFs);
        document.removeEventListener('webkitfullscreenchange', onFs);
        v?.removeEventListener('webkitbeginfullscreen', onFs);
        v?.removeEventListener('webkitendfullscreen', onFs);
      };
    }, []);

    // Apply the persisted mic-mute default to the webcam element.
    useEffect(() => {
      if (!webcamUrl) return;
      const cam = webcamRef.current;
      if (cam) cam.muted = config.micMuted;
    }, [webcamUrl, config.micMuted]);

    // Sync the screen video's mute state to the editor's
    // config.systemMuted whenever the sidebar toggle flips. Without this
    // the player only reads systemMuted at mount (via useState's initial
    // value) and the toggle becomes a no-op. We push the change through
    // setIsMuted + the <video>.muted property so the controls bar's
    // mute icon also stays in sync.
    useEffect(() => {
      const v = videoRef.current;
      if (!v) return;
      if (v.muted !== config.systemMuted) {
        v.muted = config.systemMuted;
        setIsMuted(config.systemMuted);
      }
    }, [config.systemMuted]);

    // Webcam sync — main is the master, cam follows. Each cam.currentTime
    // write triggers a full audio-decoder flush in Chromium and is
    // audible as a glitch/stutter, so we minimize them ruthlessly:
    //
    //   1. Skip redundant writes on play / seeked when cam is already
    //      within HARD_RESYNC_S of main.
    //   2. Close small drifts with playbackRate nudges (±NUDGE_RATE)
    //      instead of seeking — audio stays continuous.
    //   3. Only fall back to a hard seek when drift exceeds the
    //      "obviously wrong" threshold.
    //
    // Cam stalls never touch main (preserving its audio).
    useEffect(() => {
      if (!webcamUrl) return;
      const main = videoRef.current;
      const cam = webcamRef.current;
      if (!main || !cam) return;

      // Hard-resync only when drift is unmistakable (≥250ms). Below that
      // we ride a playbackRate nudge so the audio never seeks.
      const HARD_RESYNC_S = 0.25;
      // Below this drift we leave cam alone entirely — well within
      // human-imperceptible AV sync.
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
        // Don't seek cam if it's already in lockstep — the redundant
        // write is the most common source of "audio glitches on unpause".
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
            // Nudge: if cam is behind (drift < 0), speed it up;
            // if ahead (drift > 0), slow it down. Audio glides without
            // a seek glitch.
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

      main.addEventListener('play', onMainPlay);
      main.addEventListener('pause', onMainPause);
      main.addEventListener('ended', onMainEnded);
      main.addEventListener('seeking', onMainSeeking);
      main.addEventListener('seeked', onMainSeeked);
      main.addEventListener('ratechange', onMainRate);

      return () => {
        window.cancelAnimationFrame(rafId);
        main.removeEventListener('play', onMainPlay);
        main.removeEventListener('pause', onMainPause);
        main.removeEventListener('ended', onMainEnded);
        main.removeEventListener('seeking', onMainSeeking);
        main.removeEventListener('seeked', onMainSeeked);
        main.removeEventListener('ratechange', onMainRate);
      };
    }, [webcamUrl]);

    // Mirror `scrubbing` into the ref the webcam-sync effect closures
    // read. On scrub-end, sync cam once if it's far enough off that the
    // playbackRate nudge can't catch up in a reasonable time — otherwise
    // skip the write entirely so cam audio doesn't glitch.
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

    // Smooth scrubber: rAF loop reads video.currentTime every frame
    // while playing. The native `timeupdate` event only fires every
    // ~200-250ms, which makes the progress bar visibly jump. Driving
    // setCurrentTime from rAF gives 60fps motion. Stops on pause /
    // unmount so we don't churn. Also stops while the user is dragging
    // the scrubber — otherwise the tick keeps overwriting the user's
    // optimistic drag position with the video's lagging currentTime,
    // which felt like the bar was jittering away from the pointer.
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

    // Auto-hide the control bar 2s after the cursor stops moving. Holds
    // open while scrubbing so the user can fine-tune without the bar
    // disappearing; otherwise paused + playing both auto-collapse so
    // viewers always see the same minimal slim-progress-bar treatment
    // when their mouse isn't on the player.
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

    // Showing the bar + holding it open while scrubbing is handled in the
    // scrub-start handler (an event, not an effect) so we never call setState
    // directly in this effect's body. Here we only (re)arm the auto-hide once
    // scrubbing ends and on play/pause changes.
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
      // Don't set isPlaying or overlayIcon here — the <video> element's
      // play/pause events update isPlaying, and the prevPlaying derived
      // effect drives the overlay. This ensures keyboard, click, and
      // controls-bar toggles all flash the icon consistently.
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

    // Fragmented MP4s (and a few of our share renders, depending on the
    // muxer path) report `video.duration === Infinity`. We can't divide
    // currentTime by that, so fall back to the last seekable end — which
    // the browser keeps current as bytes arrive.
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
      // Push the new position to React state synchronously so the
      // scrubber's white-fill bar follows the pointer in real time.
      // Without this we'd be waiting on `timeupdate` (~250ms), which
      // makes dragging feel like it lags + snaps to keyframes.
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

      // iOS Safari ships only partial fullscreen support: the standard
      // `document.fullscreenElement` / `element.requestFullscreen()` API
      // doesn't exist (or only exists prefixed), and even where prefixed
      // versions exist they only work on `<video>` elements — not on the
      // container div we use everywhere else. Cascade through every
      // known shape so the button does something on every browser:
      //   1. Standard API on the container (desktop Chrome/Firefox/Safari)
      //   2. webkit-prefixed API on the container (older WebKit)
      //   3. webkitEnterFullscreen on the <video> (iOS Safari) — boots
      //      the native iOS video player. Our custom controls are lost
      //      here, but the alternative is a no-op button on every iPhone.

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
          // Older Safari + some browsers may not implement requestPictureInPicture
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
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowLeft' || e.key === 'j') {
        e.preventDefault();
        seekBy(-SKIP_SECONDS);
      } else if (e.key === 'ArrowRight' || e.key === 'l') {
        e.preventDefault();
        seekBy(SKIP_SECONDS);
      } else if (e.key === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    const fraction = duration > 0 ? currentTime / duration : 0;
    // Inset the video inside a visible bg frame when a background is
    // selected. `transparent` keeps the video edge-to-edge — same look
    // as a player with no bg. inset-[%] preserves aspect because
    // top/bottom % is relative to container height and left/right % to
    // container width, so a uniform 4% trim doesn't distort the box.
    const hasFrame = config.background !== 'transparent';

    return (
      <div className="flex flex-col items-center">
        <div
          ref={containerRef}
          // Container reserves its final size on first paint via the
          // server-known aspect ratio (passed in from the share row's
          // width/height). Without this the box collapses to 0 height
          // until <video> metadata loads, then jumps to its real size —
          // visible page-shove that the user reported. Fullscreen
          // overrides with explicit fill + black letterbox.
          // `@container` makes the inline-size queryable by descendants;
          // we use it on the controls bar below so Settings + PiP hide
          // when the player itself is narrow (not when the viewport is
          // narrow). That lets the player width track the source width
          // freely — narrow recordings no longer have to inflate just
          // to fit a controls bar with 8 buttons.
          //
          // Mobile (max-sm): override the desktop width/height bounds so
          // the player fills the column and tracks the source's natural
          // aspect ratio (no height cap — the page just scrolls). The
          // `!` prefix wins over the inline `width`/`height` below.
          className={
            '@container group relative overflow-hidden rounded-md bg-neutral-900 focus:outline-none max-sm:h-auto! max-sm:w-full! ' +
            (isFullscreen
              ? 'flex h-full w-full items-center justify-center rounded-none bg-black'
              : 'block')
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
          {/* Bg-frame wrapper. With a bg selected the video inset-shrinks
            by a uniform 4% per side so the bg paints as a visible frame.
            With bg=transparent the wrapper fills the container — same
            edge-to-edge layout as before. rounded-lg on the inner box
            gives the Loom-style soft-corner inset look. */}
          <div
            className={
              hasFrame
                ? 'absolute inset-[4%] overflow-hidden rounded-lg shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)]'
                : 'absolute inset-0'
            }
          >
            <video
              ref={videoRef}
              src={videoUrl}
              poster={posterUrl}
              // Container reserves the size via aspect-ratio; video uses
              // object-contain so an aspect mismatch (server row's
              // width/height vs the actual encoded video) shows as a
              // small letterbox against the container's bg instead of
              // cropping content.
              className="block h-full w-full cursor-pointer object-contain"
              playsInline
              preload="auto"
              onClick={handleVideoClick}
              onLoadedData={() => setFirstFrameReady(true)}
              onCanPlay={() => setFirstFrameReady(true)}
              onPlaying={() => setFirstFrameReady(true)}
              onPlay={() => {
                // iOS Safari (and some Android browsers) ignore preload="auto"
                // and never fire loadeddata/canplay until the user actually
                // taps play — leaving the spinner stuck on top of a video
                // that's perfectly ready. Treat the user-initiated play as a
                // hard signal that we're past the loading state.
                setFirstFrameReady(true);
                setIsPlaying(true);
                setEnded(false);
              }}
              onPause={(e) => {
                // Browsers fire `pause` then `ended` on natural completion.
                // Detect end-by-time inside onPause too so React batches the
                // ended=true update with isPlaying=false in a single render
                // — otherwise the prevPlaying derived check briefly flashes
                // the play icon before the watch-again overlay appears.
                const v = e.currentTarget;
                if (v.duration > 0 && v.currentTime >= v.duration - 0.1) {
                  setEnded(true);
                }
                setIsPlaying(false);
              }}
              onEnded={() => setEnded(true)}
              onTimeUpdate={(e) => {
                // Refresh duration even while scrubbing — fragmented MP4s
                // only expose it as bytes arrive, and the user is allowed
                // to scrub before the full duration is known.
                const d = effectiveDuration(e.currentTarget);
                if (d > 0 && d !== duration) setDuration(d);
                // While the user is actively dragging, don't sync the
                // scrubber's React state to the browser's currentTime —
                // browsers snap seeks to keyframes, which would yank the
                // bar away from the user's pointer mid-drag.
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
                // On mobile (especially iOS Safari) preload="auto" is a
                // suggestion — the browser parses the moov atom and fires
                // loadedmetadata but never advances to loadeddata until the
                // user taps. Treat loadedmetadata as "ready enough to show
                // the play affordance" so the spinner doesn't stay forever.
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

          {/* Webcam companion PiP. Position + size + initial mute come
            from the persisted share config (defaults: bottom-right /
            medium / unmuted). Plays its own audio track (mic) —
            independently of the main video's system audio. Sync to
            the main video is wired via the effect that mirrors
            play/pause/seek/playbackRate from videoRef → webcamRef.
            Hidden when no webcamUrl. Pointer-none so clicks fall
            through to the main video's handlers (single play/pause). */}
          {webcamUrl ? (
            <video
              ref={webcamRef}
              src={webcamUrl}
              className={
                // No z-index: natural stacking order puts the toolbar
                // (later sibling) on top when controls are visible —
                // bubble passes UNDER the toolbar like a real video
                // player's PiP.
                'pointer-events-none absolute aspect-square rounded-full object-cover ' +
                webcamCornerClass(config.cameraCorner) +
                ' ' +
                webcamSizeClass(config.cameraSize)
              }
              playsInline
              preload="auto"
            />
          ) : null}

          {/* Loading state while the video buffers its first frame AND
          we know its real intrinsic dims. Holding through actualAspect
          means the container's aspect-ratio reservation is already
          settled by the time the spinner hides — without this, an old
          share with a stale row dim resizes its container behind the
          spinner and produces a visible split-second jump on reveal. */}
          {!firstFrameReady || actualAspect == null ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-neutral-900">
              <span className="block h-10 w-10 animate-spin rounded-full border-2 border-neutral-700 border-t-neutral-200" />
            </div>
          ) : null}

          {/* Persistent center play button whenever the video is paused
          (and not at the natural end — the watch-again overlay handles
          that case). Doubles as the initial-state affordance before
          first play and as the resume affordance after a manual pause.
          Hidden until the first frame is decoded AND the aspect is
          locked so the play button doesn't paint over an empty box or
          a frame that's about to resize. */}
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

          {/* Toggle pop overlay — flashes briefly on play (pause →
          play). We deliberately skip the flash on pause because the
          persistent play button above already paints in that state;
          stacking both reads as flicker. `key` forces remount so
          back-to-back toggles within the animation window restart
          from frame 0. */}
          {overlayIcon && isPlaying && !ended ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div
                key={overlayIcon}
                className="animate-share-icon-pop flex h-32 w-32 items-center justify-center rounded-full bg-[#171717]/90"
              >
                {overlayIcon === 'pause' ? (
                  <Pause className="h-16 w-16 text-white" fill="currentColor" />
                ) : (
                  <Play className="h-16 w-16 text-white" fill="currentColor" />
                )}
              </div>
            </div>
          ) : null}

          {/* End-of-video overlay — dim the frame and surface a centered
          "Watch again" button. Clicking it seeks to 0 and resumes
          playback, clearing the ended state. We deliberately do NOT
          autoplay-loop the video so this overlay always shows on
          completion (matches Loom's share player). */}
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

          {/* Collapsed progress strip — slim 3px bar at the bottom edge,
          shown only while the full controls are auto-hidden. Lets the
          viewer track playback at a glance without occupying chrome. */}
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-overlay-strong transition-opacity duration-200 ${
              controlsVisible ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div
              className="h-full bg-white"
              style={{ width: `${fraction * 100}%` }}
            />
          </div>

          {/* Optional overlay above the progress bar (e.g. reaction
            cluster bubbles on the public viewer). The slot receives
            the effective duration + controlsVisible so it can anchor
            itself correctly to either the expanded scrubber or the
            collapsed slim-strip. */}
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

          {/* Bottom control bar. Gradient backdrop blends into the video so
          the bar reads on light + dark content. Fades in/out with the
          controlsVisible flag. */}
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-black/70 via-black/40 to-transparent px-4 pb-3 pt-10 transition-opacity duration-200 ${
              controlsVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Scrubber */}
            <Scrubber
              fraction={fraction}
              onSeek={seekTo}
              onScrubStart={() => {
                setScrubbing(true);
                // Show the bar and hold it open for the duration of the scrub.
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
                label={isPlaying ? 'Pause' : 'Play'}
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
                {formatTime(currentTime)} /{' '}
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
                            speed === s ? 'text-white' : 'text-white/80'
                          }`}
                        >
                          <span>{s === 1 ? 'Normal' : `${s}×`}</span>
                          {speed === s ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : null}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                {/* PiP isn't reliably supported on iOS Safari for inline
                  videos and the gear gives the same controls — hide
                  both when the *player* is narrow (container query, not
                  viewport) so a small recording on a wide page still
                  drops these from the controls bar. */}
                <span className="hidden @md:inline-flex">
                  <ControlButton
                    onClick={() => void togglePip()}
                    label={
                      pip ? 'Exit picture-in-picture' : 'Picture-in-picture'
                    }
                  >
                    <PictureInPicture2 className="h-5 w-5" />
                  </ControlButton>
                </span>
                <ControlButton
                  onClick={toggleFullscreen}
                  label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
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

        {/* Optional content below the player (e.g. the reaction bar on
          the public viewer). Hidden in fullscreen — the player
          container is what gets fullscreened, so a sibling below it
          is naturally off-screen, but we also skip rendering so any
          slot side-effects pause too. */}
        {belowPlayer && !isFullscreen ? belowPlayer : null}
      </div>
    );
  },
);

// Loom-style "back/forward 5s" badge: lucide rotational arrow with a
// small "5" overlaid in the center. Lucide doesn't ship a single icon
// with the digit baked in, so we composite one — keeps everything else
// on lucide for consistency.
function SkipBadge({ dir }: { dir: 'back' | 'forward' }) {
  const Arrow = dir === 'back' ? RotateCcw : RotateCw;
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

  // Pointer-driven scrubbing — captures the pointer so dragging
  // outside the track still updates seek position. Matches the editor
  // timeline's drag-anywhere behavior.
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
    // Throttle seeks during the drag to ~12Hz. Each pointermove fires
    // ~120Hz and writing main.currentTime that often flushes the
    // system-audio decoder on every write — that's the choppy
    // "stutter, stutter, stutter" the user hears during a scrub.
    // 80ms intervals give visible per-frame feedback without thrashing
    // the audio path. The final position lands on pointerup via the
    // unconditional trailing seek below.
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
      // Final seek so the player lands exactly where the user released
      // — even if the throttle window swallowed the last move.
      seekFromClientX(lastClientX);
      onScrubEnd();
      el.removeEventListener('pointermove', move as EventListener);
      el.removeEventListener('pointerup', up as EventListener);
      el.removeEventListener('pointercancel', up as EventListener);
    };
    el.addEventListener('pointermove', move as EventListener);
    el.addEventListener('pointerup', up as EventListener);
    el.addEventListener('pointercancel', up as EventListener);
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
      <ControlButton onClick={onToggleMute} label={muted ? 'Unmute' : 'Mute'}>
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
        // Background gradient paints the filled track up to the
        // current value. The default <input range> draws a uniform
        // track, which read as "empty" against our solid thumb —
        // viewers reported it looked like volume was off even at full.
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
  if (!Number.isFinite(s) || s < 0) return '0:00';
  const total = Math.floor(s);
  const m = Math.floor(total / 60);
  const sec = total % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// Reserved aspect for the loading state. Pre-fix uploads always sent
// `1280, 720` regardless of the actual encoded dim, so a 16:10
// MacBook recording (the most common case) had a row claiming 16:9 →
// the container reserved 16:9, video loaded at 16:10, container
// resized = visible jump down. We detect that exact suspicious value
// and fall back to 16:10. Real 16:9 server rows (post-fix uploads)
// are trusted and reserve correctly.
function aspectFromPlaceholder(
  width: number | null,
  height: number | null,
): number {
  if (!width || !height) return 16 / 10;
  if (width === 1280 && height === 720) return 16 / 10;
  return width / height;
}

// Landscape sources (aspect ≥ LANDSCAPE_THRESHOLD) fill the column
// edge-to-edge — height comes from `aspect-ratio`. Squarish / portrait
// sources cap their height at MAX_H, derive width from the source's
// natural rendered width plus 48px of breathing room, and center
// within the column. The threshold is chosen so 4:3 (1.33), 16:10
// (1.6), 16:9 (1.78), and wider all count as landscape; below that
// (5:4 ≈ 1.25, square, portrait) collapses to the capped path.
const LANDSCAPE_THRESHOLD = 1.3;

function sizeStyleForAspect(
  aspect: number,
  landscapeMaxHeightCss?: string,
): React.CSSProperties {
  const a = aspectAsNumber(aspect);
  if (a >= LANDSCAPE_THRESHOLD) {
    // With a viewport-aware cap (public viewer), derive width from the
    // capped height so the aspect ratio holds and the player never
    // grows taller than `landscapeMaxHeightCss`; it stays at most the
    // full column width (100%). The outer flex column is `items-center`,
    // so a sub-100% width centers on its own. Without a cap (editor),
    // keep the original fill-the-column behaviour.
    if (landscapeMaxHeightCss) {
      return {
        width: `min(100%, calc(${landscapeMaxHeightCss} * ${a}))`,
        aspectRatio: a,
      };
    }
    return { width: '100%', aspectRatio: a };
  }
  return {
    height: MAX_HEIGHT_CSS,
    width: `clamp(min(360px, 100%), calc(${MAX_HEIGHT_CSS} * ${a} + 120px), 100%)`,
    // Mobile (max-sm) overrides h/w via `!h-auto !w-full` classes; in
    // that mode the explicit height above is gone, so aspect-ratio
    // takes over to size the container. Without this the portrait
    // canvas collapsed to 0px tall on mobile.
    aspectRatio: a,
  };
}

// Locked player height = 16:9 of the page-column width.
// Page column: `max-w-4xl` (56rem) inside main with `px-4` (2rem total
// horizontal padding). On wide viewports the column hits the 56rem cap
// → height = 56rem * 9/16 = 31.5rem. On narrow viewports the column is
// `100vw - 2rem` → height = (100vw - 2rem) * 9/16. The `min()` picks
// whichever applies. Source aspect drives WIDTH; this stays fixed.
const MAX_HEIGHT_CSS = 'min(31.5rem, calc((100vw - 2rem) * 9 / 16))';

function aspectAsNumber(aspect: number): number {
  if (!Number.isFinite(aspect) || aspect <= 0) return 16 / 9;
  return aspect;
}

// Generous 6 (24px) inset mirrors the studio editor's WebcamBubble
// margin so the bubble breathes against the edge instead of sitting
// flush. Same inset for every corner.
function webcamCornerClass(corner: ShareCameraCorner): string {
  switch (corner) {
    case 'bottom-right':
      return 'bottom-6 right-6';
    case 'bottom-left':
      return 'bottom-6 left-6';
    case 'top-right':
      return 'top-6 right-6';
    case 'top-left':
      return 'top-6 left-6';
  }
}

// Sizes are tighter than the rectangular PiP since a square bubble
// reads larger at the same width. The studio bubble lands around
// 14–18% of the canvas; mirror that here.
function webcamSizeClass(size: ShareCameraSize): string {
  switch (size) {
    case 'small':
      return 'w-[12%] min-w-[80px] max-w-[140px]';
    case 'medium':
      return 'w-[16%] min-w-[110px] max-w-[200px]';
    case 'large':
      return 'w-[22%] min-w-[150px] max-w-[280px]';
  }
}

// Background paint on the player container. `transparent` falls
// through to the Tailwind `bg-neutral-900` baseline so an unset config
// renders the same as it always has. Object-contain on the screen
// video means landscape-letterbox + portrait-pillarbox sources
// reveal this layer through the empty strips.
function shareBackgroundStyle(background: string): React.CSSProperties {
  if (background === 'transparent') return {};
  if (isShareHexColor(background)) return { backgroundColor: background };
  if (isShareGradientKey(background)) {
    return {
      background: shareGradientCss(SHARE_GRADIENT_PRESETS[background].stops),
    };
  }
  return {};
}

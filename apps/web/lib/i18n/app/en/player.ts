/*
 * `controls` is handed whole to Video.js as its translations, so its groups
 * and keys are Video.js's own and must keep those names. A key left out falls
 * back to the text Video.js ships.
 */
export const PLAYER = {
  overlay: {
    watchAgain: "Watch again",
  },
  captions: {
    track: "Captions",
    size: "Size",
    position: "Position",
    sizes: {
      small: "Small",
      medium: "Medium",
      large: "Large",
    },
    positions: {
      top: "Top",
      bottom: "Bottom",
    },
  },
  reactionBar: {
    comment: "Comment",
    leaveComment: "Leave a comment",
  },
  reactions: {
    heart: "Heart",
    thumbsUp: "Thumbs up",
    fire: "Fire",
    clap: "Clap",
    raisedHands: "Raised hands",
    eyes: "Eyes",
  },
  embed: {
    title: "{product} recording",
  },
  controls: {
    buttons: {
      play: "Play",
      pause: "Pause",
      replay: "Replay",
      mute: "Mute",
      unmute: "Unmute",
    },
    seek: {
      forward: "Seek forward {seconds} seconds",
      backward: "Seek backward {seconds} seconds",
    },
    fullscreen: {
      enter: "Enter fullscreen",
      exit: "Exit fullscreen",
    },
    captions: {
      enable: "Enable captions",
      disable: "Disable captions",
    },
    pip: {
      enter: "Enter picture-in-picture",
      exit: "Exit picture-in-picture",
    },
    cast: {
      start: "Start casting",
      stop: "Stop casting",
      connecting: "Connecting",
    },
    airplay: {
      start: "Start AirPlay",
      stop: "Stop AirPlay",
    },
    slider: {
      seek: "Seek",
    },
    time: {
      current: "Current time",
      duration: "Duration",
      position: "{current} of {duration}",
      unknown: "Media not loaded, unknown time.",
    },
    playback: {
      rate: "Playback rate {rate}",
    },
    volume: {
      mutedValue: "{percent}, muted",
      muted: "Muted",
      label: "Volume",
      value: "Volume {value}",
    },
    status: {
      captionsOn: "Captions on",
      captionsOff: "Captions off",
      paused: "Paused",
      playing: "Playing",
      fullscreen: "Fullscreen",
      pip: "Picture in picture",
      exitPip: "Exit picture in picture",
      seekedTo: "Seeked to {time}",
    },
    container: {
      label: "Media player",
    },
    errors: {
      aborted: "You stopped media playback before it finished.",
      network:
        "This media could not be loaded due to a network or server issue.",
      decode:
        "This media could not be played. It may be corrupted, or your browser may not support its format.",
      source:
        "This media could not be loaded. It may be unavailable, or your browser may not support its format.",
      encrypted:
        "This media could not be played because it could not be decrypted.",
      unplayable: "This media is unsupported by the player.",
      title: "Something went wrong.",
      unexpected: "An unexpected error occurred.",
    },
    common: {
      ok: "OK",
    },
    menu: {
      settings: "Settings",
      quality: "Quality",
      audio: "Audio",
      speed: "Speed",
      captions: "Captions",
      playbackRate: "Playback rate",
      off: "Off",
      auto: "Auto",
      autoWithLabel: "Auto ({label})",
    },
  },
} as const;

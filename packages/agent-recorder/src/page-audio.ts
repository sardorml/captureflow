/*
 * Runs in every page before its own scripts. A headless browser has no
 * sound card to record, so this taps each <video> and <audio> element as it
 * plays and hands its sound to the recorder as 48 kHz 16-bit stereo PCM,
 * base64-encoded, through the binding the session exposes.
 */
export const PAGE_AUDIO_BINDING = "__cfPageAudio";

export const PAGE_AUDIO_SCRIPT = `(() => {
  if (window.__cfAudioTap) return;
  window.__cfAudioTap = true;
  let ctx = null;
  let sink = null;
  const tapped = new WeakSet();
  const toBase64 = (pcm) => {
    const bytes = new Uint8Array(pcm.buffer);
    let s = "";
    for (let i = 0; i < bytes.length; i += 0x8000) {
      s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(s);
  };
  const setup = () => {
    ctx = new AudioContext({ sampleRate: 48000 });
    sink = ctx.createScriptProcessor(4096, 2, 2);
    sink.onaudioprocess = (e) => {
      const l = e.inputBuffer.getChannelData(0);
      const r = e.inputBuffer.numberOfChannels > 1 ? e.inputBuffer.getChannelData(1) : l;
      const pcm = new Int16Array(l.length * 2);
      let loud = false;
      for (let i = 0; i < l.length; i++) {
        const a = Math.max(-1, Math.min(1, l[i]));
        const b = Math.max(-1, Math.min(1, r[i]));
        pcm[i * 2] = a * 32767;
        pcm[i * 2 + 1] = b * 32767;
        if (a !== 0 || b !== 0) loud = true;
      }
      if (loud && typeof window.${PAGE_AUDIO_BINDING} === "function") {
        window.${PAGE_AUDIO_BINDING}(toBase64(pcm)).catch(() => {});
      }
    };
    // A ScriptProcessor only runs while connected; its output stays silent.
    const mute = ctx.createGain();
    mute.gain.value = 0;
    sink.connect(mute).connect(ctx.destination);
  };
  const tap = (el) => {
    if (tapped.has(el) || !(el.captureStream || el.mozCaptureStream)) return;
    tapped.add(el);
    try {
      if (!ctx) setup();
      void ctx.resume();
      const stream = (el.captureStream || el.mozCaptureStream).call(el);
      const connect = () => {
        if (stream.getAudioTracks().length === 0) return false;
        ctx.createMediaStreamSource(stream).connect(sink);
        return true;
      };
      if (!connect()) stream.addEventListener("addtrack", connect, { once: true });
    } catch {}
  };
  document.addEventListener("play", (e) => {
    if (e.target instanceof HTMLMediaElement) tap(e.target);
  }, true);
})();`;

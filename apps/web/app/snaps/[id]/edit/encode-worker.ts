// Off-thread PNG re-encoder. Palette-quantised PNG-8 (UPNG cnum: 256)
// cuts a 3500×2300 screenshot+bg to ~500 KB at visually identical
// quality. The pure-JS deflate takes 2-5s, so running it in a worker
// keeps the editor UI responsive.

import UPNG from 'upng-js';

type EncodeRequest = {
  buffer: ArrayBuffer; // raw RGBA bytes (width * height * 4)
  width: number;
  height: number;
  // UPNG semantics: 0 = lossless truecolor (~2-3 MB), 256 = indexed
  // PNG-8 (visually identical for screenshots, ~5-10x smaller). The
  // editor defaults to 256.
  cnum: number;
};

type EncodeOk = { ok: true; png: ArrayBuffer };
type EncodeErr = { ok: false; error: string };

self.onmessage = (e: MessageEvent<EncodeRequest>) => {
  const { buffer, width, height, cnum } = e.data;
  try {
    const png = UPNG.encode([buffer], width, height, cnum);
    const msg: EncodeOk = { ok: true, png };
    // Transfer the ArrayBuffer to avoid a copy back to the main thread.
    (self as unknown as Worker).postMessage(msg, [png]);
  } catch (err) {
    const msg: EncodeErr = {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
    (self as unknown as Worker).postMessage(msg);
  }
};
